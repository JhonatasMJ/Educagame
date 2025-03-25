"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Text, View, SafeAreaView, Image, ScrollView, Animated, Dimensions } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { Video, ResizeMode } from "expo-av"
import { useLocalSearchParams } from "expo-router"
import { ArrowRight, BookOpen, CheckCircle, Clock, Info, Star } from "lucide-react-native"

interface StartPhaseProps {
  title?: string
  subTitle?: string
  description?: string
  image?: string
  video?: string
  additionalFeature?: React.ReactNode
  nextStep?: string
}

const StartPhase = ({
  title: propTitle,
  subTitle,
  description: propDescription,
  image,
  video,
  additionalFeature,
  nextStep = "/question/trueORfalse",
}: StartPhaseProps) => {
  const params = useLocalSearchParams()

  // Use props or params
  const title = propTitle || (params.title as string)
  const description = propDescription || (params.description as string)
  const phaseId = params.phaseId as string

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0]
  const slideAnim = useState(new Animated.Value(50))[0]

  const screenWidth = Dimensions.get("window").width

  // Estimated time to complete (mock data)
  const estimatedTime = "5-10 minutos"

  // Phase number (mock data - could be derived from phaseId)
  const phaseNumber = Number.parseInt(phaseId) || 1
  const totalPhases = 5

  // Key points (mock data)
  const keyPoints = [
    "Compreender os conceitos básicos",
    "Aplicar o conhecimento na prática",
    "Desenvolver habilidades essenciais",
  ]

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1">
        <ScrollView className="flex-1 pb-20">
          <Animated.View
            className="flex-1 items-center justify-between"
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            {/* Header Section */}
            <View className="w-full">
              <View className="w-full bg-secondary py-10 border-b-4 border-tertiary items-center justify-center">
                <View className="absolute top-3 left-3 bg-tertiary rounded-full p-2">
                  <BookOpen size={24} color="#fff" />
                </View>
                <Text className="text-3xl font-bold text-white text-center px-5">{title}</Text>
              </View>

              {subTitle && (
                <View className="w-full bg-[#31C7ED] py-3 items-center justify-center border-b-2 border-[#28a8c9]">
                  <Text className="text-xl font-semibold text-white text-center px-5">{subTitle}</Text>
                </View>
              )}

              {/* Time estimate */}
              <View className="w-full flex-row items-center justify-center py-3 bg-white border-b border-gray-200">
                <Clock size={18} color="#666" />
                <Text className="text-sm text-gray-700 ml-2">Tempo estimado: {estimatedTime}</Text>
              </View>
            </View>

            {/* Content Section */}
            <View className="flex-1 w-full px-6 items-center my-4">
              {image && (
                <View className="w-full items-center mb-5 rounded-xl overflow-hidden shadow-lg">
                  <Image source={{ uri: image }} className="w-full h-52 rounded-xl" resizeMode="cover" />
                  <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-2 px-3">
                    <Text className="text-white text-sm font-medium">Imagem ilustrativa</Text>
                  </View>
                </View>
              )}

              {video && (
                <View className="w-full mb-5 rounded-xl overflow-hidden shadow-lg">
                  <Video
                    source={{ uri: video }}
                    className="w-full h-52 rounded-xl"
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                  />
                </View>
              )}

              <View className="w-full bg-[#f8f9fa] p-5 rounded-xl mb-5 border border-gray-200">
                <View className="flex-row items-center mb-3">
                  <Star size={20} color="#FFD700" />
                  <Text className="text-lg font-bold text-gray-800 ml-2">Pontos-chave</Text>
                </View>
                {keyPoints.map((point, index) => (
                  <View key={index} className="flex-row items-start mt-2">
                    <CheckCircle size={18} color="#56A6DC" className="mt-0.5" />
                    <Text className="text-base text-gray-700 ml-2 flex-1">{point}</Text>
                  </View>
                ))}
              </View>

              {additionalFeature}

              {description && (
                <View className="w-full bg-white p-5 rounded-xl mb-5 shadow-sm border border-gray-100">
                  <View className="flex-row items-center mb-3">
                    <Info size={20} color="#56A6DC" />
                    <Text className="text-lg font-bold text-gray-800 ml-2">Descrição</Text>
                  </View>
                  <Text className="text-base text-gray-800 leading-6">{description}</Text>
                </View>
              )}

              {/* Additional tips section */}
              <View className="w-full bg-[#FFF8E1] p-5 rounded-xl mb-5 border border-[#FFE082]">
                <Text className="text-lg font-bold text-[#F57C00] mb-2">Dica importante</Text>
                <Text className="text-base text-[#795548]">
                  Leia com atenção todo o conteúdo antes de prosseguir. Isso ajudará você a responder corretamente as
                  perguntas na próxima etapa.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Fixed Button Section at the bottom */}
        <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-primary border-t border-gray-200">
          <View className="relative">
            <CustomButton
              title="CONTINUAR"
              nextStep={`../trueORfalse/trueORfalse?phaseId=${phaseId}`}
              className="bg-secondary shadow-md"
              textClassName="tracking-wide"
            />
            <View className="absolute right-10 top-0 h-full flex justify-center items-center">
              <ArrowRight size={24} color="#fff" />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default StartPhase

