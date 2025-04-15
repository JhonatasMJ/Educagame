"use client"

import { useEffect } from "react"

import { useState } from "react"
import { useRouter } from "expo-router"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../services/firebaseConfig"
import Toast from "react-native-toast-message"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuth } from "../context/AuthContext"

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [savedEmail, setSavedEmail] = useState<string | null>(null)
  const [savedPassword, setSavedPassword] = useState<string | null>(null)
  const router = useRouter()
  const { refreshUserData, setShowLoadingTransition } = useAuth()

  // Load saved credentials when hook initializes
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const email = await AsyncStorage.getItem("rememberedEmail")
        const password = await AsyncStorage.getItem("rememberedPassword")

        if (email) {
          setSavedEmail(email)
        }

        if (password) {
          setSavedPassword(password)
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error)
      }
    }

    loadSavedCredentials()
  }, [])

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Preencha todos os campos!",
      })
      return
    }

    setIsLoading(true)
    setShowLoadingTransition(true)

    try {
      console.log("Attempting login with:", email)

      // Save or remove credentials based on rememberMe checkbox
      if (rememberMe) {
        await AsyncStorage.setItem("rememberedEmail", email)
        await AsyncStorage.setItem("rememberedPassword", password)
      } else {
        await AsyncStorage.removeItem("rememberedEmail")
        await AsyncStorage.removeItem("rememberedPassword")
      }

      // Sign in - this will trigger the onAuthStateChanged listener
      await signInWithEmailAndPassword(auth, email, password)

      // Don't navigate here - let the auth state listener handle it
      console.log("Login successful, auth state listener will handle navigation")
    } catch (error: any) {
      console.error("Login error:", error.code, error.message)
      setShowLoadingTransition(false)

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-email" ||
        error.code === "auth/invalid-credential"
      ) {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Email ou senha inválidos!",
        })
      } else {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Email ou senha inválidos.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearSavedCredentials = async () => {
    try {
      // 1. Desconectar do Firebase Auth
      await auth.signOut()

      // 2. Limpar todas as credenciais e dados do usuário no AsyncStorage
      await AsyncStorage.removeItem("rememberedEmail")
      await AsyncStorage.removeItem("rememberedPassword")

      // 3. Limpar outros possíveis dados de sessão
      const allKeys = await AsyncStorage.getAllKeys()
      const userDataKeys = allKeys.filter(
        (key) => key.startsWith("user_") || key.includes("token") || key.includes("auth") || key.includes("session"),
      )

      if (userDataKeys.length > 0) {
        await AsyncStorage.multiRemove(userDataKeys)
      }

      // 4. Atualizar o estado local
      setSavedEmail(null)
      setSavedPassword(null)

      console.log("Logout realizado com sucesso")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return {
    handleLogin,
    isLoading,
    googleLoading,
    savedEmail,
    savedPassword,
    clearSavedCredentials,
  }
}
