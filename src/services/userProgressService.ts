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
 * FUNÇÃO AUXILIAR: Verifica se o objeto possui uma estrutura de dados válida
 * para evitar erros de serialização e inconsistências
 */
const isValidProgressObject = (obj: any): boolean => {
  if (!obj || typeof obj !== "object") return false

  // Verificar campos obrigatórios
  if (typeof obj.totalPoints !== "number") return false
  if (typeof obj.consecutiveCorrect !== "number") return false
  if (typeof obj.highestConsecutiveCorrect !== "number") return false

  // Verificar o campo trails
  if (!obj.trails) return false

  return true
}

/**
 * FUNÇÃO AUXILIAR: Limpa propriedades estranhas de um objeto antes da serialização
 * para evitar erros e inconsistências
 */
const cleanObjectForSerialization = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj

  // Se for um array, limpar cada elemento
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObjectForSerialization(item)).filter(Boolean)
  }

  // Se for um objeto regular, limpar propriedades
  const cleanObj: any = {}

  Object.keys(obj).forEach((key) => {
    // Ignorar propriedades não-enumeráveis e funções
    const value = obj[key]
    if (typeof value !== "function" && key !== "__proto__") {
      if (typeof value === "object" && value !== null) {
        cleanObj[key] = cleanObjectForSerialization(value)
      } else {
        cleanObj[key] = value
      }
    }
  })

  return cleanObj
}

// VARIÁVEIS GLOBAIS: Controle de sincronização
let isSyncingBlocked = false
let isContentSyncNeeded = false
let lastContentSyncTime = 0

// FUNÇÃO: Bloquear sincronização
export const blockSyncing = () => {
  isSyncingBlocked = true
  logSync(LogLevel.WARNING, "⛔ SINCRONIZAÇÃO BLOQUEADA - Nenhuma sincronização será executada")

  // Desbloquear após 30 segundos para evitar bloqueio permanente
  setTimeout(() => {
    isSyncingBlocked = false
    logSync(LogLevel.INFO, "✅ SINCRONIZAÇÃO DESBLOQUEADA - Sincronizações permitidas novamente")
  }, 30000)
}

// FUNÇÃO: Verificar se a sincronização está bloqueada
export const isSyncingBlockedNow = () => {
  return isSyncingBlocked
}

// FUNÇÃO: Marcar que uma sincronização de conteúdo é necessária
export const markContentSyncNeeded = () => {
  isContentSyncNeeded = true
  logSync(LogLevel.INFO, "🔄 Sincronização de conteúdo marcada como necessária")
}

// FUNÇÃO: Sincronizar apenas conteúdo novo
export const syncNewContent = async (userId: string): Promise<UserProgress | null> => {
  // Se a última sincronização foi há menos de 5 minutos, não sincronizar novamente
  const now = Date.now()
  if (now - lastContentSyncTime < 5 * 60 * 1000) {
    logSync(LogLevel.INFO, "Sincronização de conteúdo ignorada - última sincronização muito recente")
    return null
  }

  // Se a sincronização estiver bloqueada, não fazer nada
  if (isSyncingBlocked) {
    logSync(LogLevel.WARNING, "⛔ Sincronização de conteúdo bloqueada - tentando novamente mais tarde")
    return null
  }

  logSync(LogLevel.INFO, "🔄 Iniciando sincronização de NOVO CONTEÚDO para o usuário: " + userId)

  try {
    // 1. Obter o progresso atual do usuário
    const currentProgress = await getUserProgressFromFirebase(userId)
    if (!currentProgress) {
      logSync(LogLevel.WARNING, "Nenhum progresso encontrado para sincronizar conteúdo")
      return null
    }

    // 2. Fazer backup do progresso atual
    try {
      await AsyncStorage.setItem(`userProgress_content_backup_${userId}`, JSON.stringify(currentProgress))
      logSync(LogLevel.INFO, "Backup do progresso atual salvo antes da sincronização de conteúdo")
    } catch (backupError) {
      logSync(LogLevel.ERROR, "Erro ao salvar backup do progresso:", backupError)
    }

    // 3. Buscar todas as trilhas disponíveis
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
      return currentProgress
    }

    // 4. Sincronizar APENAS novas trilhas e questões
    const updatedProgress = await syncOnlyNewContent(currentProgress, availableTrails)

    // 5. Salvar o progresso atualizado
    await saveUserProgressToFirebase(userId, updatedProgress)

    // 6. Atualizar timestamp da última sincronização
    lastContentSyncTime = now
    isContentSyncNeeded = false

    logSync(LogLevel.INFO, "✅ Sincronização de novo conteúdo concluída com sucesso")

    return updatedProgress
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao sincronizar novo conteúdo:", error)
    return null
  }
}

