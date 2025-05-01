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

  // Modificar a função verifyAndFixUserProgress para garantir que não haja duplicações
  // Substituir a implementação atual da função verifyAndFixUserProgress com esta versão:

  const verifyAndFixUserProgress = async (userId: string): Promise<boolean> => {
    try {
      logSync(LogLevel.INFO, "Verificando e corrigindo estrutura do progresso do usuário...")

      // 1. Obter o progresso atual
      const db = getDatabase()
      const userProgressRef = ref(db, `userProgress/${userId}`)
      const snapshot = await get(userProgressRef)

      if (!snapshot.exists()) {
        logSync(LogLevel.INFO, "Nenhum progresso encontrado, nada para corrigir")
        return false
      }

      const currentProgress = snapshot.val()

      // 2. Verificar se há problemas na estrutura
      let needsFix = false

      // Verificar se trails existe
      if (!currentProgress.trails) {
        logSync(LogLevel.WARNING, "O campo trails não existe, correção necessária")
        needsFix = true
        currentProgress.trails = []
      }

      // Verificar se há propriedades diretas de trilhas
      const directTrailKeys = Object.keys(currentProgress).filter(
        (key) => key.startsWith("trilha_") && key !== "trails",
      )

      if (directTrailKeys.length > 0) {
        logSync(LogLevel.WARNING, `Encontradas ${directTrailKeys.length} propriedades diretas de trilhas`)
        needsFix = true
      }

      // Verificar se há trilhas com índice numérico e string ao mesmo tempo no array trails
      if (currentProgress.trails) {
        const trailsObj = currentProgress.trails
        const stringIndices = Object.keys(trailsObj).filter((key) => isNaN(Number(key)) && key !== "length")

        if (stringIndices.length > 0) {
          logSync(LogLevel.WARNING, `Encontrados ${stringIndices.length} índices de string no array trails`)
          needsFix = true
        }
      }

      // 3. Se necessário, corrigir o progresso
      if (needsFix) {
        logSync(LogLevel.INFO, "Correção necessária, aplicando correções...")

        // Aplicar a função de correção
        const fixedProgress = fixDuplicateTrailsInArray(currentProgress)

        // Salvar o progresso corrigido
        await set(userProgressRef, fixedProgress)

        logSync(LogLevel.INFO, "Progresso corrigido com sucesso")
        return true
      }

      logSync(LogLevel.INFO, "Progresso já está correto, nenhuma correção necessária")
      return false
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao verificar e corrigir progresso:", error)
      return false
    }
  }

  // Adicionar a função de correção direta para uso em situações críticas
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
          currentProgress.trails.forEach((trail, index) => {
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
        if (key.startsWith("trilha_") && key !== "trails") {
          const directTrail = currentProgress[key]
          if (directTrail) {
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
            existingTrail.phases.forEach((phase) => {
              if (phase?.id) {
                phaseMap.set(phase.id, { ...phase })
              }
            })

            // Mesclar com novas fases
            trail.phases.forEach((phase) => {
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
                  existingPhase.questionsProgress.forEach((question) => {
                    if (question?.id) {
                      questionMap.set(question.id, { ...question })
                    }
                  })

                  // Mesclar com novas questões
                  phase.questionsProgress.forEach((question) => {
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

      // 5. Adicionar trilhas mescladas ao novo progresso
      trailMap.forEach((trail) => {
        cleanProgress.trails.push(trail)
      })

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

  // Modificar a função handleLogin para incluir a correção forçada
  // Adicionar esta linha dentro do bloco try/catch da sincronização de progresso:

  const fixDuplicateTrailsInArray = (progress: any) => {
    if (!progress || !progress.trails || !Array.isArray(progress.trails)) {
      return progress
    }

    const uniqueTrails = new Map()

    progress.trails = progress.trails.filter((trail) => {
      if (!trail || !trail.id) {
        return true // Keep trails without an ID
      }

      if (uniqueTrails.has(trail.id)) {
        return false // Remove duplicate
      } else {
        uniqueTrails.set(trail.id, true)
        return true // Keep unique trail
      }
    })

    return progress
  }

  // Modifique a função handleLogin para incluir a verificação e correção do progresso
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
        await verifyAndFixUserProgress(user.uid)
        await forceFixUserProgress(user.uid)

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
