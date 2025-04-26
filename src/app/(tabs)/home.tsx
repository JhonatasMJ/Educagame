"use client"

import React, { useState, useEffect, useRef } from "react"
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
  ActivityIndicator,
} from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { useAuth } from "@/src/context/AuthContext"
import { router } from "expo-router"
import { useGameProgress } from "@/src/context/GameProgressContext"
import DuolingoHeader from "@/src/components/DuolingoHeader"
import LearningPathTrack from "@/src/components/LearningPathTrack"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import { useTrails } from "@/src/hooks/useTrails"

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

// Define stage interface
export interface Stage {
  id: string
  title: string
  description?: string
  completed: boolean
  pontos_chave?: string[] // Novos pontos-chave específicos do stage
  image?: string // Imagem específica do stage
  video?: string // URL do vídeo específico do stage
  tempo_estimado?: string // Tempo estimado para completar o stage
  questions: Question[]
}

// Update the trilhas data structure to include backgroundSvg property
// Find the trilhas declaration and modify the first two objects:
// Remove the export const trilhas = [...] declaration completely

// Main Home component
const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0)
  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0)

  const { userData, authUser, refreshUserData, isTokenLoaded } = useAuth()
  const { getPhaseCompletionPercentage } = useGameProgress()
  const { isAuthenticated, isLoading } = useRequireAuth()
  const nome = `${userData?.nome || ""} ${userData?.sobrenome || ""}`
  const scrollViewRef = useRef<ScrollView>(null)
  const [containerHeight, setContainerHeight] = useState(height - 200) // Altura inicial estimada
  const [hasLoadedTrails, setHasLoadedTrails] = useState(false);

  // Animated scroll value for header animation
  const scrollY = useRef(new Animated.Value(0)).current

  // Add a new animated value for background parallax effect after the scrollY declaration
  const backgroundScrollY = useRef(new Animated.Value(0)).current

  // Animação para transição de trilhas
  const slideAnim = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<{
    titulo: string
    descricao: string
  } | null>(null)

  // Add state to track the current background SVG after the selectedQuestion state
  const [currentBackgroundSvg, setCurrentBackgroundSvg] = useState<any>(null)

  // In the Home component, add the following after the other useState declarations:
  const { trails: trilhas, isLoading: trailsLoading, error: trailsError, fetchTrails } = useTrails()

  async function refreshTrails() {
    console.log('clicou no refresh');
    await fetchTrails();
  }

  // Estatísticas do usuário para o cabeçalho
  const [userStats, setUserStats] = useState({
    points: 1430,
    streak: 7,
    gems: 45,
    lives: 5,
  })

  // Dados da trilha atual
  // Update the currentTrilha assignment to handle the case when trilhas is empty
  // Replace:
  // const currentTrilha = trilhas[trilhaAtualIndex]
  // With:
  const currentTrilha = trilhas && trilhas.length > 0 ? trilhas[trilhaAtualIndex] : null

  // Função para calcular o progresso de uma etapa com base nos stages concluídos
  const calculateEtapaProgress = (etapa: any): number => {
    if (!etapa.stages || etapa.stages.length === 0) {
      return etapa.concluida ? 100 : 0
    }

    const completedStages = etapa.stages.filter((stage: any) => stage.completed).length
    const totalStages = etapa.stages.length

    // Calcular a porcentagem de conclusão
    return Math.round((completedStages / totalStages) * 100)
  }

  // Verificar se uma etapa está totalmente concluída (todos os stages concluídos)
  const isEtapaCompleted = (etapa: any): boolean => {
    if (!etapa.stages || etapa.stages.length === 0) {
      return etapa.concluida
    }

    return etapa.stages.every((stage: any) => stage.completed)
  }

  // 1. Primeiro, vamos definir interfaces mais claras para os tipos que estamos usando

  // Interface para o Stage (fase dentro de uma etapa)
  interface StageInfo {
    id: string
    title: string
    description?: string
    completed: boolean
    pontos_chave?: string[]
    image?: string
    video?: string
    tempo_estimado?: string
    questions: Question[]
  }

  // Interface para a Etapa (que contém stages)
  interface EtapaInfo {
    id: string
    titulo: string
    descricao?: string
    concluida: boolean
    icon?: string
    iconLibrary?: string
    stages: StageInfo[]
    progress: number
  }

  // 2. Now, let's correct the mapping of etapas

  // Update the stages mapping to handle the case when currentTrilha is null
  // Replace:
  // const stages = currentTrilha.etapas.map((etapa, index) => {
  // With:
  const stages =
    currentTrilha && currentTrilha.etapas
      ? currentTrilha.etapas.map(
        (etapa: { id: any; titulo: any; descricao: any; icon: any; iconLibrary: any; stages: any }, index: any) => {
          // Calcular o progresso com base nos stages concluídos
          const progress = calculateEtapaProgress(etapa)

          // Verificar se a etapa está totalmente concluída
          const concluida = isEtapaCompleted(etapa)

          return {
            id: etapa.id,
            titulo: etapa.titulo,
            descricao: etapa.descricao || "Descrição da etapa não disponível",
            concluida: concluida,
            icon: etapa.icon || "crown",
            iconLibrary: etapa.iconLibrary || "lucide",
            stages: etapa.stages || [],
            progress: progress,
          } as EtapaInfo
        },
      )
      : []

  // 3. Corrigir o acesso às propriedades no handleStagePress

  const handleStagePress = (index: number) => {
    setEtapaAtualIndex(index)

    // Get the current etapa
    // Update the handleStagePress function to handle the case when currentTrilha is null
    // Replace:
    // const currentEtapa = currentTrilha.etapas[index]
    // With:
    if (!currentTrilha || !currentTrilha.etapas) return
    const currentEtapa = currentTrilha.etapas[index]

    // Encontrar o primeiro stage não concluído ou o primeiro stage se todos estiverem concluídos
    const currentStageIndex = currentEtapa.stages.findIndex((stage: { completed: any }) => !stage.completed)
    const stageIndex = currentStageIndex >= 0 ? currentStageIndex : 0
    const currentStage = currentEtapa.stages[stageIndex]

    // Navigate to the start phase with the stage data
    router.push({
      pathname: "/questions/start/startPhase",
      params: {
        phaseId: currentEtapa.id,
        trailId: currentTrilha.id,
        stageId: currentStage.id,
        title: currentStage.title,
        description: currentStage.description || "",
        image: currentStage.image || "",
        video: (currentStage as StageInfo).video || "", // Type assertion to StageInfo
        tempo_estimado: currentStage.tempo_estimado || "10-15 minutos",
        pontos_chave: JSON.stringify(currentStage.pontos_chave || []),
      },
    } as any)

    // Simulação de ganho de pontos ao clicar em uma etapa
    if (!stages[index].concluida) {
      // Mudado de completed para concluida
      setUserStats((prev) => ({
        ...prev,
        points: prev.points + 10,
      }))
    }
  }
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

  // Add this effect to update the background SVG when the trail changes
  useEffect(() => {
    setCurrentBackgroundSvg(() => (trilhas && trilhas.length > 0 ? trilhas[trilhaAtualIndex].backgroundSvg : null))
  }, [trilhaAtualIndex, trilhas])

  // Update the handleScroll function to include background parallax effect
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: (event) => {
      const offsetY = event.nativeEvent.contentOffset.y
      backgroundScrollY.setValue(-offsetY * 0.5)
    },
  })

  // Create a dynamic SVG background component variable before the return statement
  const BackgroundSvg = currentBackgroundSvg

