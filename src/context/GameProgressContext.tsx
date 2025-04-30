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
import { getUserProgressFromFirebase, syncUserProgress, calculatePhaseProgress } from "../services/userProgressService"
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
  const [progress, setProgress] = useState<GameProgress>(initialProgress)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const { authUser, updateUserPoints } = useAuth()
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)

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
        // CRITICAL: First, try to load from AsyncStorage to prevent data loss during page refresh
        try {
          const cachedProgress = await AsyncStorage.getItem(`userProgress_${authUser.uid}`)
          if (cachedProgress) {
            const parsedProgress = JSON.parse(cachedProgress)
            logSync(LogLevel.INFO, "Progresso carregado do AsyncStorage")
            setProgress(parsedProgress)

            // We still need to verify with Firebase, but we'll use this as initial data
            setIsLoading(false)
          }
        } catch (cacheError) {
          logSync(LogLevel.ERROR, "Erro ao carregar progresso do AsyncStorage:", cacheError)
        }

        // Primeiro, tentar carregar do Firebase
        const firebaseProgress = await getUserProgressFromFirebase(authUser.uid)

        if (firebaseProgress) {
          logSync(LogLevel.INFO, "Progresso carregado do Firebase")
          setProgress(firebaseProgress)

          // Cache the progress in AsyncStorage
          try {
            await AsyncStorage.setItem(`userProgress_${authUser.uid}`, JSON.stringify(firebaseProgress))
          } catch (cacheError) {
            logSync(LogLevel.ERROR, "Erro ao salvar progresso no AsyncStorage:", cacheError)
          }
        } else {
          // Se não encontrar no Firebase, tentar carregar da API
          logSync(LogLevel.INFO, "Tentando carregar progresso da API...")
          const apiProgressResponse = await getUserProgress(authUser.uid)

          if (apiProgressResponse?.data) {
            logSync(LogLevel.INFO, "Progresso carregado da API")

            // Garantir que trails seja sempre um array
            const apiProgress = apiProgressResponse.data
            if (!Array.isArray(apiProgress.trails)) {
              apiProgress.trails = []
            }

            setProgress(apiProgress)

            // Cache the progress in AsyncStorage
            try {
              await AsyncStorage.setItem(`userProgress_${authUser.uid}`, JSON.stringify(apiProgress))
            } catch (cacheError) {
              logSync(LogLevel.ERROR, "Erro ao salvar progresso no AsyncStorage:", cacheError)
            }
          } else {
            // Se não encontrar na API, iniciar com progresso vazio
            logSync(LogLevel.INFO, "Nenhum progresso encontrado, iniciando com progresso vazio")

            // Only create new progress if we didn't load from AsyncStorage earlier
            if (!(await AsyncStorage.getItem(`userProgress_${authUser.uid}`))) {
              setProgress(initialProgress)

              // E sincronizar para criar o progresso inicial
              logSync(LogLevel.INFO, "Criando progresso inicial para o usuário...")
              await syncProgress()
            }
          }
        }
      } catch (error) {
        logSync(LogLevel.ERROR, "Erro ao carregar progresso do usuário:", error)

        // Em caso de erro, tentar carregar do AsyncStorage como fallback
        try {
          const savedProgress = await AsyncStorage.getItem(`userProgress_${authUser.uid}`)
          if (savedProgress) {
            logSync(LogLevel.INFO, "Progresso carregado do AsyncStorage como fallback")
            const parsedProgress = JSON.parse(savedProgress)

            // Garantir que trails seja sempre um array
            if (!Array.isArray(parsedProgress.trails)) {
              parsedProgress.trails = []
            }

            setProgress(parsedProgress)
          } else {
            // Se não encontrar no AsyncStorage, criar progresso inicial
            logSync(LogLevel.INFO, "Nenhum progresso encontrado no AsyncStorage, criando progresso inicial...")
            await syncProgress()
          }
        } catch (storageError) {
          logSync(LogLevel.ERROR, "Erro ao carregar progresso do AsyncStorage:", storageError)

          // Mesmo com erro, tentar criar progresso inicial
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

  // Função para iniciar uma fase
  const startPhase = (trailId: string, phaseId: string) => {
    setProgress((prev) => {
      // Garantir que trails seja sempre um array
      if (!Array.isArray(prev.trails)) {
        prev = { ...prev, trails: [] }
      }

      // Find or create trail
      let trail = prev.trails.find((t) => t && t.id === trailId)
      if (!trail) {
        trail = { id: trailId, phases: [] }
        prev.trails.push(trail)
      }

      // Garantir que phases seja sempre um array
      if (!Array.isArray(trail.phases)) {
        trail.phases = []
      }

      // Find or create phase
      let phase = trail.phases.find((p) => p && p.id === phaseId)
      if (!phase) {
        phase = {
          id: phaseId,
          started: true,
          completed: false,
          questionsProgress: [],
          timeSpent: 0,
        }
        trail.phases.push(phase)
      }

      // Mark phase as started
      phase.started = true

      // Chamar a API para atualizar o progresso no servidor
      if (authUser) {
        apiStartPhase(authUser.uid, trailId, phaseId)
          .then(() => logSync(LogLevel.INFO, "Fase iniciada na API com sucesso"))
          .catch((error) => logSync(LogLevel.ERROR, "Erro ao iniciar fase na API:", error))
      }

      return {
        ...prev,
        currentPhaseId: phaseId,
        currentQuestionIndex: 0,
        lastSyncTimestamp: Date.now(),
      }
    })
  }

  // Função para responder uma questão
  const answerQuestion = (correct: boolean, questionId: string) => {
    setProgress((prev) => {
      // Garantir que trails seja sempre um array
      if (!Array.isArray(prev.trails)) {
        prev = { ...prev, trails: [] }
      }

      const newProgress = { ...prev }

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

          const phase = trail.phases.find((p) => p && p.id === newProgress.currentPhaseId)
          if (phase) {
            // Garantir que questionsProgress seja sempre um array
            if (!Array.isArray(phase.questionsProgress)) {
              phase.questionsProgress = []
            }

            // Find or create question progress
            let questionProgress = phase.questionsProgress.find((q) => q && q.id === questionId)
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
              for (const trail of prev.trails) {
                if (!trail || !Array.isArray(trail.phases)) continue

                const phase = trail.phases.find((p) => p && p.id === prev.currentPhaseId)
                if (phase) {
                  apiAnswerQuestion(authUser.uid, trail.id, prev.currentPhaseId, questionId, correct)
                    .then(() => logSync(LogLevel.INFO, "Resposta registrada na API com sucesso"))
                    .catch((error) => logSync(LogLevel.ERROR, "Erro ao registrar resposta na API:", error))
                  break
                }
              }
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
      // Garantir que trails seja sempre um array
      if (!Array.isArray(prev.trails)) {
        prev = { ...prev, trails: [] }
      }

      const newProgress = { ...prev }

      // Find and update phase
      for (const trail of newProgress.trails) {
        if (!trail || !Array.isArray(trail.phases)) continue

        const phase = trail.phases.find((p) => p && p.id === phaseId)
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
      const result = { ...newProgress }
      delete result.currentPhaseId
      delete result.currentQuestionIndex

      // Update timestamp
      result.lastSyncTimestamp = Date.now()

      return result
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