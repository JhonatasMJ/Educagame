"use client"

import { useEffect, useRef } from "react"
import { View, Text, Pressable, Animated, Easing, StyleSheet, Image } from "react-native"
import { Crown, Zap, Target, BookOpen, Lock, BookOpenCheck, BookOpenText } from "lucide-react-native"
import { useGameProgress } from "@/src/context/GameProgressContext"
import Svg, { Circle } from "react-native-svg"
import React from "react"

// Tipos
interface LessonBubbleProps {
  number: number
  isActive: boolean
  isCompleted: boolean
  isNext: boolean
  isLocked?: boolean
  onPress: () => void
  title: string
  icon?: string // Pode ser nome do ícone ou URL de imagem
  description?: string
  phaseId: string
}

// Constantes para dimensões e estilos
const BUBBLE_SIZE = 90
const NUMBER_SIZE = 30
const PROGRESS_RING_SIZE = BUBBLE_SIZE + 35.5
const PROGRESS_RING_THICKNESS = 6
const ICON_SIZE = 24
const DEFAULT_ICON = "book-open-text" // Ícone padrão caso nenhum seja fornecido

// Mapeamento de nomes de ícones para componentes
const ICON_MAP: Record<string, React.ReactNode> = {
  crown: <Crown size={ICON_SIZE} color="white" />,
  zap: <Zap size={ICON_SIZE} color="white" />,
  target: <Target size={ICON_SIZE} color="white" />,
  book: <BookOpen size={ICON_SIZE} color="white" />,
  "book-open": <BookOpen size={ICON_SIZE} color="white" />,
  "book-open-check": <BookOpenCheck size={ICON_SIZE} color="white" />,
  "book-open-text": <BookOpenText size={ICON_SIZE} color="white" />,
  lock: <Lock size={ICON_SIZE} color="white" />,
}

// Componente principal
const LessonBubble = ({
  number,
  isActive,
  isCompleted,
  isNext,
  isLocked = false,
  onPress,
  title,
  icon,
  phaseId,
}: LessonBubbleProps) => {
  // Hooks e estados
  const { getPhaseCompletionPercentage } = useGameProgress()
  const completionPercentage = getPhaseCompletionPercentage(phaseId)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  // Efeito para animação de pulso
  useEffect(() => {
    if (isNext) {
      startPulseAnimation()
    } else {
      stopPulseAnimation()
    }
  }, [isNext])

  // Efeito para animação do anel de progresso
  useEffect(() => {
    animateProgressRing(completionPercentage)
  }, [completionPercentage])

  // Funções de animação
  const startPulseAnimation = () => {
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
  }

  const stopPulseAnimation = () => {
    pulseAnim.setValue(1)
    pulseAnim.stopAnimation()
  }

  const animateProgressRing = (percentage: number) => {
    Animated.timing(progressAnim, {
      toValue: percentage / 100,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }

  // Cálculos para o anel de progresso
  const circumference = 2 * Math.PI * (PROGRESS_RING_SIZE / 2 - PROGRESS_RING_THICKNESS / 2)
  const progressStrokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  })

  return (
    <Pressable onPress={onPress} className="stage-bubble">
      <Animated.View style={[styles.bubbleContainer, { transform: [{ scale: isNext ? pulseAnim : 1 }] }]}>
        <View style={styles.contentContainer}>
          {/* Anel de Progresso */}
          <ProgressRing
            size={PROGRESS_RING_SIZE}
            thickness={PROGRESS_RING_THICKNESS}
            isCompleted={isCompleted}
            circumference={circumference}
            progressStrokeDashoffset={progressStrokeDashoffset}
          />

          {/* Efeito 3D (sombra) */}
          <View
            style={[
              styles.shadowLayer,
              isCompleted ? styles.completedShadow : styles.defaultShadow,
              { width: BUBBLE_SIZE + 8, height: BUBBLE_SIZE + 8, borderRadius: (BUBBLE_SIZE + 8) / 2 },
            ]}
          />

          {/* Bolha Principal */}
          <MainBubble
            size={BUBBLE_SIZE}
            isActive={isActive}
            isCompleted={isCompleted}
            isNext={isNext}
            isLocked={isLocked}
            icon={icon}
          />

          {/* Indicador de Número */}
          <NumberIndicator number={number} size={NUMBER_SIZE} />

          {/* Título */}
          <TitleCard title={title} />
        </View>
      </Animated.View>
    </Pressable>
  )
}

