import { View, Text, TouchableOpacity, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Menu, Trophy, Target, Heart } from "lucide-react-native"
import React from "react"

interface DuolingoHeaderProps {
  points: number
  streak: number
  lives: number
  nome: string
  scrollY: Animated.Value
}

const DuolingoHeader = ({ points, streak, lives, nome, scrollY }: DuolingoHeaderProps) => {
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
      style={{
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
        {/* Linha superior com título e configurações - animada para desaparecer */}
        <Animated.View
          className="flex-row justify-between items-center"
          style={{
            opacity: titleOpacity,
            height: titleHeight_animated,
            marginBottom: titleMargin,
            overflow: "hidden", // Prevent content from showing outside the animated height
          }}
        >
          <Text className="text-2xl font-bold text-white">{nome}</Text>
          {/* Fixed menu button styling */}
          <TouchableOpacity
            className="bg-purple-700 p-2 rounded-lg"
            style={{
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              right: 0,
            }}
          >
            <Menu size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Linha de estatísticas - sempre visível e não se move */}
        <View className="flex-row justify-between items-center">
          {/* XP / Pontos */}
          <TouchableOpacity className="items-center bg-purple-700 px-3 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Trophy size={18} color="#FFD700" />
              <Text className="text-white font-bold ml-1">{points} Onocash</Text>
            </View>
          </TouchableOpacity>

          {/* Streak */}
          <TouchableOpacity className="items-center bg-purple-700 px-3 py-2 rounded-xl">
            <View className="flex-row items-center">
              <Target size={18} color="#FF4500" />
              <Text className="text-white font-bold ml-1">{streak} dias</Text>
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

export default DuolingoHeader

