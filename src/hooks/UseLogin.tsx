"use client"

import { useEffect } from "react"
import { useState } from "react"
import { useRouter } from "expo-router"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../services/firebaseConfig"
import Toast from "react-native-toast-message"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuth } from "../context/AuthContext"
import { loginApi } from "../services/apiService"
import { syncUserProgress, getUserProgressFromFirebase, resetUserProgress } from "../services/userProgressService"
import { logSync, LogLevel } from "../services/syncLogger"
import { getDatabase, ref, get, remove } from "firebase/database"
import { getTrails } from "../services/trailsService"

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [savedEmail, setSavedEmail] = useState<string | null>(null)
  const [savedPassword, setSavedPassword] = useState<string | null>(null)
  const [isSyncingProgress, setIsSyncingProgress] = useState(false)
  const router = useRouter()
  const { refreshUserData, setShowLoadingTransition } = useAuth()

  // Load saved credentials when hook initializes
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const email = await AsyncStorage.getItem("rememberedEmail")
        const password = await AsyncStorage.getItem("rememberedPassword")

        if (email) {
          setSavedEmail(email)
        }

        if (password) {
          setSavedPassword(password)
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error)
      }
    }

    loadSavedCredentials()
  }, [])

  // Função para verificar e remover propriedades diretas de trilhas
  const removeDirectTrailProperties = async (userId: string) => {
    try {
      logSync(LogLevel.INFO, "Verificando e removendo propriedades diretas de trilhas...")

      const db = getDatabase()
      const userProgressRef = ref(db, `userProgress/${userId}`)
      const snapshot = await get(userProgressRef)

      if (!snapshot.exists()) {
        logSync(LogLevel.INFO, "Nenhum progresso encontrado para o usuário")
        return false
      }

      const data = snapshot.val()
      const directTrailKeys = Object.keys(data).filter((key) => key.startsWith("trilha_"))

      if (directTrailKeys.length > 0) {
        logSync(LogLevel.INFO, `Encontradas ${directTrailKeys.length} propriedades diretas de trilhas`)

        // Remover cada propriedade direta
        for (const key of directTrailKeys) {
          const directTrailRef = ref(db, `userProgress/${userId}/${key}`)
          await remove(directTrailRef)
          logSync(LogLevel.INFO, `Propriedade direta ${key} removida`)
        }

        return true
      } else {
        logSync(LogLevel.INFO, "Nenhuma propriedade direta de trilha encontrada")
        return false
      }
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao remover propriedades diretas de trilhas:", error)
      return false
    }
  }

  // Função para verificar se o número de trilhas está correto
  const verifyTrailCount = async (userId: string) => {
    try {
      logSync(LogLevel.INFO, "Verificando se o número de trilhas está correto...")

      // Obter trilhas disponíveis
      const trailsResponse = await getTrails()
      if (!trailsResponse?.data) {
        logSync(LogLevel.ERROR, "Erro ao obter trilhas disponíveis")
        return false
      }

      const availableTrailsCount = trailsResponse.data.length
      logSync(LogLevel.INFO, `Número de trilhas disponíveis: ${availableTrailsCount}`)

      // Obter progresso do usuário
      const userProgress = await getUserProgressFromFirebase(userId)
      if (!userProgress) {
        logSync(LogLevel.INFO, "Nenhum progresso encontrado para o usuário")
        return false
      }

      // Verificar se o número de trilhas corresponde
      if (!Array.isArray(userProgress.trails)) {
        logSync(LogLevel.WARNING, "Array de trilhas não encontrado no progresso do usuário")
        return false
      }

      const userTrailsCount = userProgress.trails.length
      logSync(LogLevel.INFO, `Número de trilhas no progresso do usuário: ${userTrailsCount}`)

      if (userTrailsCount !== availableTrailsCount) {
        logSync(
          LogLevel.WARNING,
          `Inconsistência detectada: ${userTrailsCount} trilhas no progresso, mas ${availableTrailsCount} trilhas disponíveis`,
        )
        return false
      }

      logSync(LogLevel.INFO, "Número de trilhas está correto")
      return true
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao verificar número de trilhas:", error)
      return false
    }
  }

  // Função para corrigir o progresso do usuário
  const fixUserProgress = async (userId: string) => {
    try {
      logSync(LogLevel.INFO, "Iniciando correção do progresso do usuário...")

      // 1. Remover propriedades diretas de trilhas
      await removeDirectTrailProperties(userId)

      // 2. Verificar se o número de trilhas está correto
      const isTrailCountCorrect = await verifyTrailCount(userId)

      if (!isTrailCountCorrect) {
        logSync(LogLevel.WARNING, "Número de trilhas incorreto, resetando progresso...")

        // 3. Se o número de trilhas estiver incorreto, resetar o progresso
        await resetUserProgress(userId)

        // 4. Sincronizar novamente
        await syncUserProgress(userId, false, true)

        logSync(LogLevel.INFO, "Progresso do usuário corrigido com sucesso")
        return true
      }

      logSync(LogLevel.INFO, "Progresso do usuário já está correto")
      return true
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao corrigir progresso do usuário:", error)
      return false
    }
  }

  // Modifique a função handleLogin para incluir a correção do progresso
  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Preencha todos os campos!",
      })
      return
    }

    setIsLoading(true)
    setShowLoadingTransition(true)

    // Start a new log session
    logSync(LogLevel.INFO, "=== INICIANDO NOVA SESSÃO DE LOGIN ===")
    logSync(LogLevel.INFO, `Tentando login com: ${email}`)

    try {
      // Save or remove credentials based on rememberMe checkbox
      if (rememberMe) {
        await AsyncStorage.setItem("rememberedEmail", email)
        await AsyncStorage.setItem("rememberedPassword", password)
        logSync(LogLevel.INFO, "Credenciais salvas para lembrar")
      } else {
        await AsyncStorage.removeItem("rememberedEmail")
        await AsyncStorage.removeItem("rememberedPassword")
        logSync(LogLevel.INFO, "Credenciais não serão lembradas")
      }

      // Sign in with Firebase
      logSync(LogLevel.INFO, "Autenticando com Firebase...")
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      logSync(LogLevel.INFO, `Autenticação Firebase bem-sucedida para usuário: ${user.uid}`)

      // Após autenticação com Firebase, obter token JWT da API
      try {
        logSync(LogLevel.INFO, "Obtendo token JWT da API...")
        const apiResponse = await loginApi(email, password)
        if (!apiResponse) {
          logSync(LogLevel.WARNING, "Não foi possível obter token JWT da API")
        } else {
          logSync(LogLevel.INFO, "Token JWT obtido com sucesso")
        }
      } catch (apiError) {
        logSync(LogLevel.ERROR, "Erro ao obter token JWT:", apiError)
        // Não interromper o fluxo se falhar a obtenção do token JWT
      }

      // Corrigir o progresso do usuário
      setIsSyncingProgress(true)
      try {
        logSync(LogLevel.INFO, "Iniciando correção e sincronização do progresso...")

        // Primeiro, corrigir o progresso
        await fixUserProgress(user.uid)

        // Depois, sincronizar
        await syncUserProgress(user.uid, false, true)

        logSync(LogLevel.INFO, "Correção e sincronização concluídas com sucesso")
      } catch (syncError) {
        logSync(LogLevel.ERROR, "Erro ao corrigir e sincronizar progresso:", syncError)
      } finally {
        setIsSyncingProgress(false)
      }

      // Don't navigate here - let the auth state listener handle it
      logSync(LogLevel.INFO, "Login bem-sucedido, o listener de estado de autenticação tratará a navegação")
    } catch (error: any) {
      logSync(LogLevel.ERROR, `Erro de login: ${error.code} - ${error.message}`)
      setShowLoadingTransition(false)

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-email" ||
        error.code === "auth/invalid-credential"
      ) {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Email ou senha inválidos!",
        })
      } else {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Erro ao fazer login, verifique suas credenciais!",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to check if there are any completed phases in the progress
  const checkForCompletedPhases = (progress: any): boolean => {
    if (!progress || !Array.isArray(progress.trails)) {
      return false
    }

    // Verificar fases completadas no array trails
    for (const trail of progress.trails) {
      if (!trail || !Array.isArray(trail.phases)) continue

      for (const phase of trail.phases) {
        if (phase && phase.completed) {
          return true
        }

        // Also check for completed questions
        if (phase && Array.isArray(phase.questionsProgress)) {
          for (const question of phase.questionsProgress) {
            if (question && question.answered && question.correct) {
              return true
            }
          }
        }
      }
    }

    // Verificar também trilhas diretas
    for (const key in progress) {
      if (key.startsWith("trilha_")) {
        const directTrail = progress[key]
        if (directTrail && Array.isArray(directTrail.phases)) {
          for (const phase of directTrail.phases) {
            if (phase && phase.completed) {
              return true
            }

            // Verificar questões
            if (phase && Array.isArray(phase.questionsProgress)) {
              for (const question of phase.questionsProgress) {
                if (question && question.answered && question.correct) {
                  return true
                }
              }
            }
          }
        }
      }
    }

    return false
  }

  const clearSavedCredentials = async () => {
    try {
      logSync(LogLevel.INFO, "Limpando credenciais salvas e realizando logout")

      // 1. Desconectar do Firebase Auth
      await auth.signOut()

      // 2. Limpar todas as credenciais e dados do usuário no AsyncStorage
      await AsyncStorage.removeItem("rememberedEmail")
      await AsyncStorage.removeItem("rememberedPassword")

      // 3. Limpar outros possíveis dados de sessão
      const allKeys = await AsyncStorage.getAllKeys()
      const userDataKeys = allKeys.filter(
        (key) => key.startsWith("user_") || key.includes("token") || key.includes("auth") || key.includes("session"),
      )

      if (userDataKeys.length > 0) {
        await AsyncStorage.multiRemove(userDataKeys)
      }

      // 4. Atualizar o estado local
      setSavedEmail(null)
      setSavedPassword(null)

      logSync(LogLevel.INFO, "Logout realizado com sucesso")
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao fazer logout:", error)
    }
  }

  return {
    handleLogin,
    isLoading,
    googleLoading,
    savedEmail,
    savedPassword,
    clearSavedCredentials,
    isSyncingProgress,
  }
}
