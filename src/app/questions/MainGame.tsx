"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  StatusBar,
  TouchableOpacity,
  Modal,
  BackHandler,
} from "react-native"
import { Clock, Award, AlertTriangle } from "lucide-react-native"
import { router, useLocalSearchParams } from "expo-router"
import StepIndicator from "@/src/components/StepIndicator"
import FeedbackModal from "@/src/components/FeedbackModal"
import LoadingTransition from "@/src/components/LoadingTransition"
import GameTimer from "@/src/utils/GameTimer"
import { useGameProgress } from "@/src/context/GameProgressContext"
import { QuestionType } from "../(tabs)/home"
import ArrowBack from "@/src/components/ArrowBack"
import { MOBILE_WIDTH } from "@/PlataformWrapper"
import HelpButton from "@/src/components/HelpButton"
import GameTutorial from "@/src/components/GameTutorial"
import { useInactivityDetector } from "@/src/hooks/useInactivityDetector"
import { useTutorialMode } from "@/src/context/TutorialContext"
import { useTrails } from "@/src/hooks/useTrails"
import TrueOrFalse from "./trueORfalse/trueORfalse"
import MultipleChoice from "./multipleChoice/multipleChoice"
import Ordering from "./ordering/ordering"
import Matching from "./matching/matching"
import { useAuth } from "@/src/context/AuthContext"
import { getDatabase, ref, get, set } from "firebase/database"
import { logSync, LogLevel } from "@/src/services/syncLogger"
import React from "react"

// Define a generic question interface
interface BaseQuestion {
  id: string
  type: QuestionType
  description: string
  image?: string
  explanation?: string
  correctExplanation?: {
    title?: string
    description?: string
    imageUrl?: string
  }
  incorrectExplanation?: {
    title?: string
    description?: string
    imageUrl?: string
  }
}

interface TrueOrFalseQuestion extends BaseQuestion {
  type: QuestionType.TRUE_OR_FALSE
  isTrue: boolean
  statementText?: string
}

interface Option {
  id: string
  text: string
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MULTIPLE_CHOICE
  options: Option[]
  correctOptions: string[]
  multipleCorrect: boolean
  statementText?: string
}

interface OrderItem {
  id: string
  text?: string
  image?: string | any
}

interface OrderingQuestion extends BaseQuestion {
  type: QuestionType.ORDERING
  items: OrderItem[]
  correctOrder: string[]
  statementText?: string
}

interface ColumnItem {
  id: string
  text?: string
  image?: string | any
}

interface MatchingQuestion extends BaseQuestion {
  type: QuestionType.MATCHING
  leftColumn: ColumnItem[]
  rightColumn: ColumnItem[]
  correctMatches: { left: string; right: string }[]
  statementText?: string
}

type Question = TrueOrFalseQuestion | MultipleChoiceQuestion | OrderingQuestion | MatchingQuestion

