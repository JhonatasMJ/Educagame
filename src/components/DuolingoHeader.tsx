"use client"

import { View, Text, TouchableOpacity, Animated } from "react-native"
import { Menu, Trophy, Target, Flame } from "lucide-react-native"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import Regras from "./Regras"
import React from "react"

interface DuolingoHeaderProps {
  nome: string
  scrollY: Animated.Value
  selectedQuestion?: {
    titulo: string
    descricao: string
  } | null
}

interface User {
  id?: string
  name?: string
  points: number // Alterado de result para points
  avatarSource?: string
  hours: number
  consecutiveDays: number
  consecutiveCorrect: number
  totalConsecutiveDays: number
}

const DuolingoHeader = ({ nome, scrollY, selectedQuestion }: DuolingoHeaderProps) => {
  const { userData, authUser, getAllUsers } = useAuth()
  const [showRulesModal, setShowRulesModal] = useState(false)

  const userDetailsData: User = {
    points: userData?.points || 0,
    hours: 120,
    consecutiveDays: 25,
    consecutiveCorrect: 10,
    totalConsecutiveDays: 120,
    id: "",
    name: "",
    avatarSource: "",
  }

  // Function to toggle the rules modal
  const toggleRulesModal = () => {
    setShowRulesModal(!showRulesModal)
  }

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
          overflow: "hidden", // Prevent content from showing outside the animated height
        }}
      >
        <Text className="text-2xl font-bold text-white capitalize">{nome}</Text>
        {/* Menu button with onPress handler */}
        <TouchableOpacity
          className="bg-tertiary p-2 rounded-lg"
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
          onPress={toggleRulesModal}
        >
          <Menu size={20} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Linha de estatísticas - sempre visível e não se move */}
      <View className="flex-row justify-between items-center">
        {/* XP / Pontos */}
        <TouchableOpacity className="items-center bg-primary px-3 py-2 rounded-xl" onPress={toggleRulesModal}>
          <View className="flex-row items-center">
            <Trophy size={20} color="#FFD700" />
            <Text className="text-white font-bold ml-1">{userDetailsData.points} Onocash</Text>
          </View>
        </TouchableOpacity>

        {/* Streak */}
        <TouchableOpacity className="items-center bg-primary px-3 py-2 rounded-xl" onPress={toggleRulesModal}>
          <View className="flex-row items-center">
            <Target size={20} color="#FF4500" />
            <Text className="text-white font-bold ml-1">{userDetailsData.consecutiveDays} dias</Text>
          </View>
        </TouchableOpacity>

        {/* Acertos consecutivos */}
        <TouchableOpacity className="items-center bg-primary px-3 py-2 rounded-xl" onPress={toggleRulesModal}>
          <View className="flex-row items-center">
            <Flame size={20} color="#FF4500" />
            <Text className="text-white font-bold ml-1">{userDetailsData.consecutiveCorrect}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Scoring Rules Modal */}
      <Regras visible={showRulesModal} onClose={() => setShowRulesModal(false)} />
    </View>
  )
}

export default DuolingoHeader