// FUNÇÃO: Sincronizar apenas novo conteúdo sem afetar o progresso existente
const syncOnlyNewContent = async (currentProgress: UserProgress, availableTrails: any[]): Promise<UserProgress> => {
  logSync(LogLevel.INFO, "Iniciando sincronização apenas de novo conteúdo")

  // Criar uma cópia do progresso atual
  const updatedProgress = JSON.parse(JSON.stringify(currentProgress)) as UserProgress

  // Garantir que trails seja um array
  if (!Array.isArray(updatedProgress.trails)) {
    updatedProgress.trails = []
  }

  // 1. Verificar novas trilhas
  for (const availableTrail of availableTrails) {
    if (!availableTrail?.id) continue

    // Verificar se a trilha já existe no progresso
    const existingTrailIndex = updatedProgress.trails.findIndex((t) => t?.id === availableTrail.id)

    if (existingTrailIndex === -1) {
      // Trilha nova - adicionar ao progresso
      logSync(LogLevel.INFO, `Nova trilha encontrada: ${availableTrail.id} - adicionando ao progresso`)

      const newTrail: TrailProgress = {
        id: availableTrail.id,
        phases: [],
      }

      // Adicionar todas as fases da nova trilha
      const availablePhases = Array.isArray(availableTrail.etapas)
        ? availableTrail.etapas
        : Object.values(availableTrail.etapas || {})

      for (const phase of availablePhases) {
        if (!phase?.id) continue

        const newPhase: PhaseProgress = {
          id: phase.id,
          started: false,
          completed: false,
          questionsProgress: [],
          timeSpent: 0,
        }

        // Adicionar todas as questões da fase
        const availableStages = Array.isArray(phase.stages) ? phase.stages : Object.values(phase.stages || {})

        for (const stage of availableStages) {
          if (!stage?.questions) continue

          const questions = Array.isArray(stage.questions) ? stage.questions : Object.values(stage.questions || {})

          for (const question of questions) {
            if (!question?.id) continue

            newPhase.questionsProgress.push({
              id: question.id,
              answered: false,
              correct: false,
            })
          }
        }

        newTrail.phases.push(newPhase)
      }

      updatedProgress.trails.push(newTrail)
    } else {
      // Trilha existente - verificar novas fases
      const existingTrail = updatedProgress.trails[existingTrailIndex]

      // Garantir que phases seja um array
      if (!Array.isArray(existingTrail.phases)) {
        existingTrail.phases = []
      }

      const availablePhases = Array.isArray(availableTrail.etapas)
        ? availableTrail.etapas
        : Object.values(availableTrail.etapas || {})

      for (const phase of availablePhases) {
        if (!phase?.id) continue

        // Verificar se a fase já existe
        const existingPhaseIndex = existingTrail.phases.findIndex((p) => p?.id === phase.id)

        if (existingPhaseIndex === -1) {
          // Fase nova - adicionar ao progresso
          logSync(
            LogLevel.INFO,
            `Nova fase encontrada: ${phase.id} na trilha ${availableTrail.id} - adicionando ao progresso`,
          )

          const newPhase: PhaseProgress = {
            id: phase.id,
            started: false,
            completed: false,
            questionsProgress: [],
            timeSpent: 0,
          }

          // Adicionar todas as questões da fase
          const availableStages = Array.isArray(phase.stages) ? phase.stages : Object.values(phase.stages || {})

          for (const stage of availableStages) {
            if (!stage?.questions) continue

            const questions = Array.isArray(stage.questions) ? stage.questions : Object.values(stage.questions || {})

            for (const question of questions) {
              if (!question?.id) continue

              newPhase.questionsProgress.push({
                id: question.id,
                answered: false,
                correct: false,
              })
            }
          }

          existingTrail.phases.push(newPhase)
        } else {
          // Fase existente - verificar novas questões
          const existingPhase = existingTrail.phases[existingPhaseIndex]

          // Garantir que questionsProgress seja um array
          if (!Array.isArray(existingPhase.questionsProgress)) {
            existingPhase.questionsProgress = []
          }

          // Obter todas as questões disponíveis para esta fase
          const availableStages = Array.isArray(phase.stages) ? phase.stages : Object.values(phase.stages || {})

          const allAvailableQuestions: any[] = []

          for (const stage of availableStages) {
            if (!stage?.questions) continue

            const questions = Array.isArray(stage.questions) ? stage.questions : Object.values(stage.questions || {})

            allAvailableQuestions.push(...questions)
          }

          // Adicionar apenas questões novas
          for (const question of allAvailableQuestions) {
            if (!question?.id) continue

            const existingQuestion = existingPhase.questionsProgress.find((q) => q?.id === question.id)

            if (!existingQuestion) {
              // Questão nova - adicionar ao progresso
              logSync(
                LogLevel.INFO,
                `Nova questão encontrada: ${question.id} na fase ${phase.id} - adicionando ao progresso`,
              )

              existingPhase.questionsProgress.push({
                id: question.id,
                answered: false,
                correct: false,
              })
            }
          }
        }
      }
    }
  }

  logSync(LogLevel.INFO, `Sincronização de novo conteúdo concluída: ${updatedProgress.trails.length} trilhas no total`)
  return updatedProgress
}

