"use client"

import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { View, Text, SafeAreaView, StyleSheet, TextInput, StatusBar, Dimensions } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers"
import Cloudsvg from "../../../assets/images/cloud.svg"
import BigAvatar from "@/src/components/BigAvatar"
import ProgressDots from "@/src/components/ProgressDots"
import Toast from "react-native-toast-message"
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
      <StatusBar barStyle="light-content" backgroundColor="#56A6DC" />

      <View style={styles.backgroundContainer}>
        <Cloudsvg width="90%" height="40%" />
      </View>

      {avatarSource && (
        <BigAvatar avatarSource={avatarSource} style={{ position: "absolute", zIndex: 2, top: getAvatarTop() }} />
      )}

      <View style={styles.formContainer}>
        <Text style={styles.title}>Vamos criar uma senha!</Text>

        <View style={styles.inputsContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { borderColor: getBorderColor("email", emailFocused) }]}
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, { borderColor: getBorderColor("password", field1Focused) }]}
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setField1Focused(true)}
            onBlur={() => setField1Focused(false)}
            secureTextEntry
          />

          <Text style={styles.label}>Confirme sua senha</Text>
          <TextInput
            style={[styles.input, { borderColor: getBorderColor("confirmPassword", field2Focused) }]}
            placeholder="Confirme sua senha"
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#56A6DC",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    top: "4%",
  },
  formContainer: {
    width: "100%",
    height: height <= 732 ? "60%" : "55%",
    marginTop: 20,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    alignItems: "center",
    zIndex: 3,
  },
  inputsContainer: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    height: "47%",
    justifyContent: "space-around",
    top: "8%",
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F7F8F9",
    color: "#000000",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    width: "80%",
  },
  buttonContainer: {
    zIndex: 3,
    position: "absolute",
    bottom: bottomHeight(),
    justifyContent: "space-between",
    height: "20%",
  },
})

export default Step03

