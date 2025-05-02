"use client"

import  React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  startPhase as apiStartPhase,
  answerQuestion as apiAnswerQuestion,
  completePhase as apiCompletePhase,
  getUserProgress,
} from "../services/apiService"
import { useAuth } from "./AuthContext"
import { syncUserProgress, getUserProgressFromFirebase, calculatePhaseProgress } from "../services/userProgressService"
import { logSync, LogLevel } from "../services/syncLogger"

// Define types for our progress data
interface QuestionProgress {
  id: string
  answered: boolean
  correct: boolean
}

interface PhaseProgress {
  id: string
  started: boolean
  completed: boolean
  questionsProgress: QuestionProgress[]
  timeSpent: number
}

interface TrailProgress {
  id: string
  phases: PhaseProgress[]
}

interface GameProgress {
  totalPoints: number
  consecutiveCorrect: number
  highestConsecutiveCorrect: number
  trails: TrailProgress[]
  currentPhaseId?: string
  currentQuestionIndex?: number
  lastSyncTimestamp?: number // Add timestamp for tracking last sync
}

interface GameProgressContextType {
  progress: GameProgress
  isLoading: boolean
  isSyncing: boolean
  startPhase: (trailId: string, phaseId: string) => void
  answerQuestion: (correct: boolean, questionId: string) => void
  completePhase: (phaseId: string, timeSpent: number) => void
  getPhaseProgress: (phaseId: string | undefined) => PhaseProgress | undefined
  getPhaseCompletionPercentage: (phaseId: string) => number
  resetProgress: () => void
  syncProgress: () => Promise<void>
  getTrailProgress: (trailId: string | undefined) => TrailProgress | undefined
}

// Create the context
const GameProgressContext = createContext<GameProgressContextType | undefined>(undefined)

// Initial progress state
const initialProgress: GameProgress = {
  totalPoints: 0,
  consecutiveCorrect: 0,
  highestConsecutiveCorrect: 0,
  trails: [],
  lastSyncTimestamp: Date.now(),
}

