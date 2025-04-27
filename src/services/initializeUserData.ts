import { getDatabase, ref, set, get } from "firebase/database"
import { initializeUserProgress } from "./userProgressService"

/**
 * Inicializa os dados de um novo usuário no Firebase
 * Cria a estrutura básica de dados do usuário e o progresso inicial
 */
export const initializeUserData = async (userId: string, userData: any): Promise<boolean> => {
  try {
    console.log("Inicializando dados para novo usuário:", userId)
    const db = getDatabase()

    // 1. Verificar se o usuário já existe
    const userRef = ref(db, `users/${userId}`)
    const userSnapshot = await get(userRef)

    // 2. Se não existir, criar dados básicos do usuário
    if (!userSnapshot.exists()) {
      console.log("Criando dados básicos do usuário...")
      await set(userRef, {
        email: userData.email || "",
        nome: userData.nome || userData.displayName || "",
        sobrenome: userData.sobrenome || "",
        points: 0,
        createdAt: new Date().toISOString(),
        ...userData,
      })
    }

    // 3. Verificar se o progresso do usuário já existe
    const progressRef = ref(db, `userProgress/${userId}`)
    const progressSnapshot = await get(progressRef)

    // 4. Se não existir, criar progresso inicial
    if (!progressSnapshot.exists()) {
      console.log("Criando progresso inicial do usuário...")
      await initializeUserProgress(userId)
    }

    return true
  } catch (error) {
    console.error("Erro ao inicializar dados do usuário:", error)
    return false
  }
}

/**
 * Verifica se o usuário tem dados inicializados
 * Retorna true se o usuário já tem dados básicos e progresso
 */
export const checkUserInitialized = async (userId: string): Promise<boolean> => {
  try {
    const db = getDatabase()

    // Verificar dados do usuário
    const userRef = ref(db, `users/${userId}`)
    const userSnapshot = await get(userRef)

    // Verificar progresso do usuário
    const progressRef = ref(db, `userProgress/${userId}`)
    const progressSnapshot = await get(progressRef)

    return userSnapshot.exists() && progressSnapshot.exists()
  } catch (error) {
    console.error("Erro ao verificar inicialização do usuário:", error)
    return false
  }
}