// Modal de confirmação para sair do jogo
const ExitConfirmationModal = ({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean
  onCancel: () => void
  onConfirm: () => void
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" statusBarTranslucent={true}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            width: MOBILE_WIDTH - 25,
            backgroundColor: "white",
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Sair do jogo?
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#666",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Todo o progresso desta sessão será perdido. Tem certeza que deseja sair? Ao clicar sim você retornará para a
            tela inicial.
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                backgroundColor: "#3185BE",
                padding: 12,
                borderRadius: 8,
                marginRight: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={{
                flex: 1,
                backgroundColor: "#ef4444",
                padding: 12,
                borderRadius: 8,
                marginLeft: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const MainGame = () => {
  console.log("Rendering MainGame component")

  // IMPORTANTE: Todos os hooks devem ser chamados no topo do componente, antes de qualquer lógica condicional
  const params = useLocalSearchParams()
  const phaseId = params.phaseId as string
  const trailId = (params.trailId as string) || "1"
  const stageId = params.stageId as string

  // Hooks de contexto
  const { startPhase, answerQuestion, completePhase } = useGameProgress()
  const { isTutorialDismissed, dismissTutorial } = useTutorialMode()
  const { trails: trilhas, isLoading: trailsLoading, error: trailsError, fetchTrails } = useTrails()
  const { authUser, justRegistered, setJustRegistered } = useAuth()

  // Estados
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [wrongQuestions, setWrongQuestions] = useState<number[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isRetrying, setIsRetrying] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const [allQuestionsCorrect, setAllQuestionsCorrect] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [feedbackExplanation, setFeedbackExplanation] = useState<string | undefined>(undefined)
  const [showTutorial, setShowTutorial] = useState(false)
  const [correctlyRetriedQuestions, setCorrectlyRetriedQuestions] = useState<number[]>([])
  const [currentRetryIndex, setCurrentRetryIndex] = useState(0)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [userProgressInitialized, setUserProgressInitialized] = useState(false)

  // Refs
  const helpButtonPulse = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const shouldShowTutorial = useRef(false)
  const initializedRef = useRef(false)

  // Valores derivados usando useMemo para evitar recálculos desnecessários
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex])

  const progress = useMemo(() => {
    if (isRetrying) {
      return {
        current: currentRetryIndex + 1,
        total: wrongQuestions.length,
      }
    } else {
      return {
        current: currentQuestionIndex + 1,
        total: questions.length,
      }
    }
  }, [isRetrying, currentRetryIndex, wrongQuestions.length, currentQuestionIndex, questions.length])

  // Detector de inatividade
  const { panResponder, resetTimer } = useInactivityDetector({
    timeout: 6000,
    onInactivity: () => {
      if (
        !showFeedback &&
        !showLoading &&
        !showExitConfirmation &&
        !showTutorial &&
        currentQuestion &&
        !isTutorialDismissed(currentQuestion.type)
      ) {
        console.log("Showing tutorial due to inactivity for type:", currentQuestion.type)
        setShowTutorial(true)
        startHelpButtonPulse(false)
      }
    },
    shouldShowTutorial: () => {
      return (
        !showFeedback &&
        !showLoading &&
        !showExitConfirmation &&
        !showTutorial &&
        currentQuestion &&
        !isTutorialDismissed(currentQuestion.type)
      )
    },
    resetOnActivity: true,
  })

  // Debug log
  console.log("MainGame rendered, phaseId:", phaseId, "trailId:", trailId, "stageId:", stageId)

  // Função para verificar se o usuário é novo e inicializar o progresso se necessário
  const checkAndInitializeUserProgress = async () => {
    if (!authUser) return false

    try {
      logSync(LogLevel.INFO, "Verificando se o usuário é novo e inicializando progresso se necessário...")

      const db = getDatabase()
      const userProgressRef = ref(db, `userProgress/${authUser.uid}`)
      const snapshot = await get(userProgressRef)

      // Se não existir progresso ou se o usuário foi recém-registrado, inicializar
      if (!snapshot.exists() || justRegistered) {
        logSync(LogLevel.INFO, "Usuário novo ou recém-registrado detectado, inicializando progresso...")
        setIsNewUser(true)

        // Estrutura básica de progresso
        const basicProgress = {
          totalPoints: 0,
          consecutiveCorrect: 0,
          highestConsecutiveCorrect: 0,
          lastSyncTimestamp: Date.now(),
          trails: [
            {
              id: trailId,
              currentPhaseId: phaseId,
              phases: [
                {
                  id: phaseId,
                  started: true,
                  completed: false,
                  timeSpent: 0,
                  questionsProgress: [],
                },
              ],
            },
          ],
        }

        // Salvar progresso básico
        await set(userProgressRef, basicProgress)
        logSync(LogLevel.INFO, "Progresso básico inicializado com sucesso")

        // Resetar o sinalizador de usuário recém-registrado
        if (justRegistered) {
          setJustRegistered(false)
        }

        return true
      }

      return false
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao verificar/inicializar progresso do usuário:", error)
      return false
    } finally {
      setUserProgressInitialized(true)
    }
  }

  // Function to handle help button press
  const handleHelpPress = () => {
    setShowTutorial(true)
    startHelpButtonPulse(false) // Stop pulsing when tutorial is shown
  }

  const handleCloseTutorial = () => {
    setShowTutorial(false)

    // Use a função do contexto para marcar o tutorial como fechado
    if (currentQuestion) {
      console.log("Closing tutorial for type:", currentQuestion.type)
      dismissTutorial(currentQuestion.type)
    }

    resetTimer()
  }

  // Function to start help button pulse animation
  const startHelpButtonPulse = (shouldPulse: boolean) => {
    if (!shouldPulse) {
      // Stop animation
      helpButtonPulse.setValue(0)
      return
    }

    // Start pulsing animation
    helpButtonPulse.setValue(0)
    Animated.loop(
      Animated.sequence([
        Animated.timing(helpButtonPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(helpButtonPulse, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }

  // Inicialização
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Efeito para verificar e inicializar o progresso do usuário
  useEffect(() => {
    if (authUser && isInitialized && !userProgressInitialized && !initializedRef.current) {
      initializedRef.current = true
      checkAndInitializeUserProgress()
    }
  }, [authUser, isInitialized, userProgressInitialized])

  // Efeito para encontrar questões
  useEffect(() => {
    if (!isInitialized || !trilhas || trilhas.length === 0) return

    console.log("Finding questions for phase:", phaseId, "and stage:", stageId)

    try {
      // Encontrar a trilha com o ID correspondente
      const trilha = trilhas.find((t) => t.id === trailId)
      if (!trilha) {
        console.error("Trilha não encontrada:", trailId)
        return
      }

      console.log("Trilha encontrada:", trilha.nome || trilha.id)

      // Verificar se etapas é um array ou um objeto
      let etapas = []
      if (Array.isArray(trilha.etapas)) {
        etapas = trilha.etapas
      } else if (typeof trilha.etapas === "object" && trilha.etapas !== null) {
        etapas = Object.values(trilha.etapas)
      }

      // Encontrar a etapa com o ID correspondente
      const etapa = etapas.find((e: { id: string }) => e.id === phaseId)
      if (!etapa) {
        console.error("Etapa não encontrada:", phaseId)
        return
      }

      console.log("Etapa encontrada:", etapa.titulo || etapa.id)

      // Verificar se stages é um array ou um objeto
      let stages = []
      if (Array.isArray(etapa.stages)) {
        stages = etapa.stages
      } else if (typeof etapa.stages === "object" && etapa.stages !== null) {
        stages = Object.values(etapa.stages)
      }

      // Encontrar o stage com o ID correspondente
      const stage = stages.find((s: { id: string }) => s.id === stageId)
      if (!stage) {
        console.error("Stage não encontrado:", stageId)
        return
      }

      console.log("Stage encontrado:", stage.title || stage.id)

      // Verificar se o stage tem questões
      let stageQuestions = []
      if (Array.isArray(stage.questions)) {
        stageQuestions = stage.questions
      } else if (typeof stage.questions === "object" && stage.questions !== null) {
        stageQuestions = Object.values(stage.questions)
      } else {
        // Se não encontrar questões no stage, verificar se há questões diretamente na etapa
        console.log("Nenhuma questão encontrada no stage, verificando questões na etapa...")

        if (Array.isArray(etapa.questions)) {
          stageQuestions = etapa.questions
        } else if (typeof etapa.questions === "object" && etapa.questions !== null) {
          stageQuestions = Object.values(etapa.questions)
        }
      }

      // Se ainda não encontrou questões, verificar se há questões diretamente na trilha
      if (stageQuestions.length === 0) {
        console.log("Nenhuma questão encontrada na etapa, verificando questões na trilha...")

        if (Array.isArray(trilha.questions)) {
          stageQuestions = trilha.questions
        } else if (typeof trilha.questions === "object" && trilha.questions !== null) {
          stageQuestions = Object.values(trilha.questions)
        }
      }

      if (!stageQuestions || stageQuestions.length === 0) {
        console.error("Nenhuma questão encontrada para este stage:", stageId)
        setQuestions([])
        return
      }

      console.log("Encontradas", stageQuestions.length, "questões")

      // Processar as questões para o formato esperado
      const typedQuestions = stageQuestions.map((q: any) => {
        console.log("Processando questão:", q.id, "de tipo:", q.type)

        // Garantir que o tipo está correto
        if (q.type === QuestionType.TRUE_OR_FALSE || q.type === "trueOrFalse") {
          return {
            ...q,
            type: QuestionType.TRUE_OR_FALSE,
          } as TrueOrFalseQuestion
        } else if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === "multipleChoice") {
          return {
            ...q,
            type: QuestionType.MULTIPLE_CHOICE,
            options: q.options || [],
            correctOptions: q.correctOptions || [],
            multipleCorrect: q.multipleCorrect || false,
          } as MultipleChoiceQuestion
        } else if (q.type === QuestionType.ORDERING || q.type === "ordering") {
          return {
            ...q,
            type: QuestionType.ORDERING,
            items: q.items || [],
            correctOrder: q.correctOrder || [],
          } as OrderingQuestion
        } else if (q.type === QuestionType.MATCHING || q.type === "matching") {
          return {
            ...q,
            type: QuestionType.MATCHING,
            leftColumn: q.leftColumn || [],
            rightColumn: q.rightColumn || [],
            correctMatches: q.correctMatches || [],
          } as MatchingQuestion
        }
        return q as Question
      })

      console.log("Questões processadas:", typedQuestions)
      setQuestions(typedQuestions)
      setDataLoaded(true)

      // Start tracking progress for this phase
      startPhase(trailId, phaseId)
    } catch (error) {
      console.error("Erro ao processar questões:", error)
      setQuestions([])
    }

    // Start entrance animations
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    // Show tutorial on first load
    setTimeout(() => {
      if (currentQuestion && !isTutorialDismissed(currentQuestion.type)) {
        setShowTutorial(true)
      }
    }, 500)
  }, [phaseId, trailId, stageId, trilhas, isInitialized, userProgressInitialized])

  // Efeito para atualizar shouldShowTutorial
  useEffect(() => {
    shouldShowTutorial.current =
      isInitialized && currentQuestion !== undefined && !isTutorialDismissed(currentQuestion?.type)
  }, [isTutorialDismissed, isInitialized, currentQuestion])

  // Efeito para mostrar tutorial quando shouldShowTutorial mudar
  useEffect(() => {
    if (shouldShowTutorial.current) {
      console.log("Should show tutorial for type:", currentQuestion?.type)
      setTimeout(() => {
        setShowTutorial(true)
      }, 500)
    }
  }, [shouldShowTutorial.current])

  // Background timer implementation
  useEffect(() => {
    // Start the timer
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTotalTime((prev) => prev + 1)
      }, 1000)
    }

    // Cleanup function
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isTimerRunning])

  // Adicione este useEffect para lidar com o botão de voltar do Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      // Se o modal de confirmação já estiver visível, não faça nada
      if (showExitConfirmation) {
        return true
      }

      // Caso contrário, mostre o modal de confirmação
      setShowExitConfirmation(true)
      return true // Retorna true para impedir o comportamento padrão de voltar
    })

    // Limpe o event listener quando o componente for desmontado
    return () => backHandler.remove()
  }, [showExitConfirmation])

  // Start pulsing help button after a delay if tutorial is not shown
  useEffect(() => {
    if (!showTutorial) {
      const pulseTimer = setTimeout(() => {
        startHelpButtonPulse(true)
      }, 10000) // Start pulsing after 10 seconds if user hasn't opened tutorial

      return () => clearTimeout(pulseTimer)
    } else {
      startHelpButtonPulse(false)
    }
  }, [showTutorial])

  // Função para lidar com o clique no botão de voltar
  const handleBackPress = () => {
    setShowExitConfirmation(true)
  }

  // Função para confirmar a saída do jogo
  const confirmExit = () => {
    // Descartar o progresso e voltar para a home
    setShowExitConfirmation(false)
    router.push("../../(tabs)/home")
  }

  // Função para cancelar a saída do jogo
  const cancelExit = () => {
    setShowExitConfirmation(false)
  }

  // Handle answer from game components
  const handleAnswer = (correct: boolean, explanation?: string) => {
    console.log("MainGame - handleAnswer called with correct:", correct)
    setIsCorrect(correct)
    setFeedbackExplanation(explanation || currentQuestion?.explanation)

    // Record answer in context
    if (currentQuestion) {
      answerQuestion(correct, currentQuestion.id)
    }

    // Se estamos em modo de revisão e a resposta está correta, adicione à lista de questões acertadas
    if (isRetrying && correct) {
      setCorrectlyRetriedQuestions((prev) => {
        if (!prev.includes(currentQuestionIndex)) {
          return [...prev, currentQuestionIndex]
        }
        return prev
      })
    }

    // If answer is wrong, add to wrongQuestions array
    if (!correct && !wrongQuestions.includes(currentQuestionIndex) && !isRetrying) {
      setWrongQuestions((prev) => [...prev, currentQuestionIndex])
    }

    setShowFeedback(true)
  }

  const handleContinue = () => {
    setShowFeedback(false)
    setShowLoading(true)
  }

  // Função para atualizar o status de conclusão do stage atual
  const updateStageCompletion = async () => {
    if (!authUser) return

    try {
      logSync(LogLevel.INFO, `Atualizando status de conclusão do stage ${stageId} na fase ${phaseId}`)

      const db = getDatabase()
      const userProgressRef = ref(db, `userProgress/${authUser.uid}`)
      const snapshot = await get(userProgressRef)

      if (snapshot.exists()) {
        const userProgress = snapshot.val()

        // Garantir que a estrutura existe
        if (!userProgress.trails) {
          userProgress.trails = []
        }

        // Encontrar a trilha
        let trail = userProgress.trails.find((t: any) => t.id === trailId)
        if (!trail) {
          trail = { id: trailId, phases: [] }
          userProgress.trails.push(trail)
        }

        // Garantir que phases é um array
        if (!trail.phases) {
          trail.phases = []
        }

        // Encontrar a fase
        let phase = trail.phases.find((p: any) => p.id === phaseId)
        if (!phase) {
          phase = { id: phaseId, started: true, completed: false, timeSpent: 0, questionsProgress: [] }
          trail.phases.push(phase)
        }

        // Atualizar status da fase
        phase.completed = true
        phase.timeSpent = (phase.timeSpent || 0) + totalTime

        // Salvar progresso atualizado
        await set(userProgressRef, userProgress)
        logSync(LogLevel.INFO, "Status de conclusão atualizado com sucesso")
      }
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao atualizar status de conclusão:", error)
    }
  }

  // Substitua a função handleLoadingComplete por esta versão atualizada
  const handleLoadingComplete = () => {
    setShowLoading(false)

    // Se não estamos em modo de revisão e terminamos todas as questões
    if (currentQuestionIndex >= questions.length - 1 && !isRetrying) {
      if (wrongQuestions.length > 0) {
        // Start retrying wrong questions
        setIsRetrying(true)
        setCurrentQuestionIndex(wrongQuestions[0])
        setCurrentRetryIndex(0) // Inicialize o índice de revisão
        // Reset the correctly retried questions
        setCorrectlyRetriedQuestions([])
        // Force re-render of game component
        setGameKey((prev) => prev + 1)
      } else {
        // All questions answered correctly
        setAllQuestionsCorrect(true)
        setIsTimerRunning(false)

        // Marcar o stage como concluído
        updateStageCompletion()

        // Completar a fase no contexto de progresso
        completePhase(phaseId, totalTime)

        router.push({
          pathname: "/questions/completion/completion",
          params: {
            phaseId,
            stageId,
            totalTime: totalTime.toString(),
            wrongAnswers: "0",
          },
        } as any)
      }
    } else if (isRetrying) {
      // Se estamos em modo de revisão

      // Verifique se a questão atual foi respondida corretamente
      const currentQuestionCorrect = correctlyRetriedQuestions.includes(currentQuestionIndex)

      if (!currentQuestionCorrect) {
        // Se a questão atual não foi respondida corretamente, mostre-a novamente
        // Não mude o índice, apenas force um re-render
        setGameKey((prev) => prev + 1)
        return
      }

      // Se a questão atual foi respondida corretamente, verifique se há mais questões para revisar
      const remainingWrongQuestions = wrongQuestions.filter((index) => !correctlyRetriedQuestions.includes(index))

      if (remainingWrongQuestions.length > 0) {
        // Ainda há questões para revisar, vá para a próxima
        const nextWrongIndex = remainingWrongQuestions[0]
        setCurrentQuestionIndex(nextWrongIndex)

        // Atualize o índice de revisão
        const nextRetryIndex = wrongQuestions.findIndex((index) => index === nextWrongIndex)
        setCurrentRetryIndex(nextRetryIndex)

        setGameKey((prev) => prev + 1)
      } else {
        // Todas as questões foram respondidas corretamente na revisão
        setAllQuestionsCorrect(true)
        setIsTimerRunning(false)

        // Marcar o stage como concluído
        updateStageCompletion()

        completePhase(phaseId, totalTime)
        router.push({
          pathname: "/questions/completion/completion",
          params: {
            phaseId,
            stageId,
            totalTime: totalTime.toString(),
            wrongAnswers: wrongQuestions.length.toString(),
          },
        } as any)
      }
    } else {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      // Force re-render of game component
      setGameKey((prev) => prev + 1)
    }
  }

  const handleTimeUpdate = (time: number) => {
    setTotalTime(time)
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Render the appropriate game component based on question type
  const renderGameComponent = () => {
    if (!currentQuestion) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500">Erro: Questão não encontrada</Text>
        </View>
      )
    }

    switch (currentQuestion.type) {
      case QuestionType.TRUE_OR_FALSE:
        return (
          <TrueOrFalse
            key={`question-${currentQuestion.id}-${gameKey}`}
            question={currentQuestion as TrueOrFalseQuestion}
            onAnswer={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
          />
        )
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <MultipleChoice
            key={`question-${currentQuestion.id}-${gameKey}`}
            question={currentQuestion as MultipleChoiceQuestion}
            onAnswer={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
          />
        )
      case QuestionType.ORDERING:
        return (
          <Ordering
            key={`question-${currentQuestion.id}-${gameKey}`}
            question={currentQuestion as OrderingQuestion}
            onAnswer={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
          />
        )
      case QuestionType.MATCHING:
        return (
          <Matching
            key={`question-${currentQuestion.id}-${gameKey}`}
            question={currentQuestion as MatchingQuestion}
            onAnswer={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
          />
        )
      default:
        return (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-red-500">Tipo de questão não suportado: {currentQuestion.type}</Text>
          </View>
        )
    }
  }

  // Renderização condicional para estados de carregamento e erro
  if (trailsLoading || !trilhas || trilhas.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3498db" />
        <Text className="text-gray-700 text-lg font-medium mt-4">Carregando trilhas...</Text>
        <Text className="text-gray-500 text-sm mt-2">Phase ID: {phaseId}</Text>
        <Text className="text-gray-500 text-sm">Stage ID: {stageId}</Text>
        <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded-md" onPress={() => router.back()}>
          <Text className="text-white">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (trailsError) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500 text-lg font-medium">Erro ao carregar trilhas</Text>
        <Text className="text-gray-500 text-sm mt-2">{trailsError}</Text>
        <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded-md" onPress={() => router.back()}>
          <Text className="text-white">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (!userProgressInitialized) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3498db" />
        <Text className="text-gray-700 text-lg font-medium mt-4">Inicializando progresso do usuário...</Text>
        <Text className="text-gray-500 text-sm mt-2">Aguarde um momento</Text>
      </SafeAreaView>
    )
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3498db" />
        <Text className="text-gray-700 text-lg font-medium mt-4">Carregando questões...</Text>
        <Text className="text-gray-500 text-sm mt-2">Phase ID: {phaseId}</Text>
        <Text className="text-gray-500 text-sm">Stage ID: {stageId}</Text>
        <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded-md" onPress={() => router.back()}>
          <Text className="text-white">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500 text-lg font-medium">Erro: Questão não encontrada</Text>
        <Text className="text-gray-500 text-sm mt-2">Index: {currentQuestionIndex}</Text>
        <Text className="text-gray-500 text-sm">Total Questions: {questions.length}</Text>
        <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded-md" onPress={() => router.back()}>
          <Text className="text-white">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-primary" {...panResponder.panHandlers}>
      <StatusBar barStyle={"dark-content"} backgroundColor={showLoading ? "#3185BE" : "#F6A608"} translucent={false} />

      {/* Header with timer and progress */}
      <View className="px-4 py-5 bg-secondary border-tertiary border-b-4 shadow-sm">
        <View className="flex-row justify-between items-center">
          {/* Botão de voltar */}
          <ArrowBack color="#fff" size={22} className="absolute bg-tertiary" onPress={handleBackPress} />

          <View className="ml-2 px-11 flex-row items-center">
            <Clock size={16} color="#666" />
            <Text className="text-gray-700 ml-1.5 font-medium">{formatTime(totalTime)}</Text>
          </View>

          <View className="flex-row items-center">
            {/* Help Button */}
            <HelpButton onPress={handleHelpPress} pulseAnimation={helpButtonPulse} />
            <View style={{ width: 10 }} />
            <Award size={16} color="#666" />
            <Text className="text-gray-700 ml-1.5 font-medium">
              {isRetrying ? `Revisão: ${wrongQuestions.length}` : `${currentQuestionIndex + 1}/${questions.length}`}
            </Text>
          </View>
        </View>

        {/* Progress indicator */}
        <View className="mt-2">
          <StepIndicator currentStep={progress.current} totalSteps={progress.total} />
        </View>
      </View>

      {/* Question Content */}
      <Animated.View
        style={{
          flex: 1,
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        {isRetrying && (
          <View className="flex-row items-center bg-amber-100 px-3 py-2 rounded-md mx-4 mt-4 border border-amber-300">
            <AlertTriangle size={16} color="#D97706" />
            <Text className="text-amber-800 font-medium ml-2">
              Revisando questões incorretas ({progress.current}/{progress.total})
            </Text>
          </View>
        )}

        {/* Render the specific game component */}
        {renderGameComponent()}
      </Animated.View>

      {/* Feedback Modal */}
      <FeedbackModal
      
        visible={showFeedback}
        isCorrect={isCorrect}
        onContinue={handleContinue}
        description={feedbackExplanation}
        correctExplanation={currentQuestion?.correctExplanation}
        incorrectExplanation={currentQuestion?.incorrectExplanation}
      />

      {/* Loading Transition */}
      <LoadingTransition isVisible={showLoading} onAnimationComplete={handleLoadingComplete} />

      {/* Modal de confirmação para sair */}
      <ExitConfirmationModal visible={showExitConfirmation} onCancel={cancelExit} onConfirm={confirmExit} />

      {/* Game Tutorial Modal */}
      <GameTutorial
        visible={showTutorial}
        onClose={handleCloseTutorial}
        gameType={currentQuestion?.type || QuestionType.MULTIPLE_CHOICE}
      />

      {/* Hidden timer for tracking */}
      <GameTimer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} showVisual={false} />
    </SafeAreaView>
  )
}

export default MainGame