/**
 * NOVA FUNÇÃO: Inicializa o progresso para um novo usuário
 * Garante que todas as estruturas estejam corretamente configuradas
 */
export const initializeNewUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    logSync(LogLevel.INFO, `Inicializando progresso para NOVO USUÁRIO: ${userId}`)

    // Bloquear outras sincronizações durante a inicialização
    blockSyncing()

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

    // 2. Criar um progresso inicial completo
    const initialProgress: UserProgress = {
      totalPoints: 0,
      consecutiveCorrect: 0,
      highestConsecutiveCorrect: 0,
      trails: [],
      lastSyncTimestamp: Date.now(),
    }

    // 3. Adicionar todas as trilhas disponíveis com estrutura completa
    for (const availableTrail of availableTrails) {
      if (!availableTrail?.id) continue

      const newTrail: TrailProgress = {
        id: availableTrail.id,
        phases: [],
        currentPhaseId: null,
        currentQuestionIndex: 0,
        totalPoints: 0,
      }

      // Adicionar todas as fases da trilha
      const availablePhases = Array.isArray(availableTrail.etapas)
        ? availableTrail.etapas
        : Object.values(availableTrail.etapas || {})

      for (const phase of availablePhases) {
        if (!phase?.id) continue

        const newPhase: PhaseProgress = {
          id: phase.id,
          started: false,
          completed: false,
          questionsProgress: [],
          timeSpent: 0,
        }

        // Adicionar todas as questões da fase
        const availableStages = Array.isArray(phase.stages) ? phase.stages : Object.values(phase.stages || {})

        for (const stage of availableStages) {
          if (!stage?.questions) continue

          const questions = Array.isArray(stage.questions) ? stage.questions : Object.values(stage.questions || {})

          for (const question of questions) {
            if (!question?.id) continue

            newPhase.questionsProgress.push({
              id: question.id,
              answered: false,
              correct: false,
            })
          }
        }

        newTrail.phases.push(newPhase)
      }

      initialProgress.trails.push(newTrail)
    }

    // 4. Salvar o progresso inicial
    await saveUserProgressToFirebase(userId, initialProgress)
    logSync(LogLevel.INFO, "Progresso inicial para novo usuário criado com sucesso")

    // 5. Também salvar na API
    try {
      for (const trail of initialProgress.trails) {
        if (!trail?.id) continue
        await updateUserProgress(userId, trail.id, {
          phases: trail.phases,
          totalPoints: initialProgress.totalPoints,
          consecutiveCorrect: initialProgress.consecutiveCorrect,
          highestConsecutiveCorrect: initialProgress.highestConsecutiveCorrect,
        })
      }
      logSync(LogLevel.INFO, "Progresso inicial do usuário atualizado na API com sucesso")
    } catch (apiError) {
      logSync(LogLevel.ERROR, "Erro ao atualizar progresso inicial na API:", apiError)
    }

    return initialProgress
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao inicializar progresso para novo usuário:", error)
    return null
  }
}