export const GameProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Função para garantir que o progresso tenha uma estrutura válida
  const ensureValidProgressStructure = (progressData: any): GameProgress => {
    // Se o progresso for nulo ou não for um objeto, retornar o progresso inicial
    if (!progressData || typeof progressData !== "object") {
      return { ...initialProgress }
    }

    // Criar uma cópia do progresso para evitar mutações indesejadas
    const validProgress = { ...progressData }

    // Garantir valores padrão para propriedades essenciais
    validProgress.totalPoints = typeof validProgress.totalPoints === "number" ? validProgress.totalPoints : 0
    validProgress.consecutiveCorrect =
      typeof validProgress.consecutiveCorrect === "number" ? validProgress.consecutiveCorrect : 0
    validProgress.highestConsecutiveCorrect =
      typeof validProgress.highestConsecutiveCorrect === "number" ? validProgress.highestConsecutiveCorrect : 0

    // Verificar e corrigir o array trails
    if (!Array.isArray(validProgress.trails)) {
      validProgress.trails = []
    } else {
      // Limpar trilhas inválidas
      validProgress.trails = validProgress.trails.filter((trail: { id: any }) => trail && typeof trail === "object" && trail.id)

      // Garantir que cada trilha tenha uma estrutura válida
      validProgress.trails = validProgress.trails.map((trail: { phases: any[] }) => {
        // Garantir que phases seja um array
        if (!Array.isArray(trail.phases)) {
          trail.phases = []
        }

        // Verificar e corrigir cada fase
        trail.phases = trail.phases
          .filter((phase: { id: any }) => phase && typeof phase === "object" && phase.id)
          .map((phase: { questionsProgress: any[]; started: any; completed: any; timeSpent: any }) => {
            // Garantir que questionsProgress seja um array
            if (!Array.isArray(phase.questionsProgress)) {
              phase.questionsProgress = []
            }

            // Retornar a fase corrigida
            return {
              ...phase,
              started: !!phase.started,
              completed: !!phase.completed,
              timeSpent: typeof phase.timeSpent === "number" ? phase.timeSpent : 0,
              questionsProgress: phase.questionsProgress.filter((q: { id: any }) => q && q.id),
            }
          })

        // Retornar a trilha corrigida
        return trail
      })
    }

    // Adicionar timestamp se não existir
    if (!validProgress.lastSyncTimestamp) {
      validProgress.lastSyncTimestamp = Date.now()
    }

    return validProgress
  }
  const [progress, setProgress] = useState<GameProgress>(initialProgress)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const { authUser, updateUserPoints } = useAuth()
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)

  const setValidatedProgress = (newProgress: GameProgress | ((prev: GameProgress) => GameProgress)) => {
    if (typeof newProgress === "function") {
      setProgress((prev) => ensureValidProgressStructure(newProgress(prev)))
    } else {
      setProgress(ensureValidProgressStructure(newProgress))
    }
  }

  // Função para sincronizar o progresso do usuário
  const syncProgress = useCallback(async () => {
    if (!authUser) return

    setIsSyncing(true)
    try {
      logSync(LogLevel.INFO, "Sincronizando progresso do usuário...")
      const updatedProgress = await syncUserProgress(authUser.uid)

      if (updatedProgress) {
        setProgress(updatedProgress)
        logSync(LogLevel.INFO, "Progresso do usuário sincronizado com sucesso")
      }
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao sincronizar progresso do usuário:", error)
    } finally {
      setIsSyncing(false)
    }
  }, [authUser])

  // Carregar progresso quando o usuário autenticar
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!authUser) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Tente carregar de várias fontes e aplique a validação em cada caso

        // De AsyncStorage
        try {
          const cachedProgress = await AsyncStorage.getItem(`userProgress_${authUser.uid}`)
          if (cachedProgress) {
            const parsedProgress = JSON.parse(cachedProgress)
            logSync(LogLevel.INFO, "Progresso carregado do AsyncStorage")

            // Aplicar validação antes de definir o estado
            setProgress(ensureValidProgressStructure(parsedProgress))
            setIsLoading(false)
          }
        } catch (cacheError) {
          logSync(LogLevel.ERROR, "Erro ao carregar progresso do AsyncStorage:", cacheError)
        }

        // Do Firebase
        const firebaseProgress = await getUserProgressFromFirebase(authUser.uid)
        if (firebaseProgress) {
          logSync(LogLevel.INFO, "Progresso carregado do Firebase")

          // Aplicar validação antes de definir o estado
          setProgress(ensureValidProgressStructure(firebaseProgress))

          try {
            await AsyncStorage.setItem(`userProgress_${authUser.uid}`, JSON.stringify(firebaseProgress))
          } catch (cacheError) {
            logSync(LogLevel.ERROR, "Erro ao salvar progresso no AsyncStorage:", cacheError)
          }
        } else {
          // Da API
          logSync(LogLevel.INFO, "Tentando carregar progresso da API...")
          const apiProgressResponse = await getUserProgress(authUser.uid)

          if (apiProgressResponse?.data) {
            logSync(LogLevel.INFO, "Progresso carregado da API")

            // Aplicar validação antes de definir o estado
            setProgress(ensureValidProgressStructure(apiProgressResponse.data))

            try {
              await AsyncStorage.setItem(`userProgress_${authUser.uid}`, JSON.stringify(apiProgressResponse.data))
            } catch (cacheError) {
              logSync(LogLevel.ERROR, "Erro ao salvar progresso no AsyncStorage:", cacheError)
            }
          } else if (!(await AsyncStorage.getItem(`userProgress_${authUser.uid}`))) {
            // Iniciar com progresso vazio apenas se não tivermos carregado do AsyncStorage anteriormente
            setProgress(initialProgress)
            await syncProgress()
          }
        }
      } catch (error) {
        logSync(LogLevel.ERROR, "Erro ao carregar progresso do usuário:", error)

        // Tentar carregamento de fallback e aplicar validação
        try {
          const savedProgress = await AsyncStorage.getItem(`userProgress_${authUser.uid}`)
          if (savedProgress) {
            const parsedProgress = JSON.parse(savedProgress)
            setProgress(ensureValidProgressStructure(parsedProgress))
          } else {
            await syncProgress()
          }
        } catch (storageError) {
          logSync(LogLevel.ERROR, "Erro ao carregar progresso do AsyncStorage:", storageError)
          try {
            await syncProgress()
          } catch (syncError) {
            logSync(LogLevel.ERROR, "Erro ao criar progresso inicial:", syncError)
          }
        }
      } finally {
        setIsLoading(false)
        setIsInitialLoadComplete(true)
      }
    }

    loadUserProgress()
  }, [authUser, syncProgress])

  // Save progress to AsyncStorage whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!authUser) return

      try {
        await AsyncStorage.setItem(`userProgress_${authUser.uid}`, JSON.stringify(progress))
        logSync(LogLevel.DEBUG, "Progresso salvo no AsyncStorage")
      } catch (error) {
        logSync(LogLevel.ERROR, "Erro ao salvar progresso no AsyncStorage:", error)
      }
    }

    if (!isLoading && !isSyncing && isInitialLoadComplete) {
      saveProgress()
    }
  }, [progress, isLoading, isSyncing, authUser, isInitialLoadComplete])

  // FUNÇÃO CORRIGIDA: Iniciar uma fase sem criar duplicações
  const startPhase = (trailId: string, phaseId: string) => {
    setProgress((prev) => {
      // Criar uma cópia profunda do progresso atual para evitar mutações indesejadas
      const newProgress = JSON.parse(JSON.stringify(prev))

      // Garantir que trails seja sempre um array
      if (!Array.isArray(newProgress.trails)) {
        newProgress.trails = []
      }

      // CORREÇÃO: Remover qualquer trilha duplicada antes de prosseguir
      // Isso garante que só exista uma trilha com o ID especificado
      const uniqueTrails = []
      const trailIds = new Set()

      for (const trail of newProgress.trails) {
        if (trail && trail.id && !trailIds.has(trail.id)) {
          trailIds.add(trail.id)
          uniqueTrails.push(trail)
        }
      }

      newProgress.trails = uniqueTrails

      // Agora procurar a trilha pelo ID
      let trail = newProgress.trails.find((t: { id: string }) => t && t.id === trailId)

      // Se não encontrar, criar uma nova trilha
      if (!trail) {
        logSync(LogLevel.INFO, `Criando nova trilha: ${trailId}`)
        trail = { id: trailId, phases: [] }
        newProgress.trails.push(trail)
      } else {
        logSync(LogLevel.INFO, `Atualizando trilha existente: ${trailId}`)
      }

      // Garantir que phases seja sempre um array
      if (!Array.isArray(trail.phases)) {
        trail.phases = []
      }

      // Procurar a fase pelo ID
      let phase = trail.phases.find((p: { id: string }) => p && p.id === phaseId)

      // Se não encontrar, criar uma nova fase
      if (!phase) {
        logSync(LogLevel.INFO, `Criando nova fase ${phaseId} na trilha ${trailId}`)
        phase = {
          id: phaseId,
          started: true,
          completed: false,
          questionsProgress: [],
          timeSpent: 0,
        }
        trail.phases.push(phase)
      } else {
        // Marcar fase como iniciada
        logSync(LogLevel.INFO, `Atualizando fase existente ${phaseId} na trilha ${trailId}`)
        phase.started = true
      }

      // Chamar a API para atualizar o progresso no servidor
      if (authUser) {
        apiStartPhase(authUser.uid, trailId, phaseId)
          .then(() => logSync(LogLevel.INFO, "Fase iniciada na API com sucesso"))
          .catch((error) => logSync(LogLevel.ERROR, "Erro ao iniciar fase na API:", error))
      }

      // Atualizar o estado atual
      newProgress.currentPhaseId = phaseId
      newProgress.currentQuestionIndex = 0
      newProgress.lastSyncTimestamp = Date.now()

      return newProgress
    })
  }

  // Função para responder uma questão
  const answerQuestion = (correct: boolean, questionId: string) => {
    setProgress((prev) => {
      // Criar uma cópia profunda do progresso atual
      const newProgress = JSON.parse(JSON.stringify(prev))

      // Garantir que trails seja sempre um array
      if (!Array.isArray(newProgress.trails)) {
        newProgress.trails = []
      }

      // Update consecutive correct count
      if (correct) {
        newProgress.consecutiveCorrect += 1
        newProgress.highestConsecutiveCorrect = Math.max(
          newProgress.highestConsecutiveCorrect,
          newProgress.consecutiveCorrect,
        )
      } else {
        newProgress.consecutiveCorrect = 0
      }

      // Find current phase
      if (newProgress.currentPhaseId) {
        for (const trail of newProgress.trails) {
          if (!trail || !Array.isArray(trail.phases)) continue

          const phase = trail.phases.find((p: { id: any }) => p && p.id === newProgress.currentPhaseId)
          if (phase) {
            // Garantir que questionsProgress seja sempre um array
            if (!Array.isArray(phase.questionsProgress)) {
              phase.questionsProgress = []
            }

            // Find or create question progress
            let questionProgress = phase.questionsProgress.find((q: { id: string }) => q && q.id === questionId)
            if (!questionProgress) {
              questionProgress = { id: questionId, answered: true, correct }
              phase.questionsProgress.push(questionProgress)
            } else {
              questionProgress.answered = true
              questionProgress.correct = correct
            }

            // Add points for correct answers
            if (correct) {
              const pointsPerCorrectAnswer = 10
              newProgress.totalPoints += pointsPerCorrectAnswer

              // Atualizar pontos no Firebase
              updateUserPoints(pointsPerCorrectAnswer)
            }

            // Chamar a API para atualizar o progresso no servidor
            if (authUser && prev.currentPhaseId) {
              apiAnswerQuestion(authUser.uid, trail.id, prev.currentPhaseId, questionId, correct)
                .then(() => logSync(LogLevel.INFO, "Resposta registrada na API com sucesso"))
                .catch((error) => logSync(LogLevel.ERROR, "Erro ao registrar resposta na API:", error))
            }

            break
          }
        }
      }

      // Update timestamp
      newProgress.lastSyncTimestamp = Date.now()

      return newProgress
    })
  }

  // Função para completar uma fase
  const completePhase = (phaseId: string, timeSpent: number) => {
    setProgress((prev) => {
      // Criar uma cópia profunda do progresso atual
      const newProgress = JSON.parse(JSON.stringify(prev))

      // Garantir que trails seja sempre um array
      if (!Array.isArray(newProgress.trails)) {
        newProgress.trails = []
      }

      // Find and update phase
      for (const trail of newProgress.trails) {
        if (!trail || !Array.isArray(trail.phases)) continue

        const phase = trail.phases.find((p: { id: string }) => p && p.id === phaseId)
        if (phase) {
          phase.completed = true
          phase.timeSpent = timeSpent

          // Add completion bonus
          const completionBonus = 50
          newProgress.totalPoints += completionBonus

          // Atualizar pontos no Firebase
          updateUserPoints(completionBonus)

          // Chamar a API para atualizar o progresso no servidor
          if (authUser) {
            apiCompletePhase(authUser.uid, trail.id, phaseId, timeSpent)
              .then(() => logSync(LogLevel.INFO, "Fase completada na API com sucesso"))
              .catch((error) => logSync(LogLevel.ERROR, "Erro ao completar fase na API:", error))
          }
          break
        }
      }

      // Não definir currentPhaseId e currentQuestionIndex como undefined
      // Em vez disso, remover essas propriedades do objeto
      delete newProgress.currentPhaseId
      delete newProgress.currentQuestionIndex

      // Update timestamp
      newProgress.lastSyncTimestamp = Date.now()

      return newProgress
    })
  }

  // Função para obter o progresso de uma fase específica
  const getPhaseProgress = (phaseId: string | undefined): PhaseProgress | undefined => {
    // Se phaseId for undefined, retornar undefined
    if (!phaseId) return undefined

    // Garantir que trails seja sempre um array antes de usar find
    if (!Array.isArray(progress.trails)) {
      return undefined
    }

    for (const trail of progress.trails) {
      if (!trail || !Array.isArray(trail.phases)) continue

      const phase = trail.phases.find((p) => p && p.id === phaseId)
      if (phase) {
        return phase
      }
    }
    return undefined
  }

  // Função para obter o progresso de uma trilha específica
  const getTrailProgress = (trailId: string | undefined): TrailProgress | undefined => {
    // Se trailId for undefined, retornar undefined
    if (!trailId) return undefined

    // Garantir que trails seja sempre um array antes de usar find
    if (!Array.isArray(progress.trails)) {
      return undefined
    }

    return progress.trails.find((t) => t && t.id === trailId)
  }

  // Função para calcular a porcentagem de conclusão de uma fase
  const getPhaseCompletionPercentage = (phaseId: string): number => {
    const phase = getPhaseProgress(phaseId)
    if (!phase) return 0

    return calculatePhaseProgress(phase)
  }

  // Função para resetar o progresso
  const resetProgress = () => {
    setProgress({
      ...initialProgress,
      lastSyncTimestamp: Date.now(),
    })
  }

  return (
    <GameProgressContext.Provider
      value={{
        progress,
        isLoading,
        isSyncing,
        startPhase,
        answerQuestion,
        completePhase,
        getPhaseProgress,
        getPhaseCompletionPercentage,
        resetProgress,
        syncProgress,
        getTrailProgress,
      }}
    >
      {children}
    </GameProgressContext.Provider>
  )
}

// Custom hook to use the game progress context
export const useGameProgress = () => {
  const context = useContext(GameProgressContext)
  if (context === undefined) {
    throw new Error("useGameProgress must be used within a GameProgressProvider")
  }
  return context
}