// Adicione isso após suas declarações de estado
const fetchTrailsRef = useRef(fetchTrails);

useEffect(() => {
  // Atualiza a referência quando fetchTrails mudar
  fetchTrailsRef.current = fetchTrails;
}, [fetchTrails]);

// Substitua seu useEffect atual por este
useEffect(() => {
  // Agora verificamos se o token foi carregado e se o usuário está autenticado
  if (authUser && isTokenLoaded) {
    fetchTrailsRef.current();
  }
}, [authUser, isTokenLoaded]);

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#F6A608" />

      {trailsLoading && (
        <View className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <View className="bg-white p-6 rounded-xl shadow-lg">
            <Text className="text-lg font-medium text-center mb-4">Carregando trilhas...</Text>
            <ActivityIndicator size="large" color="#F6A608" />
          </View>
        </View>
      )}

      {trailsError && (
        <View className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <View className="bg-white p-6 rounded-xl shadow-lg">
            <Text className="text-lg font-medium text-center mb-4 text-red-500">Erro ao carregar trilhas</Text>
            <Text className="text-gray-600 mb-4">{trailsError}</Text>
            <TouchableOpacity className="bg-primary py-2 px-4 rounded-lg" onPress={refreshTrails}>
              <Text className="text-white font-medium">Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!trailsLoading && trilhas && trilhas.length === 0 && (
        <View className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <View className="bg-white p-6 rounded-xl shadow-lg">
            <Text className="text-lg font-medium text-center mb-4">Nenhuma trilha encontrada</Text>
            <TouchableOpacity className="bg-primary py-2 px-4 rounded-lg" onPress={refreshTrails}>
              <Text className="text-white font-medium">Atualizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Background SVG with parallax effect */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#F0E6D2", // Background color that shows if image ends
          zIndex: -1,
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateY: backgroundScrollY }],
          }}
        >
          {BackgroundSvg ? (
            <BackgroundSvg
              width="100%"
              height={height * 1.5} // Make SVG taller than screen for scrolling effect
              preserveAspectRatio="xMidYMid slice"
              onError={() => {
                console.log("Error loading background SVG")
                setCurrentBackgroundSvg(null)
              }}
            />
          ) : (
            // Fallback background when SVG fails to load
            <View
              style={{
                width: "100%",
                height: height * 1.5,
                justifyContent: "center",
                alignItems: "center",
                opacity: 0.1,
              }}
            >
              <Text style={{ fontSize: 100, color: "#333" }}>🏞️</Text>
            </View>
          )}
        </Animated.View>
      </View>

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
          <Text className="text-white font-bold text-lg mb-1">
            {currentTrilha ? currentTrilha.nome : "Carregando..."}
          </Text>
          <View className="flex-row justify-center items-center mt-1">
            {trilhas && trilhas.length > 0
              ? trilhas.map((_, index) => (
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
              ))
              : null}
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
          <View style={{ height: 60 }} /> {/* Increased padding to create more space between header and content */}
          <LearningPathTrack
            etapas={stages}
            currentEtapaIndex={etapaAtualIndex}
            onEtapaPress={handleStagePress}
            containerHeight={containerHeight}
            backgroundImage={currentTrilha?.image}
            trailId={currentTrilha?.id}
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </View>
  )
}

export default Home
