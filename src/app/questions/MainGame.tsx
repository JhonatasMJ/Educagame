"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, SafeAreaView, ActivityIndicator, Animated, StatusBar, TouchableOpacity } from "react-native"
import { Clock, Award, AlertTriangle } from "lucide-react-native"
import { router, useLocalSearchParams } from "expo-router"
import StepIndicator from "@/src/components/StepIndicator"
import FeedbackModal from "@/src/components/FeedbackModal"
import LoadingTransition from "@/src/components/LoadingTransition"
import GameTimer from "@/src/utils/GameTimer"
import { useGameProgress } from "@/src/context/GameProgressContext"
import { trilhas, QuestionType } from "../(tabs)/home"
import MultipleChoice from "./multipleChoice/multipleChoice"

// Import game components
import TrueOrFalse from "./trueORfalse/trueORfalse"
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

type Question = TrueOrFalseQuestion | MultipleChoiceQuestion


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

        // Find the phase with the matching ID
        for (const trilha of trilhas) {
            console.log("Checking trail:", trilha.id)

            const phase = trilha.etapas.find((etapa) => etapa.id === phaseId)
            if (phase) {
                console.log("Found phase:", phase.titulo, "with", phase.questions.length, "questions")

                // Certifique-se de que as questões estão no formato correto
                const typedQuestions = phase.questions.map((q: any) => {
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
                            multipleCorrect: q.multipleCorrect || false
                        } as MultipleChoiceQuestion
                    }
                    return q as Question
                })               
                setQuestions(typedQuestions)

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
            return null
        }

        switch (currentQuestion.type as QuestionType) {
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
            default:
                return (
                    <View className="flex-1 justify-center items-center p-4">
                        <Text className="text-red-500">Tipo de questão não suportado: {currentQuestion.type}</Text>
                    </View>
                )
        }
    }
    return (
        <SafeAreaView className="flex-1 bg-primary">
            <StatusBar barStyle={"dark-content"} backgroundColor={showLoading ? "#3185BE" : "#F6A608"} translucent={false} />

            {/* Header with timer and progress */}
            <View className="px-4 py-3 bg-secondary border-tertiary border-b-4 shadow-sm">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <Clock size={16} color="#666" />
                        <Text className="text-gray-700 ml-1.5 font-medium">{formatTime(totalTime)}</Text>
                    </View>

                    <View className="flex-row items-center">
                        <Award size={16} color="#666" />
                        <Text className="text-gray-700 ml-1.5 font-medium">
                            {isRetrying ? `Revisão: ${wrongQuestions.length}` : `${questions.length}`}
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
                            Revisando questões incorretas
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

            {/* Hidden timer for tracking */}
            <GameTimer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} showVisual={false} />
        </SafeAreaView>
    )
}

export default MainGame
