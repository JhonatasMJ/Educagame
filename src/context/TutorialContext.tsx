"use client"

import  React from "react"
import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import type { QuestionType } from "../app/(tabs)/home"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface TutorialContextType {
  dismissTutorial: (type: QuestionType) => void
  isTutorialDismissed: (type: QuestionType) => boolean
  resetDismissedTutorials: () => void
}

const TutorialContext = createContext<TutorialContextType>({} as TutorialContextType)

export const useTutorialMode = () => useContext(TutorialContext)

interface TutorialProviderProps {
  children: ReactNode
}

// Chave para armazenamento no AsyncStorage
const DISMISSED_TUTORIALS_KEY = "DISMISSED_TUTORIALS"

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  // Usamos um objeto em vez de um Set para garantir consistência
  const [dismissedTutorials, setDismissedTutorials] = useState<Record<string, boolean>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar tutoriais descartados do AsyncStorage ao inicializar
  useEffect(() => {
    const loadDismissedTutorials = async () => {
      try {
        const savedTutorials = await AsyncStorage.getItem(DISMISSED_TUTORIALS_KEY)
        if (savedTutorials) {
          const parsedTutorials = JSON.parse(savedTutorials)
          setDismissedTutorials(parsedTutorials)
          console.log("Loaded dismissed tutorials:", parsedTutorials)
        }
      } catch (error) {
        console.error("Error loading dismissed tutorials:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadDismissedTutorials()
  }, [])

  // Salvar tutoriais descartados no AsyncStorage quando mudar
  useEffect(() => {
    const saveDismissedTutorials = async () => {
      try {
        await AsyncStorage.setItem(DISMISSED_TUTORIALS_KEY, JSON.stringify(dismissedTutorials))
        console.log("Saved dismissed tutorials:", dismissedTutorials)
      } catch (error) {
        console.error("Error saving dismissed tutorials:", error)
      }
    }

    // Só salvar se já carregamos os dados iniciais e há alguma mudança
    if (isLoaded && Object.keys(dismissedTutorials).length > 0) {
      saveDismissedTutorials()
    }
  }, [dismissedTutorials, isLoaded])

  const dismissTutorial = (type: QuestionType) => {
    // Converter o tipo para uma chave de string consistente
    const typeKey = String(type).replace(/[^a-zA-Z0-9_]/g, "_")
    console.log(`Dismissing tutorial for type: ${type}, using key: ${typeKey}`)
    
    setDismissedTutorials((prev) => {
      const updated = { ...prev, [typeKey]: true }
      console.log("Updated dismissed tutorials:", updated)
      return updated
    })
  }

  const resetDismissedTutorials = async () => {
    console.log("Resetting all dismissed tutorials")
    setDismissedTutorials({})
    try {
      await AsyncStorage.removeItem(DISMISSED_TUTORIALS_KEY)
    } catch (error) {
      console.error("Error resetting dismissed tutorials:", error)
    }
  }

  const isTutorialDismissed = (type: QuestionType) => {
    // Converter o tipo para uma chave de string consistente
    const typeKey = String(type).replace(/[^a-zA-Z0-9_]/g, "_")
    const isDismissed = dismissedTutorials[typeKey] === true
    
    console.log(
      `Checking if tutorial is dismissed for type: ${type}, key: ${typeKey}, result: ${isDismissed}`,
      "Current dismissed tutorials:",
      dismissedTutorials
    )
    
    return isDismissed
  }

  return (
    <TutorialContext.Provider
      value={{
        dismissTutorial,
        isTutorialDismissed,
        resetDismissedTutorials,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}
