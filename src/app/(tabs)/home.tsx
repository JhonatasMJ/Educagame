"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { useAuth } from "@/src/context/AuthContext"
import { router } from "expo-router"
import { useGameProgress } from "@/src/context/GameProgressContext"
import DuolingoHeader from "@/src/components/DuolingoHeader"
import LearningPathTrack from "@/src/components/LearningPathTrack"
import React from "react"

const { width, height } = Dimensions.get("window")

// Define question types
export enum QuestionType {
  TRUE_OR_FALSE = "trueOrFalse",
  MULTIPLE_CHOICE = "multipleChoice",
  MATCHING = "matching",
  ORDERING = "ordering",
}

// Define question interface
export interface Question {
  id: string
  type: QuestionType
  description: string
  image?: string
  // For true/false questions
  isTrue?: boolean
  // For multiple choice questions
  options?: string[]
  correctOptionIndex?: number
}

// Mock data for trilhas (courses) with questions
export const trilhas = [
  {
    id: "1",
    nome: "React Native Básico",
    descricao: "Aprenda os fundamentos do React Native",
    image: require("@/assets/images/fundo.svg"),
    etapas: [
      {
        id: "1",
        titulo: "Introdução ao React Native",
        descricao: "Conceitos básicos e configuração do ambiente",
        concluida: true,
        icone: "book",
        questions: [
          {
            id: "q1",
            type: QuestionType.TRUE_OR_FALSE,
            description:
              "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat.",
            isTrue: true,
          },
          {
            id: "q2",
            type: QuestionType.TRUE_OR_FALSE,
            description:
              "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, euismod tincidunt ut laoreet dolore magna aliquam erat.",
              image: require("@/assets/images/logo.png"),
            isTrue: false,
          },
          {
            id: "q3",
            type: QuestionType.TRUE_OR_FALSE,
            description:
              "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat.",
            isTrue: true,
          },
        ],
      },
      {
        id: "2",
        titulo: "Componentes Básicos",
        descricao: "Aprenda sobre os componentes fundamentais",
        concluida: true,
        icone: "book",
        questions: [
          {
            id: "q1",
            type: QuestionType.TRUE_OR_FALSE,
            description: "React Native usa a mesma base de código para iOS e Android.",
            isTrue: true,
          },
          {
            id: "q2",
            type: QuestionType.TRUE_OR_FALSE,
            description: "StyleSheet no React Native funciona exatamente como CSS na web.",
            isTrue: false,
          },
        ],
      },
      {
        id: "3",
        titulo: "Navegação",
        concluida: false,
        icone: "target",
        descricao: "Aprenda sobre navegação entre telas",
        questions: [
          {
            id: "q1",
            type: QuestionType.TRUE_OR_FALSE,
            description: "React Navigation é a única biblioteca de navegação para React Native.",
            isTrue: false,
          },
          {
            id: "q2",
            type: QuestionType.TRUE_OR_FALSE,
            description: "Stack Navigator permite navegação em pilha entre telas.",
            isTrue: true,
          },
        ],
      },
      {
        id: "4",
        titulo: "Estado e Props",
        concluida: false,
        icone: "book",
        descricao: "Gerenciamento de estado e propriedades",
        questions: [
          {
            id: "q1",
            type: QuestionType.TRUE_OR_FALSE,
            description: "useState é um hook que permite adicionar estado a componentes funcionais.",
            isTrue: true,
          },
          {
            id: "q2",
            type: QuestionType.TRUE_OR_FALSE,
            description: "Props são imutáveis em componentes React.",
            isTrue: true,
          },
        ],
      },
      {
        id: "5",
        titulo: "APIs Nativas",
        concluida: false,
        icone: "crown",
        descricao: "Acesso a recursos nativos do dispositivo",
        questions: [
          {
            id: "q1",
            type: QuestionType.TRUE_OR_FALSE,
            description: "React Native permite acesso direto à câmera sem bibliotecas adicionais.",
            isTrue: false,
          },
          {
            id: "q2",
            type: QuestionType.TRUE_OR_FALSE,
            description: "AsyncStorage é usado para armazenamento persistente de dados.",
            isTrue: true,
          },
        ],
      },
    ],
  },
  {
    id: "2",
    nome: "Básico 2",
    image: "",
    etapas: [
      {
        id: "1",
        titulo: "Roupas",
        concluida: false,
        icone: "zap",
        descricao: "Vocabulário de vestuário",
        questions: [
          {
            id: "q1",
            type: QuestionType.TRUE_OR_FALSE,
            description: "A camisa é uma peça de roupa para a parte superior do corpo.",
            isTrue: true,
          },
        ],
      },
      {
        id: "2",
        titulo: "Cores",
        concluida: false,
        icone: "target",
        descricao: "Aprenda as cores",
        questions: [
          {
            id: "q1",
            type: QuestionType.TRUE_OR_FALSE,
            description: "Vermelho, azul e amarelo são cores primárias.",
            isTrue: true,
          },
        ],
      },
    ],
  },
]

