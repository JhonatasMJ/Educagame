"use client"

import React from "react"
import { useState } from "react"
import { View, ImageBackground, StyleSheet, type ImageSourcePropType, Text } from "react-native"
import { SvgUri } from "react-native-svg"
import LessonBubble from "./LessonBubble"
import type { IconLibrary } from "../services/IconRenderer"
import { useGameProgress } from "../context/GameProgressContext"
import { calculatePhaseProgress } from "../services/userProgressService"

// Tipos atualizados para refletir a nova estrutura
interface StageInfo {
  id: string
  title: string
  description?: string
  completed: boolean
  pontos_chave?: string[]
  image?: string
  video?: string
  tempo_estimado?: string
  questions: any[]
}

// Interface para a Etapa (que contém stages)
interface EtapaInfo {
  id: string
  titulo: string
  descricao?: string
  concluida: boolean
  icon?: string
  iconLibrary?: string
  stages: StageInfo[]
  progress: number
}

interface LearningPathTrackProps {
  etapas: any[] // Dados brutos das etapas da trilha
  currentEtapaIndex: number
  onEtapaPress: (index: number) => void
  containerHeight: number
  backgroundImage?: ImageSourcePropType
  trailId: string // Agora é obrigatório para buscar o progresso do usuário
}

// Constantes
const ETAPA_HEIGHT = 200
const BOTTOM_SPACE_ADJUSTMENT = 120
const TRACK_WIDTH = 8
const TRACK_BORDER_RADIUS = 4
const ETAPA_SPACING = 4

// Modifique a função principal do componente para adicionar mais verificações de segurança
const LearningPathTrack = ({
  etapas,
  currentEtapaIndex,
  onEtapaPress,
  containerHeight,
  backgroundImage,
  trailId,
}: LearningPathTrackProps) => {
  // Obter o contexto de progresso do jogo
  const { getTrailProgress, getPhaseProgress } = useGameProgress()

  // Buscar o progresso do usuário para esta trilha
  const trailProgress = trailId ? getTrailProgress(trailId) : null

  // Garantir que etapas seja sempre um array antes de usar map
  const etapasArray = Array.isArray(etapas) ? etapas : []

  // Processar as etapas com o progresso do usuário
  const processedEtapas: EtapaInfo[] = etapasArray.map((etapa) => {
    if (!etapa || typeof etapa !== "object") {
      // Retornar um objeto padrão si etapa não for válido
      return {
        id: `default-${Math.random().toString(36).substring(2, 9)}`,
        titulo: "Etapa sem título",
        descricao: "Descrição da etapa não disponível",
        concluida: false,
        icon: "crown",
        iconLibrary: "lucide",
        stages: [],
        progress: 0,
      }
    }

    // Buscar o progresso do usuário para esta etapa
    const phaseProgress = etapa.id ? getPhaseProgress(etapa.id) : null

    // Determinar si a etapa está concluída com base no progresso do usuário
    const concluida = phaseProgress ? phaseProgress.completed : false

    // Calcular o progresso da etapa com base nas questões respondidas
    const progress = phaseProgress ? calculatePhaseProgress(phaseProgress) : 0

    // Garantir que stages seja um array
    const stages = etapa.stages ? (Array.isArray(etapa.stages) ? etapa.stages : []) : []

    return {
      id: etapa.id || `id-${Math.random().toString(36).substring(2, 9)}`,
      titulo: etapa.titulo || "Sem título",
      descricao: etapa.descricao || "Descrição da etapa não disponível",
      concluida: concluida,
      icon: etapa.icon || "crown",
      iconLibrary: etapa.iconLibrary || "lucide",
      stages: stages,
      progress: progress,
    }
  })

  // Cálculos para layout - Proteger contra arrays vazios
  const nextEtapaIndex = processedEtapas.length > 0 ? processedEtapas.findIndex((etapa) => !etapa.concluida) : -1

  // Si no encontrar ninguna etapa no concluída, usar 0 o -1 si el array está vacío
  const safeNextEtapaIndex = nextEtapaIndex === -1 ? (processedEtapas.length > 0 ? 0 : -1) : nextEtapaIndex

  const totalContentHeight = processedEtapas.length * ETAPA_HEIGHT
  const topPadding = Math.max(0, containerHeight - totalContentHeight - BOTTOM_SPACE_ADJUSTMENT)

  // Função para verificar si una etapa está bloqueada
  const isEtapaBlocked = (index: number) => {
    // Verificar si el índice es válido
    if (index < 0 || index >= processedEtapas.length) return true

    // Una etapa está bloqueada si:
    // 1. No está completa
    // 2. No es la próxima disponible (la primera no completa)
    // 3. No es la etapa actual
    return !processedEtapas[index].concluida && index !== safeNextEtapaIndex && index !== currentEtapaIndex
  }

  // Função para manejar el clic en una etapa
  const handleEtapaPress = (index: number) => {
    // Verificar si el índice es válido
    if (index < 0 || index >= processedEtapas.length) return

    // Solo permite la navegación si la etapa no está bloqueada
    if (!isEtapaBlocked(index)) {
      onEtapaPress(index)
    }
    // Si está bloqueada, no hace nada (o podría mostrar un mensaje)
  }

  // Renderiza el contenido principal con el fondo apropiado
  return (
    <BackgroundContainer backgroundImage={backgroundImage} topPadding={topPadding}>
      <TrackContent
        etapas={processedEtapas}
        currentEtapaIndex={currentEtapaIndex}
        nextEtapaIndex={safeNextEtapaIndex}
        onEtapaPress={handleEtapaPress}
        isEtapaBlocked={isEtapaBlocked}
        trailId={trailId}
      />
    </BackgroundContainer>
  )
}

