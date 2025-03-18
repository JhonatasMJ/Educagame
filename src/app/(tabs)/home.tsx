"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
  Pressable,
  Animated,
  Easing,
} from "react-native"
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Diamond,
  Heart,
  Settings,
  Crown,
  Zap,
  Target,
  BookOpen,
} from "lucide-react-native"
import { trilhas } from "@/src/dados"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

const LessonBubble = ({
  number,
  isActive,
  isCompleted,
  isNext,
  onPress,
  title,
  icon,
  description,
}: {
  number: number
  isActive: boolean
  isCompleted: boolean
  isNext: boolean
  onPress: () => void
  title: string
  icon: string
  description?: string
}) => {
  const bubbleSize = 80
  const numberSize = 30

  // Valor de animação apenas para a próxima etapa
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Cores para efeito 3D
  const baseColor = isCompleted ? "#10b981" : "#f97316" // Verde para completo, laranja para incompleto
  const shadowColor = isCompleted ? "#059669" : "#ea580c" // Sombra mais escura para efeito 3D
  const highlightColor = isCompleted ? "#34d399" : "#fdba74" // Destaque mais claro para efeito 3D

  // Função para renderizar o ícone correto
  const renderIcon = () => {
    switch (icon) {
      case "crown":
        return <Crown size={24} color="white" />
      case "zap":
        return <Zap size={24} color="white" />
      case "target":
        return <Target size={24} color="white" />
      case "book":
        return <BookOpen size={24} color="white" />
      default:
        return null
    }
  }

  // Efeito para iniciar animação de pulso apenas na próxima etapa
  useEffect(() => {
    if (isNext) {
      // Animação de pulso contínua apenas para a próxima etapa
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      // Parar animação para outras etapas
      pulseAnim.setValue(1)
      pulseAnim.stopAnimation()
    }
  }, [isNext])

  return (
    <Pressable onPress={onPress} className="stage-bubble">
      <Animated.View
        className="items-center my-8 relative"
        style={{
          transform: [{ scale: isNext ? pulseAnim : 1 }],
        }}
      >
        <View className="items-center">
          {/* Sombra para efeito 3D - centralizada */}
          <View
            style={{
              position: "absolute",
              width: bubbleSize + 16,
              height: bubbleSize + 16,
              borderRadius: (bubbleSize + 16) / 2,
              backgroundColor: "rgba(0,0,0,0.2)",
              top: 4,
              zIndex: 1,
            }}
          />

          {/* Contêiner principal com borda condicional */}
          <View
            className={`items-center justify-center rounded-full ${
              isActive ? "border-4 border-purple-700" : isCompleted ? "border-2 border-green-700" : ""
            }`}
            style={{
              width: bubbleSize + 8,
              height: bubbleSize + 8,
              zIndex: 2,
              elevation: isActive ? 8 : 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: isActive ? 4 : 2 },
              shadowOpacity: isActive ? 0.3 : 0.2,
              shadowRadius: isActive ? 6 : 3,
            }}
          >
            {/* Gradiente para efeito 3D */}
            <LinearGradient
              colors={[highlightColor, baseColor, shadowColor]}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 0.8, y: 0.8 }}
              className="rounded-full items-center justify-center"
              style={{ width: bubbleSize, height: bubbleSize }}
            >
              {/* Ícone dentro da bolha */}
              <View className="items-center justify-center">{renderIcon()}</View>

              {isCompleted && (
                <View className="bg-green-700 absolute top-0 right-0 w-6 h-6 rounded-full items-center justify-center">
                  <Text className="text-white font-bold">✓</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Número da etapa */}
          <View
            className="bg-purple-800 rounded-full absolute items-center justify-center z-10"
            style={{
              width: numberSize,
              height: numberSize,
              top: -2,
              elevation: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Text className="text-white font-bold">{number}</Text>
          </View>

          {/* Título e descrição abaixo da bolha */}
          <View className="mt-4 items-center max-w-[200px]">
            <View
              className="bg-purple-700 px-3 py-1 rounded-lg mb-2 w-full"
              style={{
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
              }}
            >
              <Text className="text-white font-medium text-sm text-center" numberOfLines={2}>
                {title}
              </Text>
            </View>

            {description && (
              <View
                className="bg-purple-600/80 px-3 py-1 rounded-lg w-full"
                style={{
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOffset: { width: 1, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                }}
              >
                <Text className="text-white text-xs text-center" numberOfLines={3}>
                  {description}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  )
}

const LearningPathTrack = ({
  stages,
  currentStage,
  onStagePress,
}: {
  stages: Array<{
    number: number
    completed: boolean
    title: string
    icon: string
    description: string
  }>
  currentStage: number
  onStagePress: (index: number) => void
}) => {
  // Encontrar o índice da próxima etapa não concluída
  const nextStageIndex = stages.findIndex((stage) => !stage.completed)

  return (
    <View className="items-center">
      {/* Trilha de fundo contínua */}
      <View
        className="absolute bg-purple-300"
        style={{
          width: 8,
          height: "100%",
          borderRadius: 4,
          zIndex: 1,
        }}
      />

      {/* Trilha de progresso */}
      <View
        className="absolute bg-purple-700"
        style={{
          width: 8,
          height: `${Math.max((stages.filter((s) => s.completed).length / stages.length) * 100, 10)}%`,
          borderRadius: 4,
          zIndex: 2,
          bottom: 0, // Começa de baixo
        }}
      />

      {/* Estágios em ordem reversa (de baixo para cima) */}
      {[...stages].reverse().map((stage, index) => {
        // Calcular o índice original (antes da inversão)
        const originalIndex = stages.length - 1 - index
        // Verificar se esta é a próxima etapa a ser concluída
        const isNextStage = originalIndex === nextStageIndex

        return (
          <View key={originalIndex} className="items-center z-10">
            <LessonBubble
              number={stage.number}
              isActive={currentStage === originalIndex}
              isCompleted={stage.completed}
              isNext={isNextStage}
              onPress={() => onStagePress(originalIndex)}
              title={stage.title}
              icon={stage.icon}
            />

            {/* Espaço entre bolhas - aumentado */}
            {index < stages.length - 1 && <View style={{ height: 60 }} />}
          </View>
        )
      })}
    </View>
  )
}

// Componente de cabeçalho estilo Duolingo com sombra aprimorada
const DuolingoHeader = ({
  points,
  streak,
  gems,
  lives,
}: {
  points: number
  streak: number
  gems: number
  lives: number
}) => {
  return (
    <View
      style={{
        // Sombra aprimorada para o cabeçalho
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 10,
      }}
    >
      <LinearGradient
        colors={["#7c3aed", "#6d28d9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-4 pb-4 px-4"
      >
        {/* Linha superior com título e configurações */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-white">Aprendizado</Text>
          <TouchableOpacity
            className="bg-purple-700 p-2 rounded-full"
            style={{
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            }}
          >
            <Settings size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Linha de estatísticas */}
        <View className="flex-row justify-between items-center">
          {/* XP / Pontos */}
          <TouchableOpacity className="items-center bg-purple-700 px-3 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Trophy size={18} color="#FFD700" />
              <Text className="text-white font-bold ml-1">{points} XP</Text>
            </View>
          </TouchableOpacity>

          {/* Streak */}
          <TouchableOpacity className="items-center bg-purple-700 px-3 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Target size={18} color="#FF4500" />
              <Text className="text-white font-bold ml-1">{streak} dias</Text>
            </View>
          </TouchableOpacity>

          {/* Gemas */}
          <TouchableOpacity className="items-center bg-purple-700 px-3 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Diamond size={18} color="#1E90FF" />
              <Text className="text-white font-bold ml-1">{gems}</Text>
            </View>
          </TouchableOpacity>

          {/* Vidas */}
          <TouchableOpacity className="items-center bg-purple-700 px-3 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Heart size={18} color="#FF69B4" />
              <Text className="text-white font-bold ml-1">{lives}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}

const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0)
  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  // Estatísticas do usuário para o cabeçalho
  const [userStats, setUserStats] = useState({
    points: 1250,
    streak: 7,
    gems: 45,
    lives: 5,
  })

  // Dados reais das trilhas
  const currentTrilha = trilhas[trilhaAtualIndex]
  const stages = currentTrilha.etapas.map((etapa, index) => ({
    number: index + 1,
    title: etapa.titulo,
    completed: etapa.concluida,
    icon: etapa.icone || "crown", // Valor padrão caso não tenha ícone
    description: etapa.descricao || "Descrição da etapa não disponível", // Descrição da etapa
  }))

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
    // Aqui você pode adicionar navegação para a tela de conteúdo da etapa

    // Simulação de ganho de pontos ao clicar em uma etapa
    if (!stages[index].completed) {
      setUserStats((prev) => ({
        ...prev,
        points: prev.points + 10,
      }))
    }
  }

  const handleNextTrilha = () => {
    if (trilhaAtualIndex < trilhas.length - 1) {
      setTrilhaAtualIndex(trilhaAtualIndex + 1)
      setEtapaAtualIndex(0)
    }
  }

  const handlePreviousTrilha = () => {
    if (trilhaAtualIndex > 0) {
      setTrilhaAtualIndex(trilhaAtualIndex - 1)
      setEtapaAtualIndex(0)
    }
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-pink-100 to-purple-100">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Cabeçalho estilo Duolingo com sombra aprimorada */}
      <DuolingoHeader
        points={userStats.points}
        streak={userStats.streak}
        gems={userStats.gems}
        lives={userStats.lives}
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
          disabled={trilhaAtualIndex === 0}
          style={{
            opacity: trilhaAtualIndex === 0 ? 0.5 : 1,
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
          <View className="bg-purple-700 px-4 py-1 rounded-full">
            <Text className="text-white font-bold">
              {etapaAtualIndex + 1} / {stages.length}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNextTrilha}
          className="bg-purple-700 p-3 rounded-full"
          disabled={trilhaAtualIndex === trilhas.length - 1}
          style={{
            opacity: trilhaAtualIndex === trilhas.length - 1 ? 0.5 : 1,
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

      {/* Conteúdo principal com trilha de aprendizado - agora com padding na parte inferior para começar acima da barra de navegação */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerClassName="items-center px-4 pb-24 pt-6" // Padding inferior para dar espaço à barra de navegação
        showsVerticalScrollIndicator={false}
      >
        <LearningPathTrack stages={stages} currentStage={etapaAtualIndex} onStagePress={handleStagePress} />
        <View style={{ height: 100 }} /> {/* Espaço reservado para a barra de navegação */}
      </ScrollView>
    </View>
  )
}

export default Home

