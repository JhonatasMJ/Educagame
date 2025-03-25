import { router } from "expo-router"
import React from "react"
import { TouchableOpacity, Text, View, Alert } from "react-native"

interface CustomButtonProps {
  nextStep?: `/${string}` | (string & {})
  validation?: {
    isValid: boolean
    message: string
  }
  params?: Record<string, any>
  onPress?: () => void
  title: string
  className?: string // Permite passar classes do Tailwind
  textClassName?: string // Permite personalizar o texto
}

const CustomButton = ({
  nextStep,
  validation,
  params,
  onPress,
  title,
  className,
  textClassName,
}: CustomButtonProps) => {
  const goToNextStep = () => {
    if (onPress) {
      onPress()
    } else {
      if (validation) {
        if (validation.isValid) {
          router.push({
            pathname: nextStep as any,
            params: params,
          })
        } else {
          Alert.alert(validation.message)
        }
      } else {
        router.push({
          pathname: nextStep as any,
          params: params,
        })
      }
    }
  }

  return (
    <View className="items-center justify-center">
      <TouchableOpacity
        className={`w-[350px] h-[52px] bg-[#56A6DC] items-center justify-center rounded-xl ${className}`}
        onPress={goToNextStep}
      >
        <Text className={`text-white text-xl font-bold ${textClassName}`}>{title}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CustomButton

