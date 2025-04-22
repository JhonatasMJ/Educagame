"use client"

import { useLocalSearchParams, router } from "expo-router"
import { useState } from "react"
import { View, Text, SafeAreaView, StyleSheet, StatusBar, Dimensions } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { getDatabase, ref, serverTimestamp, set } from "firebase/database"
import Toast from "react-native-toast-message"
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
  const { isAuthenticated, isLoading, refreshUserData } = useRequireAuth({ requireAuth: false })

  // Modifique a função handleFinalRegister para uma abordagem mais robusta
  const handleFinalRegister = async () => {
    try {
      setIsCreating(true)

      const auth = getAuth()
      const db = getDatabase()

      // Verificar se temos email e senha
      if (!email || !password) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Dados de autenticação incompletos",
        })
        return
      }

      console.log("Iniciando processo de finalização de registro")

      // 1. Garantir que o usuário esteja autenticado fazendo login explícito
      try {
        console.log("Tentando fazer login com:", email)
        await signInWithEmailAndPassword(auth, email, password)
        console.log("Login realizado com sucesso")
      } catch (loginError) {
        console.error("Erro ao fazer login:", loginError)
        Toast.show({
          type: "error",
          text1: "Erro de autenticação",
          text2: "Não foi possível autenticar. Tente fazer login manualmente.",
        })
        router.push("/login")
        return
      }

      // 2. Verificar se o usuário está realmente autenticado
      const user = auth.currentUser
      if (!user) {
        console.error("Usuário não está autenticado após login")
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Falha na autenticação. Tente fazer login manualmente.",
        })
        router.push("/login")
        return
      }

      console.log("Usuário autenticado com sucesso:", user.uid)

      // 3. Salvar os dados do usuário no banco de dados
      try {
        await set(ref(db, `users/${user.uid}`), {
          uid: user.uid,
          email,
          nome,
          sobrenome,
          birthDate,
          phone,
          avatarId,
          avatarSource,
          points: 0,
          createdAt: serverTimestamp(),
        })
        console.log("Dados do usuário salvos com sucesso")
      } catch (dbError) {
        console.error("Erro ao salvar dados do usuário:", dbError)
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Conta criada, mas falha ao salvar dados. Tente atualizar seu perfil depois.",
        })
      }

      // 4. Atualizar o contexto de autenticação
      try {
        await refreshUserData()
        console.log("Dados do usuário atualizados no contexto")
      } catch (refreshError) {
        console.error("Erro ao atualizar dados do usuário no contexto:", refreshError)
      }

      // 5. Mostrar mensagem de sucesso
      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Sua conta foi criada com sucesso!",
      })

      // 6. Adicionar um atraso maior antes de navegar
      console.log("Aguardando antes de redirecionar para home...")
      setTimeout(() => {
        console.log("Redirecionando para home")
        router.replace("/(tabs)/home")
      }, 1500)
    } catch (error: any) {
      console.error("Erro geral no processo de registro:", error)
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Ocorreu um erro inesperado. Tente novamente.",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <ArrowBack onPress={() => router.back()} className="top-3 left-3 absolute bg-white" color="#56A6DC" />

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
                      <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 30 }}>
          <CustomButton
            title={isCreating ? "Criando conta..." : "Criar conta"}
            onPress={handleFinalRegister}
            disabled={isCreating}
          />
          </View>
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
