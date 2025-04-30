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
import { syncUserProgress, getUserProgressFromFirebase } from "../services/userProgressService"
import { logSync, LogLevel } from "../services/syncLogger"
import { getDatabase, ref, set } from "firebase/database"

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

  // Modify the handleLogin function to better preserve existing progress data
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

      // CRITICAL: Check for cached progress in AsyncStorage before proceeding
      let cachedProgress = null
      try {
        const cachedProgressStr = await AsyncStorage.getItem(`userProgress_${user.uid}`)
        if (cachedProgressStr) {
          cachedProgress = JSON.parse(cachedProgressStr)
          logSync(LogLevel.INFO, "Progresso em cache encontrado no AsyncStorage", {
            trailsCount: cachedProgress.trails?.length || 0,
            hasCompletedPhases: checkForCompletedPhases(cachedProgress),
          })

          // Log detailed information about completed phases and questions
          if (cachedProgress.trails && Array.isArray(cachedProgress.trails)) {
            logSync(LogLevel.INFO, "Detalhes do progresso em cache:")
            cachedProgress.trails.forEach((trail: { phases: any[]; id: any }) => {
              if (trail && trail.phases && Array.isArray(trail.phases)) {
                trail.phases.forEach((phase) => {
                  if (phase && phase.completed) {
                    logSync(LogLevel.INFO, `Fase completada encontrada: ${phase.id} na trilha ${trail.id}`)
                  }

                  if (phase && phase.questionsProgress && Array.isArray(phase.questionsProgress)) {
                    const answeredQuestions = phase.questionsProgress.filter((q: { answered: any }) => q && q.answered).length
                    const correctQuestions = phase.questionsProgress.filter((q: { correct: any }) => q && q.correct).length

                    if (answeredQuestions > 0) {
                      logSync(
                        LogLevel.INFO,
                        `Fase ${phase.id}: ${answeredQuestions} questões respondidas, ${correctQuestions} corretas`,
                      )
                    }
                  }
                })
              }
            })
          }
        }
      } catch (cacheError) {
        logSync(LogLevel.ERROR, "Erro ao verificar progresso em cache:", cacheError)
      }

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

      // CRITICAL: Check if there's already progress in Firebase
      const existingFirebaseProgress = await getUserProgressFromFirebase(user.uid)

      // If we have cached progress with completed phases but no Firebase progress,
      // or if the cached progress has more completed phases than Firebase
      if (
        cachedProgress &&
        (!existingFirebaseProgress ||
          countCompletedItems(cachedProgress) > countCompletedItems(existingFirebaseProgress))
      ) {
        logSync(LogLevel.INFO, "O progresso em cache tem mais itens completados que o Firebase, salvando primeiro...")

        // Save cached progress to Firebase to ensure it's not lost
        const db = getDatabase()
        const userProgressRef = ref(db, `userProgress/${user.uid}`)
        await set(userProgressRef, cachedProgress)
        logSync(LogLevel.INFO, "Progresso em cache salvo no Firebase com sucesso")
      }

      // Sincronizar o progresso do usuário com as trilhas disponíveis
      // IMPORTANTE: Passamos false para NÃO forçar a criação de novo progresso
      // Isso preservará os dados existentes
      setIsSyncingProgress(true)
      try {
        logSync(LogLevel.INFO, "Iniciando sincronização de progresso (preservando dados existentes)...")

        // CRITICAL: Set preserveCompletion to true to ensure completed status is preserved
        await syncUserProgress(user.uid, false, true)
        logSync(LogLevel.INFO, "Sincronização de progresso concluída com sucesso")
      } catch (syncError) {
        logSync(LogLevel.ERROR, "Erro ao sincronizar progresso do usuário:", syncError)
        // Não interromper o fluxo se falhar a sincronização
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

    return false
  }

  // Helper function to count completed items (phases and questions)
  const countCompletedItems = (progress: any): number => {
    if (!progress || !Array.isArray(progress.trails)) {
      return 0
    }

    let count = 0

    for (const trail of progress.trails) {
      if (!trail || !Array.isArray(trail.phases)) continue

      for (const phase of trail.phases) {
        // Count completed phases
        if (phase && phase.completed) {
          count += 10 // Give higher weight to completed phases
        }

        // Count started phases
        if (phase && phase.started) {
          count += 1
        }

        // Count answered and correct questions
        if (phase && Array.isArray(phase.questionsProgress)) {
          for (const question of phase.questionsProgress) {
            if (question && question.answered) {
              count += 1

              if (question.correct) {
                count += 1
              }
            }
          }
        }
      }
    }

    return count
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
