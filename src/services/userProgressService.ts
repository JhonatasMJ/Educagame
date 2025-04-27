import { getDatabase, ref, get, set } from "firebase/database"
import { getUserProgress, getTrails, updateUserProgress } from "./apiService"

// Interface para o progresso de uma questão
interface QuestionProgress {
  id: string
  answered: boolean
  correct: boolean
}

// Interface para o progresso de uma fase
interface PhaseProgress {
  id: string
  started: boolean
  completed: boolean
  questionsProgress: QuestionProgress[]
  timeSpent: number
}

// Interface para o progresso de uma trilha
interface TrailProgress {
  id: string
  phases: PhaseProgress[]
}

// Interface para o progresso completo do usuário
interface UserProgress {
  totalPoints: number
  consecutiveCorrect: number
  highestConsecutiveCorrect: number
  trails: TrailProgress[]
  currentPhaseId?: string
  currentQuestionIndex?: number
}

/**
 * Sincroniza o progresso do usuário com as trilhas disponíveis
 * Preserva o progresso existente e adiciona novas trilhas/etapas/questões
 *
 * @param userId ID do usuário
 * @param forceCreate Se true, força a criação de um novo progresso mesmo se já existir
 */
export const syncUserProgress = async (userId: string, forceCreate = false): Promise<UserProgress | null> => {
  try {
    console.log("Iniciando sincronização de progresso para o usuário:", userId)

    // 1. Verificar se já existe progresso no Firebase
    let userProgress: UserProgress | null = null

    if (!forceCreate) {
      userProgress = await getUserProgressFromFirebase(userId)
      console.log("Progresso existente encontrado no Firebase:", userProgress ? "Sim" : "Não")
    }

    // 2. Se não existir no Firebase ou forceCreate for true, tentar buscar da API
    if (!userProgress) {
      console.log("Nenhum progresso encontrado no Firebase ou forceCreate ativado, verificando na API...")
      try {
        const userProgressResponse = await getUserProgress(userId)

        if (userProgressResponse?.data && !forceCreate) {
          userProgress = userProgressResponse.data
          console.log("Progresso encontrado na API")
        } else {
          // 3. Se não existir na API ou forceCreate for true, criar um progresso inicial
          console.log("Criando progresso inicial para o usuário...")
          userProgress = {
            totalPoints: 0,
            consecutiveCorrect: 0,
            highestConsecutiveCorrect: 0,
            trails: [],
          }
        }
      } catch (apiError) {
        console.error("Erro ao buscar progresso da API:", apiError)
        // Se falhar ao buscar da API, criar um progresso inicial
        userProgress = {
          totalPoints: 0,
          consecutiveCorrect: 0,
          highestConsecutiveCorrect: 0,
          trails: [],
        }
      }
    }

    // Garantir que userProgress não seja null neste ponto
    if (!userProgress) {
      userProgress = {
        totalPoints: 0,
        consecutiveCorrect: 0,
        highestConsecutiveCorrect: 0,
        trails: [],
      }
    }

    // Garantir que trails seja sempre um array
    if (!Array.isArray(userProgress.trails)) {
      console.log("Progresso do usuário não contém um array de trilhas, inicializando...")
      userProgress.trails = []
    }

    console.log("Progresso do usuário carregado:", userProgress)

    // 4. Buscar todas as trilhas disponíveis
    let availableTrails: any[] = []
    try {
      const trailsResponse = await getTrails()
      if (trailsResponse?.data) {
        // Garantir que temos um array
        availableTrails = Array.isArray(trailsResponse.data)
          ? trailsResponse.data
          : Object.values(trailsResponse.data || {})
      }
      console.log("Trilhas disponíveis carregadas:", availableTrails.length)
    } catch (trailsError) {
      console.error("Erro ao buscar trilhas disponíveis:", trailsError)
      // Continuar com um array vazio se falhar
    }

    // 5. Sincronizar trilhas - MODIFICADO para preservar dados existentes
    const updatedProgress = syncTrails(userProgress, availableTrails)

    // 6. Salvar o progresso atualizado no servidor
    console.log("Salvando progresso do usuário no Firebase...")
    await saveUserProgressToFirebase(userId, updatedProgress)

    // 7. Também atualizar na API
    try {
      for (const trail of updatedProgress.trails) {
        await updateUserProgress(userId, trail.id, {
          phases: trail.phases,
          totalPoints: updatedProgress.totalPoints,
          consecutiveCorrect: updatedProgress.consecutiveCorrect,
          highestConsecutiveCorrect: updatedProgress.highestConsecutiveCorrect,
        })
      }
      console.log("Progresso do usuário atualizado na API com sucesso")
    } catch (apiError) {
      console.error("Erro ao atualizar progresso na API:", apiError)
      // Continuar mesmo se falhar a atualização na API
    }

    return updatedProgress
  } catch (error) {
    console.error("Erro ao sincronizar progresso do usuário:", error)
    return null
  }
}

