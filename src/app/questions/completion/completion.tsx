"use client"

import { useEffect, useRef } from "react"
import { View, Text, SafeAreaView, Animated, StatusBar, ScrollView, Dimensions } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { useLocalSearchParams } from "expo-router"
import { Clock, Award, Target, Star, Trophy, ChevronRight } from "lucide-react-native"
import Confetti from "react-native-confetti"
import React from "react"

const CompletionPage = () => {
  const params = useLocalSearchParams()
  const totalTime = Number.parseInt((params.totalTime as string) || "0")
  const wrongAnswers = Number.parseInt((params.wrongAnswers as string) || "0")
  const { width } = Dimensions.get("window")

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
      <StatusBar barStyle={"dark-content"} backgroundColor="#4361ee" translucent={false} />
      <Confetti ref={confettiRef} />

      {/* Header - Fixed at top */}
      <View className="w-full bg-[#4361ee] py-4 items-center shadow-md">
        <Text className="text-white text-xl font-bold">Fase Concluída</Text>
      </View>

      {/* Scrollable content with better centering */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-5 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          className="items-center justify-center"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          }}
        >
          <View className="w-full justify-center items-center">
            {/* Trophy */}
            <View className="mb-8 items-center">
              <View className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-yellow-100 items-center justify-center border-4 border-yellow-400 shadow-lg">
                <Trophy size={width > 360 ? 60 : 50} color="#FFD700" />
              </View>
              <View className="absolute -bottom-2 bg-[#4361ee] px-4 py-1 rounded-full shadow-md">
                <Text className="text-white font-bold text-sm">CONCLUÍDO</Text>
              </View>
            </View>

            {/* Congratulations text */}
            <Text className="text-2xl md:text-3xl font-bold text-green-600 mb-2">Parabéns!</Text>
            <Text className="text-lg md:text-xl text-gray-800 mb-8 text-center">Você completou esta fase!</Text>

            {/* Stars based on performance */}
            <View className="flex-row mb-10">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  size={width > 360 ? 36 : 30}
                  fill={star <= Math.max(3 - wrongAnswers, 1) ? "#FFD700" : "#E5E7EB"}
                  color={star <= Math.max(3 - wrongAnswers, 1) ? "#FFD700" : "#E5E7EB"}
                  className="mx-1"
                />
              ))}
            </View>
          </View>

          {/* Stats cards - Responsive layout */}
          <View className="flex-row justify-between w-full mb-10">
            <View className="bg-white rounded-2xl p-3 md:p-4 items-center shadow-md border border-gray-100 flex-1 mx-1">
              <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Award size={width > 360 ? 24 : 20} color="#4361ee" />
              </View>
              <Text className="text-xl md:text-2xl font-bold text-[#4361ee]">+{totalPoints}</Text>
              <Text className="text-gray-500 text-xs md:text-sm">Pontos</Text>
            </View>

            <View className="bg-white rounded-2xl p-3 md:p-4 items-center shadow-md border border-gray-100 flex-1 mx-1">
              <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                <Clock size={width > 360 ? 24 : 20} color="#10B981" />
              </View>
              <Text className="text-xl md:text-2xl font-bold text-green-600">{formatTime(totalTime)}</Text>
              <Text className="text-gray-500 text-xs md:text-sm">Tempo</Text>
            </View>

            <View className="bg-white rounded-2xl p-3 md:p-4 items-center shadow-md border border-gray-100 flex-1 mx-1">
              <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-100 items-center justify-center mb-2">
                <Target size={width > 360 ? 24 : 20} color="#EF4444" />
              </View>
              <Text className="text-xl md:text-2xl font-bold text-red-500">{wrongAnswers}</Text>
              <Text className="text-gray-500 text-xs md:text-sm">Erros</Text>
            </View>
          </View>

          {/* Message */}
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6 w-full">
            <Text className="text-center text-blue-800">Continue praticando para melhorar suas habilidades!</Text>
          </View>
        </Animated.View>

        {/* Add extra padding at bottom to ensure content isn't hidden behind the button */}
        <View className="h-16" />
      </ScrollView>

      {/* Button - Fixed at bottom */}
      <View className="px-5 py-4 bg-white border-t border-gray-200">
        <CustomButton
          title="CONTINUAR APRENDIZADO"
          nextStep="../../(tabs)/home"
          className="bg-[#4361ee] shadow-md"
          textClassName="tracking-wide"
        />
      </View>
    </SafeAreaView>
  )
}

export default CompletionPage

