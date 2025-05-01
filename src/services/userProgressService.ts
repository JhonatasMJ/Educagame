import { getDatabase, ref, get, set, remove } from "firebase/database"
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
  consecutiveCorrect?: number
  highestConsecutiveCorrect?: number
  currentPhaseId?: string
  currentQuestionIndex?: number
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

      if (userProgress) {
        // Remover propriedades diretas de trilhas
        const directTrailKeys = Object.keys(userProgress).filter((key) => key.startsWith("trilha_"))
        if (directTrailKeys.length > 0) {
          logSync(LogLevel.INFO, `Removendo ${directTrailKeys.length} propriedades diretas de trilhas`)

          // Criar uma cópia limpa do progresso
          const cleanProgress = { ...userProgress }

          // Mesclar propriedades diretas com o array trails
          if (!Array.isArray(cleanProgress.trails)) {
            cleanProgress.trails = []
          }

          // Mapa para evitar duplicatas
          const trailsMap = new Map()

          // Adicionar trilhas existentes ao mapa
          cleanProgress.trails.forEach((trail) => {
            if (trail?.id) {
              trailsMap.set(trail.id, { ...trail })
            }
          })

          // Processar propriedades diretas
          directTrailKeys.forEach((key) => {
            const directTrail = userProgress[key]

            // Se já existe no mapa, mesclar dados
            const existingTrail = trailsMap.get(key)
            if (existingTrail) {
              // Preservar dados importantes
              if (directTrail.currentPhaseId) {
                existingTrail.currentPhaseId = directTrail.currentPhaseId
              }

              if (directTrail.currentQuestionIndex !== undefined) {
                existingTrail.currentQuestionIndex = directTrail.currentQuestionIndex
              }

              // Mesclar fases se existirem
              if (Array.isArray(directTrail.phases)) {
                if (!Array.isArray(existingTrail.phases)) {
                  existingTrail.phases = []
                }

                // Mapa para mesclar fases
                const phasesMap = new Map()

                // Adicionar fases existentes
                existingTrail.phases.forEach((phase) => {
                  if (phase?.id) {
                    phasesMap.set(phase.id, { ...phase })
                  }
                })

                // Mesclar com fases da propriedade direta
                directTrail.phases.forEach((phase) => {
                  if (!phase?.id) return

                  const existingPhase = phasesMap.get(phase.id)
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
                      const questionsMap = new Map()

                      // Adicionar questões existentes
                      existingPhase.questionsProgress.forEach((question) => {
                        if (question?.id) {
                          questionsMap.set(question.id, { ...question })
                        }
                      })

                      // Mesclar com questões da fase direta
                      phase.questionsProgress.forEach((question) => {
                        if (!question?.id) return

                        const existingQuestion = questionsMap.set(question.id, {
                          ...question,
                          answered: question.answered || false,
                          correct: question.correct || false,
                        })
                      })

                      // Atualizar questões
                      existingPhase.questionsProgress = Array.from(questionsMap.values())
                    }
                  } else {
                    // Se não existe, adicionar
                    phasesMap.set(phase.id, { ...phase })
                  }
                })

                // Atualizar fases
                existingTrail.phases = Array.from(phasesMap.values())
              }
            } else {
              // Se não existe no array, adicionar
              trailsMap.set(key, {
                id: key,
                phases: Array.isArray(directTrail.phases) ? [...directTrail.phases] : [],
                currentPhaseId: directTrail.currentPhaseId,
                currentQuestionIndex: directTrail.currentQuestionIndex,
              })
            }

            // Remover a propriedade direta
            delete cleanProgress[key]
          })

          // Atualizar array de trilhas
          cleanProgress.trails = Array.from(trailsMap.values())

          // Atualizar o progresso
          userProgress = cleanProgress

          // Salvar o progresso limpo no Firebase
          await saveUserProgressToFirebase(userId, cleanProgress)
          logSync(LogLevel.INFO, "Progresso limpo salvo no Firebase")
        }

        // Log do progresso existente
        if (Array.isArray(userProgress.trails)) {
          logSync(LogLevel.INFO, `Progresso existente: ${userProgress.trails.length} trilhas`)

          userProgress.trails.forEach((trail) => {
            if (trail && Array.isArray(trail.phases)) {
              const completedPhases = trail.phases.filter((p) => p?.completed).length
              logSync(LogLevel.INFO, `Trilha ${trail.id}: ${trail.phases.length} fases, ${completedPhases} completadas`)

              // Log detalhado das fases completadas
              trail.phases.forEach((phase) => {
                if (phase?.completed) {
                  logSync(LogLevel.INFO, `Fase completada: ${phase.id}`)
                }
              })
            }
          })
        }
      }
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

    // Verificação final para garantir que não haja propriedades diretas de trilhas
    const finalProgress = await getUserProgressFromFirebase(userId)
    if (finalProgress) {
      const directTrailKeys = Object.keys(finalProgress).filter((key) => key.startsWith("trilha_"))
      if (directTrailKeys.length > 0) {
        logSync(
          LogLevel.WARNING,
          `Ainda existem ${directTrailKeys.length} propriedades diretas de trilhas após sincronização`,
        )

        // Remover propriedades diretas
        const db = getDatabase()
        for (const key of directTrailKeys) {
          const directTrailRef = ref(db, `userProgress/${userId}/${key}`)
          await remove(directTrailRef)
          logSync(LogLevel.INFO, `Propriedade direta ${key} removida`)
        }
      }
    }

    return updatedProgress
  } catch (error) {
    logSync(LogLevel.ERROR, "Erro ao sincronizar progresso do usuário:", error)
    return null
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

    // Remover trilhas duplicadas ou sem ID antes de começar
    if (Array.isArray(updatedProgress.trails)) {
      const uniqueTrails = new Map()
      updatedProgress.trails = updatedProgress.trails.filter((trail) => {
        if (!trail?.id) return false
        if (uniqueTrails.has(trail.id)) return false
        uniqueTrails.set(trail.id, true)
        return true
      })
    } else {
      updatedProgress.trails = []
    }

    // Log do estado inicial
    logSync(LogLevel.INFO, `Estado inicial: ${updatedProgress.trails.length} trilhas no progresso do usuário`)
    updatedProgress.trails.forEach((trail) => {
      if (trail && Array.isArray(trail.phases)) {
        const completedPhases = trail.phases.filter((p) => p?.completed).length
        logSync(LogLevel.INFO, `Trilha ${trail.id}: ${trail.phases.length} fases, ${completedPhases} completadas`)
      }
    })

    // Create map of existing trails
    const existingTrails = new Map(updatedProgress.trails.filter((t) => t?.id).map((t) => [t.id, t]))

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
        updatedProgress.trails.push(trail)
      } else {
        logSync(LogLevel.INFO, `Atualizando trilha existente: ${availableTrail.id}`)
      }

      // Merge phases
      mergePhases(trail, availableTrail, preserveCompletion)
    }

    // IMPORTANTE: Manter apenas as trilhas que existem nas trilhas disponíveis
    // a menos que tenham fases completadas
    const initialTrailCount = updatedProgress.trails.length
    updatedProgress.trails = updatedProgress.trails.filter((trail) => {
      if (!trail?.id) return false

      const exists = availableTrails.some((at) => at?.id === trail.id)

      if (!exists) {
        if (preserveCompletion) {
          const hasCompletedPhases = trail.phases?.some((p) => p?.completed)
          if (hasCompletedPhases) {
            logSync(
              LogLevel.INFO,
              `Mantendo trilha ${trail.id} que tem fases completadas mesmo não estando nas trilhas disponíveis`,
            )
            return true
          }
        }
        logSync(LogLevel.INFO, `Removendo trilha ${trail.id} que não existe nas trilhas disponíveis`)
        return false
      }
      return true
    })

    logSync(
      LogLevel.INFO,
      `Removidas ${initialTrailCount - updatedProgress.trails.length} trilhas que não existem nas trilhas disponíveis`,
    )

    // Log do estado final
    logSync(LogLevel.INFO, `Estado final: ${updatedProgress.trails.length} trilhas no progresso do usuário`)
    updatedProgress.trails.forEach((trail) => {
      if (trail && Array.isArray(trail.phases)) {
        const completedPhases = trail.phases.filter((p) => p?.completed).length
        logSync(LogLevel.INFO, `Trilha ${trail.id}: ${trail.phases.length} fases, ${completedPhases} completadas`)
      }
    })

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
    const existingPhases = new Map(
      userTrail.phases
        .filter((p) => p?.id)
        .map((p) => [p.id, { ...p }]), // Create a copy of each phase
    )

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
      } else if (preserveCompletion) {
        // CRITICAL: Preserve completion status
        logSync(LogLevel.INFO, `Verificando fase ${phase.id}: completed=${phase.completed}`)
        if (phase.completed) {
          logSync(LogLevel.INFO, `Preservando status completed=true para fase ${phase.id}`)
        }
      }

      // Ensure the phase is in the trail's phases array
      const existingIndex = userTrail.phases.findIndex((p) => p?.id === phase.id)
      if (existingIndex === -1) {
        userTrail.phases.push(phase)
      } else {
        userTrail.phases[existingIndex] = phase
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

    // Remove phases that don't exist in available phases, unless completed
    const phasesBeforeFilter = userTrail.phases.length
    userTrail.phases = userTrail.phases.filter((phase) => {
      if (!phase?.id) return false

      const exists = availablePhases.some((ap) => ap?.id === phase.id)
      if (!exists && preserveCompletion && phase.completed) {
        logSync(LogLevel.INFO, `Mantendo fase ${phase.id} que está completa mesmo não estando nas fases disponíveis`)
        return true
      }

      if (!exists) {
        logSync(LogLevel.INFO, `Removendo fase ${phase.id} que não existe nas fases disponíveis`)
        return false
      }

      return true
    })

    logSync(
      LogLevel.INFO,
      `Removidas ${phasesBeforeFilter - userTrail.phases.length} fases que não existem nas fases disponíveis`,
    )

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
    const existingQuestions = new Map(
      userPhase.questionsProgress
        .filter((q) => q?.id)
        .map((q) => [q.id, { ...q }]), // Create a copy of each question
    )

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
      } else if (preserveCompletion && question.answered) {
        // CRITICAL: Preserve answer status
        logSync(
          LogLevel.INFO,
          `Preservando status para questão ${question.id}: answered=${question.answered}, correct=${question.correct}`,
        )
      }

      // Ensure the question is in the phase's questions array
      const existingIndex = userPhase.questionsProgress.findIndex((q) => q?.id === question.id)
      if (existingIndex === -1) {
        userPhase.questionsProgress.push(question)
      } else {
        userPhase.questionsProgress[existingIndex] = question
      }
    }

    // Remove questions that don't exist in available questions, unless answered correctly
    const questionsBeforeFilter = userPhase.questionsProgress.length
    userPhase.questionsProgress = userPhase.questionsProgress.filter((question) => {
      if (!question?.id) return false

      const exists = availableQuestions.some((aq) => aq?.id === question.id)
      if (!exists && preserveCompletion && question.answered && question.correct) {
        logSync(
          LogLevel.INFO,
          `Mantendo questão ${question.id} que foi respondida corretamente mesmo não estando nas questões disponíveis`,
        )
        return true
      }

      if (!exists) {
        logSync(LogLevel.INFO, `Removendo questão ${question.id} que não existe nas questões disponíveis`)
        return false
      }

      return true
    })

    logSync(
      LogLevel.INFO,
      `Removidas ${questionsBeforeFilter - userPhase.questionsProgress.length} questões que não existem nas questões disponíveis`,
    )

    // Check if all questions are completed to set phase completion
    if (preserveCompletion && userPhase.questionsProgress.length > 0) {
      const allQuestionsComplete = userPhase.questionsProgress.every((q) => q?.answered && q?.correct)
      if (allQuestionsComplete) {
        userPhase.completed = true
        logSync(LogLevel.INFO, `Fase ${userPhase.id} marcada como completa pois todas as questões estão corretas`)
      }
    }

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

    // Remover propriedades que começam com "trilha_"
    Object.keys(cleanProgress).forEach((key) => {
      if (key.startsWith("trilha_")) {
        logSync(LogLevel.INFO, `Removendo propriedade direta de trilha: ${key}`)
        delete cleanProgress[key]
      }
    })

    // NOVO: Verificar se o array de trilhas é válido
    if (!Array.isArray(cleanProgress.trails)) {
      cleanProgress.trails = []
      logSync(LogLevel.WARNING, "Array de trilhas inválido, criando um novo array vazio")
    } else {
      // Remover duplicatas no array de trilhas
      const uniqueTrails = new Map()
      cleanProgress.trails.forEach((trail) => {
        if (trail?.id) {
          uniqueTrails.set(trail.id, trail)
        }
      })
      cleanProgress.trails = Array.from(uniqueTrails.values())
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

      // Verificação adicional para garantir que não haja propriedades diretas
      const snapshot = await get(userProgressRef)
      if (snapshot.exists()) {
        const savedData = snapshot.val()
        const directTrailKeys = Object.keys(savedData).filter((key) => key.startsWith("trilha_"))

        if (directTrailKeys.length > 0) {
          logSync(LogLevel.WARNING, `Ainda existem ${directTrailKeys.length} propriedades diretas após salvar`)

          // Remover propriedades diretas uma a uma
          for (const key of directTrailKeys) {
            const directTrailRef = ref(db, `userProgress/${userId}/${key}`)
            await remove(directTrailRef)
            logSync(LogLevel.INFO, `Propriedade direta ${key} removida`)
          }
        }
      }
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
