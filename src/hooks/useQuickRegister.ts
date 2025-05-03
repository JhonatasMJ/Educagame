"use client"

import { useState } from "react"
import { useRouter } from "expo-router"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../services/firebaseConfig"
import { getDatabase, ref, set } from "firebase/database"
import Toast from "react-native-toast-message"
import { useAuth } from "../context/AuthContext"
import { initializeNewUserProgress } from "../services/userProgressService"
import { logSync, LogLevel } from "../services/syncLogger"
import { syncUserProgress } from "../services/userProgressService"
import { SIMPLIFIED_ONBOARDING_CONFIG } from "@/config/appConfig"

export const useQuickRegister = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setJustRegistered, setShowLoadingTransition } = useAuth()

  // Função para gerar um email aleatório baseado no nome do usuário
  const generateRandomEmail = (name: string): string => {
    const sanitizedName = name
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "")
    const randomString = Math.random().toString(36).substring(2, 10)
    return `${sanitizedName}_${randomString}@${SIMPLIFIED_ONBOARDING_CONFIG.AUTO_EMAIL_DOMAIN}`
  }

  // Função para gerar uma senha aleatória forte
  const generateRandomPassword = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleQuickRegister = async (name: string, avatarId: string) => {
    if (!name || !avatarId) {
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
      logSync(LogLevel.INFO, "=== INICIANDO CADASTRO RÁPIDO ===")

      // Gerar email e senha aleatórios
      const email = generateRandomEmail(name)
      const password = generateRandomPassword()

      logSync(LogLevel.INFO, `Tentando cadastrar usuário rápido: ${email}`)

      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      logSync(LogLevel.INFO, `Usuário criado com sucesso: ${user.uid}`)

      // Determinar nome e sobrenome
      const nameParts = name.trim().split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

      // Salvar dados do usuário no Realtime Database
      const db = getDatabase()
      const userRef = ref(db, `users/${user.uid}`)

      const userData = {
        email,
        nome: firstName,
        sobrenome: lastName,
        phone: SIMPLIFIED_ONBOARDING_CONFIG.DEFAULT_VALUES.phone,
        avatarSource: `avatar${avatarId}`,
        avatarId: avatarId,
        points: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString().split("T")[0],
        consecutiveDays: 1,
        totalConsecutiveDays: 1,
        birthDate: SIMPLIFIED_ONBOARDING_CONFIG.DEFAULT_VALUES.birthDate,
        lgpdAccepted: SIMPLIFIED_ONBOARDING_CONFIG.DEFAULT_VALUES.lgpdAccepted,
        termsAccepted: SIMPLIFIED_ONBOARDING_CONFIG.DEFAULT_VALUES.termsAccepted,
      }

      await set(userRef, userData)
      logSync(LogLevel.INFO, "Dados do usuário salvos com sucesso")

      // Inicializar o progresso do usuário
      try {
        logSync(LogLevel.INFO, "Inicializando progresso do usuário...")
        await initializeNewUserProgress(user.uid)
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
      logSync(LogLevel.ERROR, `Erro no cadastro rápido: ${err.code} - ${err.message}`)

      if (err.code === "auth/email-already-in-use") {
        // Improvável, mas possível se o email gerado já existir
        setError("Erro ao criar conta. Tente novamente.")
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Erro ao criar conta. Tente novamente!",
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
    handleQuickRegister,
    isLoading,
    error,
  }
}
