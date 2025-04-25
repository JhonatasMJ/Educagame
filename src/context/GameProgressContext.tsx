"use client"

import React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  startPhase as apiStartPhase,
  answerQuestion as apiAnswerQuestion,
  completePhase as apiCompletePhase,
} from "../services/apiService"
// Importe o contexto de autenticação
import { useAuth } from "./AuthContext"

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
  startPhase: (trailId: string, phaseId: string) => void
  answerQuestion: (correct: boolean, questionId: string) => void
  completePhase: (phaseId: string, timeSpent: number) => void
  getPhaseProgress: (phaseId: string) => PhaseProgress | undefined
  getPhaseCompletionPercentage: (phaseId: string) => number
  resetProgress: () => void
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

// Modifique o GameProgressProvider para usar o contexto de autenticação
export const GameProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<GameProgress>(initialProgress)
  const [isLoading, setIsLoading] = useState(true)
  const { authUser, updateUserPoints } = useAuth() // Use o contexto de autenticação

  // Load progress from AsyncStorage on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem("gameProgress")
        if (savedProgress) {
          setProgress(JSON.parse(savedProgress))
        }
      } catch (error) {
        console.error("Failed to load progress:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [])

  // Save progress to AsyncStorage whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await AsyncStorage.setItem("gameProgress", JSON.stringify(progress))
      } catch (error) {
        console.error("Failed to save progress:", error)
      }
    }

    if (!isLoading) {
      saveProgress()
    }
  }, [progress, isLoading])

  // Modifique a função startPhase para usar a API
  const startPhase = (trailId: string, phaseId: string) => {
    setProgress((prev) => {
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

  // Modifique a função answerQuestion para usar a API
  const answerQuestion = (correct: boolean, questionId: string) => {
    setProgress((prev) => {
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

  // Modifique a função completePhase para usar a API
  const completePhase = async (phaseId: string, timeSpent: number) => {
    setProgress((prev) => {
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

  // Get progress for a specific phase
  const getPhaseProgress = (phaseId: string): PhaseProgress | undefined => {
    for (const trail of progress.trails) {
      const phase = trail.phases.find((p) => p.id === phaseId)
      if (phase) {
        return phase
      }
    }
    return undefined
  }

  // Calculate completion percentage for a phase
  const getPhaseCompletionPercentage = (phaseId: string): number => {
    const phase = getPhaseProgress(phaseId)
    if (!phase || phase.questionsProgress.length === 0) {
      return 0
    }

    const correctCount = phase.questionsProgress.filter((q) => q.correct).length
    return (correctCount / phase.questionsProgress.length) * 100
  }

  // Reset all progress
  const resetProgress = () => {
    setProgress(initialProgress)
  }

  return (
    <GameProgressContext.Provider
      value={{
        progress,
        isLoading,
        startPhase,
        answerQuestion,
        completePhase,
        getPhaseProgress,
        getPhaseCompletionPercentage,
        resetProgress,
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
