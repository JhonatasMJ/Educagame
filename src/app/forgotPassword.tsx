import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Dimensions,
} from "react-native"
import { router } from "expo-router"
import Logo from "../../assets/images/web.svg"
import CustomButton from "@/src/components/CustomButton"
import { useRequireAuth } from "../hooks/useRequireAuth"
import { usePasswordReset } from "@/src/hooks/useReset"
import ArrowBack from "../components/ArrowBack"

const ForgotPasswordScreen = () => {
  const [step, setStep] = useState<"email" | "code" | "password">("email")
  const [email, setEmail] = useState("")
  const [emailFocused, setEmailFocused] = useState(false)

  const [code, setCode] = useState(["", "", "", "", ""])
  const [codeFocused, setCodeFocused] = useState([false, false, false, false, false])
  const codeInputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null])

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
    setVerificationCode,
  } = usePasswordReset()

  const handleSendResetEmail = async () => {
    if (await sendResetEmail(email)) {
      setStep("code")
    }
  }

  const handleVerifyCode = async () => {
    const fullCode = code.join("")
    if (await verifyCode(fullCode)) {
      setStep("password")
    }
  }

  const handleResetPassword = async () => {
    if (await resetPassword(newPassword, confirmPassword)) {
      router.push("/")
    }
  }

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) text = text[0]
    const newCode = [...code]
    newCode[index] = text
    setCode(newCode)
    if (text !== "" && index < 4) codeInputRefs.current[index + 1]?.focus()
    if (newCode.every(digit => digit !== "") && index === 4) {
      setVerificationCode(newCode.join(""))
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  const handleCodeFocus = (index: number, focused: boolean) => {
    const newCodeFocused = [...codeFocused]
    newCodeFocused[index] = focused
    setCodeFocused(newCodeFocused)
  }

  const getBorderColor = (isFocused: boolean) => isFocused ? 'border-blue-500' : 'border-[#E8ECF4]'

  const getMaskedEmail = (email: string) => {
    const [username, domain] = email.split("@");
    if (!username || !domain) return email;
    return `${username.substring(0, 3)}***@${domain}`
  }

  const renderEmailStep = () => (
    <View className="w-full mt-10 items-start">
      <Text className="text-primary font-semibold text-xl mb-1">Recuperação</Text>
      <Text className="text-2xl font-bold mb-4">Esqueceu sua senha?</Text>
      <Text className="text-gray-600 font-medium text-sm mb-5">Digite seu email abaixo para receber um código de verificação</Text>

      <View className="w-full mb-5">
        <Text className="text-gray-600 font-medium mb-2">E-mail:</Text>
        <TextInput
          className={`w-full h-16 rounded-lg px-4 py-3 text-base bg-[#F7F8F9] text-black border-2 ${getBorderColor(emailFocused)}`}
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

      <TouchableOpacity className="mt-5 self-center" onPress={() => router.push("/")}>
        <Text className="text-primary font-semibold text-base">Voltar para o login</Text>
      </TouchableOpacity>
    </View>
  )

  const renderCodeStep = () => (
    <View className="w-full items-center mt-10">
      <View className="items-center w-4/5 pt-8">
        <Text className="text-primary font-semibold text-xl mb-1">Atenção</Text>
        <Text className="text-2xl font-bold mb-4 text-center">Verifique seu email</Text>
        <Text className="text-sm font-medium text-gray-600 text-center">Por favor digite o código para verificar o seu email</Text>

        <View className="flex-row justify-between px-4 w-full mt-5">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={el => codeInputRefs.current[index] = el}
              className={`w-[18%] h-16 text-3xl font-bold text-center bg-[#F7F8F9] border-2 rounded-xl ${getBorderColor(codeFocused[index])}`}
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

      <View className="w-full items-center mt-8">
        <Text className="text-sm font-medium text-center">Enviamos um código para o email <Text className="font-semibold text-primary">{getMaskedEmail(email)}</Text></Text>
        <CustomButton
          title={isLoading ? "Verificando..." : "Confirmar código"}
          onPress={handleVerifyCode}
          disabled={isLoading || code.some(digit => digit === "")}
        />

        <View className="flex-row items-center justify-center mt-5">
          <Text className="text-sm font-medium text-gray-600">Não recebeu o código?</Text>
          <TouchableOpacity onPress={() => sendResetEmail(email)}>
            <Text className="text-sm font-semibold text-primary ml-2">Reenviar código</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderPasswordStep = () => (
    <View className="w-full mt-10 items-start">
      <Text className="text-primary font-semibold text-xl mb-1">Última etapa</Text>
      <Text className="text-2xl font-bold mb-4">Nova senha</Text>
      <Text className="text-gray-600 font-medium text-sm mb-5">Digite sua nova senha abaixo</Text>

      <View className="w-full mb-5">
        <Text className="text-gray-600 font-medium mb-2">Nova senha:</Text>
        <View className="relative">
          <TextInput
            className={`w-full h-16 rounded-lg px-4 py-3 text-base bg-[#F7F8F9] text-black border-2 ${getBorderColor(newPasswordFocused)}`}
            placeholder="Digite sua nova senha"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setNewPasswordFocused(true)}
            onBlur={() => setNewPasswordFocused(false)}
            editable={!isLoading}
          />
          <TouchableOpacity className="absolute right-4 top-1/2 -translate-y-1/2" onPress={() => setShowPassword(!showPassword)}>
            <Text className="text-xl">{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="w-full mb-5">
        <Text className="text-gray-600 font-medium mb-2">Confirme a senha:</Text>
        <View className="relative">
          <TextInput
            className={`w-full h-16 rounded-lg px-4 py-3 text-base bg-[#F7F8F9] text-black border-2 ${getBorderColor(confirmPasswordFocused)}`}
            placeholder="Confirme sua nova senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            onFocus={() => setConfirmPasswordFocused(true)}
            onBlur={() => setConfirmPasswordFocused(false)}
            editable={!isLoading}
          />
          <TouchableOpacity className="absolute right-4 top-1/2 -translate-y-1/2" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Text className="text-xl">{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
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
    <SafeAreaView className="flex-1 bg-white justify-center">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ArrowBack onPress={() => router.back()} className="absolute top-3 left-3 bg-primary" color="#f2f2f2" />
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}>
          <View className="items-center">
            <Logo style={{ width: 400, height: 180, marginBottom: marginTopDaLogo(), top: 30, position: "relative" }} />
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
  const { width, height } = Dimensions.get("window")
  if (width <= 500 && height < 732) return "15%"
  else if (height >= 732 && width > 409) return "20%"
  else return 80
}

export default ForgotPasswordScreen
