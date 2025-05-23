"use client"

import { useState } from "react"
import { useRouter } from "expo-router"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../services/firebaseConfig"
import { getDatabase, ref, set } from "firebase/database"
import Toast from "react-native-toast-message"
import { useAuth } from "../context/AuthContext"
import { initializeUserData } from "../services/initializeUserData"
import { logSync, LogLevel } from "../services/syncLogger"
import { syncUserProgress } from "../services/userProgressService"

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setJustRegistered, setShowLoadingTransition } = useAuth()

  const handleRegister = async (
    email: string,
    password: string,
    nome: string,
    sobrenome: string,
    phone: string,
    avatarSource: string,
  ) => {
    if (!email || !password || !nome || !sobrenome) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Preencha todos os campos obrigatórios!",
      })
      return
    }

    setIsLoading(true)
    setShowLoadingTransition(true)
    setError(null)

    try {
      logSync(LogLevel.INFO, "=== INICIANDO NOVO CADASTRO ===")
      logSync(LogLevel.INFO, `Tentando cadastrar usuário: ${email}`)

      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      logSync(LogLevel.INFO, `Usuário criado com sucesso: ${user.uid}`)

      // Salvar dados do usuário no Realtime Database
      const db = getDatabase()
      const userRef = ref(db, `users/${user.uid}`)

      const userData = {
        email,
        nome,
        sobrenome,
        phone: phone || "",
        avatarSource: avatarSource || "",
        points: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString().split("T")[0],
        consecutiveDays: 1,
        totalConsecutiveDays: 1,
      }

      await set(userRef, userData)
      logSync(LogLevel.INFO, "Dados do usuário salvos com sucesso")

      // Inicializar o progresso do usuário
      try {
        logSync(LogLevel.INFO, "Inicializando progresso do usuário...")
        await initializeUserData(user.uid, userData)
        logSync(LogLevel.INFO, "Progresso do usuário inicializado com sucesso")

        // Sincronizar progresso com as trilhas disponíveis
        logSync(LogLevel.INFO, "Sincronizando progresso com trilhas disponíveis...")
        await syncUserProgress(user.uid, true, true)
        logSync(LogLevel.INFO, "Sincronização concluída com sucesso")
      } catch (progressError) {
        logSync(LogLevel.ERROR, "Erro ao inicializar/sincronizar progresso:", progressError)
      }

      // Marcar como recém-registrado para forçar refresh na home
      setJustRegistered(true)
      logSync(LogLevel.INFO, "Usuário marcado como recém-registrado")

      // Implementar múltiplos refreshes para consolidar dados
      logSync(LogLevel.INFO, "Iniciando processo de consolidação de dados com múltiplos refreshes")

      // Navegar para a home com parâmetro de refresh
      router.replace({
        pathname: "/(tabs)/home",
        params: {
          needsMultipleRefresh: "true",
          refreshCount: "3", // Número de refreshes a serem realizados
        },
      })
      logSync(LogLevel.INFO, "Navegando para a home com parâmetro de múltiplos refreshes")
    } catch (err: any) {
      setShowLoadingTransition(false)
      logSync(LogLevel.ERROR, `Erro no cadastro: ${err.code} - ${err.message}`)

      if (err.code === "auth/email-already-in-use") {
        setError("Este email já está em uso.")
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Este email já está em uso!",
        })
      } else if (err.code === "auth/invalid-email") {
        setError("Email inválido.")
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Email inválido!",
        })
      } else if (err.code === "auth/weak-password") {
        setError("Senha muito fraca.")
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "A senha deve ter pelo menos 6 caracteres!",
        })
      } else {
        setError("Erro ao cadastrar usuário.")
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Erro ao cadastrar usuário!",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleRegister,
    isLoading,
    error,
  }
}
