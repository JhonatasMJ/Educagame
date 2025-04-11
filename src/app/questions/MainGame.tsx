"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  StatusBar,
  TouchableOpacity,
  Modal,
  BackHandler, // Import BackHandler for Android back button
} from "react-native"
import { Clock, Award, AlertTriangle } from "lucide-react-native"
import { router, useLocalSearchParams } from "expo-router"
import StepIndicator from "@/src/components/StepIndicator"
import FeedbackModal from "@/src/components/FeedbackModal"
import LoadingTransition from "@/src/components/LoadingTransition"
import GameTimer from "@/src/utils/GameTimer"
import { useGameProgress } from "@/src/context/GameProgressContext"
import { trilhas, QuestionType } from "../(tabs)/home"
import ArrowBack from "@/src/components/ArrowBack"
import { MOBILE_WIDTH } from "@/PlataformWrapper"

// Import game components
import TrueOrFalse from "./trueORfalse/trueORfalse"
import MultipleChoice from "./multipleChoice/multipleChoice"
import Ordering from "./ordering/ordering"
import React from "react"

// Define a generic question interface
interface BaseQuestion {
  id: string
  type: QuestionType
  description: string
  image?: string
  explanation?: string
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

type Question = TrueOrFalseQuestion | MultipleChoiceQuestion | OrderingQuestion

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
            width: MOBILE_WIDTH - 15,
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
            Sair da etapa?
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#666",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Todo o progresso desta sessão será perdido. Tem certeza que deseja sair?
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
  const params = useLocalSearchParams()
  const phaseId = params.phaseId as string
  const trailId = (params.trailId as string) || "1" // Default to first trail if not provided

  const { startPhase, answerQuestion, completePhase } = useGameProgress()

  // Game state
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
  const [feedbackExplanation, setFeedbackExplanation] = useState<string | undefined>(undefined)
  // Adicione este novo estado para rastrear as questões acertadas durante a revisão
  const [correctlyRetriedQuestions, setCorrectlyRetriedQuestions] = useState<number[]>([])

  // Adicione este estado para rastrear o índice atual na lista de questões erradas
  const [currentRetryIndex, setCurrentRetryIndex] = useState(0)

  // Estado para controlar a visibilidade do modal de confirmação de saída
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)

  // Key to force re-render of game components
  const [gameKey, setGameKey] = useState(0)

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Timer interval reference
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Debug log
  console.log("MainGame rendered, phaseId:", phaseId, "trailId:", trailId)

  // Find the questions for this phase
  useEffect(() => {
    console.log("Finding questions for phase:", phaseId)
    console.log("All trilhas:", JSON.stringify(trilhas))

    // Find the phase with the matching ID
    let foundPhase = false
    for (const trilha of trilhas) {
      console.log("Checking trail:", trilha.id, "with etapas:", trilha.etapas.length)

      const phase = trilha.etapas.find((etapa) => etapa.id === phaseId)
      if (phase) {
        console.log("Found phase:", phase.titulo, "with", phase.questions?.length || 0, "questions")
        console.log("Phase details:", JSON.stringify(phase))
        foundPhase = true

        // Certifique-se de que as questões estão no formato correto
        if (!phase.questions || phase.questions.length === 0) {
          console.error("No questions found in phase:", phase.id)
          setQuestions([])
          break
        }

        const typedQuestions = phase.questions.map((q: any) => {
          console.log("Processing question:", q.id, "of type:", q.type)
          // Garantir que o tipo está correto
          if (q.type === QuestionType.TRUE_OR_FALSE) {
            return {
              ...q,
              type: QuestionType.TRUE_OR_FALSE,
            } as TrueOrFalseQuestion
          } else if (q.type === QuestionType.MULTIPLE_CHOICE) {
            return {
              ...q,
              type: QuestionType.MULTIPLE_CHOICE,
              options: q.options || [],
              correctOptions: q.correctOptions || [],
              multipleCorrect: q.multipleCorrect || false,
            } as MultipleChoiceQuestion
          } else if (q.type === QuestionType.ORDERING) {
            return {
              ...q,
              type: QuestionType.ORDERING,
              items: q.items || [],
              correctOrder: q.correctOrder || [],
            } as OrderingQuestion
          }
          return q as Question
        })

        console.log("Processed questions:", typedQuestions)
        setQuestions(typedQuestions)

        // Start tracking progress for this phase
        startPhase(trailId, phaseId)
        break
      }
    }

    if (!foundPhase) {
      console.error("Phase not found:", phaseId)
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
  }, [phaseId, trailId])

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

  // Função para lidar com o clique no botão de voltar
  const handleBackPress = () => {
    setShowExitConfirmation(true)
  }

  // Função para confirmar a saída do jogo
  const confirmExit = () => {
    // Descartar o progresso e voltar para a home
    router.push("../../(tabs)/home")
  }

  // Função para cancelar a saída do jogo
  const cancelExit = () => {
    setShowExitConfirmation(false)
  }

  // If no questions found, show a loading screen
  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3498db" />
        <Text className="text-gray-700 text-lg font-medium mt-4">Carregando questões...</Text>
        <Text className="text-gray-500 text-sm mt-2">Phase ID: {phaseId}</Text>
        <Text className="text-gray-500 text-sm">Trail ID: {trailId}</Text>
        <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded-md" onPress={() => router.back()}>
          <Text className="text-white">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  // Verificação de segurança para garantir que a questão existe
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

  console.log("Current question:", currentQuestion)

  // Handle answer from game components
  const handleAnswer = (correct: boolean, explanation?: string) => {
    console.log("MainGame - handleAnswer called with correct:", correct)
    setIsCorrect(correct)
    setFeedbackExplanation(explanation || currentQuestion.explanation)

    // Record answer in context
    answerQuestion(correct, currentQuestion.id)

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
        completePhase(phaseId, totalTime)
        router.push({
          pathname: "/questions/completion/completion",
          params: {
            phaseId,
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
        completePhase(phaseId, totalTime)
        router.push({
          pathname: "/questions/completion/completion",
          params: {
            phaseId,
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

  // Calcule o progresso atual para o StepIndicator
  const calculateProgress = () => {
    if (isRetrying) {
      // Durante a revisão, mostre o progresso baseado na posição atual na lista de questões erradas
      return {
        current: currentRetryIndex + 1,
        total: wrongQuestions.length,
      }
    } else {
      // Durante o jogo normal, mostre o progresso baseado no índice da questão
      return {
        current: currentQuestionIndex + 1,
        total: questions.length,
      }
    }
  }

  const progress = calculateProgress()

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
      default:
        return (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-red-500">Tipo de questão não suportado: {questions[currentQuestionIndex].type}</Text>
          </View>
        )
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
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
      />

      {/* Loading Transition */}
      <LoadingTransition isVisible={showLoading} onAnimationComplete={handleLoadingComplete} />

      {/* Modal de confirmação para sair */}
      <ExitConfirmationModal visible={showExitConfirmation} onCancel={cancelExit} onConfirm={confirmExit} />

      {/* Hidden timer for tracking */}
      <GameTimer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} showVisual={false} />
    </SafeAreaView>
  )
}

export default MainGame
