import { View, Text, TouchableOpacity, Animated } from "react-native"
import { Menu, Trophy, Target, Heart } from "lucide-react-native"
import React from "react"

interface DuolingoHeaderProps {
  points: number
  streak: number
  lives: number
  nome: string
  scrollY: Animated.Value
  selectedQuestion?: {
    titulo: string
    descricao: string
  } | null
}

const DuolingoHeader = ({ points, streak, lives, nome, scrollY, selectedQuestion }: DuolingoHeaderProps) => {
  // Animation values for header transformation
  const titleHeight = 60 // Height of the title section that will hide

  // Calculate opacity for the title section
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  })

  // Calculate height for the title section
  const titleHeight_animated = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [titleHeight, 0],
    extrapolate: "clamp",
  })

  // Calculate margin for spacing
  const titleMargin = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [16, 0],
    extrapolate: "clamp",
  })

  return (
    <View
      className="bg-secondary pt-4 pb-4 px-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 10,
      }}
    >
      <Animated.View
        className="flex-row justify-between items-center"
        style={{
          opacity: titleOpacity,
          height: titleHeight_animated,
          marginBottom: titleMargin,
          overflow: "hidden",
        }}
      >
        {selectedQuestion ? (
          <View className="flex-1 mr-2">
            <Text className="text-xl font-bold text-white" numberOfLines={1}>
              {selectedQuestion.titulo}
            </Text>
            <Text className="text-sm text-white opacity-80" numberOfLines={1}>
              {selectedQuestion.descricao}
            </Text>
          </View>
        ) : (
          <Text className="text-2xl font-bold text-white">{nome}</Text>
        )}

        <TouchableOpacity className="bg-tertiary p-3 rounded-lg">
          <Menu size={20} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Linha de estatísticas - sempre visível e não se move */}
      <View className="flex-row justify-between items-center">
        {/* XP / Pontos */}
        <TouchableOpacity className="items-center bg-primary px-3 py-2 rounded-xl">
          <View className="flex-row items-center">
            <Trophy size={20} color="#FFD700" />
            <Text className="text-white font-bold ml-1">{points} Onocash</Text>
          </View>
        </TouchableOpacity>

        {/* Streak */}
        <TouchableOpacity className="items-center bg-primary px-3 py-2 rounded-xl">
          <View className="flex-row items-center">
            <Target size={20} color="#FF4500" />
            <Text className="text-white font-bold ml-1">{streak} dias</Text>
          </View>
        </TouchableOpacity>

        {/* Vidas */}
        <TouchableOpacity className="items-center bg-primary px-3 py-2 rounded-xl">
          <View className="flex-row items-center">
            <Heart size={20} color="#FF4500" />
            <Text className="text-white font-bold ml-1">{lives}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default DuolingoHeader

