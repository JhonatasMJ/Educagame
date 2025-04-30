import { getDatabase, ref, get, set } from "firebase/database"
import { getUserProgress, getTrails, updateUserProgress } from "./apiService"
import { logSync, LogLevel } from "./syncLogger"

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
  lastSyncTimestamp?: number
}

/**
 * Sincroniza o progresso do usuário com as trilhas disponíveis
 * Preserva o progresso existente e adiciona novas trilhas/etapas/questões
 *
 * @param userId ID do usuário
 * @param forceCreate Se true, força a criação de um novo progresso mesmo se já existir
 * @param preserveCompletion Se true, garante que o status de conclusão seja preservado
 */
export const syncUserProgress = async (
  userId: string,
  forceCreate = false,
  preserveCompletion = true,
): Promise<UserProgress | null> => {
  try {
    logSync(LogLevel.INFO, `Iniciando sincronização de progresso para o usuário: ${userId}`, {
      forceCreate,
      preserveCompletion,
    })

    // 1. Verificar se já existe progresso no Firebase
    let userProgress: UserProgress | null = null

    if (!forceCreate) {
      userProgress = await getUserProgressFromFirebase(userId)
      logSync(LogLevel.INFO, `Progresso existente encontrado no Firebase: ${userProgress ? "Sim" : "Não"}`)

      if (userProgress) {
        logSync(LogLevel.DEBUG, "Progresso atual do usuário:", userProgress)

        // Log detailed information about completed phases
        if (userProgress.trails && Array.isArray(userProgress.trails)) {
          let completedPhasesCount = 0
          let startedPhasesCount = 0
          let answeredQuestionsCount = 0

          userProgress.trails.forEach((trail) => {
            if (trail && trail.phases && Array.isArray(trail.phases)) {
              trail.phases.forEach((phase) => {
                if (phase.completed) completedPhasesCount++
                if (phase.started) startedPhasesCount++

                if (phase.questionsProgress && Array.isArray(phase.questionsProgress)) {
                  answeredQuestionsCount += phase.questionsProgress.filter((q) => q && q.answered).length
                }
              })
            }
          })

          logSync(
            LogLevel.INFO,
            `Estatísticas do progresso: ${completedPhasesCount} fases completas, ${startedPhasesCount} fases iniciadas, ${answeredQuestionsCount} questões respondidas`,
          )
        }
      }
    }

    // 2. Se não existir no Firebase ou forceCreate for true, tentar buscar da API
    if (!userProgress) {
      logSync(LogLevel.INFO, "Nenhum progresso encontrado no Firebase ou forceCreate ativado, verificando na API...")
      try {
        const userProgressResponse = await getUserProgress(userId)

        if (userProgressResponse?.data && !forceCreate) {
          userProgress = userProgressResponse.data
          logSync(LogLevel.INFO, "Progresso encontrado na API")
          logSync(LogLevel.DEBUG, "Progresso da API:", userProgress)
        } else {
          // 3. Se não existir na API ou forceCreate for true, criar um progresso inicial
          logSync(LogLevel.INFO, "Criando progresso inicial para o usuário...")
          userProgress = {
            totalPoints: 0,
            consecutiveCorrect: 0,
            highestConsecutiveCorrect: 0,
            trails: [],
            lastSyncTimestamp: Date.now(),
          }
        }
      } catch (apiError) {
        logSync(LogLevel.ERROR, "Erro ao buscar progresso da API:", apiError)
        // Se falhar ao buscar da API, criar um progresso inicial
        userProgress = {
          totalPoints: 0,
          consecutiveCorrect: 0,
          highestConsecutiveCorrect: 0,
          trails: [],
          lastSyncTimestamp: Date.now(),
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
        lastSyncTimestamp: Date.now(),
      }
    }

    // Fazer uma cópia profunda do progresso original para comparação posterior
    const originalProgress = JSON.parse(JSON.stringify(userProgress))
    logSync(LogLevel.DEBUG, "Cópia do progresso original para comparação:", originalProgress)

    // Garantir que trails seja sempre um array
    if (!Array.isArray(userProgress.trails)) {
      logSync(LogLevel.WARNING, "Progresso do usuário não contém um array de trilhas, inicializando...")
      userProgress.trails = []
    }

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
      logSync(LogLevel.INFO, `Trilhas disponíveis carregadas: ${availableTrails.length}`)
      logSync(LogLevel.DEBUG, "Trilhas disponíveis:", availableTrails)
    } catch (trailsError) {
      logSync(LogLevel.ERROR, "Erro ao buscar trilhas disponíveis:", trailsError)
      // Continuar com um array vazio se falhar
    }

    // 5. Sincronizar trilhas - MODIFICADO para preservar dados existentes
    const updatedProgress = mergeProgressWithTrails(userProgress, availableTrails, preserveCompletion)

    // Verificar se houve alterações no progresso
    const hasChanges = JSON.stringify(updatedProgress) !== JSON.stringify(originalProgress)
    logSync(LogLevel.INFO, `Houve alterações no progresso: ${hasChanges ? "Sim" : "Não"}`)

    if (hasChanges) {
      // 6. Salvar o progresso atualizado no servidor
      logSync(LogLevel.INFO, "Salvando progresso do usuário no Firebase...")
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
        logSync(LogLevel.INFO, "Progresso do usuário atualizado na API com sucesso")
      } catch (apiError) {
        logSync(LogLevel.ERROR, "Erro ao atualizar progresso na API:", apiError)
        // Continuar mesmo se falhar a atualização na API
      }
    } else {
      logSync(LogLevel.INFO, "Nenhuma alteração detectada, não é necessário salvar")
    }

    return updatedProgress
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao sincronizar progresso do usuário:", error)
    return null
  }
}

