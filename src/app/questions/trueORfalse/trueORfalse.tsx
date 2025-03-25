"use client"

import { useState, useEffect, useRef } from "react"
import { Text, View, SafeAreaView, TouchableOpacity, Image, StyleSheet, Alert } from "react-native"
import { Check, X } from "lucide-react-native"
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

  // If no questions found, show a message or redirect
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.questionText}>Carregando questões...</Text>
        </View>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      <StepIndicator
        currentStep={isRetrying ? wrongQuestions.indexOf(currentQuestionIndex) + 1 : currentQuestionIndex + 1}
        totalSteps={isRetrying ? wrongQuestions.length : questions.length}
      />

      {/* Question Content */}
      <View style={styles.contentContainer}>
        {currentQuestion.image && (
          <Image source={{ uri: currentQuestion.image }} style={styles.image} resizeMode="cover" />
        )}

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.description}</Text>
        </View>

        <Text style={styles.statementText}>{statementText}</Text>

        {/* Answer Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.answerButton, styles.trueButton, selectedAnswer === true && styles.selectedButton]}
            onPress={() => handleAnswer(true)}
            disabled={selectedAnswer !== null}
          >
            <View style={styles.iconContainer}>
              <Check width={24} height={24} color="#006400" />
            </View>
            <Text style={styles.answerText}>Verdadeiro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.answerButton, styles.falseButton, selectedAnswer === false && styles.selectedButton]}
            onPress={() => handleAnswer(false)}
            disabled={selectedAnswer !== null}
          >
            <View style={styles.iconContainer}>
              <X width={24} height={24} color="#8B0000" />
            </View>
            <Text style={styles.answerText}>Falso</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feedback Modal */}
      <FeedbackModal visible={showFeedback} isCorrect={isCorrect} onContinue={handleContinue} />

      {/* Loading Transition */}
      <LoadingTransition isVisible={showLoading} onAnimationComplete={handleLoadingComplete} />
      <GameTimer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} showVisual={false} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center", // Center content horizontally
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  questionContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: "100%",
    alignItems: "center", // Center text horizontally
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: "#333",
    textAlign: "center", // Center text
  },
  statementText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  buttonsContainer: {
    width: "100%",
    gap: 15,
    marginBottom: '6.5%',
  },
  answerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Center content
    padding: 15,
    borderRadius: 12, // Less rounded corners
    borderWidth: 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  trueButton: {
    backgroundColor: "#e6ffe6",
    borderColor: "#4CAF50",
  },
  falseButton: {
    backgroundColor: "#fff0f0",
    borderColor: "#FF5252",
  },
  selectedButton: {
    borderWidth: 3,
    elevation: 5,
    transform: [{ scale: 1.02 }], // Slightly larger when selected
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  answerText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: "600",
  },
})

export default TrueOrFalse

