"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Pressable,
} from "react-native"
import {
  X,
  Award,
  Target,
  Flame,
  Clock,
  Star,
  CheckCircle,
  TrendingUp,
} from "lucide-react-native"

interface RegrasProps {
  visible: boolean
  onClose: () => void
}

const { width, height } = Dimensions.get("window")
const modalWidth = Math.min(width * 0.92, 420)

const Regras = ({ visible, onClose }: RegrasProps) => {
  const [activeTab, setActiveTab] = useState("points")
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const tabs = [
    { id: "points", title: "Pontos", icon: <Award size={20} color="#FFD700" /> },
    { id: "streaks", title: "Sequências", icon: <Target size={20} color="#FF4500" /> },
    { id: "bonuses", title: "Bônus", icon: <Star size={20} color="#FFC107" /> },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "points":
        return <PointsTab />
      case "streaks":
        return <StreaksTab />
      case "bonuses":
        return <BonusesTab />
      default:
        return <PointsTab />
    }
  }

  return (
    <Modal visible={visible} transparent={true} animationType="none" statusBarTranslucent={true}>
      <Pressable
        className="flex-1 justify-center items-center bg-black/60"
        onPress={onClose}
      >
        <Animated.View
          className="rounded-3xl overflow-hidden"
          style={{
            width: modalWidth,
            maxHeight: height * 0.85,
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="px-5 py-6 rounded-t-3xl bg-primary">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white text-xs font-medium uppercase tracking-wider opacity-80">
                    Sistema de Pontuação
                  </Text>
                  <Text className="text-white text-2xl font-bold mt-1">Como Ganhar Pontos</Text>
                </View>
                <TouchableOpacity
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md justify-center items-center"
                  onPress={onClose}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-white">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 px-2 border-b border-gray-100"
              >
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 mx-1 rounded-full flex-row items-center ${
                      activeTab === tab.id
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <View className="mr-2">{tab.icon}</View>
                    <Text
                      className={`font-medium ${
                        activeTab === tab.id ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {tab.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="bg-white">{renderTabContent()}</View>

            <View className="p-4 border-t rounded-b-xl border-gray-100 bg-white">
              <TouchableOpacity
                className="w-full py-3 rounded-xl bg-secondary flex-row justify-center items-center"
                onPress={onClose}
              >
                <Text className="text-white font-bold text-base">Entendi</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}

const PointsTab = () => (
  <ScrollView className="p-5 max-h-[400px]" showsVerticalScrollIndicator={false}>
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mr-3">
          <Award size={24} color="#FFD700" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-800">Onocash</Text>
          <Text className="text-xs text-gray-500">Moeda do jogo</Text>
        </View>
      </View>

      <Text className="text-sm text-gray-600 mb-4 leading-5">
        Onocash são os pontos que você acumula ao completar atividades e responder corretamente às questões.
      </Text>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <View className="p-4 border-b border-gray-100 flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
            <CheckCircle size={16} color="#22c55e" />
          </View>
          <View>
            <Text className="font-medium text-gray-800">Resposta Correta</Text>
            <Text className="text-green-600 font-bold">+10 pontos</Text>
          </View>
        </View>

        <View className="p-4 border-b border-gray-100 flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
            <CheckCircle size={16} color="#3b82f6" />
          </View>
          <View>
            <Text className="font-medium text-gray-800">Fase Completada</Text>
            <Text className="text-blue-600 font-bold">+50 pontos</Text>
          </View>
        </View>

        <View className="p-4 flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center mr-3">
            <TrendingUp size={16} color="#f59e0b" />
          </View>
          <View>
            <Text className="font-medium text-gray-800">Resposta Rápida</Text>
            <Text className="text-amber-600 font-bold">Bônus de 2x (menos de 10s)</Text>
          </View>
        </View>
      </View>
    </View>

    <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
      <Text className="text-blue-800 text-sm leading-5">
        Quanto mais você estuda e responde corretamente, mais Onocash você acumula para subir no ranking!
      </Text>
    </View>
  </ScrollView>
)

const StreaksTab = () => (
  <ScrollView className="p-5 max-h-[400px]" showsVerticalScrollIndicator={false}>
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mr-3">
          <Target size={24} color="#FF4500" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-800">Dias Consecutivos</Text>
          <Text className="text-xs text-gray-500">Mantenha sua sequência</Text>
        </View>
      </View>

      <Text className="text-sm text-gray-600 mb-4 leading-5">
        Mantenha uma sequência de dias estudando para ganhar bônus especiais e multiplicadores de pontos.
      </Text>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <View className="p-4 border-b border-gray-100 flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
            <CheckCircle size={16} color="#22c55e" />
          </View>
          <View>
            <Text className="font-medium text-gray-800">Dia de Estudo</Text>
            <Text className="text-green-600 font-bold">+5 pontos</Text>
          </View>
        </View>

        <View className="p-4 flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
            <Target size={16} color="#3b82f6" />
          </View>
          <View>
            <Text className="font-medium text-gray-800">7 Dias Consecutivos</Text>
            <Text className="text-blue-600 font-bold">+25 pontos bônus</Text>
          </View>
        </View>
      </View>
    </View>

    <View className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
      <Text className="text-orange-800 text-sm leading-5">
        Não perca sua sequência! Estude pelo menos uma vez por dia para manter seu progresso.
      </Text>
    </View>
  </ScrollView>
)

const BonusesTab = () => (
  <ScrollView className="p-5 max-h-[400px]" showsVerticalScrollIndicator={false}>
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
          <Clock size={24} color="#2196F3" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-800">Bônus de Tempo</Text>
          <Text className="text-xs text-gray-500">Seja rápido, ganhe mais</Text>
        </View>
      </View>

      <Text className="text-sm text-gray-600 mb-4 leading-5">
        Quanto mais rápido você responder, mais pontos extras você ganha.
      </Text>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <View className="p-4 border-b border-gray-100 flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
            <Clock size={16} color="#3b82f6" />
          </View>
          <View>
            <Text className="font-medium text-gray-800">Resposta em menos de 5s</Text>
            <Text className="text-blue-600 font-bold">+5 pontos extras</Text>
          </View>
        </View>

        <View className="p-4 flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-3">
            <Clock size={16} color="#6366f1" />
          </View>
          <View>
            <Text className="font-medium text-gray-800">Fase em menos de 2 min</Text>
            <Text className="text-indigo-600 font-bold">+20 pontos extras</Text>
          </View>
        </View>
      </View>
    </View>

    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mr-3">
          <Flame size={24} color="#FF4500" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-800">Acertos Consecutivos</Text>
          <Text className="text-xs text-gray-500">Aumente seu multiplicador</Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <View className="p-4 border-b border-gray-100 flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center mr-3">
            <Flame size={16} color="#f59e0b" />
          </View>
          <View>
            <Text className="font-medium text-gray-800">5 acertos consecutivos</Text>
            <Text className="text-amber-600 font-bold">multiplicador 1.5x</Text>
          </View>
        </View>

        <View className="p-4 flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
            <Flame size={16} color="#ef4444" />
          </View>
          <View>
            <Text className="font-medium text-gray-800">10 acertos consecutivos</Text>
            <Text className="text-red-600 font-bold">multiplicador 2x</Text>
          </View>
        </View>
      </View>
    </View>
  </ScrollView>
)

export default Regras