/**
 * Inicializa o progresso do usuário para um novo registro
 * Cria um progresso zerado com todas as trilhas disponíveis
 */
export const initializeUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    logSync(LogLevel.INFO, `Inicializando progresso para novo usuário: ${userId}`)

    // Forçar a criação de um novo progresso
    return await syncUserProgress(userId, true, false)
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao inicializar progresso para novo usuário:", error)
    return null
  }
}

// Modify the mergeProgressWithTrails function to implement a more robust comparison and merging strategy
const mergeProgressWithTrails = (
  userProgress: UserProgress,
  availableTrails: any[],
  preserveCompletion = true,
): UserProgress => {
  try {
    logSync(LogLevel.INFO, "Iniciando mesclagem de progresso com trilhas disponíveis")
    const updatedProgress = { ...userProgress }

    // Garantir que trails seja sempre um array
    if (!Array.isArray(updatedProgress.trails)) {
      updatedProgress.trails = []
    }

    // Criar um mapa de trilhas existentes para facilitar a busca
    const existingTrailsMap = new Map()
    updatedProgress.trails.forEach((trail) => {
      if (trail && trail.id) {
        existingTrailsMap.set(trail.id, trail)
      }
    })

    // Para cada trilha disponível
    for (const availableTrail of availableTrails) {
      // Verificar se a trilha disponível é válida
      if (!availableTrail || typeof availableTrail !== "object" || !availableTrail.id) {
        logSync(LogLevel.WARNING, "Trilha inválida encontrada, ignorando:", availableTrail)
        continue
      }

      // Verificar se o usuário já tem progresso nesta trilha
      let userTrail = existingTrailsMap.get(availableTrail.id)

      // Se não tiver, criar uma nova trilha no progresso do usuário
      if (!userTrail) {
        userTrail = {
          id: availableTrail.id,
          phases: [],
        }
        updatedProgress.trails.push(userTrail)
        logSync(LogLevel.INFO, `Nova trilha adicionada ao progresso: ${availableTrail.id}`)
      } else {
        logSync(LogLevel.INFO, `Trilha existente encontrada: ${availableTrail.id}, preservando dados`)
      }

      // Garantir que phases seja sempre um array
      if (!Array.isArray(userTrail.phases)) {
        userTrail.phases = []
      }

      // Sincronizar as etapas da trilha - PRESERVANDO dados existentes
      mergePhases(userTrail, availableTrail, preserveCompletion)
    }

    // Remover trilhas que não existem mais nas trilhas disponíveis
    // IMPORTANTE: Só remover se não tiver fases completadas
    const availableTrailIds = new Set(availableTrails.map((trail) => trail?.id).filter(Boolean))
    updatedProgress.trails = updatedProgress.trails.filter((trail) => {
      if (!trail || !trail.id) return false

      const exists = availableTrailIds.has(trail.id)

      // Se a trilha não existe mais, mas tem fases completadas e preserveCompletion é true, mantê-la
      if (!exists) {
        const hasCompletedPhases =
          trail.phases && Array.isArray(trail.phases) && trail.phases.some((p) => p && p.completed)

        if (preserveCompletion && hasCompletedPhases) {
          logSync(LogLevel.INFO, `Mantendo trilha ${trail.id} que não existe mais, mas tem fases completadas`)
          return true
        }

        logSync(LogLevel.INFO, `Removendo trilha que não existe mais: ${trail.id}`)
      }

      return exists
    })

    return updatedProgress
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao mesclar progresso com trilhas:", error)
    // Retornar o progresso original em caso de erro
    return userProgress
  }
}

