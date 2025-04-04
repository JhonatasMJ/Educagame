"use client"

import React from "react"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import type { User as FirebaseUser } from "firebase/auth"
import { getDatabase, ref, get } from "firebase/database"
import { auth } from "../services/firebaseConfig"
import type { User } from "../types/types"

interface AuthContextData {
  authUser: FirebaseUser | null
  userData: User | null
  loading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
  getAllUsers: () => Promise<User[]>
  logout: () => Promise<void> // Nova função de logout
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async (uid: string) => {
    try {
      setLoading(true)
      const db = getDatabase()
      const userRef = ref(db, "users/" + uid)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        setUserData(snapshot.val())
        setError(null)
      } else {
        setError("Nenhum dado encontrado para este usuário.")
        setUserData(null)
      }
    } catch (err) {
      setError("Erro ao buscar dados do usuário.")
      console.error(err)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUserData = async () => {
    if (authUser?.uid) {
      await fetchUserData(authUser.uid)
    }
  }

  // New function to get all users from Firebase
  const getAllUsers = async (): Promise<User[]> => {
    try {
      const db = getDatabase()
      const usersRef = ref(db, "users")
      const snapshot = await get(usersRef)

      if (snapshot.exists()) {
        const usersData = snapshot.val()
        // Convert the object to an array and add the key as id
        const usersArray = Object.entries(usersData).map(([id, data]) => ({
          id,
          ...(data as any),
        }))

        // Sort users by result (assuming there's a result field)
        return usersArray.sort((a, b) => (b.result || 0) - (a.result || 0))
      }
      return []
    } catch (err) {
      console.error("Erro ao buscar todos os usuários:", err)
      return []
    }
  }

  // Dentro do AuthProvider, adicione a implementação da função logout
  const logout = async () => {
    try {
      setLoading(true)
      await auth.signOut()
      setAuthUser(null)
      setUserData(null)
      setError(null)
    } catch (err) {
      setError("Erro ao fazer logout.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setAuthUser(user)

      if (user) {
        await fetchUserData(user.uid)
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Adicione a função ao contextValue
  const contextValue: AuthContextData = {
    authUser,
    userData,
    loading,
    error,
    refreshUserData,
    getAllUsers,
    logout, // Adicionando a função de logout ao contexto
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

