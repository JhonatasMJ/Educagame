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
  Keyboard
} from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers"
import Cloudsvg from "../../../assets/images/cloud.svg"
import BigAvatar from "@/src/components/BigAvatar"
import ProgressDots from "@/src/components/ProgressDots"
import Toast from "react-native-toast-message"
import React from "react"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"

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
  const scrollViewRef = useRef<ScrollView>(null)
  const { isAuthenticated, isLoading } = useRequireAuth({ requireAuth: false });

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

  const handleContinue = () => {
    const newErrors: { email?: boolean; password?: boolean; confirmPassword?: boolean } = {}

    if (!email) newErrors.email = true
    if (!password) newErrors.password = true
    if (!confirmPassword) newErrors.confirmPassword = true
    if (password !== confirmPassword) {
      newErrors.confirmPassword = true
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "As senhas não coincidem!",
      })
      return
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Preencha todos os campos corretamente!",
      })
      return
    }

    // Using consistent params format for navigation
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
      },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Replace KeyboardAvoidingView with ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {avatarSource && <BigAvatar avatarSource={avatarSource} style={{ marginBottom: -20 }} />}
          <View style={styles.backgroundContainer}>
            <Cloudsvg width="90%" height="40%" />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Vamos criar uma senha!</Text>

            <View style={styles.inputsContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={[styles.input, { borderColor: getBorderColor("email", emailFocused) },
                  Platform.select({
                    web: emailFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
                  })
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

              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={[styles.input, { borderColor: getBorderColor("password", field1Focused) },
                  Platform.select({
                    web: field1Focused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
                  })
                ]}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setField1Focused(true)}
                onBlur={() => setField1Focused(false)}
                secureTextEntry
              />

              <Text style={styles.label}>Confirme sua senha</Text>
              <TextInput
                style={[styles.input, { borderColor: getBorderColor("confirmPassword", field2Focused) },
                  Platform.select({
                    web: field2Focused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
                  })
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

            <View style={styles.buttonContainer}>
              <CustomButton title="Continuar" onPress={handleContinue} />
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
    backgroundColor: "#56A6DC",
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
    paddingBottom: 50,
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
    minHeight: height * 0.2,
  },
  inputsContainer: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
    height: "55%",
    gap: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    width: "80%",
    marginBottom: 0,
  },
  input: {
    width: "80%",
    height: "21%",
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F7F8F9",
    color: "#000000",
    marginBottom: 8,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    height: "15%",
    marginTop: 0,
  },
})

export default Step03