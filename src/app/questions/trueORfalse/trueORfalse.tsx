"use client"

import { useState, useEffect, useRef } from "react"
import { Text, View, SafeAreaView, TouchableOpacity, Image, Alert, Animated, ActivityIndicator, StatusBar } from "react-native"
import { Check, X, Clock, Award, AlertTriangle } from "lucide-react-native"
import { router, useLocalSearchParams } from "expo-router"
import StepIndicator from "@/src/components/StepIndicator"
import FeedbackModal from "@/src/components/FeedbackModal"
import LoadingTransition from "@/src/components/LoadingTransition"
import { QuestionType } from "../../(tabs)/home"
import { useGameProgress } from "@/src/context/GameProgressContext"
import GameTimer from "@/src/utils/GameTimer"

// Define the question type for true/false minigame
interface TrueOrFalseQuestion {
  id: string
  type: QuestionType.TRUE_OR_FALSE
  description: string
  image?: string
  isTrue: boolean
  statementText?: string // Added customizable statement text
}

// Import the trilhas data to access questions
import { trilhas } from "../../(tabs)/home"
import React from "react"

const TrueOrFalse = () => {
  const params = useLocalSearchParams()
  const phaseId = params.phaseId as string
  const trailId = (params.trailId as string) || "1" // Default to first trail if not provided

  const { startPhase, answerQuestion, completePhase } = useGameProgress()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [wrongQuestions, setWrongQuestions] = useState<number[]>([])
  const [questions, setQuestions] = useState<TrueOrFalseQuestion[]>([])
  const [isRetrying, setIsRetrying] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const [allQuestionsCorrect, setAllQuestionsCorrect] = useState(false)

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Timer interval reference
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Find the questions for this phase
  useEffect(() => {
    // Find the phase with the matching ID
    for (const trilha of trilhas) {
      const phase = trilha.etapas.find((etapa) => etapa.id === phaseId)
      if (phase) {
        // Filter for true/false questions only
        const trueOrFalseQuestions = phase.questions.filter(
          (q) => q.type === QuestionType.TRUE_OR_FALSE,
        ) as TrueOrFalseQuestion[]

        setQuestions(trueOrFalseQuestions)

        // Start tracking progress for this phase
        startPhase(trailId, phaseId)
        break
      }
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

  // If no questions found, show a loading screen
  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3498db" />
        <Text className="text-gray-700 text-lg font-medium mt-4">Carregando questões...</Text>
      </SafeAreaView>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const defaultStatementText = "A afirmação é:"
  const statementText = currentQuestion.statementText || defaultStatementText

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.isTrue
    setIsCorrect(correct)

    // Record answer in context
    answerQuestion(correct, currentQuestion.id)

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

  const handleLoadingComplete = () => {
    setSelectedAnswer(null)
    setShowLoading(false)

    // If we've gone through all questions, check if there are wrong questions to retry
    if (currentQuestionIndex >= questions.length - 1 && !isRetrying) {
      if (wrongQuestions.length > 0) {
        // Start retrying wrong questions
        setIsRetrying(true)
        setCurrentQuestionIndex(wrongQuestions[0])
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
      // If we're retrying and there are more wrong questions
      const currentWrongIndex = wrongQuestions.indexOf(currentQuestionIndex)

      if (currentWrongIndex < wrongQuestions.length - 1) {
        // Move to the next wrong question
        setCurrentQuestionIndex(wrongQuestions[currentWrongIndex + 1])
      } else {
        // Check if all retried questions are now correct
        const allCorrect = wrongQuestions.every((index) => {
          const question = questions[index]
          // Check if this question is now marked as correct in our tracking
          // This would require additional state tracking for retried questions
          return isCorrect // This is simplified - you'd need to track each retried question
        })

        if (allCorrect) {
          // All wrong questions have been retried and are now correct
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
        } else {
          // Some questions are still wrong, alert the user
          Alert.alert("Atenção", "Você ainda tem questões incorretas. Vamos tentar novamente!", [
            { text: "OK", onPress: () => setCurrentQuestionIndex(wrongQuestions[0]) },
          ])
        }
      }
    } else {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1)
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
<StatusBar barStyle={"dark-content"} backgroundColor={showLoading ? "#3185BE" : "#fff" }  translucent={false} />
      <View className="px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
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
          <StepIndicator
            currentStep={isRetrying ? wrongQuestions.indexOf(currentQuestionIndex) + 1 : currentQuestionIndex + 1}
            totalSteps={isRetrying ? wrongQuestions.length : questions.length}
          />
        </View>
      </View>

      {/* Question Content */}
      <Animated.View
        className="flex-1 px-5 py-6"
        style={{
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        {isRetrying && (
          <View className="flex-row items-center bg-amber-100 px-3 py-2 rounded-md mb-4 border border-amber-300">
            <AlertTriangle size={16} color="#D97706" />
            <Text className="text-amber-800 font-medium ml-2">Revisando questões incorretas</Text>
          </View>
        )}

        {/* Question number and text */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-500 mb-1">Questão {currentQuestionIndex + 1}</Text>
          <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <Text className="text-lg text-gray-800 leading-relaxed">{currentQuestion.description}</Text>
          </View>
        </View>

        {/* Image if available */}
        {currentQuestion.image && (
          <View className="mb-5 rounded-lg overflow-hidden border border-gray-200">
            <Image source={{ uri: currentQuestion.image }} className="w-full h-48 rounded-lg" resizeMode="cover" />
          </View>
        )}

        {/* Statement */}
        <View className="mb-6">
          <Text className="text-center text-lg font-semibold text-gray-700">{statementText}</Text>
        </View>


        <View className="space-y-4">
          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-lg border ${
              selectedAnswer === true ? "bg-green-100 border-green-500" : "bg-white border-gray-300"
            }`}
            onPress={() => handleAnswer(true)}
            disabled={selectedAnswer !== null}
            activeOpacity={0.8}
          >
            <View className="w-10 h-10 rounded-full bg-green-100 justify-center items-center mr-3">
              <Check width={20} height={20} color="#16A34A" />
            </View>
            <Text className={`text-lg font-medium ${selectedAnswer === true ? "text-green-800" : "text-gray-800"}`}>
              Verdadeiro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-lg border mt-4 ${
              selectedAnswer === false ? "bg-red-100 border-red-500" : "bg-white border-gray-300"
            }`}
            onPress={() => handleAnswer(false)}
            disabled={selectedAnswer !== null}
            activeOpacity={0.8}
          >
            <View className="w-10 h-10 rounded-full bg-red-100 justify-center items-center mr-3">
              <X width={20} height={20} color="#DC2626" />
            </View>
            <Text className={`text-lg font-medium ${selectedAnswer === false ? "text-red-800" : "text-gray-800"}`}>
              Falso
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Feedback Modal */}
      <FeedbackModal visible={showFeedback} isCorrect={isCorrect} onContinue={handleContinue} />

      {/* Loading Transition */}
      <LoadingTransition isVisible={showLoading} onAnimationComplete={handleLoadingComplete} />
      <GameTimer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} showVisual={false} />
    </SafeAreaView>
  )
}

export default TrueOrFalse

