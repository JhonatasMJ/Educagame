"use client"

import { useEffect, useRef } from "react"
import { View, Text, Pressable, Animated, Easing } from "react-native"
import { Crown, Zap, Target, BookOpen, Lock } from "lucide-react-native"
import React from "react"

interface LessonBubbleProps {
  number: number
  isActive: boolean
  isCompleted: boolean
  isNext: boolean
  onPress: () => void
  title: string
  icon: "crown" | "zap" | "target" | "book"
  description?: string
}

const LessonBubble = ({
  number,
  isActive,
  isCompleted,
  isNext,
  onPress,
  title,
  icon,
  description,
}: LessonBubbleProps) => {
  const bubbleSize = 80
  const numberSize = 30

  // Valor de animação apenas para a próxima etapa
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Função para renderizar o ícone correto
  const renderIcon = () => {
    // If not completed, show lock icon
    if (!isCompleted && !isActive && !isNext) {
      return <Lock size={24} color="white" />
    }

    // Otherwise show the lesson icon
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
        return <Crown size={24} color="white" />
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

  // Determine background color based on completion status
  const getBubbleBackgroundColor = () => {
    if (isCompleted) {
      return "bg-[#83AD11]" // Using the exact color provided
    } else if (isActive || isNext) {
      return "bg-purple-600" // Purple for active or next
    } else {
      return "bg-gray-500" // Gray for locked/uncompleted
    }
  }

  // Get border style based on active state and background color
  const getBorderStyle = () => {
    if (!isActive) return ""

    if (isCompleted) {
      return "border-4 border-[#5A7A0C]" // Darker green for completed
    } else if (isNext) {
      return "border-4 border-purple-800" // Darker purple for next
    } else {
      return "border-4 border-gray-700" // Darker gray for others
    }
  }

  return (
    <Pressable onPress={onPress} className="stage-bubble">
      <Animated.View
        className="items-center my-8 relative"
        style={{
          transform: [{ scale: isNext ? pulseAnim : 1 }],
        }}
      >
        <View className="items-center">
          {/* 3D effect base layer */}
          <View
            className={`absolute rounded-full ${isCompleted ? "bg-green" : "bg-gray-700"}`}
            style={{
              width: bubbleSize + 8,
              height: bubbleSize + 8,
              top: 6, // Offset to create 3D effect
              zIndex: 0,
              borderRadius: (bubbleSize + 8) / 2,
            }}
          />

          {/* Contêiner principal com borda condicional */}
          <View
            className={`items-center justify-center rounded-full ${getBubbleBackgroundColor()} ${getBorderStyle()}`}
            style={{
              width: bubbleSize + 8,
              height: bubbleSize + 8,
              zIndex: 2,
              elevation: 4,
              shadowColor: "#86a531",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            }}
          >
            <View className="items-center justify-center">{renderIcon()}</View>

            {isCompleted && (
              <View className="bg-green-700 absolute top-0 right-0 w-6 h-6 rounded-full items-center justify-center">
                <Text className="text-white font-bold">✓</Text>
              </View>
            )}
          </View>

          <View
            className="bg-secondary rounded-full absolute items-center justify-center z-10"
            style={{
              width: numberSize,
              height: numberSize,
              top: -2,
              elevation: 6,
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
              className= "bg-secondary px-3 py-1 rounded-lg mb-2 w-full"
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

            {/* {description && (
              <View
                className={`${isCompleted ? "bg-green-600/80" : "bg-purple-600/80"} px-3 py-1 rounded-lg w-full`}
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
            )} */}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  )
}

export default LessonBubble