// Componente para el container de fondo
const BackgroundContainer = ({
  backgroundImage,
  topPadding,
  children,
}: {
  backgroundImage?: ImageSourcePropType
  topPadding: number
  children: React.ReactNode
}) => {
  // Estado para controlar errores de carga de imagen
  const [imageError, setImageError] = useState(false)

  // Verifica si la imagen de fondo es un SVG
  const isSvgImage = typeof backgroundImage === "string" && (backgroundImage as string).endsWith(".svg")

  // Si no hay imagen o ocurre error, use un fondo estándar
  if (!backgroundImage || imageError) {
    return (
      <View className="items-center bg-gray-100" style={[styles.container, { paddingTop: topPadding }]}>
        {/* Ícono de fondo estándar cuando no hay imagen o ocurre error */}
        <View style={styles.fallbackBackground}>
          <Text style={{ fontSize: 40, color: "#ccc" }}>🏞️</Text>
        </View>
        {children}
      </View>
    )
  }

  if (isSvgImage) {
    return (
      <View className="items-center" style={[styles.container, { paddingTop: topPadding }]}>
        <SvgUri uri={backgroundImage as string} style={styles.svgBackground} onError={() => setImageError(true)} />
        {children}
      </View>
    )
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.container, { paddingTop: topPadding }]}
      imageStyle={styles.imageBackground}
      className="items-center"
      onError={() => setImageError(true)}
    >
      {children}
    </ImageBackground>
  )
}

// Modifique o componente TrackContent para adicionar mais verificações de segurança
const TrackContent = ({
  etapas,
  currentEtapaIndex,
  nextEtapaIndex,
  onEtapaPress,
  isEtapaBlocked,
  trailId,
}: {
  etapas: EtapaInfo[]
  currentEtapaIndex: number
  nextEtapaIndex: number
  onEtapaPress: (index: number) => void
  isEtapaBlocked: (index: number) => boolean
  trailId: string
}) => {
  // Verificar se etapas é um array válido e não vazio
  if (!Array.isArray(etapas) || etapas.length === 0) {
    return (
      <View className="items-center justify-center py-10">
        <Text className="text-gray-500 text-lg">Nenhuma etapa disponível</Text>
      </View>
    )
  }

  // Calcula a altura da trilha de progresso
  const completedCount = etapas.filter((e) => e.concluida).length
  const completedEtapasPercentage = Math.max((completedCount / etapas.length) * 100, 10)

  return (
    <>
      {/* Trilha de fundo */}
      <TrackLine className="bg-tertiary/80" height="100%" zIndex={1} />

      {/* Trilha de progresso */}
      <TrackLine
        className="bg-secondary"
        height={`${completedEtapasPercentage}%`}
        zIndex={2}
        style={styles.progressTrack}
      />

      {/* Etapas em ordem reversa */}
      <EtapasList
        etapas={etapas}
        currentEtapaIndex={currentEtapaIndex}
        nextEtapaIndex={nextEtapaIndex}
        onEtapaPress={onEtapaPress}
        isEtapaBlocked={isEtapaBlocked}
        trailId={trailId}
      />
    </>
  )
}

// Componente para la línea de la trilha
const TrackLine = ({
  className,
  height,
  zIndex,
  style,
}: {
  className: string
  height: string
  zIndex: number
  style?: any
}) => <View className={className} style={[styles.trackLine, { height, zIndex }, style]} />

// Componente para la lista de etapas
const EtapasList = ({
  etapas,
  currentEtapaIndex,
  nextEtapaIndex,
  onEtapaPress,
  isEtapaBlocked,
  trailId,
}: {
  etapas: EtapaInfo[]
  currentEtapaIndex: number
  nextEtapaIndex: number
  onEtapaPress: (index: number) => void
  isEtapaBlocked: (index: number) => boolean
  trailId: string
}) => {
  // Verificar se etapas é um array válido
  if (!Array.isArray(etapas) || etapas.length === 0) {
    return null
  }

  // Inverte as etapas para renderizar de baixo para cima
  const reversedEtapas = [...etapas].reverse()

  return (
    <>
      {reversedEtapas.map((etapa, index) => {
        // Verificar se etapa é um objeto válido
        if (!etapa || typeof etapa !== "object") return null

        // Calcula o índice original (antes da inversão)
        const originalIndex = etapas.length - 1 - index

        // Verifica se esta é a próxima etapa a ser concluída
        const isNextEtapa = originalIndex === nextEtapaIndex

        // Verifica se a etapa está bloqueada
        const isLocked = isEtapaBlocked(originalIndex)

        return (
          <View key={originalIndex} className="items-center z-10">
            <LessonBubble
              number={originalIndex + 1} // Número de la etapa (1-based)
              isActive={currentEtapaIndex === originalIndex}
              isCompleted={etapa.concluida}
              isNext={isNextEtapa}
              isLocked={isLocked}
              onPress={() => onEtapaPress(originalIndex)}
              title={etapa.titulo || "Sem título"}
              icon={etapa.icon}
              iconLibrary={etapa.iconLibrary as IconLibrary}
              description={etapa.descricao}
              progress={etapa.progress} // Progresso calculado com base nos stages
              phaseId={etapa.id}
            />

            {/* Espaço entre bolhas */}
            {index < etapas.length - 1 && <View style={{ height: ETAPA_SPACING }} />}
          </View>
        )
      })}
    </>
  )
}

// Estilos
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  svgBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
  imageBackground: {
    opacity: 0.3,
  },
  trackLine: {
    position: "absolute",
    width: TRACK_WIDTH,
    borderRadius: TRACK_BORDER_RADIUS,
  },
  progressTrack: {
    bottom: 0, // Começa de baixo
  },
  fallbackBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.3,
  },
})

export default LearningPathTrack