/**
 * Sincroniza o progresso do usuário com as trilhas disponíveis
 * Preserva o progresso existente e adiciona novas trilhas/etapas/questões
 */
export const syncUserProgress = async (
  userId: string,
  forceCreate = false,
  preserveCompletion = true, // Garantir que este parâmetro seja true por padrão
): Promise<UserProgress | null> => {
  try {
    // VERIFICAÇÃO CRÍTICA: Se a sincronização estiver bloqueada, retornar o progresso atual sem modificações
    if (isSyncingBlocked) {
      logSync(LogLevel.WARNING, "⛔ Tentativa de sincronização bloqueada - Retornando progresso atual sem modificações")
      return await getUserProgressFromFirebase(userId)
    }

    logSync(LogLevel.INFO, `Iniciando sincronização de progresso para o usuário: ${userId}`)
    logSync(LogLevel.INFO, `Parâmetros: forceCreate=${forceCreate}, preserveCompletion=${preserveCompletion}`)

    // Verificar se é um novo usuário
    const isNewUser = await AsyncStorage.getItem(`new_user_${userId}`)
    if (isNewUser === "true" && forceCreate) {
      logSync(LogLevel.INFO, "Novo usuário detectado - usando inicialização especial")
      return await initializeNewUserProgress(userId)
    }

    // IMPORTANTE: Fazer backup do progresso atual antes de qualquer modificação
    const currentProgress = await getUserProgressFromFirebase(userId)
    if (currentProgress) {
      try {
        await AsyncStorage.setItem(`userProgress_backup_${userId}`, JSON.stringify(currentProgress))
        logSync(LogLevel.INFO, "Backup do progresso atual salvo com sucesso")
      } catch (backupError) {
        logSync(LogLevel.ERROR, "Erro ao salvar backup do progresso:", backupError)
      }
    }

    // Se forceCreate for false e já existir progresso, não fazer nada
    if (!forceCreate && currentProgress) {
      logSync(LogLevel.INFO, "Progresso existente encontrado e forceCreate=false, mantendo dados existentes")
      return currentProgress
    }

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
    // IMPORTANTE: Forçar preserveCompletion para true para garantir que o progresso seja mantido
    const updatedProgress = mergeProgressWithTrails(userProgress, availableTrails, true)

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
      logSync(LogLevel.DEBUG, "Progresso salvo no AsyncStorage")
    } catch (storageError) {
      logSync(LogLevel.ERROR, "Erro ao salvar progresso no AsyncStorage:", storageError)
    }

    logSync(LogLevel.INFO, "Progresso do usuário sincronizado com sucesso")
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
  const stringIndices = Object.keys(progress.trails).filter((key) => isNaN(Number(key)) && key !== "length")

  if (stringIndices.length > 0) {
    hasDuplicates = true
    logSync(LogLevel.WARNING, `Encontrados ${stringIndices.length} índices de string no array trails`)
  }

  return hasDuplicates
}

