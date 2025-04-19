"use client"

import { useLocalSearchParams, router } from "expo-router"
import { useState } from "react"
import { View, Text, SafeAreaView, StyleSheet, StatusBar, Dimensions } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers"
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { getDatabase, ref, serverTimestamp, set } from "firebase/database"
import Toast from "react-native-toast-message"
import Cloudsvg from "../../../assets/images/cloud.svg"
import BigAvatar from "@/src/components/BigAvatar"
import ProgressDots from "@/src/components/ProgressDots"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import ArrowBack from "@/src/components/ArrowBack"
import React from "react"

const { height } = Dimensions.get("window")

const Step04 = () => {
  const [isCreating, setIsCreating] = useState(false)

  // Get all params from previous screens
  const { avatarId, avatarSource, nome, sobrenome, email, birthDate, phone, termsAccepted, lgpdAccepted, password } =
    useLocalSearchParams<{
      avatarId: string
      avatarSource: string
      nome: string
      sobrenome: string
      email: string
      birthDate: string
      phone: string
      termsAccepted: string
      lgpdAccepted: string
      password: string
    }>()

  // Move this hook call to the component level
  const { isAuthenticated, isLoading } = useRequireAuth({ requireAuth: false })

  const handleFinalRegister = async () => {
    try {
      setIsCreating(true)
  
      const auth = getAuth()
  
      // Aguarda o Firebase reconhecer o usuário logado
      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            unsubscribe()
            resolve(user)
          }
        })
      })
  
      const user = auth.currentUser
      if (!user) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Usuário não autenticado!",
        })
        return
      }
  
      const db = getDatabase()
      await set(ref(db, "users/" + user.uid), {
        uid: user.uid,
        email,
        nome,
        sobrenome,
        birthDate,
        phone,
        avatarId,
        avatarSource,
        createdAt: serverTimestamp(),
      })
  
      Toast.show({
        type: "success",
        text1: "Conta criada com sucesso!",
      })
  
      router.push("/(tabs)/home") // ou para onde quiser ir depois do cadastro
    } catch (error: any) {
      console.error("Erro ao finalizar registro:", error)
  
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Falha ao finalizar o registro!",
      })
    } finally {
      setIsCreating(false)
    }
  }
  


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <ArrowBack onPress={() => router.back()} className="top-3 left-3 absolute bg-white" color="#56A6DC" />
      <View style={styles.backgroundContainer}>
        <Cloudsvg width="90%" height="40%" />
      </View>

      {avatarSource && (
        <BigAvatar avatarSource={avatarSource} style={{ position: "absolute", zIndex: 2, top: getAvatarTop() }} />
      )}

      <View style={styles.formContainer}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>
            <Text style={{ fontWeight: "bold", color: "#4A90E2" }}>{nome}, </Text>
            <Text style={{ fontWeight: "bold" }}>está tudo pronto!</Text>
          </Text>
        </View>
        <View style={styles.text}>
          <Text style={{ fontSize: 25, textAlign: "center", paddingHorizontal: "19%" }}>
            Agora é só criar sua conta e começar a estudar!
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title={isCreating ? "Criando conta..." : "Criar conta"}
            onPress={handleFinalRegister}
            disabled={isCreating}
          />
          <View style={{ height: 5 }} />
          <ProgressDots currentStep={4} />
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
    backgroundColor: "#85F995",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    top: 25,
    textAlign: "center",
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
  text: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    height: "55%",
    justifyContent: "center",
    top: "5%",
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

export default Step04
