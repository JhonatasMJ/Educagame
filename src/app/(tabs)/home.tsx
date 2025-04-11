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
  ImageBackground,
} from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { useAuth } from "@/src/context/AuthContext"
import { router } from "expo-router"
import { useGameProgress } from "@/src/context/GameProgressContext"
import DuolingoHeader from "@/src/components/DuolingoHeader"
import LearningPathTrack from "@/src/components/LearningPathTrack"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
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
  explanation?: string
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
        id: "2",
        titulo: "Componentes Básicos",
        descricao: "Aprenda sobre os componentes fundamentais",
        concluida: true,
        icon: "book-open-text", // Nome do ícone do Lucide
        iconLibrary: "lucide", // Opcional, padrão é "lucide"
        questions: [
          {
            id: "q1",
            type: QuestionType.TRUE_OR_FALSE,
            description: "React Native permite escrever código uma vez e executar em múltiplas plataformas.",
            isTrue: true,
            explanation:
              "Correto! React Native permite que você escreva código JavaScript que funciona tanto em iOS quanto em Android.",
          },
          {
            id: "q1",
            type: QuestionType.ORDERING,
            items: [
              { id: "a", text: "1" },
              { id: "b", text: "2" },
              { id: "c", text: "3" },
              { id: "d", text: "4" },
            ],
            correctOrder: ["a", "b", "c", "d"],
            statementText: "Coloque a ordem correta!",
            explanation:
              "A ordem cronológica correta é: Descobrimento (1500), Independência (1822), Abolição (1888) e República (1889).",
          },
          {
            id: "q1",
            type: QuestionType.MULTIPLE_CHOICE,
            description: "Lorem ____ ipsum",
            options: [
              { id: "a", text: "React Navigation" },
              { id: "b", text: "Expo Router" },
              { id: "c", text: "React Native Navigation" },
              { id: "d", text: "React Router Native" },
            ],
            correctOptions: ["a", "b", "c"],
            multipleCorrect: true,
            statementText: "Complete a frase",
            explanation:
              "Todas estas são bibliotecas de navegação populares para React Native, cada uma com suas próprias vantagens e abordagens.",
          },
          {
            id: "q3",
            type: QuestionType.TRUE_OR_FALSE,
            description: "React Native usa WebView para renderizar a interface do usuário.",
            isTrue: false,
            explanation:
              "Incorreto! React Native não usa WebView, ele renderiza componentes nativos reais da plataforma.",
          },
        ],
      },
      {
        id: "3",
        titulo: "Navegação",
        concluida: false,
        icon: "target", // Nome do ícone do Lucide
        iconLibrary: "lucide",
        descricao: "Aprenda sobre navegação entre telas",
        questions: [
          {
            id: "q1",
            type: QuestionType.MULTIPLE_CHOICE,
            description: "Quais das seguintes são bibliotecas de navegação para React Native?",
            options: [
              { id: "a", text: "React Navigation" },
              { id: "b", text: "Expo Router" },
              { id: "c", text: "React Native Navigation" },
              { id: "d", text: "React Router Native" },
            ],
            correctOptions: ["a", "b", "c", "d"],
            multipleCorrect: true,
            statementText: "Selecione todas as opções corretas:",
            explanation:
              "Todas estas são bibliotecas de navegação populares para React Native, cada uma com suas próprias vantagens e abordagens.",
          },
          {
            id: "q2",
            type: QuestionType.MULTIPLE_CHOICE,
            description: "Qual navegador no React Navigation permite navegação em pilha entre telas?",
            options: [
              { id: "a", text: "Stack Navigator" },
              { id: "b", text: "Tab Navigator" },
              { id: "c", text: "Drawer Navigator" },
              { id: "d", text: "Bottom Navigator" },
            ],
            correctOptions: ["a"],
            multipleCorrect: false,
            explanation:
              "O Stack Navigator empilha telas uma sobre a outra, permitindo navegação para frente e para trás.",
          },
        ],
      },
      {
        id: "4",
        titulo: "Estado e Props",
        concluida: false,
        icon: "book", // Nome do ícone do Lucide
        iconLibrary: "lucide",
        descricao: "Gerenciamento de estado e propriedades",
        questions: [
          {
            id: "q1",
            type: QuestionType.MULTIPLE_CHOICE,
            description: "Quais dos seguintes são hooks do React para gerenciamento de estado?",
            options: [
              { id: "a", text: "useState" },
              { id: "b", text: "useEffect" },
              { id: "c", text: "useReducer" },
              { id: "d", text: "useContext" },
            ],
            correctOptions: ["a", "c", "d"],
            multipleCorrect: true,
            statementText: "Selecione todas as opções que são hooks de estado:",
            explanation:
              "useState, useReducer e useContext são hooks relacionados ao gerenciamento de estado. useEffect é um hook para efeitos colaterais, não diretamente para estado.",
          },
          {
            id: "q2",
            type: QuestionType.TRUE_OR_FALSE,
            description: "Props são imutáveis em componentes React.",
            isTrue: true,
            explanation: "Correto! Props são somente leitura e não devem ser modificadas dentro do componente.",
          },
        ],
      },
      {
        id: "5",
        titulo: "APIs Nativas",
        concluida: false,
        icon: "crown", // Nome do ícone do Lucide
        iconLibrary: "lucide",
        descricao: "Acesso a recursos nativos do dispositivo",
        questions: [
          {
            id: "q1",
            type: QuestionType.MULTIPLE_CHOICE,
            description: "Quais das seguintes APIs são usadas para armazenamento de dados em React Native?",
            options: [
              { id: "a", text: "AsyncStorage" },
              { id: "b", text: "SQLite" },
              { id: "c", text: "Realm" },
              { id: "d", text: "Firebase Firestore" },
            ],
            correctOptions: ["a", "b", "c", "d"],
            multipleCorrect: true,
            image: require("@/assets/images/logo.png"),
            statementText: "Selecione todas as opções corretas:",
            explanation:
              "Todas estas são opções válidas para armazenamento de dados em aplicativos React Native, cada uma com diferentes casos de uso e complexidade.",
          },
          {
            id: "q2",
            type: QuestionType.MULTIPLE_CHOICE,
            description: "Qual API é usada para acessar a localização do dispositivo em React Native?",
            options: [
              { id: "a", text: "react-native-geolocation" },
              { id: "b", text: "expo-location" },
              { id: "c", text: "react-native-maps" },
              { id: "d", text: "react-native-gps" },
            ],
            correctOptions: ["a", "b"],
            multipleCorrect: true,
            explanation:
              "react-native-geolocation e expo-location são APIs para acessar a localização do dispositivo. react-native-maps é para exibir mapas e react-native-gps não é uma biblioteca padrão.",
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
        icon: "https://cdn-icons-png.flaticon.com/512/69/69544.png",
        descricao: "Vocabulário de vestuário",
        questions: [
          {
            id: "q1",
            type: QuestionType.MULTIPLE_CHOICE,
            description: "Quais das seguintes são peças de roupa para a parte superior do corpo?",
            options: [
              { id: "a", text: "Camisa" },
              { id: "b", text: "Calça" },
              { id: "c", text: "Blusa" },
              { id: "d", text: "Sapato" },
            ],
            correctOptions: ["a", "c"],
            multipleCorrect: true,
            statementText: "Selecione todas as opções corretas:",
            explanation:
              "Camisa e blusa são peças de vestuário usadas na parte superior do corpo. Calça é usada na parte inferior e sapato nos pés.",
          },
        ],
      },
      {
        id: "2",
        titulo: "Cores",
        concluida: false,
        icon: "palette", // Nome do ícone do MaterialIcons
        iconLibrary: "material", // Especifica a biblioteca MaterialIcons
        descricao: "Aprenda as cores",
        questions: [
          {
            id: "q1",
            type: QuestionType.MULTIPLE_CHOICE,
            description: "Quais das seguintes são cores primárias no sistema de cores subtrativas?",
            options: [
              { id: "a", text: "Vermelho" },
              { id: "b", text: "Verde" },
              { id: "c", text: "Azul" },
              { id: "d", text: "Amarelo" },
            ],
            correctOptions: ["a", "c", "d"],
            multipleCorrect: true,
            statementText: "Selecione todas as cores primárias:",
            explanation:
              "No sistema de cores subtrativas (como tintas), as cores primárias são vermelho, azul e amarelo. No sistema aditivo (como luz), são vermelho, verde e azul.",
          },
          {
            id: "q2",
            type: QuestionType.MULTIPLE_CHOICE,
            description: "Qual é a cor resultante da mistura de azul e amarelo?",
            options: [
              { id: "a", text: "Verde" },
              { id: "b", text: "Roxo" },
              { id: "c", text: "Laranja" },
              { id: "d", text: "Marrom" },
            ],
            correctOptions: ["a"],
            multipleCorrect: false,
            explanation: "A mistura de azul e amarelo resulta na cor verde.",
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
  const { isAuthenticated, isLoading } = useRequireAuth()
  const nome = `${userData?.nome || ""} ${userData?.sobrenome || ""}`
  const scrollViewRef = useRef<ScrollView>(null)
  const [containerHeight, setContainerHeight] = useState(height - 200) // Altura inicial estimada

  // Animated scroll value for header animation
  const scrollY = useRef(new Animated.Value(0)).current

  // Animated value for background parallax effect
  const backgroundScrollY = useRef(new Animated.Value(0)).current

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
      icon: etapa.icon || "crown",
      iconLibrary: etapa.iconLibrary || "lucide",
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
    listener: (event) => {
      // Update the background scroll position at a slower rate for parallax effect
      const offsetY = event.nativeEvent.contentOffset.y
      backgroundScrollY.setValue(offsetY * 0.5) // Scroll at half the speed for parallax effect
    },
  })

  // Background image for parallax effect
  const backgroundImage = require("@/assets/images/fundo.png") // Replace with your actual background image

  return (
    <View className="flex-1 ">
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#F6A608" />

      {/* Background image with parallax effect */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateY: backgroundScrollY }],
          zIndex: -1,
        }}
      >
        <ImageBackground
          source={backgroundImage}
          style={{ width: "100%", height: height * 1.5 }} // Make image taller than screen for scrolling effect
          resizeMode="cover"
        />
      </Animated.View>

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
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingBottom: 96,
            paddingTop: 60, // Added padding to create space at the top
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16} // Standard value for smooth animation
          decelerationRate="normal" // Smoother deceleration
        >
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
