import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { QuestionType } from "../app/(tabs)/home"

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

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [dismissedTutorials, setDismissedTutorials] = useState<Set<QuestionType>>(new Set())

  // Log para debug
  useEffect(() => {
    console.log("TutorialContext initialized with dismissed tutorials:", [...dismissedTutorials])
  }, [dismissedTutorials])

  const dismissTutorial = (type: QuestionType) => {
    console.log("Dismissing tutorial for type:", type)
    setDismissedTutorials(prev => {
      const newSet = new Set(prev)
      newSet.add(type)
      console.log("New dismissed tutorials:", [...newSet])
      return newSet
    })
  }
  
  const resetDismissedTutorials = () => {
    console.log("Resetting all dismissed tutorials")
    setDismissedTutorials(new Set())
  }
  
  const isTutorialDismissed = (type: QuestionType) => {
    const isDismissed = dismissedTutorials.has(type)
    console.log("Checking if tutorial is dismissed for type:", type, "Result:", isDismissed)
    return isDismissed
  }

  return (
    <TutorialContext.Provider
      value={{
        dismissTutorial,
        isTutorialDismissed,
        resetDismissedTutorials
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}