// NOVA IMPLEMENTAÇÃO: Modificada para não criar duplicações
const fixDuplicateTrailsInArray = (progress: UserProgress): UserProgress => {
  if (!progress) {
    return progress
  }

  logSync(LogLevel.INFO, "Verificando e corrigindo duplicações no array trails...")

  // Criar uma cópia limpa do progresso para evitar problemas de serialização
  const fixedProgress = cleanObjectForSerialization(progress)

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
      if (trail && (trail.id || key)) {
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
  Object.keys(fixedProgress).forEach((key) => {
    if (
      key !== "trails" &&
      key !== "totalPoints" &&
      key !== "consecutiveCorrect" &&
      key !== "highestConsecutiveCorrect" &&
      key !== "currentPhaseId" &&
      key !== "currentQuestionIndex" &&
      key !== "lastSyncTimestamp"
    ) {
      const directTrail = fixedProgress[key]
      if (directTrail && typeof directTrail === "object") {
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

  // IMPORTANTE: Criar um array completamente novo e limpo
  const cleanTrails: TrailProgress[] = []

  // Adicionar cada trilha como um elemento do array
  trailMap.forEach((trail) => {
    cleanTrails.push(trail)
  })

  // Definir o novo array de trilhas (garantir que seja um array puro)
  fixedProgress.trails = cleanTrails

  logSync(
    LogLevel.INFO,
    `Correção concluída: ${allTrails.length} trilhas encontradas, ${fixedProgress.trails.length} após mesclagem`,
  )

  return fixedProgress
}

/**
 * NOVA FUNÇÃO: Limpa e normaliza a estrutura do array trails
 * Garante que trails seja um array puro sem propriedades adicionais
 */
export const normalizeTrailsArray = async (userId: string): Promise<boolean> => {
  try {
    // VERIFICAÇÃO CRÍTICA: Se a sincronização estiver bloqueada, não fazer nada
    if (isSyncingBlocked) {
      logSync(LogLevel.WARNING, "⛔ Tentativa de normalização bloqueada")
      return false
    }

    logSync(LogLevel.INFO, `Iniciando normalização do array trails para o usuário: ${userId}`)

    // 1. Obter o progresso atual
    const userProgress = await getUserProgressFromFirebase(userId)

    if (!userProgress) {
      logSync(LogLevel.WARNING, "Nenhum progresso encontrado para normalizar")
      return false
    }

    // 2. Verificar se já está normalizado
    if (!Array.isArray(userProgress.trails)) {
      logSync(LogLevel.WARNING, "O campo trails não é um array, criando um novo")
      userProgress.trails = []
    }

    // 3. Verificar se há propriedades não numéricas no array
    const trailsObj = userProgress.trails as any
    const nonNumericKeys = Object.keys(trailsObj).filter((key) => isNaN(Number(key)) && key !== "length")

    if (nonNumericKeys.length === 0) {
      logSync(LogLevel.INFO, "Array trails já está normalizado, nenhuma ação necessária")
      return true
    }

    logSync(LogLevel.WARNING, `Encontradas ${nonNumericKeys.length} propriedades não numéricas no array trails`)

    // 4. Aplicar a função de correção
    const fixedProgress = fixDuplicateTrailsInArray(userProgress)

    // 5. Salvar o progresso normalizado
    await saveUserProgressToFirebase(userId, fixedProgress)

    logSync(LogLevel.INFO, "Array trails normalizado com sucesso")
    return true
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao normalizar array trails:", error)
    return false
  }
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
      } else {
        // MODIFICADO: Sempre preservar o status existente, independente do parâmetro preserveCompletion
        logSync(LogLevel.INFO, `Verificando fase ${phase.id}: started=${phase.started}, completed=${phase.completed}`)

        // IMPORTANTE: Preservar explicitamente os estados de started e completed
        const wasStarted = phase.started
        const wasCompleted = phase.completed
        const timeSpent = phase.timeSpent || 0

        // Merge questions
        mergeQuestions(phase, availablePhase, true)

        // NOVO: Restaurar explicitamente os estados após a mesclagem
        phase.started = wasStarted
        phase.completed = wasCompleted
        phase.timeSpent = timeSpent

        logSync(
          LogLevel.INFO,
          `Estado preservado para fase ${phase.id}: started=${phase.started}, completed=${phase.completed}`,
        )
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

    const availableQuestions = availableStages.flatMap((stage: { questions: any }) => {
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
      } else {
        // MODIFICADO: Sempre preservar o status existente, independente do parâmetro preserveCompletion
        logSync(
          LogLevel.INFO,
          `Preservando status para questão ${question.id}: answered=${question.answered}, correct=${question.correct}`,
        )

        // Não modificar o status da questão se já foi respondida
        // O código já está correto aqui, apenas garantindo que não seja alterado
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

// Modifique a função saveUserProgressToFirebase para incluir uma verificação de segurança adicional
export const saveUserProgressToFirebase = async (userId: string, progress: UserProgress): Promise<void> => {
  try {
    // VERIFICAÇÃO CRÍTICA: Se a sincronização estiver bloqueada, não fazer nada
    if (isSyncingBlocked) {
      logSync(LogLevel.WARNING, "⛔ Tentativa de salvar progresso bloqueada")
      return
    }

    // NOVO: Verificar se o progresso é válido antes de salvar
    if (!progress) {
      logSync(LogLevel.ERROR, "Tentativa de salvar progresso inválido (null ou undefined)")
      return
    }

    // NOVO: Verificar se o progresso tem uma estrutura válida
    if (!isValidProgressObject(progress)) {
      logSync(LogLevel.ERROR, "Estrutura de progresso inválida, aplicando correções...")

      // Tentar corrigir o objeto
      const fixedProgress = {
        totalPoints: progress.totalPoints || 0,
        consecutiveCorrect: progress.consecutiveCorrect || 0,
        highestConsecutiveCorrect: progress.highestConsecutiveCorrect || 0,
        trails: Array.isArray(progress.trails) ? progress.trails : [],
        lastSyncTimestamp: Date.now(),
      }

      // Usar o objeto corrigido
      progress = fixedProgress
    }

    // NOVO: Criar uma cópia limpa do objeto para evitar problemas de serialização
    const cleanProgress = cleanObjectForSerialization(progress)

    // NOVO: Verificar se o array de trilhas é válido
    if (!Array.isArray(cleanProgress.trails)) {
      cleanProgress.trails = []
      logSync(LogLevel.WARNING, "Array de trilhas inválido, criando um novo array vazio")
    }

    // Verificar se trails é um array puro e convertê-lo se necessário
    if (cleanProgress.trails && typeof cleanProgress.trails === "object") {
      // Verificar se há propriedades não numéricas
      const nonNumericKeys = Object.keys(cleanProgress.trails).filter((key) => isNaN(Number(key)) && key !== "length")

      if (nonNumericKeys.length > 0) {
        logSync(LogLevel.WARNING, "Convertendo objeto trails para array puro antes de salvar")

        // Aplicar fixDuplicateTrailsInArray para garantir a correção
        const fixedProgress = fixDuplicateTrailsInArray(cleanProgress)

        // Usar o progresso corrigido
        cleanProgress.trails = fixedProgress.trails
      }
    }

    // NOVO: Verificar se o userId é válido
    if (!userId) {
      logSync(LogLevel.ERROR, "Tentativa de salvar progresso com userId inválido (null ou undefined)")
      return
    }

    const db = getDatabase()
    const userProgressRef = ref(db, `userProgress/${userId}`)

    logSync(LogLevel.INFO, `Salvando progresso do usuário no Firebase para o usuário: ${userId}`)
    await set(userProgressRef, cleanProgress)
    logSync(LogLevel.INFO, "Progresso do usuário salvo no Firebase com sucesso")
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao salvar progresso do usuário no Firebase:", error)
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
      logSync(LogLevel.INFO, `Progresso do usuário encontrado no Firebase para o usuário: ${userId}`)
      return data as UserProgress
    } else {
      logSync(LogLevel.INFO, `Nenhum progresso encontrado no Firebase para o usuário: ${userId}`)
      return null
    }
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao buscar progresso do usuário no Firebase:", error)
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

/**
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