// Main Home component
const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0)
  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0)

  const { userData, authUser, refreshUserData } = useAuth()
  const { getPhaseCompletionPercentage } = useGameProgress()

  const nome = `${userData?.nome} ${userData?.sobrenome}`
  const scrollViewRef = useRef<ScrollView>(null)
  const flatListRef = useRef(null)
  const [containerHeight, setContainerHeight] = useState(height - 200) // Altura inicial estimada

  // Animated scroll value for header animation
  const scrollY = useRef(new Animated.Value(0)).current

  // Animação para transição de trilhas
  const slideAnim = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<{
    titulo: string
    descricao: string
  } | null>(null)

  // Estatísticas do usuário para o cabeçalho
  const [userStats, setUserStats] = useState({
    points: 1430,
    streak: 7,
    gems: 45,
    lives: 5,
  })

  // Dados da trilha atual
  const currentTrilha = trilhas[trilhaAtualIndex]

  // Add id to each stage and calculate progress percentage
  const stages = currentTrilha.etapas.map((etapa, index) => {
    // Get progress percentage from context
    const progressPercentage = getPhaseCompletionPercentage(etapa.id)

    return {
      number: index + 1,
      title: etapa.titulo,
      completed: etapa.concluida,
      icon: etapa.icone || "crown",
      description: etapa.descricao || "Descrição da etapa não disponível",
      id: etapa.id, // Add the id property
      progressPercentage: progressPercentage, // Add progress percentage
    }
  })

  // Medir a altura do container para posicionar os estágios corretamente
  const onContainerLayout = (event: {
    nativeEvent: { layout: { height: number } }
  }) => {
    const { height } = event.nativeEvent.layout
    setContainerHeight(height)
  }

  // Scroll para a etapa atual quando mudar
  useEffect(() => {
    if (scrollViewRef.current) {
      if (Platform.OS !== "web") {
        // Para dispositivos móveis - agora invertido
        setTimeout(() => {
          // Calcular posição para rolar - de baixo para cima
          const totalHeight = stages.length * 200 // Altura aproximada de todos os estágios (aumentada)
          const position = totalHeight - (etapaAtualIndex + 1) * 200 // Posição a partir de baixo

          scrollViewRef.current?.scrollTo({ y: position, animated: true })
        }, 300)
      } else {
        // Para web
        setTimeout(() => {
          const elements = document.querySelectorAll(".stage-bubble")
          if (elements && elements[stages.length - 1 - etapaAtualIndex]) {
            elements[stages.length - 1 - etapaAtualIndex].scrollIntoView({
              behavior: "smooth",
              block: "center",
            })
          }
        }, 300)
      }
    }
  }, [etapaAtualIndex, stages.length])

  const handleStagePress = (index: number) => {
    setEtapaAtualIndex(index)

    // Get the current stage
    const currentStage = currentTrilha.etapas[index]

    // Navigate to the start phase with the stage data
    router.push({
      pathname: "/questions/start/startPhase",
      params: {
        phaseId: currentStage.id,
        trailId: currentTrilha.id, // Pass the trail ID too
        title: currentStage.titulo,
        description: currentStage.descricao || "",
      },
    } as any)

    // Simulação de ganho de pontos ao clicar em uma etapa
    if (!stages[index].completed) {
      setUserStats((prev) => ({
        ...prev,
        points: prev.points + 10,
      }))
    }
  }

  const handleNextTrilha = () => {
    if (trilhaAtualIndex < trilhas.length - 1 && !isAnimating) {
      setIsAnimating(true)

      // Animar para a direita
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start(() => {
        setTrilhaAtualIndex(trilhaAtualIndex + 1)
        setEtapaAtualIndex(0)
        slideAnim.setValue(width) // Preparar para deslizar da direita para o centro

        // Animar de volta ao centro
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start(() => {
          setIsAnimating(false)
        })
      })
    }
  }

  const handlePreviousTrilha = () => {
    if (trilhaAtualIndex > 0 && !isAnimating) {
      setIsAnimating(true)

      // Animar para a esquerda
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start(() => {
        setTrilhaAtualIndex(trilhaAtualIndex - 1)
        setEtapaAtualIndex(0)
        slideAnim.setValue(-width) // Preparar para deslizar da esquerda para o centro

        // Animar de volta ao centro
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start(() => {
          setIsAnimating(false)
        })
      })
    }
  }

  // Handle scroll events for header animation with improved performance
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: () => {}, // Empty listener to ensure the event is processed
  })

  return (
    <View className="flex-1 bg-primary ">
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#F6A608" />

      <DuolingoHeader nome={nome} scrollY={scrollY} selectedQuestion={selectedQuestion} />

      
      <View className="bg-secondary px-4 py-6 flex-row justify-between items-center absolute bottom-20 left-0 right-0 z-20 border-t-2 border-tertiary">
        <TouchableOpacity
          onPress={handlePreviousTrilha}
          className="bg-tertiary p-2 rounded-md"
          disabled={trilhaAtualIndex === 0 || isAnimating}
        >
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-white font-bold text-lg mb-1">{currentTrilha.nome}</Text>
          <View className="flex-row justify-center items-center mt-1">
            {trilhas.map((_, index) => (
              <TouchableOpacity
                key={`indicator-${index}`}
                onPress={() => {
                  if (index < trilhaAtualIndex) {
                    handlePreviousTrilha()
                  } else if (index > trilhaAtualIndex) {
                    handleNextTrilha()
                  }
                }}
                className="mx-1"
              >
                <View
                  className={`rounded-full ${trilhaAtualIndex === index ? "bg-white w-3 h-3" : "bg-tertiary w-2 h-2"}`}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNextTrilha}
          className="bg-tertiary p-2 rounded-md"
          disabled={trilhaAtualIndex === trilhas.length - 1 || isAnimating}
        >
          <ChevronRight size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal com trilha de aprendizado - agora com animação de slide */}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: slideAnim }],
        }}
        onLayout={onContainerLayout}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerClassName="items-center px-4 pb-24" // Padding inferior para dar espaço à barra de navegação
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16} // Standard value for smooth animation
          decelerationRate="normal" // Smoother deceleration
        >
          <View style={{ height: 60 }} /> {/* Increased padding to create more space between header and content */}
          <LearningPathTrack
            stages={stages}
            currentStage={etapaAtualIndex}
            onStagePress={handleStagePress}
            containerHeight={containerHeight}
            backgroundImage={currentTrilha.image}
            trailId={currentTrilha.id}
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </View>
  )
}

export default Home

