"use client"

import React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

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

export const GameProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<GameProgress>(initialProgress)
  const [isLoading, setIsLoading] = useState(true)

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

  // Start a phase
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

      return {
        ...prev,
        currentPhaseId: phaseId,
        currentQuestionIndex: 0,
      }
    })
  }

  // Answer a question
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
              newProgress.totalPoints += 10
            }

            break
          }
        }
      }

      return newProgress
    })
  }

  // Complete a phase
  const completePhase = (phaseId: string, timeSpent: number) => {
    setProgress((prev) => {
      const newProgress = { ...prev }

      // Find and update phase
      for (const trail of newProgress.trails) {
        const phase = trail.phases.find((p) => p.id === phaseId)
        if (phase) {
          phase.completed = true
          phase.timeSpent = timeSpent

          // Add completion bonus
          newProgress.totalPoints += 50
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