/**
 * Inicializa o progresso do usuário para um novo registro
 * Cria um progresso zerado com todas as trilhas disponíveis
 */
export const initializeUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    console.log("Inicializando progresso para novo usuário:", userId)

    // Forçar a criação de um novo progresso
    return await syncUserProgress(userId, true)
  } catch (error) {
    console.error("Erro ao inicializar progresso para novo usuário:", error)
    return null
  }
}

/**
 * Sincroniza as trilhas do usuário com as trilhas disponíveis
 * MODIFICADO para preservar dados existentes
 */
const syncTrails = (userProgress: UserProgress, availableTrails: any[]): UserProgress => {
  try {
    const updatedProgress = { ...userProgress }

    // Garantir que trails seja sempre um array
    if (!Array.isArray(updatedProgress.trails)) {
      updatedProgress.trails = []
    }

    // Para cada trilha disponível
    for (const availableTrail of availableTrails) {
      // Verificar se a trilha disponível é válida
      if (!availableTrail || typeof availableTrail !== "object" || !availableTrail.id) {
        console.warn("Trilha inválida encontrada, ignorando:", availableTrail)
        continue
      }

      // Verificar se o usuário já tem progresso nesta trilha
      let userTrail = updatedProgress.trails.find((t) => t && t.id === availableTrail.id)

      // Se não tiver, criar uma nova trilha no progresso do usuário
      if (!userTrail) {
        userTrail = {
          id: availableTrail.id,
          phases: [],
        }
        updatedProgress.trails.push(userTrail)
        console.log(`Nova trilha adicionada ao progresso: ${availableTrail.id}`)
      }

      // Garantir que phases seja sempre um array
      if (!Array.isArray(userTrail.phases)) {
        userTrail.phases = []
      }

      // Sincronizar as etapas da trilha - PRESERVANDO dados existentes
      syncPhases(userTrail, availableTrail)
    }

    return updatedProgress
  } catch (error) {
    console.error("Erro ao sincronizar trilhas:", error)
    // Retornar o progresso original em caso de erro
    return userProgress
  }
}

/**
 * Sincroniza as etapas de uma trilha
 * MODIFICADO para preservar dados existentes
 */
const syncPhases = (userTrail: TrailProgress, availableTrail: any): void => {
  try {
    // Verificar se a trilha disponível tem etapas
    let availablePhases: any[] = []

    if (availableTrail.etapas) {
      if (Array.isArray(availableTrail.etapas)) {
        availablePhases = availableTrail.etapas
      } else if (typeof availableTrail.etapas === "object") {
        availablePhases = Object.values(availableTrail.etapas)
      }
    }

    // Para cada etapa disponível
    for (const availablePhase of availablePhases) {
      // Verificar se a etapa disponível é válida
      if (!availablePhase || typeof availablePhase !== "object" || !availablePhase.id) {
        console.warn("Etapa inválida encontrada, ignorando:", availablePhase)
        continue
      }

      // Verificar se o usuário já tem progresso nesta etapa
      let userPhase = userTrail.phases.find((p) => p && p.id === availablePhase.id)

      // Se não tiver, criar uma nova etapa no progresso do usuário
      if (!userPhase) {
        userPhase = {
          id: availablePhase.id,
          started: false,
          completed: false,
          questionsProgress: [],
          timeSpent: 0,
        }
        userTrail.phases.push(userPhase)
        console.log(`Nova etapa adicionada ao progresso: ${availablePhase.id}`)
      }

      // Garantir que questionsProgress seja sempre um array
      if (!Array.isArray(userPhase.questionsProgress)) {
        userPhase.questionsProgress = []
      }

      // Sincronizar as questões da etapa - PRESERVANDO dados existentes
      syncQuestions(userPhase, availablePhase)
    }
  } catch (error) {
    console.error("Erro ao sincronizar etapas:", error)
    // Continuar mesmo se houver erro
  }
}

