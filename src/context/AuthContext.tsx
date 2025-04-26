"use client"

import React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode, useCallback } from "react"
import { getDatabase, ref, get, update } from "firebase/database"
import { signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../services/firebaseConfig"
import { useRouter } from "expo-router"
import { getAuthToken, removeAuthToken, saveAuthToken} from "../services/apiService"

// Adicione o token JWT e isTokenLoaded à interface AuthContextData
interface AuthContextData {
  authUser: any | null
  userData: User | null
  loading: boolean
  error: string | null
  jwtToken: string | null
  isTokenLoaded: boolean // Novo campo para indicar se o token foi carregado
  refreshUserData: () => Promise<void>
  refreshToken: () => Promise<boolean> // Nova função para atualizar o token
  getAllUsers: () => Promise<User[]>
  logout: () => Promise<void>
  updateUserPoints: (points: number) => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  showLoadingTransition: boolean
  setShowLoadingTransition: (show: boolean) => void
}

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

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authUser, setAuthUser] = useState<any | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLoadingTransition, setShowLoadingTransition] = useState(false)
  const [isAuthInitialized, setIsAuthInitialized] = useState(false)
  const [jwtToken, setJwtToken] = useState<string | null>(null)
  const [isTokenLoaded, setIsTokenLoaded] = useState(false) // Novo estado para controlar se o token foi carregado
  const router = useRouter()

  // Função para carregar o token JWT do AsyncStorage
  const loadToken = useCallback(async () => {
    try {
      console.log("Carregando token JWT do AsyncStorage...")
      const token = await getAuthToken()
      console.log("Token JWT carregado:", token ? "Token encontrado" : "Token não encontrado")
      setJwtToken(token)
      return token
    } catch (error) {
      console.error("Erro ao carregar token JWT:", error)
      setJwtToken(null)
      return null
    } finally {
      setIsTokenLoaded(true) // Marcar que o token foi carregado (mesmo que seja null)
    }
  }, [])

  // Função para atualizar o token JWT
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Atualizando token JWT...")
      // Aqui você implementaria a lógica para obter um novo token da sua API
      // Por exemplo, usando um refresh token ou reautenticando o usuário
      
      // Exemplo simplificado (substitua pela sua lógica real):
      // const response = await fetch('/api/auth/refresh', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${jwtToken}` }
      // });
      // const data = await response.json();
      // if (data.token) {
      //   await saveAuthToken(data.token, data.expiresIn);
      //   setJwtToken(data.token);
      //   return true;
      // }
      
      // Como não temos a implementação real, vamos apenas recarregar o token atual
      const token = await loadToken();
      return !!token;
    } catch (error) {
      console.error("Erro ao atualizar token JWT:", error)
      return false
    }
  }, [loadToken])

  // Efeito para carregar o token JWT quando o componente é montado
  useEffect(() => {
    loadToken()
  }, [loadToken])

  // Efeito para lidar com o estado de autenticação e ouvir mudanças
  useEffect(() => {
    let isMounted = true
    console.log("Setting up auth state listener")

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log("Auth state changed:", user ? "User logged in" : "No user")

        if (!isMounted) return

        if (user) {
          setAuthUser(user)
          
          // Verificar se o token JWT está disponível
          if (!jwtToken && isTokenLoaded) {
            console.log("Usuário autenticado, mas sem token JWT. Tentando atualizar...")
            await refreshToken()
          }
          
          const db = getDatabase()
          const userRef = ref(db, `users/${user.uid}`)

          try {
            const snapshot = await get(userRef)
            if (snapshot.exists() && isMounted) {
              const userDataFromDB = snapshot.val()
              setUserData({ id: user.uid, ...userDataFromDB })
              console.log("User data loaded successfully")
            } else if (isMounted) {
              console.log("No user data available")
              setUserData(null)
            }
          } catch (dbError) {
            console.error("Error fetching user data:", dbError)
            if (isMounted) {
              setError("Error fetching user data")
            }
          }
        } else {
          if (isMounted) {
            setAuthUser(null)
            setUserData(null)
            
            // Se não há usuário autenticado, remover o token JWT
            if (jwtToken) {
              await removeAuthToken()
              setJwtToken(null)
            }
          }
        }
      } catch (error) {
        console.error("Auth state change error:", error)
        if (isMounted) {
          setError("Error in authentication state change")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setIsAuthInitialized(true)
        }
      }
    })

    return () => {
      console.log("Cleaning up auth state listener")
      isMounted = false
      unsubscribe()
    }
  }, [jwtToken, isTokenLoaded, refreshToken])

  // Função para atualizar os dados do usuário
  const refreshUserData = async () => {
    console.log("Iniciando refreshUserData")
    if (authUser) {
      setShowLoadingTransition(true)
      const db = getDatabase()
      const userRef = ref(db, `users/${authUser.uid}`)
      try {
        console.log("Buscando dados do usuário:", authUser.uid)
        const snapshot = await get(userRef)
        if (snapshot.exists()) {
          const userDataFromDB = snapshot.val()
          console.log("Dados do usuário encontrados:", userDataFromDB)
          setUserData({ id: authUser.uid, ...userDataFromDB })
        } else {
          console.log("Nenhum dado disponível para o usuário")
          setUserData(null)
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
        setError("Erro ao buscar dados do usuário.")
        setUserData(null)
      } finally {
        setLoading(false)
        setTimeout(() => {
          setShowLoadingTransition(false)
        }, 500)
      }
    } else {
      console.log("refreshUserData: Nenhum usuário autenticado")
      setUserData(null)
      setShowLoadingTransition(false)
    }
  }

  // Função para obter todos os usuários
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

  // Função para fazer logout
  const logout = async () => {
    try {
      setLoading(true)
      setShowLoadingTransition(true)
      await signOut(auth)
      await removeAuthToken() // Remover o token JWT
      setAuthUser(null)
      setUserData(null)
      setError(null)
      setJwtToken(null) // Limpar o token JWT do estado

      // Navigate to login after logout
      router.replace("/login")
    } catch (err) {
      setError("Erro ao fazer logout.")
      console.error(err)
    } finally {
      setLoading(false)
      setShowLoadingTransition(false)
    }
  }

  // Função para atualizar os pontos do usuário
  const updateUserPoints = async (points: number) => {
    if (authUser && userData) {
      const db = getDatabase()
      const userRef = ref(db, `users/${authUser.uid}`)
      try {
        setLoading(true)
        await update(userRef, { points: userData.points + points })
        await refreshUserData()
        setError(null)
      } catch (err) {
        setError("Erro ao atualizar pontos do usuário.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Função para redefinir a senha
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

  // Valor do contexto
  const contextValue: AuthContextData = {
    authUser,
    userData,
    loading,
    error,
    jwtToken,
    isTokenLoaded, // Novo campo para indicar se o token foi carregado
    refreshUserData,
    refreshToken, // Nova função para atualizar o token
    getAllUsers,
    logout,
    updateUserPoints,
    resetPassword,
    showLoadingTransition,
    setShowLoadingTransition,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthProvider, useAuth }