// Modify the mergePhases function to better preserve completed phases
const mergePhases = (userTrail: TrailProgress, availableTrail: any, preserveCompletion = true): void => {
  try {
    logSync(LogLevel.INFO, `Mesclando etapas para trilha: ${userTrail.id}`)

    // Verificar se a trilha disponível tem etapas
    let availablePhases: any[] = []

    if (availableTrail.etapas) {
      if (Array.isArray(availableTrail.etapas)) {
        availablePhases = availableTrail.etapas
      } else if (typeof availableTrail.etapas === "object") {
        availablePhases = Object.values(availableTrail.etapas)
      }
    }

    logSync(LogLevel.DEBUG, `Etapas disponíveis: ${availablePhases.length}`)

    // Criar um mapa de etapas existentes para facilitar a busca
    const existingPhasesMap = new Map()
    userTrail.phases.forEach((phase) => {
      if (phase && phase.id) {
        existingPhasesMap.set(phase.id, phase)
      }
    })

    // Para cada etapa disponível
    for (const availablePhase of availablePhases) {
      // Verificar se a etapa disponível é válida
      if (!availablePhase || typeof availablePhase !== "object" || !availablePhase.id) {
        logSync(LogLevel.WARNING, "Etapa inválida encontrada, ignorando:", availablePhase)
        continue
      }

      // Verificar se o usuário já tem progresso nesta etapa
      let userPhase = existingPhasesMap.get(availablePhase.id)

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
        logSync(LogLevel.INFO, `Nova etapa adicionada ao progresso: ${availablePhase.id}`)
      } else {
        // IMPORTANTE: Log detalhado sobre o status da fase existente
        logSync(
          LogLevel.INFO,
          `Etapa existente encontrada: ${availablePhase.id}, status: started=${userPhase.started}, completed=${userPhase.completed}, timeSpent=${userPhase.timeSpent}`,
        )

        if (userPhase.completed) {
          logSync(LogLevel.INFO, `PRESERVANDO fase completada: ${availablePhase.id}`)
        }
      }

      // Garantir que questionsProgress seja sempre um array
      if (!Array.isArray(userPhase.questionsProgress)) {
        userPhase.questionsProgress = []
      }

      // Sincronizar as questões da etapa - PRESERVANDO dados existentes
      mergeQuestions(userPhase, availablePhase, preserveCompletion)
    }

    // Remover etapas que não existem mais nas etapas disponíveis
    // IMPORTANTE: Só remover se não estiver completada
    const availablePhaseIds = new Set(availablePhases.map((phase) => phase?.id).filter(Boolean))
    userTrail.phases = userTrail.phases.filter((phase) => {
      if (!phase || !phase.id) return false

      const exists = availablePhaseIds.has(phase.id)

      // Se a fase não existe mais, mas está completada e preserveCompletion é true, mantê-la
      if (!exists && preserveCompletion && phase.completed) {
        logSync(LogLevel.INFO, `Mantendo fase ${phase.id} que não existe mais, mas está completada`)
        return true
      }

      if (!exists) {
        logSync(LogLevel.INFO, `Removendo etapa que não existe mais: ${phase.id}`)
      }

      return exists
    })
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao mesclar etapas:", error)
    // Continuar mesmo se houver erro
  }
}