/**
 * Sincroniza as questões de uma etapa
 * MODIFICADO para preservar dados existentes
 */
const syncQuestions = (userPhase: PhaseProgress, availablePhase: any): void => {
  try {
    // Verificar se a etapa disponível tem stages
    let availableStages: any[] = []

    if (availablePhase.stages) {
      if (Array.isArray(availablePhase.stages)) {
        availableStages = availablePhase.stages
      } else if (typeof availablePhase.stages === "object") {
        availableStages = Object.values(availablePhase.stages)
      }
    }

    // Coletar todas as questões de todos os stages
    const availableQuestions: any[] = []

    for (const stage of availableStages) {
      if (!stage || typeof stage !== "object") continue

      if (stage.questions) {
        let questions = []
        if (Array.isArray(stage.questions)) {
          questions = stage.questions
        } else if (typeof stage.questions === "object") {
          questions = Object.values(stage.questions)
        }

        // Filtrar questões inválidas
        const validQuestions = questions.filter((q: { id: any }) => q && typeof q === "object" && q.id)
        availableQuestions.push(...validQuestions)
      }
    }

    // Para cada questão disponível
    for (const availableQuestion of availableQuestions) {
      // Verificar se a questão disponível é válida
      if (!availableQuestion || typeof availableQuestion !== "object" || !availableQuestion.id) {
        continue
      }

      // Verificar se o usuário já respondeu esta questão
      const userQuestion = userPhase.questionsProgress.find((q) => q && q.id === availableQuestion.id)

      // Se não tiver, adicionar a questão ao progresso do usuário (como não respondida)
      if (!userQuestion) {
        userPhase.questionsProgress.push({
          id: availableQuestion.id,
          answered: false,
          correct: false,
        })
        console.log(`Nova questão adicionada ao progresso: ${availableQuestion.id}`)
      }
      // NÃO modificar questões que já existem no progresso do usuário
    }
  } catch (error) {
    console.error("Erro ao sincronizar questões:", error)
    // Continuar mesmo se houver erro
  }
}

/**
 * Salva o progresso do usuário no Firebase
 */
const saveUserProgressToFirebase = async (userId: string, progress: UserProgress): Promise<void> => {
  try {
    const db = getDatabase()
    const userProgressRef = ref(db, `userProgress/${userId}`)
    await set(userProgressRef, progress)
    console.log("Progresso do usuário salvo no Firebase com sucesso")
  } catch (error) {
    console.error("Erro ao salvar progresso do usuário no Firebase:", error)
    throw error
  }
}

/**
 * Obtém o progresso do usuário do Firebase
 */
export const getUserProgressFromFirebase = async (userId: string): Promise<UserProgress | null> => {
  try {
    const db = getDatabase()
    const userProgressRef = ref(db, `userProgress/${userId}`)
    const snapshot = await get(userProgressRef)

    if (snapshot.exists()) {
      const data = snapshot.val()

      // Garantir que trails seja sempre um array
      if (!Array.isArray(data.trails)) {
        data.trails = []
      }

      return data as UserProgress
    }

    return null
  } catch (error) {
    console.error("Erro ao obter progresso do usuário do Firebase:", error)
    return null
  }
}

/**
 * Calcula o progresso de uma etapa com base nas questões respondidas corretamente
 */
export const calculatePhaseProgress = (phase: PhaseProgress): number => {
  if (
    !phase ||
    !phase.questionsProgress ||
    !Array.isArray(phase.questionsProgress) ||
    phase.questionsProgress.length === 0
  ) {
    return phase && phase.completed ? 100 : 0
  }

  const answeredQuestions = phase.questionsProgress.filter((q) => q && q.answered)
  const correctQuestions = phase.questionsProgress.filter((q) => q && q.correct)

  if (answeredQuestions.length === 0) {
    return 0
  }

  return Math.round((correctQuestions.length / phase.questionsProgress.length) * 100)
}

/**
 * Verifica se uma etapa está completa
 */
export const isPhaseCompleted = (phase: PhaseProgress): boolean => {
  if (!phase || !phase.questionsProgress || !Array.isArray(phase.questionsProgress)) {
    return false
  }

  return (
    phase.completed ||
    (phase.questionsProgress.length > 0 && phase.questionsProgress.every((q) => q && q.answered && q.correct))
  )
}
