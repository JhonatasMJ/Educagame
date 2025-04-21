"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import Toast from "react-native-toast-message"

interface UseRequireAuthOptions {
  requireAuth?: boolean
  redirectTo?: string
  showToast?: boolean
}

export const useRequireAuth = ({
  requireAuth = true,
  redirectTo = "/login",
  showToast = true,
}: UseRequireAuthOptions = {}) => {
  const { userData, authUser, refreshUserData, loading } = useAuth()
  const router = useRouter()
  const hasNavigated = useRef(false)
  const authCheckAttempts = useRef(0)
  const MAX_AUTH_CHECK_ATTEMPTS = 3

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!requireAuth) return

      // Se ainda estiver carregando, aguarde
      if (loading) return

      // Se o usuário estiver autenticado, resete as tentativas
      if (userData && authUser) {
        hasNavigated.current = false
        authCheckAttempts.current = 0
        return
      }

      // Se não estiver autenticado, tente atualizar os dados do usuário
      // mas apenas se ainda não tivermos tentado muitas vezes
      if (authCheckAttempts.current < MAX_AUTH_CHECK_ATTEMPTS) {
        authCheckAttempts.current += 1
        console.log(`Tentativa ${authCheckAttempts.current} de verificar autenticação`)

        try {
          await refreshUserData()
          // Aguarde um momento para ver se os dados foram atualizados
          return
        } catch (error) {
          console.error("Erro ao atualizar dados do usuário:", error)
        }
      }

      // Se chegamos aqui, o usuário realmente não está autenticado após várias tentativas
      if (!hasNavigated.current) {
        hasNavigated.current = true

        if (showToast) {
          Toast.show({
            type: "error",
            text1: "Erro de autenticação ⚠️",
            text2: "Você não está autenticado. Redirecionando para a tela de login...",
            visibilityTime: 3000,
          })
        }

        // Atraso maior para garantir que tudo seja processado
        setTimeout(
          () => {
            router.replace(redirectTo as any)
          },
          showToast ? 3500 : 1500,
        )
      }
    }

    checkAuthentication()
  }, [requireAuth, userData, authUser, loading, redirectTo, showToast, router, refreshUserData])

  return {
    isAuthenticated: !!(userData && authUser),
    isLoading: loading,
    userData,
    authUser,
    refreshUserData,
  }
}
