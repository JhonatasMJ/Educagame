"use client"

import { useState } from "react"
import { SafeAreaView, StyleSheet, Text, TextInput, View, StatusBar, Dimensions } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { getDatabase, ref, set } from "firebase/database"
import { auth } from "@/src/services/firebaseConfig"
import { createUserWithEmailAndPassword } from "firebase/auth"
import Toast from "react-native-toast-message"
import CustomButton from "@/src/components/CustomButton"
import Checkbox from "@/src/components/Checkbox"
import Cloudsvg from "../../../assets/images/cloud.svg"
import BigAvatar from "@/src/components/BigAvatar"
import ProgressDots from "@/src/components/ProgressDots"
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers"

const { height } = Dimensions.get("window")

const Step02 = () => {
  const router = useRouter()

  const { nome, sobrenome, email, avatarId, avatarSource } = useLocalSearchParams<{
    nome: string
    sobrenome: string
    email: string
    avatarId: string
    avatarSource: string
  }>()

  const [birthDate, setBirthDate] = useState("")
  const [phone, setPhone] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!birthDate || !phone || !termsAccepted || !lgpdAccepted) {
      Toast.show({ type: "error", text1: "Erro", text2: "Preencha todos os campos!" })
      return
    }

    setIsLoading(true)

    try {
      // Generate a random password
      const password = Math.random().toString(36).slice(-8)

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      // Save user data to Firebase Realtime Database
      const db = getDatabase()
      await set(ref(db, `users/${uid}`), {
        nome,
        sobrenome,
        email,
        avatarId,
        birthDate,
        phone,
        termsAccepted,
        lgpdAccepted,
        createdAt: new Date().toISOString(),
      })

      Toast.show({ type: "success", text1: "Sucesso", text2: "Cadastro completo!" })

      // Navigate to the next step (Step 3)
      router.push("/step3")
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Erro", text2: error.message || "Falha ao salvar dados!" })
    } finally {
      setIsLoading(false)
    }
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
          <Text style={styles.label}>Data Nascimento</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={birthDate}
            onChangeText={setBirthDate}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Celular</Text>
          <TextInput
            style={styles.input}
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
          <CustomButton title="Continuar" onPress={handleContinue} isLoading={isLoading} />
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
    height: "50%",
    justifyContent: "space-between",
    top: "5%",
  },
  input: {
    width: "80%",
    borderWidth: 2,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    width: "80%",
  },
  checkboxesContainer: {
    width: "100%",
    alignItems: "center",
    height: "25%",
    justifyContent: "space-between",
    top: "5%",
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

