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

// Import componentized UI elements
import DuolingoHeader from "@/src/components/DuolingoHeader"
import LearningPathTrack from "@/src/components/LearningPathTrack"
import React from "react"

const { width, height } = Dimensions.get("window")

// Mock data for trilhas (courses) - now with image field
const trilhas = [
  {
    id: "1",
    nome: "React Native Básico",
    descricao: "Aprenda os fundamentos do React Native",
    image: "https://example.com/react-native-path.jpg", // Example image URL
    etapas: [
      {
        id: "1",
        titulo: "Introdução ao React Native",
        descricao: "Conceitos básicos e configuração do ambiente",
        concluida: true,
        icone: "book",
      },
      {
        id: "2",
        titulo: "Introdução ao React Native",
        descricao: "Conceitos básicos e configuração do ambiente",
        concluida: true,
        icone: "book",
      },
      {
        titulo: "Viagem",
        concluida: false,
        icone: "target",
        descricao: "Frases úteis para viagem",
      },
      {
        titulo: "Família",
        concluida: false,
        icone: "book",
        descricao: "Membros da família",
      },
      {
        titulo: "Casa",
        concluida: false,
        icone: "crown",
        descricao: "Vocabulário do lar",
      },
    ],
  },
  {
    id: "2",
    nome: "Básico 2",
    image: "https://example.com/basic-path.jpg", // Example image URL
    etapas: [
      {
        titulo: "Roupas",
        concluida: false,
        icone: "zap",
        descricao: "Vocabulário de vestuário",
      },
      {
        titulo: "Cores",
        concluida: false,
        icone: "target",
        descricao: "Aprenda as cores",
      },
      {
        titulo: "Animais",
        concluida: false,
        icone: "book",
        descricao: "Nomes de animais comuns",
      },
    ],
  },
  {
    id: "3",
    nome: "Intermediário",
    image: "https://example.com/intermediate-path.jpg", // Example image URL
    etapas: [
      {
        titulo: "Trabalho",
        concluida: false,
        icone: "crown",
        descricao: "Vocabulário profissional",
      },
      {
        titulo: "Hobbies",
        concluida: false,
        icone: "zap",
        descricao: "Atividades de lazer",
      },
    ],
  },
]

// Main Home component
const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0)
  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0)

  const { userData, authUser, refreshUserData } = useAuth()

  const nome = `${userData?.nome} ${userData?.sobrenome}`
  const scrollViewRef = useRef<ScrollView>(null)
  const flatListRef = useRef(null)
  const [containerHeight, setContainerHeight] = useState(height - 200) // Altura inicial estimada

  // Animated scroll value for header animation
  const scrollY = useRef(new Animated.Value(0)).current

  // Animação para transição de trilhas
  const slideAnim = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)

  // Estatísticas do usuário para o cabeçalho
  const [userStats, setUserStats] = useState({
    points: 1250,
    streak: 7,
    gems: 45,
    lives: 5,
  })

  // Dados da trilha atual
  const currentTrilha = trilhas[trilhaAtualIndex]
  const stages = currentTrilha.etapas.map((etapa, index) => ({
    number: index + 1,
    title: etapa.titulo,
    completed: etapa.concluida,
    icon: etapa.icone || "crown",
    description: etapa.descricao || "Descrição da etapa não disponível",
  }))

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

  // Handle scroll events for header animation
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })

  return (
    <View className="flex-1 bg-gradient-to-b from-pink-100 to-purple-100">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Cabeçalho estilo Duolingo com animação de scroll */}
      <DuolingoHeader
        points={userStats.points}
        streak={userStats.streak}
        lives={userStats.lives}
        nome={nome}
        scrollY={scrollY}
      />

      {/* Barra de navegação inferior - FIXA na parte inferior */}
      <View
        className="bg-purple-800 px-4 py-2 flex-row justify-between items-center absolute bottom-20 left-0 right-0 z-20"
        style={{
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        }}
      >
        <TouchableOpacity
          onPress={handlePreviousTrilha}
          className="bg-purple-700 p-3 rounded-full"
          disabled={trilhaAtualIndex === 0 || isAnimating}
          style={{
            opacity: trilhaAtualIndex === 0 || isAnimating ? 0.5 : 1,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
          }}
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
                  className={`rounded-full ${
                    trilhaAtualIndex === index ? "bg-white w-3 h-3" : "bg-purple-300 w-2 h-2"
                  }`}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNextTrilha}
          className="bg-purple-700 p-3 rounded-full"
          disabled={trilhaAtualIndex === trilhas.length - 1 || isAnimating}
          style={{
            opacity: trilhaAtualIndex === trilhas.length - 1 || isAnimating ? 0.5 : 1,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
          }}
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
          scrollEventThrottle={16} // Important for smooth animation
        >
          <View style={{ height: 20 }} /> {/* Reduced padding to avoid cutting content */}
          <LearningPathTrack
            stages={stages}
            currentStage={etapaAtualIndex}
            onStagePress={handleStagePress}
            containerHeight={containerHeight}
            backgroundImage={currentTrilha.image}
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </View>
  )
}

export default Home

