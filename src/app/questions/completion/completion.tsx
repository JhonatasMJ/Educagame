"use client"

import { useEffect, useRef } from "react"
import { View, Text, SafeAreaView, Animated, StatusBar, ScrollView } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { useLocalSearchParams } from "expo-router"
import { Clock, Award, Star, ChevronRight } from "lucide-react-native"
import Confetti from "react-native-confetti"
import { useAuth } from "@/src/context/AuthContext"
import BigAvatar1 from "../../../../assets/images/grande-avatar1.svg"
import BigAvatar2 from "../../../../assets/images/grande-avatar2.svg"
import BigAvatar3 from "../../../../assets/images/grande-avatar3.svg"
import BigAvatar4 from "../../../../assets/images/grande-avatar4.svg"
import React from "react"
import { avatarSize } from "@/src/utils/layoutHelpers"

const CompletionPage = () => {
  const params = useLocalSearchParams()
  const totalTime = Number.parseInt((params.totalTime as string) || "0")
  const wrongAnswers = Number.parseInt((params.wrongAnswers as string) || "0")
  const { userData } = useAuth()

  // Avatar components mapping
  const avatarComponents = {
    avatar1: BigAvatar1,
    avatar2: BigAvatar2,
    avatar3: BigAvatar3,
    avatar4: BigAvatar4,
  }

  // Get user's avatar source or default to avatar1
  const avatarSource = userData?.avatarSource || "avatar1"
  const AvatarComponent = avatarComponents[avatarSource as keyof typeof avatarComponents] || BigAvatar1

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

  // Obter pontos totais do usuário
  const userTotalPoints = userData?.points || 0

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Start animations when component mounts
  useEffect(() => {
    // Start confetti
    if (confettiRef.current && typeof confettiRef.current === 'object' && 'startConfetti' in confettiRef.current) {
      (confettiRef.current as { startConfetti: () => void }).startConfetti()
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
      if (confettiRef.current && typeof confettiRef.current === 'object' && 'stopConfetti' in confettiRef.current) {
        (confettiRef.current as { stopConfetti: () => void }).stopConfetti()
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [])
  return (
    <SafeAreaView className="flex-1 bg-[#f0f8ff]">
      <StatusBar barStyle={"dark-content"} backgroundColor="#F6A608" translucent={false} />
      <Confetti ref={confettiRef} />

      {/* Header */}
      <View className="w-full bg-secondary py-4 items-center shadow-md">
        <Text className="text-white text-xl font-bold">Fase Concluída</Text>
      </View>
      
      <ScrollView className="px-6 flex-1" contentContainerStyle={{justifyContent: 'center', alignItems:"center"}}>
        <Animated.View
          className="items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          }}
        >

<View className="mb-3 mt-6 items-center">
            <View className="w-42 h-42 rounded-full  items-center justify-center bg-primary border-4 border-blue-900  shadow-lg overflow-hidden">
              <AvatarComponent width={avatarSize()} height={avatarSize()} />
            </View>
            <View className=" bg-primary px-4 py-1 rounded-full shadow-md">
              <Text className="text-white font-bold text-sm">CONCLUÍDO</Text>
            </View>
          </View>
  

          {/* Congratulations with user name */}
          <Text className="text-3xl font-bold text-green-600 mb-2 text-center">Parabéns, {userData?.nome || "Aluno"}!</Text>
          <Text className="text-xl text-gray-800 mb-4 text-center">Você completou esta fase!</Text>

          <View className="flex-row mb-4 justify-center">
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


          <View className="flex-row justify-between w-full mb-8 gap-4 ">
            <View className="bg-white rounded-2xl  p-4 items-center shadow-md border border-gray-100 flex-1 ">
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Award size={24} color="#4361ee" />
              </View>
              <Text className="text-2xl font-bold text-[#4361ee]">+{totalPoints}</Text>
              <Text className="text-gray-500 text-sm">Pontos</Text>
       
            </View>

            <View className="bg-white rounded-2xl p-4 items-center shadow-md border border-gray-100 flex-1 ">
              <View className="w-12 h-12 rounded-full bg-emerald-400/30 items-center justify-center mb-2">
                <Clock size={24} color="#0c9164" />
              </View>
              <Text className="text-2xl font-bold ">{formatTime(totalTime)}</Text>
              <Text className="text-gray-500 text-sm">Tempo</Text>
            </View>

           
          </View>

      
            
        </Animated.View>
        <View style={{height: 70}} />
      </ScrollView>

    
      <View className=" py-4 absolute bottom-0 w-full bg-white border-t flex-row border-gray-200 justify-center">
        <View className="flex-row w-[80%] justify-between items-center">
        <CustomButton
          title="CONTINUAR APRENDIZADO"
          nextStep="../../(tabs)/home"
          className="bg-primary shadow-md justify-center "
          textClassName="tracking-wide"
        />
        <View className="absolute right-0 top-0 px-1 ml-2 h-full flex justify-center items-center">
          <ChevronRight size={26} color="#fff" />
        </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default CompletionPage