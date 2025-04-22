"use client"

import { router, useLocalSearchParams } from "expo-router"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers"
import Sunsvg from "../../../assets/images/sun.svg"
import BigAvatar from "@/src/components/BigAvatar"
import ProgressDots from "@/src/components/ProgressDots"
import Toast from "react-native-toast-message"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import ArrowBack from "@/src/components/ArrowBack"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import React from "react"

const { height } = Dimensions.get("window")

const Step03 = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: boolean; password?: boolean; confirmPassword?: boolean }>({})
  const [emailFocused, setEmailFocused] = useState(false)
  const [field1Focused, setField1Focused] = useState(false)
  const [field2Focused, setField2Focused] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const { isAuthenticated, isLoading } = useRequireAuth({ requireAuth: false })

  // Get params from previous screen
  const { avatarId, avatarSource, nome, sobrenome, birthDate, phone, termsAccepted, lgpdAccepted } =
    useLocalSearchParams<{
      avatarId: string
      avatarSource: string
      nome: string
      sobrenome: string
      birthDate: string
      phone: string
      termsAccepted: string
      lgpdAccepted: string
    }>()

  // Add keyboard event listeners similar to step01.tsx and step02.tsx
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardVisible(true)
      // Scroll to input area when keyboard appears
      scrollViewRef.current?.scrollTo({ y: 200, animated: true })
    })

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
      // Optionally scroll back to top when keyboard hides
      scrollViewRef.current?.scrollTo({ y: 0, animated: true })
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const getBorderColor = (field: "email" | "password" | "confirmPassword", isFocused: boolean) => {
    if (errors[field]) return "#FF0000"
    if (isFocused) return "#56A6DC"
    return "#E8ECF4"
  }

  // Modifique a função handleContinue para garantir que o usuário seja redirecionado corretamente
  const handleContinue = async () => {
    try {
      setIsVerifying(true)
      const newErrors: { email?: boolean; password?: boolean; confirmPassword?: boolean } = {}

      // Validação básica
      if (!email) {
        newErrors.email = true
        setErrors(newErrors)
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Digite seu email!",
        })
        return
      }

      if (!password) {
        newErrors.password = true
        setErrors(newErrors)
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Digite sua senha!",
        })
        return
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = true
        setErrors(newErrors)
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Confirme sua senha!",
        })
        return
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = true
        setErrors(newErrors)
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "As senhas não coincidem!",
        })
        return
      }

      // Tentar criar o usuário no Firebase Auth
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Após criar o usuário, faça logout para evitar problemas de autenticação na próxima tela
      // Isso permite que a tela step4 faça o login explicitamente
      await auth.signOut()

      // Prosseguir para o próximo passo
      router.push({
        pathname: "/(register)/step4",
        params: {
          nome,
          sobrenome,
          email,
          birthDate,
          phone,
          termsAccepted,
          lgpdAccepted,
          password,
          avatarId,
          avatarSource,
          uid: user.uid, // opcional, pode passar se quiser reutilizar
        },
      })
    } catch (error: any) {
      console.error("Erro ao criar conta:", error)

      let errorMessage = "Falha ao criar conta!"
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está em uso!"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido!"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Senha muito fraca!"
      }

      Toast.show({
        type: "error",
        text1: "Erro",
        text2: errorMessage,
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <ArrowBack onPress={() => router.back()} className="top-3 left-3 absolute bg-white" color="#56A6DC" />
      {/* Replace KeyboardAvoidingView with ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backgroundContainer}>
            <Sunsvg style={{position:"absolute", top: "-40%", right: "-45"}} width="45%" height="90%"></Sunsvg>
        </View>
        <View style={styles.contentContainer}>
          {avatarSource && <BigAvatar avatarSource={avatarSource} style={{ marginBottom: -20 }} />}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Vamos criar uma senha!</Text>

            <View style={styles.inputsContainer}>
              <View style={styles.inputCada}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: getBorderColor("email", emailFocused) },
                    Platform.select({
                      web: emailFocused ? { outlineColor: "#56A6DC", outlineWidth: 2 } : {},
                    }),
                  ]}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputCada}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: getBorderColor("password", field1Focused) },
                    Platform.select({
                      web: field1Focused ? { outlineColor: "#56A6DC", outlineWidth: 2 } : {},
                    }),
                  ]}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setField1Focused(true)}
                  onBlur={() => setField1Focused(false)}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputCada}>
                <Text style={styles.label}>Confirme sua senha</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: getBorderColor("confirmPassword", field2Focused) },
                    Platform.select({
                      web: field2Focused ? { outlineColor: "#56A6DC", outlineWidth: 2 } : {},
                    }),
                  ]}
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setField2Focused(true)}
                  onBlur={() => setField2Focused(false)}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 30 }}>
              <CustomButton
                title={isVerifying ? "Verificando..." : "Continuar"}
                onPress={handleContinue}
                disabled={isVerifying}
              />
              </View>

              <View style={{ height: 5 }} />
              <ProgressDots currentStep={3} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4D2A3",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: getAvatarTop(),
  },
  contentContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  formContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    alignItems: "center",
    paddingBottom: 20,
    height: height <= 732 ? "60%" : "65%",
  },
  inputsContainer: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
    top: height <= 732 ? "0%" : "0%",
    height: "60%",
    gap: 8,
  },
  inputCada: {
    width: "100%",
    height: "30%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height <= 732 ? 5 : 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    width: "80%",
    marginBottom: 5,
  },
  input: {
    width: "80%",
    height: 55,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F7F8F9",
    color: "#000000",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    height: "5%",
    marginTop: 5,
    bottom: bottomHeight(),
  },
})
export default Step03
