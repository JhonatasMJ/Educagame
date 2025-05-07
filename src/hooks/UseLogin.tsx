"use client"

import { useEffect } from "react"
import { useState } from "react"
import { useRouter } from "expo-router"
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth"
import { auth } from "../services/firebaseConfig"
import Toast from "react-native-toast-message"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuth } from "../context/AuthContext"
import { loginApi } from "../services/apiService"
import { syncUserProgress, resetUserProgress } from "../services/userProgressService"
import { logSync, LogLevel } from "../services/syncLogger"
import { getDatabase, ref, set, get } from "firebase/database"

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [savedEmail, setSavedEmail] = useState<string | null>(null)
  const [savedPassword, setSavedPassword] = useState<string | null>(null)
  const [isSyncingProgress, setIsSyncingProgress] = useState(false)
  const router = useRouter()
  const { refreshUserData, setShowLoadingTransition, setJustLoggedIn } = useAuth() // Include setJustLoggedIn

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

  // Modifique a função verifyAndFixUserProgress para garantir a consolidação adequada dos dados

  const verifyAndFixUserProgress = async (userId: string): Promise<boolean> => {
    try {
      logSync(LogLevel.INFO, "Verificando e corrigindo estrutura do progresso do usuário...")

      // 1. Obter o progresso atual do Firebase
      const db = getDatabase()
      const userProgressRef = ref(db, `userProgress/${userId}`)
      const snapshot = await get(userProgressRef)

      if (!snapshot.exists()) {
        logSync(LogLevel.INFO, "Nenhum progresso encontrado, nada para corrigir")
        return false
      }

      // 2. Obter os dados do progresso
      const currentProgress = snapshot.val()

      // 3. Verificar se há duplicações ou propriedades diretas no objeto trails
      let needsCorrection = false

      // Verificar se trails existe
      if (!currentProgress.trails) {
        currentProgress.trails = []
        needsCorrection = true
      } else if (!Array.isArray(currentProgress.trails)) {
        // Se não for um array, converter para array
        currentProgress.trails = []
        needsCorrection = true
      } else {
        // Verificar propriedades não numéricas no array trails
        const nonNumericKeys = Object.keys(currentProgress.trails).filter(
          (key) => isNaN(Number(key)) && key !== "length",
        )

        if (nonNumericKeys.length > 0) {
          needsCorrection = true
          logSync(LogLevel.WARNING, `Encontradas ${nonNumericKeys.length} propriedades não numéricas no array trails`)
        }

        // Verificar se há trilhas duplicadas por ID
        const trailIds = new Set()
        let duplicateFound = false

        for (let i = 0; i < currentProgress.trails.length; i++) {
          const trail = currentProgress.trails[i]
          if (trail && trail.id) {
            if (trailIds.has(trail.id)) {
              duplicateFound = true
              break
            }
            trailIds.add(trail.id)
          }
        }

        if (duplicateFound) {
          needsCorrection = true
          logSync(LogLevel.WARNING, "Encontradas trilhas com IDs duplicados no array")
        }
      }

      // 4. Aplicar correção se necessário
      if (needsCorrection) {
        logSync(LogLevel.INFO, "Corrigindo estrutura do progresso...")

        // Aplicar a função de correção forçada
        await forceFixUserProgress(userId)

        // Verificar novamente
        const newSnapshot = await get(userProgressRef)
        const fixedProgress = newSnapshot.val()

        // Verificar se a correção foi bem-sucedida
        if (fixedProgress && Array.isArray(fixedProgress.trails)) {
          const nonNumericKeys = Object.keys(fixedProgress.trails).filter(
            (key) => isNaN(Number(key)) && key !== "length",
          )

          if (nonNumericKeys.length === 0) {
            logSync(LogLevel.INFO, "Correção aplicada com sucesso!")
            return true
          } else {
            logSync(
              LogLevel.WARNING,
              "Correção não foi totalmente bem-sucedida, ainda existem propriedades não numéricas",
            )
          }
        }
      } else {
        logSync(LogLevel.INFO, "Estrutura do progresso já está correta, nenhuma ação necessária")
        return true
      }

      return false
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao verificar e corrigir progresso:", error)
      return false
    }
  }

  // Modifique a função forceFixUserProgress para garantir uma limpeza mais completa

  const forceFixUserProgress = async (userId: string): Promise<boolean> => {
    try {
      logSync(LogLevel.INFO, "Iniciando correção forçada do progresso...")

      // 1. Obter o progresso atual
      const db = getDatabase()
      const userProgressRef = ref(db, `userProgress/${userId}`)
      const snapshot = await get(userProgressRef)

      if (!snapshot.exists()) {
        logSync(LogLevel.INFO, "Nenhum progresso encontrado, nada para corrigir")
        return false
      }

      const currentProgress = snapshot.val()

      // 2. Extrair todas as trilhas (de todas as fontes possíveis)
      const allTrails: any[] = []

      // Verificar trilhas no array trails
      if (currentProgress.trails) {
        // Trilhas com índices numéricos
        if (Array.isArray(currentProgress.trails)) {
          currentProgress.trails.forEach((trail: any, index: number) => {
            if (trail && trail.id) {
              logSync(LogLevel.INFO, `Encontrada trilha no array com índice ${index}: ${trail.id}`)
              allTrails.push({ ...trail })
            }
          })
        }

        // Trilhas com índices string no objeto trails
        Object.keys(currentProgress.trails).forEach((key) => {
          if (isNaN(Number(key)) && key !== "length") {
            const trail = currentProgress.trails[key]
            if (trail) {
              // Se não tiver ID, usar a chave como ID
              if (!trail.id) {
                trail.id = key
              }
              logSync(LogLevel.INFO, `Encontrada trilha com chave string ${key}: ${trail.id}`)
              allTrails.push({ ...trail })
            }
          }
        })
      }

      // Verificar propriedades diretas que são trilhas
      Object.keys(currentProgress).forEach((key) => {
        if (
          key !== "trails" &&
          key !== "totalPoints" &&
          key !== "consecutiveCorrect" &&
          key !== "highestConsecutiveCorrect" &&
          key !== "currentPhaseId" &&
          key !== "currentQuestionIndex" &&
          key !== "lastSyncTimestamp"
        ) {
          const directTrail = currentProgress[key]
          if (directTrail && typeof directTrail === "object") {
            // Garantir que tenha um ID
            if (!directTrail.id) {
              directTrail.id = key
            }
            logSync(LogLevel.INFO, `Encontrada trilha como propriedade direta ${key}: ${directTrail.id}`)
            allTrails.push({ ...directTrail })
          }
        }
      })

      // 3. Criar um novo objeto de progresso limpo
      const cleanProgress = {
        totalPoints: currentProgress.totalPoints || 0,
        consecutiveCorrect: currentProgress.consecutiveCorrect || 0,
        highestConsecutiveCorrect: currentProgress.highestConsecutiveCorrect || 0,
        lastSyncTimestamp: Date.now(),
        trails: [] as any[],
      }

      // 4. Mesclar trilhas com o mesmo ID
      const trailMap = new Map<string, any>()

      allTrails.forEach((trail) => {
        if (!trail.id) return

        const existingTrail = trailMap.get(trail.id)

        if (existingTrail) {
          // Mesclar dados
          logSync(LogLevel.INFO, `Mesclando dados da trilha duplicada: ${trail.id}`)

          // Preservar campos importantes
          if (trail.currentPhaseId) existingTrail.currentPhaseId = trail.currentPhaseId
          if (trail.currentQuestionIndex !== undefined) existingTrail.currentQuestionIndex = trail.currentQuestionIndex
          if (trail.consecutiveCorrect !== undefined) existingTrail.consecutiveCorrect = trail.consecutiveCorrect
          if (trail.highestConsecutiveCorrect !== undefined)
            existingTrail.highestConsecutiveCorrect = trail.highestConsecutiveCorrect
          if (trail.totalPoints !== undefined) existingTrail.totalPoints = trail.totalPoints

          // Mesclar fases se existirem
          if (Array.isArray(trail.phases)) {
            if (!Array.isArray(existingTrail.phases)) {
              existingTrail.phases = []
            }

            // Mapa para mesclar fases
            const phaseMap = new Map()

            // Adicionar fases existentes
            existingTrail.phases.forEach((phase: any) => {
              if (phase?.id) {
                phaseMap.set(phase.id, { ...phase })
              }
            })

            // Mesclar com novas fases
            trail.phases.forEach((phase: any) => {
              if (!phase?.id) return

              const existingPhase = phaseMap.get(phase.id)

              if (existingPhase) {
                // Preservar status
                if (phase.completed) existingPhase.completed = true
                if (phase.started) existingPhase.started = true
                if (phase.timeSpent) existingPhase.timeSpent = phase.timeSpent

                // Mesclar questões
                if (Array.isArray(phase.questionsProgress)) {
                  if (!Array.isArray(existingPhase.questionsProgress)) {
                    existingPhase.questionsProgress = []
                  }

                  // Mapa para mesclar questões
                  const questionMap = new Map()

                  // Adicionar questões existentes
                  existingPhase.questionsProgress.forEach((question: any) => {
                    if (question?.id) {
                      questionMap.set(question.id, { ...question })
                    }
                  })

                  // Mesclar com novas questões
                  phase.questionsProgress.forEach((question: any) => {
                    if (!question?.id) return

                    const existingQuestion = questionMap.get(question.id)

                    if (existingQuestion) {
                      // Preservar status
                      if (question.answered) existingQuestion.answered = true
                      if (question.correct) existingQuestion.correct = true
                    } else {
                      questionMap.set(question.id, { ...question })
                    }
                  })

                  // Atualizar questões
                  existingPhase.questionsProgress = Array.from(questionMap.values())
                }
              } else {
                phaseMap.set(phase.id, { ...phase })
              }
            })

            // Atualizar fases
            existingTrail.phases = Array.from(phaseMap.values())
          }
        } else {
          trailMap.set(trail.id, { ...trail })
        }
      })

      // 5. Adicionar trilhas mescladas ao novo progresso como um array puro
      cleanProgress.trails = Array.from(trailMap.values())

      // 6. Salvar o progresso limpo
      await set(userProgressRef, cleanProgress)

      logSync(
        LogLevel.INFO,
        `Correção forçada concluída: ${allTrails.length} trilhas encontradas, ${cleanProgress.trails.length} após mesclagem`,
      )
      return true
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro na correção forçada:", error)
      return false
    }
  }

  // Modifique a função handleLogin para aplicar verificações adicionais

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
      await setPersistence(auth, browserLocalPersistence)
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

      // Verificar e corrigir o progresso do usuário
      setIsSyncingProgress(true)
      try {
        logSync(LogLevel.INFO, "Iniciando verificação e correção do progresso...")

        // Primeiro, verificar e corrigir a estrutura do progresso
        const verified = await verifyAndFixUserProgress(user.uid)

        if (!verified) {
          // Se a verificação automática falhar, aplicar correção forçada
          logSync(LogLevel.WARNING, "Verificação automática falhou, aplicando correção forçada...")
          await forceFixUserProgress(user.uid)
        }

        // Depois, sincronizar com as trilhas disponíveis
        await syncUserProgress(user.uid, false, true)

        logSync(LogLevel.INFO, "Verificação, correção e sincronização concluídas com sucesso")
      } catch (syncError) {
        logSync(LogLevel.ERROR, "Erro ao verificar, corrigir e sincronizar progresso:", syncError)

        // Tentar uma abordagem mais simples como último recurso
        try {
          logSync(LogLevel.INFO, "Tentando abordagem alternativa: reset completo...")
          await resetUserProgress(user.uid)
          logSync(LogLevel.INFO, "Reset completo realizado com sucesso")
        } catch (resetError) {
          logSync(LogLevel.ERROR, "Erro também no reset completo:", resetError)
        }
      } finally {
        setIsSyncingProgress(false)
      }

      // Sinalizar que o login foi concluído recentemente
      // Importe o useAuth e use setJustLoggedIn
      setJustLoggedIn(true)

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

  const clearSavedCredentials = async (): Promise<boolean> => {
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

      // 5. Limpar cache adicional
      try {
        // Limpar todos os outros dados que possam estar armazenados
        const cacheKeys = allKeys.filter(
          (key) =>
            key.includes("cache") ||
            key.includes("progress") ||
            key.includes("state") ||
            key.includes("data") ||
            key.includes("trail"),
        )

        if (cacheKeys.length > 0) {
          await AsyncStorage.multiRemove(cacheKeys)
        }
      } catch (cacheError) {
        logSync(LogLevel.ERROR, "Erro ao limpar cache adicional:", cacheError)
        // Continuar mesmo com erro no cache
      }

      logSync(LogLevel.INFO, "Logout realizado com sucesso")
      return true
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao fazer logout:", error)
      return false
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
