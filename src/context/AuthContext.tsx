"use client"

import  React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import { getDatabase, ref, get, update, set } from "firebase/database"
import { signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../services/firebaseConfig"
import { useRouter } from "expo-router"
import { getAuthToken, removeAuthToken } from "../services/apiService"
import { USE_SIMPLIFIED_ONBOARDING } from "@/config/appConfig"

// Adicione o token JWT à interface AuthContextData
interface AuthContextData {
  authUser: any | null
  userData: User | null
  loading: boolean
  error: string | null
  jwtToken: string | null // Novo campo para o token JWT
  justLoggedIn: boolean // Estado para indicar login recente
  justRegistered: boolean // Novo estado para indicar cadastro recente
  setJustLoggedIn: (value: boolean) => void
  setJustRegistered: (value: boolean) => void // Nova função para atualizar o estado
  refreshUserData: () => Promise<void>
  getAllUsers: () => Promise<User[]>
  logout: () => Promise<void>
  updateUserPoints: (points: number) => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  showLoadingTransition: boolean
  isTokenLoaded: boolean
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
  lastLogin?: string
  consecutiveDays?: number
  totalConsecutiveDays?: number
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

// No AuthProvider, adicione o estado para o token JWT
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authUser, setAuthUser] = useState<any | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLoadingTransition, setShowLoadingTransition] = useState(false)
  const [isAuthInitialized, setIsAuthInitialized] = useState(false)
  const [jwtToken, setJwtToken] = useState<string | null>(null) // Novo estado para o token JWT
  const [isTokenLoaded, setIsTokenLoaded] = useState(false)
  const [justLoggedIn, setJustLoggedIn] = useState(false) // Estado para login recente
  const [justRegistered, setJustRegistered] = useState(false) // Novo estado para cadastro recente
  const router = useRouter()

  // Adicione um efeito para carregar o token JWT do AsyncStorage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await getAuthToken()
        setJwtToken(token)
      } catch (error) {
        console.error("Erro ao carregar token JWT:", error)
      } finally {
        setIsTokenLoaded(true)
      }
    }

    loadToken()
  }, [])

  const refreshToken = async () => {
    // Implemente a lógica para obter um novo token JWT aqui
    // Por exemplo, chamando uma API que retorna um novo token
    // Após obter o novo token, salve-o no AsyncStorage e atualize o estado
    console.log("Função refreshToken chamada")
    // Exemplo:
    // const newToken = await fetchNewToken();
    // await saveAuthToken(newToken);
    // setJwtToken(newToken);
  }

  const syncUserProgress = async (userId: string) => {
    // Implemente a lógica para sincronizar o progresso do usuário aqui
    // Por exemplo, inicializando o progresso no banco de dados
    console.log("Função syncUserProgress chamada para o usuário:", userId)
    // Exemplo:
    // await initializeUserProgress(userId);
  }

  // Modificar o efeito de autenticação para inicializar dados de novos usuários
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

              // Atualizar lastLogin e consecutiveDays
              const now = new Date()
              const today = now.toISOString().split("T")[0] // YYYY-MM-DD format
              const lastLogin = userDataFromDB.lastLogin || today
              let consecutiveDays = userDataFromDB.consecutiveDays || 1
              let totalConsecutiveDays = userDataFromDB.totalConsecutiveDays || 1

              // Verificar se o último login foi ontem
              const lastLoginDate = new Date(lastLogin)
              const yesterday = new Date(now)
              yesterday.setDate(yesterday.getDate() - 1)

              // Se o último login foi ontem, incrementar consecutiveDays
              if (lastLoginDate.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0]) {
                consecutiveDays += 1
                totalConsecutiveDays = Math.max(totalConsecutiveDays, consecutiveDays)
              }
              // Se o último login foi antes de ontem, resetar consecutiveDays
              else if (lastLoginDate.toISOString().split("T")[0] !== today) {
                consecutiveDays = 1
              }

              // Atualizar os dados do usuário com lastLogin e consecutiveDays
              await update(userRef, {
                lastLogin: today,
                consecutiveDays,
                totalConsecutiveDays,
              })

              // Atualizar userData com os novos valores
              setUserData({
                id: user.uid,
                ...userDataFromDB,
                lastLogin: today,
                consecutiveDays,
                totalConsecutiveDays,
              })

              console.log("User data loaded and updated successfully")

              // IMPORTANTE: Não inicializar progresso aqui, deixar isso para o useLogin
              // Isso evita que o progresso seja sobrescrito durante o login
            } else if (isMounted) {
              console.log("No user data available")

              // Inicializar dados para novo usuário
              const basicUserData = {
                email: user.email || "",
                nome: user.displayName?.split(" ")[0] || "",
                sobrenome: user.displayName?.split(" ").slice(1).join(" ") || "",
                name: user.displayName || "",
                displayName: user.displayName || "",
                photoURL: user.photoURL || "",
                avatarSource: user.photoURL || "",
                avatarId: user.photoURL?.replace("avatar", "") || "",
                points: 0,
                lastLogin: new Date().toISOString().split("T")[0],
                consecutiveDays: 1,
                totalConsecutiveDays: 1,
                createdAt: new Date().toISOString(), // Adicionar data de criação
                appName: auth.app.name || "[DEFAULT]",
              }

              // Apenas inicializar dados básicos do usuário, não o progresso
              await set(userRef, basicUserData)

              // Carregar os dados recém-criados
              const newSnapshot = await get(userRef)
              if (newSnapshot.exists()) {
                const newUserData = newSnapshot.val()
                setUserData({ id: user.uid, ...newUserData })
                setJustRegistered(true)
              } else {
                setUserData(null)
              }
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
  }, [jwtToken, isTokenLoaded])

  // Modifique a função refreshUserData para ser mais robusta
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

  // Modifique a função logout para também remover o token JWT
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
      setJustLoggedIn(false) // Resetar o estado de login recente
      setJustRegistered(false) // Resetar o estado de cadastro recente
      USE_SIMPLIFIED_ONBOARDING ? router.replace("/quick-start") : router.replace("/login")
    } catch (err) {
      setError("Erro ao fazer logout.")
      console.error(err)
    } finally {
      setLoading(false)
      setShowLoadingTransition(false)
    }
  }

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

  // Atualize o contextValue para incluir os novos estados e funções
  const contextValue: AuthContextData = {
    authUser,
    userData,
    loading,
    error,
    jwtToken,
    justLoggedIn,
    justRegistered,
    setJustLoggedIn,
    setJustRegistered,
    refreshUserData,
    getAllUsers,
    logout,
    updateUserPoints,
    resetPassword,
    showLoadingTransition,
    isTokenLoaded,
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
