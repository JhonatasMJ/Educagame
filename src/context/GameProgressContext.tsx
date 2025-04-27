"use client"

import React from "react"
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
}

interface GameProgressContextType {
  progress: GameProgress
  isLoading: boolean
  isSyncing: boolean
  startPhase: (trailId: string, phaseId: string) => void
  answerQuestion: (correct: boolean, questionId: string) => void
  completePhase: (phaseId: string, timeSpent: number) => void
  getPhaseProgress: (phaseId: string) => PhaseProgress | undefined
  getPhaseCompletionPercentage: (phaseId: string) => number
  resetProgress: () => void
  syncProgress: () => Promise<void>
  getTrailProgress: (trailId: string) => TrailProgress | undefined
}

// Create the context
const GameProgressContext = createContext<GameProgressContextType | undefined>(undefined)

// Initial progress state
const initialProgress: GameProgress = {
  totalPoints: 0,
  consecutiveCorrect: 0,
  highestConsecutiveCorrect: 0,
  trails: [],
}

export const GameProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<GameProgress>(initialProgress)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const { authUser, updateUserPoints } = useAuth()

  // Função para sincronizar o progresso do usuário
  const syncProgress = useCallback(async () => {
    if (!authUser) return

    setIsSyncing(true)
    try {
      console.log("Sincronizando progresso do usuário...")
      const updatedProgress = await syncUserProgress(authUser.uid)

      if (updatedProgress) {
        setProgress(updatedProgress)
        console.log("Progresso do usuário sincronizado com sucesso")
      }
    } catch (error) {
      console.error("Erro ao sincronizar progresso do usuário:", error)
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
        // Primeiro, tentar carregar do Firebase
        const firebaseProgress = await getUserProgressFromFirebase(authUser.uid)

        if (firebaseProgress) {
          console.log("Progresso carregado do Firebase")
          setProgress(firebaseProgress)
        } else {
          // Se não encontrar no Firebase, tentar carregar da API
          console.log("Tentando carregar progresso da API...")
          const apiProgressResponse = await getUserProgress(authUser.uid)

          if (apiProgressResponse?.data) {
            console.log("Progresso carregado da API")

            // Garantir que trails seja sempre um array
            const apiProgress = apiProgressResponse.data
            if (!Array.isArray(apiProgress.trails)) {
              apiProgress.trails = []
            }

            setProgress(apiProgress)
          } else {
            // Se não encontrar na API, iniciar com progresso vazio
            console.log("Nenhum progresso encontrado, iniciando com progresso vazio")
            setProgress(initialProgress)

            // E sincronizar para criar o progresso inicial
            console.log("Criando progresso inicial para o usuário...")
            await syncProgress()
          }
        }
      } catch (error) {
        console.error("Erro ao carregar progresso do usuário:", error)

        // Em caso de erro, tentar carregar do AsyncStorage como fallback
        try {
          const savedProgress = await AsyncStorage.getItem("gameProgress")
          if (savedProgress) {
            console.log("Progresso carregado do AsyncStorage")
            const parsedProgress = JSON.parse(savedProgress)

            // Garantir que trails seja sempre um array
            if (!Array.isArray(parsedProgress.trails)) {
              parsedProgress.trails = []
            }

            setProgress(parsedProgress)
          } else {
            // Se não encontrar no AsyncStorage, criar progresso inicial
            console.log("Nenhum progresso encontrado no AsyncStorage, criando progresso inicial...")
            await syncProgress()
          }
        } catch (storageError) {
          console.error("Erro ao carregar progresso do AsyncStorage:", storageError)

          // Mesmo com erro, tentar criar progresso inicial
          try {
            await syncProgress()
          } catch (syncError) {
            console.error("Erro ao criar progresso inicial:", syncError)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProgress()
  }, [authUser, syncProgress])

  // Save progress to AsyncStorage whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await AsyncStorage.setItem("gameProgress", JSON.stringify(progress))
      } catch (error) {
        console.error("Failed to save progress to AsyncStorage:", error)
      }
    }

    if (!isLoading && !isSyncing) {
      saveProgress()
    }
  }, [progress, isLoading, isSyncing])

  // Função para iniciar uma fase
  const startPhase = (trailId: string, phaseId: string) => {
    setProgress((prev) => {
      // Garantir que trails seja sempre um array
      if (!Array.isArray(prev.trails)) {
        prev = { ...prev, trails: [] }
      }

      // Find or create trail
      let trail = prev.trails.find((t) => t.id === trailId)
      if (!trail) {
        trail = { id: trailId, phases: [] }
        prev.trails.push(trail)
      }

      // Find or create phase
      let phase = trail.phases.find((p) => p.id === phaseId)
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
          .then(() => console.log("Fase iniciada na API com sucesso"))
          .catch((error) => console.error("Erro ao iniciar fase na API:", error))
      }

      return {
        ...prev,
        currentPhaseId: phaseId,
        currentQuestionIndex: 0,
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
          const phase = trail.phases.find((p) => p.id === newProgress.currentPhaseId)
          if (phase) {
            // Find or create question progress
            let questionProgress = phase.questionsProgress.find((q) => q.id === questionId)
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
                const phase = trail.phases.find((p) => p.id === prev.currentPhaseId)
                if (phase) {
                  apiAnswerQuestion(authUser.uid, trail.id, prev.currentPhaseId, questionId, correct)
                    .then(() => console.log("Resposta registrada na API com sucesso"))
                    .catch((error) => console.error("Erro ao registrar resposta na API:", error))
                  break
                }
              }
            }

            break
          }
        }
      }

      return newProgress
    })
  }

  // Função para completar uma fase
  const completePhase = async (phaseId: string, timeSpent: number) => {
    setProgress((prev) => {
      // Garantir que trails seja sempre um array
      if (!Array.isArray(prev.trails)) {
        prev = { ...prev, trails: [] }
      }

      const newProgress = { ...prev }

      // Find and update phase
      for (const trail of newProgress.trails) {
        const phase = trail.phases.find((p) => p.id === phaseId)
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
            for (const trail of newProgress.trails) {
              const phase = trail.phases.find((p) => p.id === phaseId)
              if (phase) {
                apiCompletePhase(authUser.uid, trail.id, phaseId, timeSpent)
                  .then(() => console.log("Fase completada na API com sucesso"))
                  .catch((error) => console.error("Erro ao completar fase na API:", error))
                break
              }
            }
          }
          break
        }
      }

      // Clear current phase
      newProgress.currentPhaseId = undefined
      newProgress.currentQuestionIndex = undefined

      return newProgress
    })
  }

  // Função para obter o progresso de uma fase específica
  const getPhaseProgress = (phaseId: string): PhaseProgress | undefined => {
    // Garantir que trails seja sempre um array antes de usar find
    if (!Array.isArray(progress.trails)) {
      return undefined
    }

    for (const trail of progress.trails) {
      const phase = trail.phases.find((p) => p.id === phaseId)
      if (phase) {
        return phase
      }
    }
    return undefined
  }

  // Função para obter o progresso de uma trilha específica
  const getTrailProgress = (trailId: string): TrailProgress | undefined => {
    // Garantir que trails seja sempre um array antes de usar find
    if (!Array.isArray(progress.trails)) {
      return undefined
    }

    return progress.trails.find((t) => t.id === trailId)
  }

  // Função para calcular a porcentagem de conclusão de uma fase
  const getPhaseCompletionPercentage = (phaseId: string): number => {
    const phase = getPhaseProgress(phaseId)
    if (!phase) return 0

    return calculatePhaseProgress(phase)
  }

  // Função para resetar o progresso
  const resetProgress = () => {
    setProgress(initialProgress)
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
