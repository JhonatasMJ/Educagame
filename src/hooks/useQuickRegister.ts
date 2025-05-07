"use client"

import { useState } from "react"
import { useRouter } from "expo-router"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "../services/firebaseConfig"
import { getDatabase, ref, set, get } from "firebase/database"
import Toast from "react-native-toast-message"
import { useAuth } from "../context/AuthContext"
import { initializeNewUserProgress } from "../services/userProgressService"
import { logSync, LogLevel } from "../services/syncLogger"
import { syncUserProgress } from "../services/userProgressService"
import { SIMPLIFIED_ONBOARDING_CONFIG } from "@/config/appConfig"

export const useQuickRegister = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setJustRegistered, setShowLoadingTransition } = useAuth()

  // Função para gerar um email aleatório baseado no nome do usuário
  const generateRandomEmail = (name: string): string => {
    const sanitizedName = name
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "")
    const randomString = Math.random().toString(36).substring(2, 10)
    return `${sanitizedName}_${randomString}@${SIMPLIFIED_ONBOARDING_CONFIG.AUTO_EMAIL_DOMAIN}`
  }

  // Função para gerar uma senha aleatória forte
  const generateRandomPassword = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleQuickRegister = async (name: string, avatarId: string, firstName?: string, lastName?: string) => {
    if (!name || !avatarId) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Preencha todos os campos obrigatórios!",
      })
      return
    }

    setIsLoading(true)
    setShowLoadingTransition(true)
    setError(null)

    try {
      logSync(LogLevel.INFO, "=== INICIANDO CADASTRO RÁPIDO ===")

      // Gerar email e senha aleatórios
      const email = generateRandomEmail(name)
      const password = generateRandomPassword()

      logSync(LogLevel.INFO, `Tentando cadastrar usuário rápido: ${email}`)

      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      logSync(LogLevel.INFO, `Usuário criado com sucesso: ${user.uid}`)

      // Determinar nome e sobrenome
      // Se firstName e lastName foram fornecidos, use-os
      // Caso contrário, extraia do nome completo
      let userFirstName = firstName
      let userLastName = lastName

      if (!userFirstName || !userLastName) {
        const nameParts = name.trim().split(/\s+/)
        userFirstName = nameParts[0]
        userLastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""
      }

      logSync(LogLevel.INFO, `Nome processado: ${userFirstName} ${userLastName}`)

      // IMPORTANTE: Atualizar o perfil do usuário no Firebase Authentication
      // Isso garante que displayName e outras propriedades sejam definidas
      await updateProfile(user, {
        displayName: name,
        photoURL: `avatar${avatarId}`, // Armazenar o avatar como photoURL
      })
      logSync(
        LogLevel.INFO,
        `Perfil do usuário atualizado no Firebase Auth: displayName=${name}, photoURL=avatar${avatarId}`,
      )

      // Salvar dados do usuário no Realtime Database
      const db = getDatabase()
      const userRef = ref(db, `users/${user.uid}`)

      const userData = {
        email,
        nome: userFirstName,
        sobrenome: userLastName,
        name: name, // Adicionar o nome completo
        displayName: name, // Adicionar displayName explicitamente
        phone: SIMPLIFIED_ONBOARDING_CONFIG.DEFAULT_VALUES.phone,
        avatarSource: `avatar${avatarId}`,
        avatarId: avatarId, // Garantir que o avatarId seja salvo
        photoURL: `avatar${avatarId}`, // Adicionar photoURL para consistência
        points: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString().split("T")[0],
        consecutiveDays: 1,
        totalConsecutiveDays: 1,
        birthDate: SIMPLIFIED_ONBOARDING_CONFIG.DEFAULT_VALUES.birthDate,
        lgpdAccepted: SIMPLIFIED_ONBOARDING_CONFIG.DEFAULT_VALUES.lgpdAccepted,
        termsAccepted: SIMPLIFIED_ONBOARDING_CONFIG.DEFAULT_VALUES.termsAccepted,
        // Adicionar dados para estatísticas
        completedLessons: 0,
        perfectLessons: 0,
        minutesOnline: 0,
        timeSpent: 0, // Total de segundos online
        // Adicionar metadados da aplicação
        registrationMethod: "quick-start",
      }

      await set(userRef, userData)
      logSync(LogLevel.INFO, "Dados do usuário salvos com sucesso no Realtime Database")

      // Verificar se os dados foram salvos corretamente
      try {
        // Forma correta de verificar os dados: usar a função get() com a referência
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          logSync(LogLevel.INFO, "Verificação: dados do usuário encontrados no banco")
          const savedData = snapshot.val()
          logSync(
            LogLevel.INFO,
            `Dados salvos - nome: ${savedData.nome}, sobrenome: ${savedData.sobrenome}, avatarId: ${savedData.avatarId}, displayName: ${savedData.displayName}`,
          )
        } else {
          logSync(LogLevel.WARNING, "Verificação: dados do usuário NÃO encontrados no banco!")
        }
      } catch (verifyError) {
        logSync(LogLevel.ERROR, "Erro ao verificar dados salvos:", verifyError)
      }

      // Inicializar o progresso do usuário
      try {
        logSync(LogLevel.INFO, "Inicializando progresso do usuário...")
        await initializeNewUserProgress(user.uid)
        logSync(LogLevel.INFO, "Progresso do usuário inicializado com sucesso")

        // IMPORTANTE: Realizar múltiplas sincronizações para garantir persistência
        logSync(LogLevel.INFO, "Iniciando processo de sincronização em sequência...")

        // Primeira sincronização
        logSync(LogLevel.INFO, "Executando sincronização inicial...")
        await syncUserProgress(user.uid, true, true)
        logSync(LogLevel.INFO, "Sincronização inicial concluída")

        // Segunda sincronização após um pequeno delay
        setTimeout(async () => {
          logSync(LogLevel.INFO, "Executando segunda sincronização...")
          await syncUserProgress(user.uid, true, true)
          logSync(LogLevel.INFO, "Segunda sincronização concluída")
        }, 1000)

        // Terceira sincronização após mais um delay
        setTimeout(async () => {
          logSync(LogLevel.INFO, "Executando terceira sincronização...")
          await syncUserProgress(user.uid, true, true)
          logSync(LogLevel.INFO, "Terceira sincronização concluída")
        }, 2000)
      } catch (progressError) {
        logSync(LogLevel.ERROR, "Erro ao inicializar/sincronizar progresso:", progressError)
      }

      // Marcar como recém-registrado para forçar refresh na home
      setJustRegistered(true)
      logSync(LogLevel.INFO, "Usuário marcado como recém-registrado")

      // Implementar múltiplos refreshes para consolidar dados
      logSync(LogLevel.INFO, "Iniciando processo de consolidação de dados com múltiplos refreshes")

      // Navegar para a home com parâmetro de refresh
      router.replace({
        pathname: "/(tabs)/home",
        params: {
          needsMultipleRefresh: "true",
          refreshCount: "5", // Aumentado para 5 refreshes para maior garantia
          refreshTimestamp: Date.now().toString(), // Timestamp para evitar caching
          forceFullRefresh: "true", // Forçar refresh completo
        },
      })
      logSync(LogLevel.INFO, "Navegando para a home com parâmetro de múltiplos refreshes")
    } catch (err: any) {
      setShowLoadingTransition(false)
      logSync(LogLevel.ERROR, `Erro no cadastro rápido: ${err.code} - ${err.message}`)

      if (err.code === "auth/email-already-in-use") {
        // Improvável, mas possível se o email gerado já existir
        setError("Erro ao criar conta. Tente novamente.")
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Erro ao criar conta. Tente novamente!",
        })
      } else {
        setError("Erro ao cadastrar usuário.")
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro",
          text2: "Erro ao cadastrar usuário!",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleQuickRegister,
    isLoading,
    error,
  }
}
