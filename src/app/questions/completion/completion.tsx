"use client"

import { useEffect, useRef } from "react"
import { View, Text, SafeAreaView, Animated, StatusBar } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { useLocalSearchParams } from "expo-router"
import { Clock, Award, Target, Star, Trophy, ChevronRight } from "lucide-react-native"
import Confetti from "react-native-confetti"
import React from "react"

const CompletionPage = () => {
  const params = useLocalSearchParams()
  const totalTime = Number.parseInt((params.totalTime as string) || "0")
  const wrongAnswers = Number.parseInt((params.wrongAnswers as string) || "0")

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Confetti ref
  const confettiRef = useRef(null)

  // Calculate points based on time and wrong answers
  const basePoints = 100
  const timeDeduction = Math.floor(totalTime / 10) // Deduct points for time
  const wrongAnswerDeduction = wrongAnswers * 10 // Deduct 10 points per wrong answer
  const totalPoints = Math.max(basePoints - timeDeduction - wrongAnswerDeduction, 10) // Minimum 10 points

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Start animations when component mounts
  useEffect(() => {
    // Start confetti
    if (confettiRef.current) {
      confettiRef.current.startConfetti()
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      if (confettiRef.current) {
        confettiRef.current.stopConfetti()
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-[#f0f8ff]">
      <StatusBar barStyle={"dark-content"} backgroundColor='#4361ee' translucent={false} />
      <Confetti ref={confettiRef} />

      {/* Header */}
      <View className="w-full bg-[#4361ee] py-4 items-center shadow-md">
        <Text className="text-white text-xl font-bold">Fase Concluída</Text>
      </View>

      <View className="flex-1 items-center justify-center px-5">
        <Animated.View
          className="items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          }}
        >
          {/* Trophy */}
          <View className="mb-6 items-center">
            <View className="w-28 h-28 rounded-full bg-yellow-100 items-center justify-center border-4 border-yellow-400 shadow-lg">
              <Trophy size={60} color="#FFD700" />
            </View>
            <View className="absolute -bottom-2 bg-[#4361ee] px-4 py-1 rounded-full shadow-md">
              <Text className="text-white font-bold text-sm">CONCLUÍDO</Text>
            </View>
          </View>

          {/* Congratulations text */}
          <Text className="text-3xl font-bold text-green-600 mb-2">Parabéns!</Text>
          <Text className="text-xl text-gray-800 mb-6">Você completou esta fase!</Text>

          {/* Stars based on performance */}
          <View className="flex-row mb-8">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                size={36}
                fill={star <= Math.max(3 - wrongAnswers, 1) ? "#FFD700" : "#E5E7EB"}
                color={star <= Math.max(3 - wrongAnswers, 1) ? "#FFD700" : "#E5E7EB"}
                className="mx-1"
              />
            ))}
          </View>

          {/* Stats cards */}
          <View className="flex-row justify-between w-full mb-8">
            <View className="bg-white rounded-2xl p-4 items-center shadow-md border border-gray-100 flex-1 mx-1">
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Award size={24} color="#4361ee" />
              </View>
              <Text className="text-2xl font-bold text-[#4361ee]">+{totalPoints}</Text>
              <Text className="text-gray-500 text-sm">Pontos</Text>
            </View>

            <View className="bg-white rounded-2xl p-4 items-center shadow-md border border-gray-100 flex-1 mx-1">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                <Clock size={24} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-green-600">{formatTime(totalTime)}</Text>
              <Text className="text-gray-500 text-sm">Tempo</Text>
            </View>

            <View className="bg-white rounded-2xl p-4 items-center shadow-md border border-gray-100 flex-1 mx-1">
              <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-2">
                <Target size={24} color="#EF4444" />
              </View>
              <Text className="text-2xl font-bold text-red-500">{wrongAnswers}</Text>
              <Text className="text-gray-500 text-sm">Erros</Text>
            </View>
          </View>

          {/* Message */}
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6 w-full">
            <Text className="text-center text-blue-800">Continue praticando para melhorar suas habilidades!</Text>
          </View>
        </Animated.View>
      </View>

      {/* Button */}
      <View className="px-5 py-4 bg-white border-t border-gray-200">
        <CustomButton
          title="CONTINUAR APRENDIZADO"
          nextStep="../../(tabs)/home"
          className="bg-[#4361ee] shadow-md"
          textClassName="tracking-wide"
        />
        <View className="absolute right-10 top-0 h-full flex justify-center items-center">
          <ChevronRight size={24} color="#fff" />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default CompletionPage