// Componentes auxiliares
const ProgressRing = ({
  size,
  thickness,
  isCompleted,
  circumference,
  progressStrokeDashoffset,
}: {
  size: number
  thickness: number
  isCompleted: boolean
  circumference: number
  progressStrokeDashoffset: Animated.AnimatedInterpolation<string | number>
}) => {
  const progressColor = isCompleted ? "#5A7A0C" : "transparent"
  const AnimatedCircle = Animated.createAnimatedComponent(Circle)

  return (
    <View
      style={[
        styles.progressRingContainer,
        { width: size, height: size, top: -size / 11, elevation: 2, shadowColor: "#000" },
      ]}
    >
      <Svg width={size} height={size} style={styles.progressRingSvg}>
        {/* Círculo de fundo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - thickness / 2}
          stroke="transparent"
          strokeWidth={thickness}
          fill="transparent"
          opacity={0.7}
        />
        {/* Círculo de progresso */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - thickness / 2}
          stroke={progressColor}
          strokeWidth={thickness}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={progressStrokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
    </View>
  )
}

const MainBubble = ({
  size,
  isActive,
  isCompleted,
  isNext,
  isLocked,
  icon,
}: {
  size: number
  isActive: boolean
  isCompleted: boolean
  isNext: boolean
  isLocked?: boolean
  icon?: string
}) => {
  // Determinar a cor de fundo da bolha
  const getBubbleStyle = () => {
    let bgColorClass = "bg-gray-500"
    let borderClass = ""

    if (isCompleted) {
      bgColorClass = "bg-[#83AD11]"
    } else if (isActive || isNext) {
      bgColorClass = "bg-purple-600"
    }

    if (isActive) {
      if (isCompleted) {
        borderClass = "border-4 border-[#5A7A0C]"
      } else if (isNext) {
        borderClass = "border-4 border-purple-800"
      } else {
        borderClass = "border-4 border-gray-700"
      }
    }

    return `${bgColorClass} ${borderClass}`
  }

  return (
    <View
      className={`items-center justify-center rounded-full ${getBubbleStyle()}`}
      style={[styles.mainBubble, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}
    >
      <View style={styles.iconContainer}>{renderBubbleContent(icon, isLocked, isCompleted, isActive, isNext)}</View>

      {isCompleted && (
        <View style={styles.checkmarkBadge}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </View>
  )
}

const NumberIndicator = ({ number, size }: { number: number; size: number }) => (
  <View
    className="bg-secondary rounded-full absolute items-center justify-center z-10"
    style={[styles.numberIndicator, { width: size, height: size, borderRadius: size / 2 }]}
  >
    <Text style={styles.numberText}>{number}</Text>
  </View>
)

const TitleCard = ({ title }: { title: string }) => (
  <View style={styles.titleContainer}>
    <View className="bg-secondary px-3 py-1 rounded-lg mb-2 w-full" style={styles.titleCard}>
      <Text style={styles.titleText} numberOfLines={2}>
        {title}
      </Text>
    </View>
  </View>
)

// Função para verificar se uma string é uma URL
const isValidUrl = (str: string): boolean => {
  try {
    return str.startsWith("http://") || str.startsWith("https://") || str.startsWith("data:image/")
  } catch (e) {
    return false
  }
}

// Função auxiliar para renderizar o conteúdo da bolha (ícone ou imagem)
const renderBubbleContent = (
  iconOrUrl?: string,
  isLocked?: boolean,
  isCompleted?: boolean,
  isActive?: boolean,
  isNext?: boolean,
) => {
  // Se estiver bloqueado, mostrar cadeado
  if (isLocked || (!isCompleted && !isActive && !isNext)) {
    return <Lock size={ICON_SIZE} color="white" />
  }

  // Se não houver ícone, usar o padrão
  if (!iconOrUrl) {
    return ICON_MAP[DEFAULT_ICON] || <BookOpenText size={ICON_SIZE} color="white" />
  }

  // Verificar se é uma URL de imagem
  if (isValidUrl(iconOrUrl)) {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: iconOrUrl }}
          style={{ width: ICON_SIZE * 1.5, height: ICON_SIZE * 1.5 }}
          resizeMode="contain"
        />
      </View>
    )
  }

  // Verificar se é um nome de ícone conhecido
  if (ICON_MAP[iconOrUrl.toLowerCase()]) {
    return ICON_MAP[iconOrUrl.toLowerCase()]
  }

  // Caso não seja reconhecido, usar o ícone padrão
  return ICON_MAP[DEFAULT_ICON] || <BookOpenText size={ICON_SIZE} color="white" />
}

// Estilos
const styles = StyleSheet.create({
  bubbleContainer: {
    alignItems: "center",
    marginVertical: 32,
    position: "relative",
  },
  contentContainer: {
    alignItems: "center",
  },
  progressRingContainer: {
    position: "absolute",
    borderRadius: PROGRESS_RING_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  progressRingSvg: {
    position: "absolute",
  },
  shadowLayer: {
    position: "absolute",
    top: 6,
    zIndex: 0,
  },
  completedShadow: {
    backgroundColor: "#365314", // verde escuro
  },
  defaultShadow: {
    backgroundColor: "#374151", // cinza escuro
  },
  mainBubble: {
    zIndex: 2,
    elevation: 4,
    shadowColor: "#86a531",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: ICON_SIZE * 1.5,
    height: ICON_SIZE * 1.5,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: ICON_SIZE,
  },
  checkmarkBadge: {
    backgroundColor: "#365314", // verde escuro
    position: "absolute",
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "white",
    fontWeight: "bold",
  },
  numberIndicator: {
    top: -2,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  numberText: {
    color: "white",
    fontWeight: "bold",
  },
  titleContainer: {
    marginTop: 20,
    alignItems: "center",
    maxWidth: 200,
  },
  titleCard: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  titleText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
    textAlign: "center",
  },
})

export default LessonBubble
