"use client"

import React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import {  FirebaseUser, signOut, onAuthStateChanged } from "firebase/auth"
import { getDatabase, ref, get, update } from "firebase/database"
import { auth, sendPasswordResetEmail } from "../services/firebaseConfig"

interface User {
  avatarSource: string
  phone: string
  sobrenome: string
  nome: string
  id: string
  email: string
  name: string
  points: number
  createdAt: string
}

interface AuthContextData {
  authUser: FirebaseUser | null
  userData: User | null
  loading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
  getAllUsers: () => Promise<User[]>
  logout: () => Promise<void>
  updateUserPoints: (points: number) => Promise<void>
  resetPassword: (email: string) => Promise<boolean> 
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setAuthUser(user)
          await refreshUserData()
        } else {
          setAuthUser(null)
          setUserData(null)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setError("Erro ao verificar autenticação.")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const refreshUserData = async () => {
    if (authUser) {
      const db = getDatabase()
      const userRef = ref(db, `users/${authUser.uid}`)
      try {
        const snapshot = await get(userRef)
        if (snapshot.exists()) {
          const userDataFromDB = snapshot.val() as Omit<User, "id">
          setUserData({ id: authUser.uid, ...userDataFromDB })
        } else {
          console.log("No data available")
          setUserData(null)
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
        setError("Erro ao buscar dados do usuário.")
        setUserData(null)
      } finally {
        setLoading(false)
      }
    } else {
      setUserData(null)
    }
  }

  const getAllUsers = async (): Promise<User[]> => {
    const db = getDatabase()
    const usersRef = ref(db, "users")
    try {
      const snapshot = await get(usersRef)
      if (snapshot.exists()) {
        const usersData = snapshot.val()
        const usersArray: User[] = Object.entries(usersData).map(([key, value]) => ({
          id: key,
          ...(value as Omit<User, "id">),
        }))
        return usersArray
      } else {
        console.log("No users data available")
        return []
      }
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error)
      setError("Erro ao buscar todos os usuários.")
      return []
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await signOut(auth)
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

  const updateUserPoints = async (points: number) => {
    if (authUser && userData) {
      const db = getDatabase()
      const userRef = ref(db, `users/${authUser.uid}`)
      try {
        setLoading(true)
        await update(userRef, { points: points })
        setUserData({ ...userData, points: points })
        setError(null)
      } catch (err) {
        setError("Erro ao atualizar pontos do usuário.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Add the resetPassword function implementation in the AuthProvider component
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true)
      await sendPasswordResetEmail(auth, email)
      setError(null)
      return true
    } catch (err) {
      setError("Erro ao enviar email de redefinição de senha.")
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Add resetPassword to the contextValue
  const contextValue: AuthContextData = {
    authUser,
    userData,
    loading,
    error,
    refreshUserData,
    getAllUsers,
    logout,
    updateUserPoints,
    resetPassword, // Add this line
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  return useContext(AuthContext)
}

export { AuthProvider, useAuth }
