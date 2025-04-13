"use client"

import { useState, useEffect } from "react"
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
} from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { useLogin } from "../hooks/UseLogin"
import Checkbox from "../components/Checkbox"
import Logo from "../../assets/images/logo.svg"
import React from "react"

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
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [rememberMe, setRememberMe] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Set the email and password fields if we have saved credentials
  useEffect(() => {
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }))
      setRememberMe(true) // Also check the remember me box
    }

    if (savedPassword) {
      setFormData((prev) => ({ ...prev, password: savedPassword }))
    }
  }, [savedEmail, savedPassword])

  const updateFormField = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateAndLogin = () => {
    const newErrors: Errors = {}

    if (!formData.email.trim()) {
      newErrors.email = "O e-mail é obrigatório"
    }

    if (!formData.password.trim()) {
      newErrors.password = "A senha é obrigatória"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Pass the rememberMe state to the login handler
    handleLogin(formData.email, formData.password, rememberMe)
  }

  const getBorderColor = (field: keyof Errors, isFocused: boolean) => {
    if (errors[field]) return "border-red-500"
    if (isFocused) return "border-[#56A6DC]"
    return "border-[#E8ECF4]"
  }

  const getWebOutlineStyle = (field: keyof Errors, isFocused: boolean) => {
    if (Platform.OS === "web" && isFocused) {
      return "outline-[#56A6DC] outline-2"
    }
    return ""
  }

  const marginTopForLogo = () => {
    const { width } = Dimensions.get("window")
    if (width <= 410) {
      return "mt-[18%]"
    } else {
      return "mt-10"
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
              <View className="items-center">
                <Logo style={{ width: 315, height: 65 }} />
              </View>
            </View>

            <View className="mt-5">
              <Text className="text-lg font-medium text-[#3B82F6] mb-1">Bem-vindo (a) 👋</Text>
              <Text className="text-3xl font-bold mb-4">Entre na sua conta</Text>
            </View>

            <View className="justify-center mt-2">
              <View className="mb-5">
                <Text className="text-base font-medium text-[#4B5563] mb-2">E-mail:</Text>
                <TextInput
                  className={`w-full h-16 border-2 rounded-lg px-4 py-3 text-base bg-[#F7F8F9] text-black ${getBorderColor("email", emailFocused)} ${getWebOutlineStyle("email", emailFocused)}`}
                  placeholder="Digite seu e-mail"
                  value={formData.email}
                  onChangeText={(value: string) => updateFormField("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  cursorColor="#3B82F6"
                  editable={!isLoading}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholderTextColor="#999"
                />
                {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>}
              </View>

              <View className="mb-5">
                <Text className="text-base font-medium text-[#4B5563] mb-2">Senha:</Text>
                <View className="relative">
                  <TextInput
                    className={`w-full h-16 border-2 rounded-lg px-4 py-3 text-base bg-[#F7F8F9] text-black pr-12 ${getBorderColor("password", passwordFocused)} ${getWebOutlineStyle("password", passwordFocused)}`}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChangeText={(value: string) => updateFormField("password", value)}
                    secureTextEntry={!showPassword}
                    cursorColor="#3B82F6"
                    editable={!isLoading}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholderTextColor="#999"
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
                <Checkbox title="Lembrar conta" isChecked={rememberMe} onCheck={setRememberMe} colorText="#3B82F6" />

                <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
                  <Text className="text-sm text-[#3B82F6] underline">Esqueci minha senha</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-2">
              <TouchableOpacity
                className={`w-full py-4 bg-[#3B82F6] rounded-lg justify-center items-center mb-6 ${isLoading ? "opacity-70" : ""}`}
                onPress={validateAndLogin}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-semibold">{isLoading ? "Carregando..." : "Entrar"}</Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mb-8">
                <Text className="text-[#6B7280]">Não tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.push("/(register)")}>
                  <Text className="text-[#3B82F6] font-medium underline">Criar conta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Login