"use client"

import React,{ useState, useEffect } from "react"
import { router } from "expo-router"
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  Image,
} from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { useLogin } from "../hooks/UseLogin"
import Checkbox from "../components/Checkbox"
import Logo from "../../assets/images/web.svg"
import LoadingTransition from "@/src/components/LoadingTransition"
import { useAuth } from "../context/AuthContext"
import colors from "../colors"
import { USE_SIMPLIFIED_ONBOARDING } from "@/config/appConfig"

interface Errors {
  email?: string
  password?: string
}

interface FormData {
  email: string
  password: string
}

const Login = () => {
  const { handleLogin, isLoading, savedEmail, savedPassword } = useLogin()
  const { showLoadingTransition, setShowLoadingTransition, userData, authUser } = useAuth()
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [rememberMe, setRememberMe] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Reset loading transition when component unmounts
  useEffect(() => {
    return () => {
      setShowLoadingTransition(false)
    }
  }, [])

  // Check if user is already authenticated and navigate if needed
  useEffect(() => {
    if (authUser && userData) {
      console.log("User already authenticated, navigating to home")
      router.replace("/(tabs)/home")
    }
  }, [authUser, userData])

  // Pre-fill form with saved credentials if available
  useEffect(() => {
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }
    if (savedPassword) {
      setFormData((prev) => ({ ...prev, password: savedPassword }))
    }
  }, [savedEmail, savedPassword])

  const marginTopForLogo = () => {
    const screenHeight = Dimensions.get("window").height
    return screenHeight > 800 ? "mt-10" : "mt-5"
  }

  // For the getBorderColor function:
  const getBorderColor = (field: keyof Errors, isFocused: boolean) => {
    if (errors[field]) {
      return colors.form.INPUT_BORDER_ERROR
    } else if (isFocused) {
      return colors.form.INPUT_BORDER_FOCUS
    } else {
      return colors.form.INPUT_BORDER
    }
  }

  // For the getWebOutlineStyle function:
  const getWebOutlineStyle = (field: string, isFocused: boolean) => {
    if (Platform.OS === "web") {
      return isFocused ? { outline: "none" } : {}
    }
    return {}
  }

  const updateFormField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setErrors({ ...errors, [field]: undefined })
  }

  const validateAndLogin = async () => {
    const newErrors: Errors = {}

    if (!formData.email) {
      newErrors.email = "Por favor, insira seu e-mail."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Por favor, insira um e-mail válido."
    }

    if (!formData.password) {
      newErrors.password = "Por favor, insira sua senha."
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      console.log("Form validated, attempting login")
      await handleLogin(formData.email, formData.password, rememberMe)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="px-6 flex-1 justify-evenly">
            <View className={`items-center ${marginTopForLogo()}`}>
              <View className="items-center" >
                <Image  source={require("../../assets/images/favicon.png")} resizeMode="contain" style={{width: 150, height: 150, padding: 10 }} />
              </View>
            </View>

            <View className="mt-5">
              <Text className="text-lg font-medium text-primary mb-1">Bem-vindo (a) 👋</Text>
              <Text className="text-3xl font-bold mb-4">Entre na sua conta</Text>
            </View>

            <View className="justify-center mt-2">
              <View className="mb-5">
                <Text className="text-base font-medium text-[#4B5563] mb-2">E-mail:</Text>
                <TextInput
                  className={`w-full h-16 border-2 rounded-lg px-4 py-3 text-base bg-[#F7F8F9] text-black`}
                  placeholder="Digite seu e-mail"
                  style={[{borderColor: getBorderColor("email", emailFocused), }, getWebOutlineStyle("email", emailFocused)]}
                  value={formData.email}
                  onChangeText={(value: string) => updateFormField("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  cursorColor={colors.form.INPUT_BORDER_FOCUS}
                  editable={!isLoading}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholderTextColor={colors.ui.PLACEHOLDER}
                />
                {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>}
              </View>

              <View className="mb-5">
                <Text className="text-base font-medium text-[#4B5563] mb-2">Senha:</Text>
                <View className="relative">
                  <TextInput
                    className={`w-full h-16 border-2 rounded-lg px-4 py-3 text-base bg-[#F7F8F9] text-black pr-12`}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    style={[ getWebOutlineStyle("password", passwordFocused), {borderColor: getBorderColor("password", passwordFocused)}]}
                    onChangeText={(value: string) => updateFormField("password", value)}
                    secureTextEntry={!showPassword}
                    cursorColor={colors.form.INPUT_BORDER_FOCUS}
                    editable={!isLoading}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholderTextColor={colors.ui.PLACEHOLDER}
                  />
                  <TouchableOpacity
                    className="absolute right-4 h-full justify-center"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>}
              </View>

              <View className="flex-row justify-between items-center mt-2.5 mb-[10%] w-4/5">
                <Checkbox title="Lembrar conta" isChecked={rememberMe} onCheck={setRememberMe} colorText="#111" />

                <TouchableOpacity onPress={() => router.replace("/forgotPassword")}>
                  <Text className="text-sm text-primary underline">Esqueci minha senha</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-2">
              <TouchableOpacity
                className={`w-full py-4 bg-primary rounded-lg justify-center items-center mb-6 ${isLoading ? "opacity-70" : ""}`}
                onPress={validateAndLogin}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-semibold">{isLoading ? "Carregando..." : "Entrar"}</Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mb-8">
                <Text className="text-[#6B7280]">Não tem uma conta? </Text>
                <TouchableOpacity onPress={() => USE_SIMPLIFIED_ONBOARDING ? router.push("/quick-start") : router.replace("/(register)")}>
                  <Text className="text-primary font-medium underline">Criar conta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        <LoadingTransition
          isVisible={showLoadingTransition}
          onAnimationComplete={() => setShowLoadingTransition(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Login
