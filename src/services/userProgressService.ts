import { getDatabase, ref, get, set } from "firebase/database"
import { getUserProgress, getTrails, updateUserProgress } from "./apiService"
import { logSync, LogLevel } from "./syncLogger"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
  consecutiveCorrect?: number
  highestConsecutiveCorrect?: number
  currentPhaseId?: string
  currentQuestionIndex?: number
  totalPoints?: number
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
 */
export const syncUserProgress = async (
  userId: string,
  forceCreate = false,
  preserveCompletion = true,
): Promise<UserProgress | null> => {
  try {
    logSync(LogLevel.INFO, `Iniciando sincronização de progresso para o usuário: ${userId}`)

    // 1. Buscar todas as trilhas disponíveis primeiro
    let availableTrails: any[] = []
    try {
      const trailsResponse = await getTrails()
      if (trailsResponse?.data) {
        availableTrails = Array.isArray(trailsResponse.data)
          ? trailsResponse.data
          : Object.values(trailsResponse.data || {})
      }
      logSync(LogLevel.INFO, `Trilhas disponíveis carregadas: ${availableTrails.length}`)

      // Log detalhado das trilhas disponíveis
      availableTrails.forEach((trail) => {
        logSync(LogLevel.INFO, `Trilha disponível: ${trail.id}, Nome: ${trail.nome || "N/A"}`)
      })
    } catch (trailsError) {
      logSync(LogLevel.ERROR, "Erro ao buscar trilhas disponíveis:", trailsError)
    }

    // 2. Verificar se já existe progresso no Firebase
    let userProgress: UserProgress | null = null

    if (!forceCreate) {
      userProgress = await getUserProgressFromFirebase(userId)
      logSync(LogLevel.INFO, `Progresso existente encontrado no Firebase: ${userProgress ? "Sim" : "Não"}`)
    }

    // 3. Se não existir no Firebase ou forceCreate for true, tentar buscar da API
    if (!userProgress) {
      logSync(LogLevel.INFO, "Nenhum progresso encontrado no Firebase ou forceCreate ativado, verificando na API...")
      try {
        const userProgressResponse = await getUserProgress(userId)

        if (userProgressResponse?.data && !forceCreate) {
          userProgress = userProgressResponse.data
          logSync(LogLevel.INFO, "Progresso encontrado na API")
        } else {
          // 4. Se não existir na API ou forceCreate for true, criar um progresso inicial
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

    // NOVO: Corrigir duplicações no array trails antes de prosseguir
    userProgress = fixDuplicateTrailsInArray(userProgress)

    // Fazer uma cópia profunda do progresso original para comparação posterior
    const originalProgress = JSON.parse(JSON.stringify(userProgress))

    // Garantir que trails seja sempre um array
    if (!Array.isArray(userProgress.trails)) {
      userProgress.trails = []
    }

    // 5. Sincronizar trilhas - MODIFICADO para preservar dados existentes
    const updatedProgress = mergeProgressWithTrails(userProgress, availableTrails, preserveCompletion)

    // Verificar se houve alterações no progresso
    const hasChanges = JSON.stringify(updatedProgress) !== JSON.stringify(originalProgress)

    if (hasChanges) {
      // 6. Salvar o progresso atualizado no servidor
      logSync(LogLevel.INFO, "Salvando progresso do usuário no Firebase...")
      await saveUserProgressToFirebase(userId, updatedProgress)

      // 7. Também atualizar na API
      try {
        for (const trail of updatedProgress.trails) {
          if (!trail?.id) continue
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
      }
    } else {
      logSync(LogLevel.INFO, "Nenhuma alteração detectada no progresso, não é necessário salvar")
    }

    // Salvar uma cópia no AsyncStorage para backup
    try {
      await AsyncStorage.setItem(`userProgress_${userId}`, JSON.stringify(updatedProgress))
      logSync(LogLevel.INFO, "Progresso salvo no AsyncStorage para backup")
    } catch (storageError) {
      logSync(LogLevel.ERROR, "Erro ao salvar progresso no AsyncStorage:", storageError)
    }

    // NOVO: Verificação final para garantir que não haja duplicações
    const finalProgress = await getUserProgressFromFirebase(userId)
    if (finalProgress) {
      const hasDuplicates = checkForDuplicateTrails(finalProgress)
      if (hasDuplicates) {
        logSync(LogLevel.WARNING, "Ainda existem duplicações após sincronização, corrigindo...")
        const fixedProgress = fixDuplicateTrailsInArray(finalProgress)
        await saveUserProgressToFirebase(userId, fixedProgress)
        logSync(LogLevel.INFO, "Duplicações corrigidas com sucesso")
      }
    }

    return updatedProgress
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao sincronizar progresso do usuário:", error)
    return null
  }
}

/**
 * NOVA FUNÇÃO: Verifica se há trilhas duplicadas no array trails
 */
const checkForDuplicateTrails = (progress: UserProgress): boolean => {
  if (!progress || !Array.isArray(progress.trails)) {
    return false
  }

  // Verificar se há duplicações por ID
  const trailIds = new Set<string>()
  let hasDuplicates = false

  for (const trail of progress.trails) {
    if (!trail?.id) continue

    if (trailIds.has(trail.id)) {
      hasDuplicates = true
      logSync(LogLevel.WARNING, `Trilha duplicada encontrada: ${trail.id}`)
    } else {
      trailIds.add(trail.id)
    }
  }

  // Verificar se há trilhas com índices numéricos e string ao mesmo tempo
  const numericIndices = progress.trails.filter((_, index) => typeof index === "number")
  const stringIndices = Object.keys(progress.trails).filter((key) => isNaN(Number(key)) && key !== "length")

  if (stringIndices.length > 0) {
    hasDuplicates = true
    logSync(LogLevel.WARNING, `Encontrados ${stringIndices.length} índices de string no array trails`)
  }

  return hasDuplicates
}

// Modificar a função fixDuplicateTrailsInArray para garantir que não haja duplicações
// Substituir a implementação atual da função fixDuplicateTrailsInArray com esta versão:

const fixDuplicateTrailsInArray = (progress: UserProgress): UserProgress => {
  if (!progress) {
    return progress
  }

  logSync(LogLevel.INFO, "Verificando e corrigindo duplicações no array trails...")

  // Criar uma cópia do progresso
  const fixedProgress = { ...progress }

  // Verificar se trails existe
  if (!fixedProgress.trails) {
    fixedProgress.trails = []
    return fixedProgress
  }

  // Extrair TODAS as trilhas, incluindo as que estão como propriedades diretas do objeto trails
  const allTrails: TrailProgress[] = []
  const trailsObj = fixedProgress.trails as any

  // 1. Adicionar trilhas de índices numéricos
  if (Array.isArray(fixedProgress.trails)) {
    for (let i = 0; i < fixedProgress.trails.length; i++) {
      const trail = fixedProgress.trails[i]
      if (trail && trail.id) {
        logSync(LogLevel.INFO, `Encontrada trilha com índice numérico ${i}: ${trail.id}`)
        allTrails.push({ ...trail })
      }
    }
  }

  // 2. Adicionar trilhas de índices string (propriedades diretas do objeto trails)
  Object.keys(trailsObj).forEach((key) => {
    if (isNaN(Number(key)) && key !== "length") {
      const trail = trailsObj[key]
      if (trail && (trail.id || key.startsWith("trilha_"))) {
        // Se não tiver ID, usar a chave como ID
        if (!trail.id) {
          trail.id = key
        }
        logSync(LogLevel.INFO, `Encontrada trilha com índice string ${key}: ${trail.id}`)
        allTrails.push({ ...trail })
      }
    }
  })

  // 3. Verificar propriedades diretas no objeto progress que são trilhas
  Object.keys(progress).forEach((key) => {
    if (key.startsWith("trilha_") && key !== "trails") {
      const directTrail = progress[key]
      if (directTrail) {
        // Garantir que tenha um ID
        if (!directTrail.id) {
          directTrail.id = key
        }
        logSync(LogLevel.INFO, `Encontrada trilha como propriedade direta ${key}: ${directTrail.id}`)
        allTrails.push({ ...directTrail })

        // Remover a propriedade direta
        delete fixedProgress[key]
      }
    }
  })

  logSync(LogLevel.INFO, `Total de trilhas encontradas: ${allTrails.length}`)

  // Mesclar trilhas com o mesmo ID
  const trailMap = new Map<string, TrailProgress>()

  for (const trail of allTrails) {
    if (!trail.id) continue

    const existingTrail = trailMap.get(trail.id)

    if (existingTrail) {
      // Mesclar dados
      logSync(LogLevel.INFO, `Mesclando dados da trilha duplicada: ${trail.id}`)

      // Preservar campos importantes
      if (trail.currentPhaseId) {
        existingTrail.currentPhaseId = trail.currentPhaseId
      }

      if (trail.currentQuestionIndex !== undefined) {
        existingTrail.currentQuestionIndex = trail.currentQuestionIndex
      }

      if (trail.consecutiveCorrect !== undefined) {
        existingTrail.consecutiveCorrect = trail.consecutiveCorrect
      }

      if (trail.highestConsecutiveCorrect !== undefined) {
        existingTrail.highestConsecutiveCorrect = trail.highestConsecutiveCorrect
      }

      if (trail.totalPoints !== undefined) {
        existingTrail.totalPoints = trail.totalPoints
      }

      // Mesclar fases
      if (Array.isArray(trail.phases)) {
        if (!Array.isArray(existingTrail.phases)) {
          existingTrail.phases = []
        }

        // Mapa para mesclar fases
        const phaseMap = new Map<string, PhaseProgress>()

        // Adicionar fases existentes
        existingTrail.phases.forEach((phase) => {
          if (phase?.id) {
            phaseMap.set(phase.id, { ...phase })
          }
        })

        // Mesclar com novas fases
        trail.phases.forEach((phase) => {
          if (!phase?.id) return

          const existingPhase = phaseMap.get(phase.id)

          if (existingPhase) {
            // Preservar status de conclusão
            if (phase.completed) {
              existingPhase.completed = true
            }

            // Preservar status de início
            if (phase.started) {
              existingPhase.started = true
            }

            // Preservar tempo gasto
            if (phase.timeSpent) {
              existingPhase.timeSpent = phase.timeSpent
            }

            // Mesclar questões
            if (Array.isArray(phase.questionsProgress)) {
              if (!Array.isArray(existingPhase.questionsProgress)) {
                existingPhase.questionsProgress = []
              }

              // Mapa para mesclar questões
              const questionMap = new Map<string, QuestionProgress>()

              // Adicionar questões existentes
              existingPhase.questionsProgress.forEach((question) => {
                if (question?.id) {
                  questionMap.set(question.id, { ...question })
                }
              })

              // Mesclar com novas questões
              phase.questionsProgress.forEach((question) => {
                if (!question?.id) return

                const existingQuestion = questionMap.get(question.id)

                if (existingQuestion) {
                  // Preservar status de resposta
                  if (question.answered) {
                    existingQuestion.answered = true
                  }

                  // Preservar status de correção
                  if (question.correct) {
                    existingQuestion.correct = true
                  }
                } else {
                  questionMap.set(question.id, { ...question })
                }
              })

              // Atualizar questões
              existingPhase.questionsProgress = Array.from(questionMap.values())
            }
          } else {
            phaseMap.set(phase.id, { ...phase })
          }
        })

        // Atualizar fases
        existingTrail.phases = Array.from(phaseMap.values())
      }
    } else {
      trailMap.set(trail.id, { ...trail })
    }
  }

  // Criar um novo array de trilhas sem duplicações
  const cleanTrails = Array.from(trailMap.values())

  // IMPORTANTE: Criar um array completamente novo para evitar propriedades diretas
  fixedProgress.trails = []

  // Adicionar cada trilha como um elemento do array
  cleanTrails.forEach((trail) => {
    fixedProgress.trails.push(trail)
  })

  logSync(
    LogLevel.INFO,
    `Correção concluída: ${allTrails.length} trilhas encontradas, ${fixedProgress.trails.length} após mesclagem`,
  )

  return fixedProgress
}

/**
 * Mescla o progresso do usuário com as trilhas disponíveis
 */
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

    // Log do estado inicial
    logSync(LogLevel.INFO, `Estado inicial: ${updatedProgress.trails.length} trilhas no progresso do usuário`)

    // Create map of existing trails
    const existingTrails = new Map<string, TrailProgress>()

    // Adicionar apenas trilhas com ID válido
    updatedProgress.trails.forEach((trail) => {
      if (trail?.id) {
        existingTrails.set(trail.id, { ...trail })
      }
    })

    // Process each available trail
    for (const availableTrail of availableTrails) {
      if (!availableTrail?.id) {
        logSync(LogLevel.WARNING, "Trilha disponível sem ID encontrada, ignorando")
        continue
      }

      let trail = existingTrails.get(availableTrail.id)

      if (!trail) {
        logSync(LogLevel.INFO, `Criando nova trilha: ${availableTrail.id}`)
        trail = {
          id: availableTrail.id,
          phases: [],
        }
        existingTrails.set(availableTrail.id, trail)
      } else {
        logSync(LogLevel.INFO, `Atualizando trilha existente: ${availableTrail.id}`)
      }

      // Merge phases
      mergePhases(trail, availableTrail, preserveCompletion)
    }

    // Atualizar o array de trilhas
    updatedProgress.trails = Array.from(existingTrails.values())

    // Log do estado final
    logSync(LogLevel.INFO, `Estado final: ${updatedProgress.trails.length} trilhas no progresso do usuário`)

    return updatedProgress
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao mesclar progresso com trilhas:", error)
    return userProgress
  }
}

/**
 * Mescla as etapas de uma trilha
 */
const mergePhases = (userTrail: TrailProgress, availableTrail: any, preserveCompletion = true): void => {
  try {
    if (!Array.isArray(userTrail.phases)) {
      userTrail.phases = []
    }

    // Log do estado inicial
    const initialPhaseCount = userTrail.phases.length
    const initialCompletedPhases = userTrail.phases.filter((p) => p?.completed).length
    logSync(
      LogLevel.INFO,
      `Trilha ${userTrail.id}: Estado inicial - ${initialPhaseCount} fases, ${initialCompletedPhases} completadas`,
    )

    const availablePhases = Array.isArray(availableTrail.etapas)
      ? availableTrail.etapas
      : Object.values(availableTrail.etapas || {})

    logSync(LogLevel.INFO, `Trilha ${userTrail.id}: ${availablePhases.length} fases disponíveis para mesclagem`)

    // Create map of existing phases
    const existingPhases = new Map<string, PhaseProgress>()

    // Adicionar apenas fases com ID válido
    userTrail.phases.forEach((phase) => {
      if (phase?.id) {
        existingPhases.set(phase.id, { ...phase })
      }
    })

    // Process each available phase
    for (const availablePhase of availablePhases) {
      if (!availablePhase?.id) {
        logSync(LogLevel.WARNING, `Fase sem ID encontrada na trilha ${userTrail.id}, ignorando`)
        continue
      }

      let phase = existingPhases.get(availablePhase.id)

      if (!phase) {
        logSync(LogLevel.INFO, `Criando nova fase ${availablePhase.id} na trilha ${userTrail.id}`)
        phase = {
          id: availablePhase.id,
          started: false,
          completed: false,
          questionsProgress: [],
          timeSpent: 0,
        }
        existingPhases.set(availablePhase.id, phase)
      } else if (preserveCompletion) {
        // CRITICAL: Preserve completion status
        logSync(LogLevel.INFO, `Verificando fase ${phase.id}: completed=${phase.completed}`)
        if (phase.completed) {
          logSync(LogLevel.INFO, `Preservando status completed=true para fase ${phase.id}`)
        }
      }

      // Merge questions
      mergeQuestions(phase, availablePhase, preserveCompletion)

      // Re-check completion status after merging questions
      if (preserveCompletion && phase.questionsProgress?.length > 0) {
        const allQuestionsComplete = phase.questionsProgress.every((q) => q?.answered && q?.correct)
        if (allQuestionsComplete) {
          phase.completed = true
          logSync(LogLevel.INFO, `Fase ${phase.id} marcada como completa pois todas as questões estão corretas`)
        }
      }
    }

    // Atualizar o array de fases
    userTrail.phases = Array.from(existingPhases.values())

    // Log do estado final
    const finalCompletedPhases = userTrail.phases.filter((p) => p?.completed).length
    logSync(
      LogLevel.INFO,
      `Trilha ${userTrail.id}: Estado final - ${userTrail.phases.length} fases, ${finalCompletedPhases} completadas`,
    )
  } catch (error) {
    logSync(LogLevel.ERROR, `Erro ao mesclar etapas na trilha ${userTrail.id}:`, error)
  }
}

/**
 * Mescla as questões de uma fase
 */
const mergeQuestions = (userPhase: PhaseProgress, availablePhase: any, preserveCompletion = true): void => {
  try {
    if (!Array.isArray(userPhase.questionsProgress)) {
      userPhase.questionsProgress = []
    }

    // Log do estado inicial
    const initialQuestionCount = userPhase.questionsProgress.length
    const initialAnsweredQuestions = userPhase.questionsProgress.filter((q) => q?.answered).length
    const initialCorrectQuestions = userPhase.questionsProgress.filter((q) => q?.answered && q?.correct).length

    logSync(
      LogLevel.INFO,
      `Fase ${userPhase.id}: Estado inicial - ${initialQuestionCount} questões, ${initialAnsweredQuestions} respondidas, ${initialCorrectQuestions} corretas`,
    )

    // Get all questions from all stages
    const availableStages = Array.isArray(availablePhase.stages)
      ? availablePhase.stages
      : Object.values(availablePhase.stages || {})

    const availableQuestions = availableStages.flatMap((stage) => {
      if (!stage?.questions) return []
      return Array.isArray(stage.questions) ? stage.questions : Object.values(stage.questions || {})
    })

    logSync(LogLevel.INFO, `Fase ${userPhase.id}: ${availableQuestions.length} questões disponíveis para mesclagem`)

    // Create map of existing questions
    const existingQuestions = new Map<string, QuestionProgress>()

    // Adicionar apenas questões com ID válido
    userPhase.questionsProgress.forEach((question) => {
      if (question?.id) {
        existingQuestions.set(question.id, { ...question })
      }
    })

    // Process each available question
    for (const availableQuestion of availableQuestions) {
      if (!availableQuestion?.id) {
        logSync(LogLevel.WARNING, `Questão sem ID encontrada na fase ${userPhase.id}, ignorando`)
        continue
      }

      let question = existingQuestions.get(availableQuestion.id)

      if (!question) {
        logSync(LogLevel.INFO, `Criando nova questão ${availableQuestion.id} na fase ${userPhase.id}`)
        question = {
          id: availableQuestion.id,
          answered: false,
          correct: false,
        }
        existingQuestions.set(availableQuestion.id, question)
      } else if (preserveCompletion && question.answered) {
        // CRITICAL: Preserve answer status
        logSync(
          LogLevel.INFO,
          `Preservando status para questão ${question.id}: answered=${question.answered}, correct=${question.correct}`,
        )
      }
    }

    // Atualizar o array de questões
    userPhase.questionsProgress = Array.from(existingQuestions.values())

    // Log do estado final
    const finalAnsweredQuestions = userPhase.questionsProgress.filter((q) => q?.answered).length
    const finalCorrectQuestions = userPhase.questionsProgress.filter((q) => q?.answered && q?.correct).length

    logSync(
      LogLevel.INFO,
      `Fase ${userPhase.id}: Estado final - ${userPhase.questionsProgress.length} questões, ${finalAnsweredQuestions} respondidas, ${finalCorrectQuestions} corretas`,
    )
  } catch (error) {
    logSync(LogLevel.ERROR, `Erro ao mesclar questões na fase ${userPhase.id}:`, error)
  }
}

/**
 * Salva o progresso do usuário no Firebase
 */
const saveUserProgressToFirebase = async (userId: string, progress: UserProgress): Promise<void> => {
  try {
    // NOVO: Verificar se o progresso é válido antes de salvar
    if (!progress) {
      logSync(LogLevel.ERROR, "Tentativa de salvar progresso inválido (null ou undefined)")
      return
    }

    // NOVO: Criar uma cópia limpa do objeto para evitar problemas de serialização
    const cleanProgress = JSON.parse(JSON.stringify(progress))

    // NOVO: Verificar se o array de trilhas é válido
    if (!Array.isArray(cleanProgress.trails)) {
      cleanProgress.trails = []
      logSync(LogLevel.WARNING, "Array de trilhas inválido, criando um novo array vazio")
    }

    // NOVO: Verificar se o userId é válido
    if (!userId) {
      logSync(LogLevel.ERROR, "ID de usuário inválido ao tentar salvar progresso")
      throw new Error("ID de usuário inválido")
    }

    logSync(LogLevel.INFO, `Tentando salvar progresso para o usuário: ${userId}`)

    const db = getDatabase()
    const userProgressRef = ref(db, `userProgress/${userId}`)

    // NOVO: Usar try/catch específico para a operação de set
    try {
      await set(userProgressRef, cleanProgress)
      logSync(LogLevel.INFO, "Progresso do usuário salvo no Firebase com sucesso")
    } catch (setError) {
      // Capturar detalhes específicos do erro de set
      logSync(LogLevel.ERROR, "Erro específico ao executar set() no Firebase:", setError)

      // NOVO: Tentar uma abordagem alternativa se a primeira falhar
      logSync(LogLevel.INFO, "Tentando abordagem alternativa de salvamento...")

      // Tentar salvar apenas os dados essenciais
      const minimalProgress = {
        totalPoints: cleanProgress.totalPoints || 0,
        consecutiveCorrect: cleanProgress.consecutiveCorrect || 0,
        highestConsecutiveCorrect: cleanProgress.highestConsecutiveCorrect || 0,
        trails: cleanProgress.trails.map((trail) => ({
          id: trail.id,
          phases: Array.isArray(trail.phases)
            ? trail.phases.map((phase) => ({
                id: phase.id,
                completed: phase.completed || false,
                started: phase.started || false,
                timeSpent: phase.timeSpent || 0,
                questionsProgress: Array.isArray(phase.questionsProgress)
                  ? phase.questionsProgress.map((q) => ({
                      id: q.id,
                      answered: q.answered || false,
                      correct: q.correct || false,
                    }))
                  : [],
              }))
            : [],
        })),
      }

      try {
        await set(userProgressRef, minimalProgress)
        logSync(LogLevel.INFO, "Progresso mínimo do usuário salvo com sucesso usando abordagem alternativa")
      } catch (fallbackError) {
        logSync(LogLevel.ERROR, "Falha também na abordagem alternativa:", fallbackError)
        throw fallbackError
      }
    }
  } catch (error) {
    // Melhorar o log de erro para incluir mais detalhes
    logSync(LogLevel.ERROR, "Erro ao salvar progresso do usuário no Firebase:")

    // Tentar extrair mais informações do erro
    if (error instanceof Error) {
      logSync(LogLevel.ERROR, `Mensagem: ${error.message}`)
      logSync(LogLevel.ERROR, `Stack: ${error.stack}`)
    } else {
      logSync(LogLevel.ERROR, `Erro não padrão: ${JSON.stringify(error)}`)
    }

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

      // NOVO: Verificar e corrigir duplicações antes de retornar
      if (data && data.trails) {
        const fixedData = fixDuplicateTrailsInArray(data)
        return fixedData as UserProgress
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
 * Calcula o progresso de uma etapa
 */
export const calculatePhaseProgress = (phase: PhaseProgress): number => {
  if (phase.completed) return 100

  if (!Array.isArray(phase.questionsProgress) || phase.questionsProgress.length === 0) {
    return 0
  }

  const correctQuestions = phase.questionsProgress.filter((q) => q?.answered && q?.correct).length
  return Math.round((correctQuestions / phase.questionsProgress.length) * 100)
}

/**
 * Verifica se uma etapa está completa
 */
export const isPhaseCompleted = (phase: PhaseProgress): boolean => {
  if (phase.completed) return true

  if (!Array.isArray(phase.questionsProgress) || phase.questionsProgress.length === 0) {
    return false
  }

  return phase.questionsProgress.every((q) => q?.answered && q?.correct)
}

/**\
 * Limpa completamente o progresso do usuário e recria com base nas trilhas disponíveis
 */
export const resetUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    logSync(LogLevel.INFO, `Iniciando reset completo do progresso para o usuário: ${userId}`)

    // 1. Buscar todas as trilhas disponíveis
    let availableTrails: any[] = []
    try {
      const trailsResponse = await getTrails()
      if (trailsResponse?.data) {
        availableTrails = Array.isArray(trailsResponse.data)
          ? trailsResponse.data
          : Object.values(trailsResponse.data || {})
      }
      logSync(LogLevel.INFO, `Trilhas disponíveis carregadas: ${availableTrails.length}`)
    } catch (trailsError) {
      logSync(LogLevel.ERROR, "Erro ao buscar trilhas disponíveis:", trailsError)
      return null
    }

    // 2. Criar um progresso limpo
    const cleanProgress: UserProgress = {
      totalPoints: 0,
      consecutiveCorrect: 0,
      highestConsecutiveCorrect: 0,
      trails: availableTrails.map((trail) => ({
        id: trail.id,
        phases: [],
      })),
      lastSyncTimestamp: Date.now(),
    }

    // 3. Salvar o progresso limpo
    await saveUserProgressToFirebase(userId, cleanProgress)
    logSync(LogLevel.INFO, "Progresso do usuário resetado com sucesso")

    return cleanProgress
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao resetar progresso do usuário:", error)
    return null
  }
}
