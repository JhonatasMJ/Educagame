"use client"

import  React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

interface EditModeContextType {
  isEditMode: boolean
  setIsEditMode: (value: boolean) => void
  showUnsavedChangesModal: boolean
  setShowUnsavedChangesModal: (value: boolean) => void
  pendingNavigation: (() => void) | null
  setPendingNavigation: (callback: (() => void) | null) => void
  handleNavigationWithCheck: (navigationCallback: () => void) => void
  resetEditState: () => void
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined)

export const EditModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

  const handleNavigationWithCheck = (navigationCallback: () => void) => {
    if (isEditMode) {
      // If in edit mode, show confirmation modal and store the navigation callback
      setShowUnsavedChangesModal(true)
      setPendingNavigation(() => navigationCallback)
    } else {
      // If not in edit mode, navigate directly
      navigationCallback()
    }
  }

  const resetEditState = () => {
    setIsEditMode(false)
    setShowUnsavedChangesModal(false)
    setPendingNavigation(null)
  }

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        showUnsavedChangesModal,
        setShowUnsavedChangesModal,
        pendingNavigation,
        setPendingNavigation,
        handleNavigationWithCheck,
        resetEditState,
      }}
    >
      {children}
    </EditModeContext.Provider>
  )
}

export const useEditMode = (): EditModeContextType => {
  const context = useContext(EditModeContext)
  if (context === undefined) {
    throw new Error("useEditMode must be used within an EditModeProvider")
  }
  return context
}
