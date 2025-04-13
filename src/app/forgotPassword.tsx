import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { router } from "expo-router"
import Logo from "../../assets/images/logo.svg"
import CustomButton from "@/src/components/CustomButton"
import { useRequireAuth } from "../hooks/useRequireAuth"
import { usePasswordReset } from "@/src/hooks/useReset"
import ArrowBack from "../components/ArrowBack"

const ForgotPasswordScreen = () => {
  // Step states
  const [step, setStep] = useState<"email" | "code" | "password">("email")
  const [email, setEmail] = useState("")
  const [emailFocused, setEmailFocused] = useState(false)
  
  // Code verification states
  const [code, setCode] = useState(["", "", "", "", ""])
  const [codeFocused, setCodeFocused] = useState([false, false, false, false, false])
  const codeInputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null])
  
  // New password states
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newPasswordFocused, setNewPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth({ requireAuth: false })
  const { 
    isLoading, 
    emailSent, 
    sendResetEmail, 
    verifyCode, 
    resetPassword, 
    codeVerified,
    setVerificationCode 
  } = usePasswordReset()

  // Handle email submission
  const handleSendResetEmail = async () => {
    if (await sendResetEmail(email)) {
      setStep("code")
    }
  }

  // Handle code verification
  const handleVerifyCode = async () => {
    const fullCode = code.join("")
    if (await verifyCode(fullCode)) {
      setStep("password")
    }
  }

  // Handle password reset
  const handleResetPassword = async () => {
    if (await resetPassword(newPassword, confirmPassword)) {
      // Navigate to login screen after successful password reset
      router.push("/")
    }
  }

  // Handle code input changes
  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0]
    }
    
    const newCode = [...code]
    newCode[index] = text
    setCode(newCode)
    
    // Auto-focus next input
    if (text !== "" && index < 4) {
      codeInputRefs.current[index + 1]?.focus()
    }
    
    // Check if all digits are filled to auto-submit
    if (newCode.every(digit => digit !== "") && index === 4) {
      setVerificationCode(newCode.join(""))
    }
  }

  // Handle code input backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  const handleCodeFocus = (index: number, focused: boolean) => {
    const newCodeFocused = [...codeFocused]
    newCodeFocused[index] = focused
    setCodeFocused(newCodeFocused)
  }

  const getBorderColor = (isFocused: boolean) => {
    if (isFocused) return '#56A6DC'
    return '#E8ECF4'
  }

  // Mask email for display
  const getMaskedEmail = (email: string) => {
    if (!email) return ""
    const [username, domain] = email.split('@')
    if (!username || !domain) return email
    
    const maskedUsername = username.substring(0, 3) + '***'
    return `${maskedUsername}@${domain}`
  }

  // Render different steps
  const renderEmailStep = () => (
    <View style={styles.formContainer}>
      <Text style={styles.attentionText}>Recuperação</Text>
      <Text style={styles.titleText}>Esqueceu sua senha?</Text>
      <Text style={styles.pleaseText}>
        Digite seu email abaixo para receber um código de verificação
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>E-mail:</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: getBorderColor(emailFocused) },
            Platform.select({
              web: emailFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {},
            }),
          ]}
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          editable={!isLoading}
        />
      </View>
      
      <CustomButton
        title={isLoading ? "Enviando..." : "Enviar email"}
        onPress={handleSendResetEmail}
        disabled={isLoading || !email}
      />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
        <Text style={styles.backButtonText}>Voltar para o login</Text>
      </TouchableOpacity>
    </View>
  )

  const renderCodeStep = () => (
    <>
      <View style={styles.containerText}>
        <View>
          <Text style={styles.attentionText}>Atenção</Text>
          <Text style={styles.titleText}>Verifique seu email</Text>
        </View>
      </View>

      <View style={styles.containerInput}>
        <Text style={styles.pleaseText}>Por favor digite o código para verificar o seu email</Text>
        <View style={styles.inputArea}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={el => codeInputRefs.current[index] = el}
              style={[
                styles.codeInput,
                { borderColor: getBorderColor(codeFocused[index]) },
                Platform.select({
                  web: codeFocused[index] ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {},
                }),
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleCodeFocus(index, true)}
              onBlur={() => handleCodeFocus(index, false)}
              keyboardType="numeric"
              maxLength={1}
              editable={!isLoading}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.containerBottom}>
        <View style={styles.containerEmailText}>
          <Text style={styles.codEmail}>Enviamos um código para o email </Text>
          <Text style={styles.email}>{getMaskedEmail(email)} </Text>
        </View>
        <View style={styles.buttonArea}>
          <CustomButton
            title={isLoading ? "Verificando..." : "Confirmar código"}
            onPress={handleVerifyCode}
            disabled={isLoading || code.some(digit => digit === "")}
          />
          <View style={styles.textBottomArea}>
            <Text style={styles.bottomText}>Não recebeu o código?</Text>
            <TouchableOpacity onPress={() => sendResetEmail(email)}>
              <Text style={styles.bottomText2}>Reenviar código</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  )

  const renderPasswordStep = () => (
    <View style={styles.formContainer}>
      <Text style={styles.attentionText}>Última etapa</Text>
      <Text style={styles.titleText}>Nova senha</Text>
      <Text style={styles.pleaseText}>
        Digite sua nova senha abaixo
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nova senha:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              { borderColor: getBorderColor(newPasswordFocused) },
              Platform.select({
                web: newPasswordFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {},
              }),
            ]}
            placeholder="Digite sua nova senha"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setNewPasswordFocused(true)}
            onBlur={() => setNewPasswordFocused(false)}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.eyeIconContainer} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirme a senha:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              { borderColor: getBorderColor(confirmPasswordFocused) },
              Platform.select({
                web: confirmPasswordFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {},
              }),
            ]}
            placeholder="Confirme sua nova senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            onFocus={() => setConfirmPasswordFocused(true)}
            onBlur={() => setConfirmPasswordFocused(false)}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.eyeIconContainer} 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.eyeIcon}>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <CustomButton
        title={isLoading ? "Redefinindo..." : "Redefinir senha"}
        onPress={handleResetPassword}
        disabled={isLoading || !newPassword || !confirmPassword}
      />
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ArrowBack onPress={() => router.back()} className="top-3 left-3 absolute bg-primary" color="#f2f2f2" />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={{ alignItems: "center" }}>
            <Logo style={{ width: 315, height: 65, marginBottom: marginTopDaLogo(), top: 30, position: 'relative' }} />
          </View>

          {step === "email" && renderEmailStep()}
          {step === "code" && renderCodeStep()}
          {step === "password" && renderPasswordStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function marginTopDaLogo(): any {
  const {width, height} = Dimensions.get("window")
  if(width <= 500 && height < 732){ //para celular bemmm pequeno
    return '15%'
  } else if (height >= 732 && width > 409) {
    return "20%"
  } else { //nos que não se encaixam
    return 80
  }
}  

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  formContainer: {
    flex: 1,
    marginTop: 40,
    alignItems: "flex-start",
    width: "100%",
  },
  containerText: {
    alignItems: "center",
    width: "80%",
    paddingTop: 30,
    marginTop: 20,
  },
  attentionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0072C6",
    textAlign: "left",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 16,
  },
  containerInput: {
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    flexDirection: "column",
    justifyContent: "space-between",
    textAlign: "center",
  },
  inputArea: {
    justifyContent: "space-between",
    paddingHorizontal: 15,
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
    marginTop: 20,
  },
  pleaseText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 64,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F7F8F9",
    color: "#000000",
  },
  codeInput: {
    width: "18%",
    height: 64,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#F7F8F9",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  containerBottom: {
    alignItems: "center",
    width: "100%",
    marginTop: 30,
    justifyContent: "space-evenly",
    flexDirection: "column",
  },
  containerEmailText: {
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
  },
  codEmail: {
    fontSize: 14,
    fontWeight: "500",
  },
  email: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0072C6",
  },
  buttonArea: {
    alignItems: "center",
    width: "100%",
  },
  textBottomArea: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "center",
    width: "100%",
  },
  bottomText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
  },
  bottomText2: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0072C6",
    marginLeft: 8,
  },
  backButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0072C6",
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIconContainer: {
    position: "absolute",
    right: 16,
    height: "100%",
    justifyContent: "center",
  },
  eyeIcon: {
    fontSize: 24,
  },
})

export default ForgotPasswordScreen
