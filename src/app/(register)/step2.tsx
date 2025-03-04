"use client"

import { useState } from "react"
import { SafeAreaView, StyleSheet, Text, TextInput, View, StatusBar, Dimensions } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import Toast from "react-native-toast-message"
import CustomButton from "@/src/components/CustomButton"
import Checkbox from "@/src/components/Checkbox"
import Cloudsvg from "../../../assets/images/cloud.svg"
import BigAvatar from "@/src/components/BigAvatar"
import ProgressDots from "@/src/components/ProgressDots"
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers"

const { height } = Dimensions.get("window")

const Step02 = () => {
  // Get params from previous screen
  const { nome, sobrenome, avatarId, avatarSource } = useLocalSearchParams<{
    nome: string
    sobrenome: string
    avatarId: string
    avatarSource: string
  }>()

  const [email, setEmail] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [phone, setPhone] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
  const [errors, setErrors] = useState<{
    email?: boolean
    birthDate?: boolean
    phone?: boolean
  }>({})

  const [emailFocused, setEmailFocused] = useState(false)
  const [field1Focused, setField1Focused] = useState(false)
  const [field2Focused, setField2Focused] = useState(false)

  const getBorderColor = (field: "email" | "birthDate" | "phone", isFocused: boolean) => {
    if (errors[field]) return "#FF0000"
    if (isFocused) return "#56A6DC"
    return "#E8ECF4"
  }

  const handleContinue = () => {
    const newErrors: { email?: boolean; birthDate?: boolean; phone?: boolean } = {}

    if (!email) newErrors.email = true
    if (!birthDate) newErrors.birthDate = true
    if (!phone) newErrors.phone = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      Toast.show({ type: "error", text1: "Erro", text2: "Preencha todos os campos!" })
      return
    }

    if (!termsAccepted || !lgpdAccepted) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Você precisa aceitar os termos para continuar!",
      })
      return
    }

    // Using consistent params format for navigation
    router.push({
      pathname: "/(register)/step3",
      params: {
        nome,
        sobrenome,
        email,
        birthDate,
        phone,
        termsAccepted: termsAccepted.toString(),
        lgpdAccepted: lgpdAccepted.toString(),
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
        <Text style={styles.title}>{nome}, falta pouco!</Text>

        <View style={styles.inputsContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { borderColor: getBorderColor("email", emailFocused) }]}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Data Nascimento</Text>
          <TextInput
            style={[styles.input, { borderColor: getBorderColor("birthDate", field1Focused) }]}
            onFocus={() => setField1Focused(true)}
            onBlur={() => setField1Focused(false)}
            placeholder="DD/MM/AAAA"
            value={birthDate}
            onChangeText={setBirthDate}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Celular</Text>
          <TextInput
            style={[styles.input, { borderColor: getBorderColor("phone", field2Focused) }]}
            onFocus={() => setField2Focused(true)}
            onBlur={() => setField2Focused(false)}
            placeholder="Digite seu celular"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
          />

          <View style={styles.checkboxesContainer}>
            <Checkbox title="Termos de uso" isChecked={termsAccepted} onCheck={setTermsAccepted} />
            <Checkbox title="LGPD" isChecked={lgpdAccepted} onCheck={setLgpdAccepted} />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton title="Continuar" onPress={handleContinue} />
          <ProgressDots currentStep={2} />
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
    top: 10,
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
    height: "60%",
    justifyContent: "space-between",
    top: "5%",
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
  checkboxesContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  buttonContainer: {
    zIndex: 3,
    position: "absolute",
    bottom: bottomHeight(),
    justifyContent: "space-between",
    height: "20%",
  },
})

export default Step02

