"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, Dimensions, Platform, StatusBar, ScrollView, Pressable, StyleSheet } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { trilhas } from "@/src/dados"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

const LessonBubble = ({
  number,
  isActive,
  isCompleted,
  onPress,
  title,
}: {
  number: number
  isActive: boolean
  isCompleted: boolean
  onPress: () => void
  title: string
}) => {
  const bubbleSize = 80
  const numberSize = 30

  // Cores para efeito 3D
  const baseColor = isCompleted ? "#10b981" : "#f97316" // Verde para completo, laranja para incompleto
  const shadowColor = isCompleted ? "#059669" : "#ea580c" // Sombra mais escura para efeito 3D
  const highlightColor = isCompleted ? "#34d399" : "#fdba74" // Destaque mais claro para efeito 3D

  return (
    <Pressable onPress={onPress} className="stage-bubble">
      <View className="items-center my-6 relative">
        {/* Sombra para efeito 3D */}
        <View
          style={{
            position: 'absolute',
            width: bubbleSize + 16,
            height: bubbleSize + 16,
            borderRadius: (bubbleSize + 16) / 2,
            backgroundColor: 'rgba(0,0,0,0.2)',
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

        {/* Título da etapa */}
        <View 
          className="absolute bg-purple-700 px-3 py-1 rounded-lg"
          style={{ 
            left: bubbleSize + 10, 
            maxWidth: 180,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
          }}
        >
          <Text className="text-white font-medium text-sm" numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

const LearningPathTrack = ({
  stages,
  currentStage,
  onStagePress,
}: {
  stages: Array<{ number: number; completed: boolean; title: string }>
  currentStage: number
  onStagePress: (index: number) => void
}) => {
  return (
    <View className="items-center">
      {/* Trilha de fundo contínua */}
      <View 
        className="absolute bg-purple-300" 
        style={{ 
          width: 8, 
          height: '100%',
          borderRadius: 4,
          zIndex: 1,
        }} 
      />
      
      {/* Trilha de progresso */}
      <View 
        className="absolute bg-purple-700" 
        style={{ 
          width: 8, 
          height: `${Math.max((stages.filter(s => s.completed).length / stages.length) * 100, 10)}%`,
          borderRadius: 4,
          zIndex: 2,
        }} 
      />

      {/* Estágios */}
      {stages.map((stage, index) => (
        <View key={index} className="items-center z-10">
          <LessonBubble
            number={stage.number}
            isActive={currentStage === index}
            isCompleted={stage.completed}
            onPress={() => onStagePress(index)}
            title={stage.title}
          />
          
          {/* Espaço entre bolhas */}
          {index < stages.length - 1 && (
            <View style={{ height: 40 }} />
          )}
        </View>
      ))}
    </View>
  )
}

const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0)
  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  // Dados reais das trilhas
  const currentTrilha = trilhas[trilhaAtualIndex]
  const stages = currentTrilha.etapas.map((etapa, index) => ({
    number: index + 1,
    title: etapa.titulo,
    completed: etapa.concluida,
  }))

  // Scroll para a etapa atual quando mudar
  useEffect(() => {
    if (scrollViewRef.current) {
      if (Platform.OS !== "web") {
        // Para dispositivos móveis
        setTimeout(() => {
          const position = etapaAtualIndex * 150
          scrollViewRef.current?.scrollTo({ y: position, animated: true })
        }, 300)
      } else {
        // Para web
        setTimeout(() => {
          const elements = document.querySelectorAll(".stage-bubble")
          if (elements && elements[etapaAtualIndex]) {
            elements[etapaAtualIndex].scrollIntoView({
              behavior: "smooth",
              block: "center",
            })
          }
        }, 300)
      }
    }
  }, [etapaAtualIndex])

  const handleStagePress = (index: number) => {
    setEtapaAtualIndex(index)
    // Aqui você pode adicionar navegação para a tela de conteúdo da etapa
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

      {/* Cabeçalho com título da trilha */}
      <View className="bg-purple-800 pt-12 pb-4 px-4 items-center">
        <Text className="text-2xl font-bold text-white">{currentTrilha.nome}</Text>
        <Text className="text-sm text-purple-200 text-center mt-1">{currentTrilha.descricao}</Text>
      </View>

      {/* Conteúdo principal com trilha de aprendizado */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerClassName="items-center py-10 px-4"
        showsVerticalScrollIndicator={false}
      >
        <LearningPathTrack 
          stages={stages} 
          currentStage={etapaAtualIndex} 
          onStagePress={handleStagePress} 
        />
      </ScrollView>

      {/* Barra de navegação inferior */}
      <View className="bg-purple-800 px-4 py-4 flex-row justify-between items-center">
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

        <View className="bg-purple-700 px-4 py-2 rounded-full">
          <Text className="text-white font-bold">
            {etapaAtualIndex + 1} / {stages.length}
          </Text>
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
    </View>
  )
}

export default Home