// Modify the mergeQuestions function to better preserve completed questions
const mergeQuestions = (userPhase: PhaseProgress, availablePhase: any, preserveCompletion = true): void => {
  try {
    logSync(LogLevel.INFO, `Mesclando questões para etapa: ${userPhase.id}`)

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

    logSync(LogLevel.DEBUG, `Questões disponíveis: ${availableQuestions.length}`)

    // Criar um mapa de questões existentes para facilitar a busca
    const existingQuestionsMap = new Map()
    userPhase.questionsProgress.forEach((question) => {
      if (question && question.id) {
        existingQuestionsMap.set(question.id, question)
      }
    })

    // Para cada questão disponível
    for (const availableQuestion of availableQuestions) {
      // Verificar se a questão disponível é válida
      if (!availableQuestion || typeof availableQuestion !== "object" || !availableQuestion.id) {
        continue
      }

      // Verificar se o usuário já respondeu esta questão
      const userQuestion = existingQuestionsMap.get(availableQuestion.id)

      // Se não tiver, adicionar a questão ao progresso do usuário (como não respondida)
      if (!userQuestion) {
        userPhase.questionsProgress.push({
          id: availableQuestion.id,
          answered: false,
          correct: false,
        })
        logSync(LogLevel.INFO, `Nova questão adicionada ao progresso: ${availableQuestion.id}`)
      } else {
        // IMPORTANTE: Log detalhado sobre o status da questão existente
        logSync(
          LogLevel.INFO,
          `Questão existente encontrada: ${availableQuestion.id}, status: answered=${userQuestion.answered}, correct=${userQuestion.correct}`,
        )

        if (userQuestion.answered) {
          logSync(LogLevel.INFO, `PRESERVANDO questão respondida: ${availableQuestion.id}`)
        }
      }
    }

    // Remover questões que não existem mais nas questões disponíveis
    // IMPORTANTE: Só remover se não estiver respondida corretamente
    const availableQuestionIds = new Set(availableQuestions.map((question) => question?.id).filter(Boolean))
    userPhase.questionsProgress = userPhase.questionsProgress.filter((question) => {
      if (!question || !question.id) return false

      const exists = availableQuestionIds.has(question.id)

      // Se a questão não existe mais, mas foi respondida corretamente e preserveCompletion é true, mantê-la
      if (!exists && preserveCompletion && question.answered && question.correct) {
        logSync(LogLevel.INFO, `Mantendo questão ${question.id} que não existe mais, mas foi respondida corretamente`)
        return true
      }

      if (!exists) {
        logSync(LogLevel.INFO, `Removendo questão que não existe mais: ${question.id}`)
      }

      return exists
    })
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao mesclar questões:", error)
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
    logSync(LogLevel.INFO, "Progresso do usuário salvo no Firebase com sucesso")
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao salvar progresso do usuário no Firebase:", error)
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
    logSync(LogLevel.ERROR, "Erro ao obter progresso do usuário do Firebase:", error)
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