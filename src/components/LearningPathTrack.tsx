"use client"

import  React from "react"
import { View, ImageBackground, StyleSheet, type ImageSourcePropType } from "react-native"
import { SvgUri } from "react-native-svg"
import LessonBubble from "./LessonBubble"

// Tipos
interface Stage {
  number: number
  completed: boolean
  title: string
  icon: string
  description?: string
  id: string
}

interface LearningPathTrackProps {
  stages: Stage[]
  currentStage: number
  onStagePress: (index: number) => void
  containerHeight: number
  backgroundImage?: ImageSourcePropType
  trailId?: string
}

// Constantes
const STAGE_HEIGHT = 200
const BOTTOM_SPACE_ADJUSTMENT = 120
const TRACK_WIDTH = 8
const TRACK_BORDER_RADIUS = 4
const STAGE_SPACING = 4

// Componente principal
const LearningPathTrack = ({
  stages,
  currentStage,
  onStagePress,
  containerHeight,
  backgroundImage,
  trailId = "1",
}: LearningPathTrackProps) => {
  // Cálculos para layout
  const nextStageIndex = stages.findIndex((stage) => !stage.completed)
  const totalContentHeight = stages.length * STAGE_HEIGHT
  const topPadding = Math.max(0, containerHeight - totalContentHeight - BOTTOM_SPACE_ADJUSTMENT)

  // Renderiza o conteúdo principal com o fundo apropriado
  return (
    <BackgroundContainer backgroundImage={backgroundImage} topPadding={topPadding}>
      <TrackContent
        stages={stages}
        currentStage={currentStage}
        nextStageIndex={nextStageIndex}
        onStagePress={onStagePress}
        trailId={trailId}
      />
    </BackgroundContainer>
  )
}

// Componente para o container de fundo
const BackgroundContainer = ({
  backgroundImage,
  topPadding,
  children,
}: {
  backgroundImage?: ImageSourcePropType
  topPadding: number
  children: React.ReactNode
}) => {
  // Verifica se a imagem de fundo é um SVG
  const isSvgImage = typeof backgroundImage === "string" && (backgroundImage as string).endsWith(".svg")

  if (!backgroundImage) {
    return (
      <View className="items-center" style={[styles.container, { paddingTop: topPadding }]}>
        {children}
      </View>
    )
  }

  if (isSvgImage) {
    return (
      <View className="items-center" style={[styles.container, { paddingTop: topPadding }]}>
        <SvgUri uri={backgroundImage as string} style={styles.svgBackground} />
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
    >
      {children}
    </ImageBackground>
  )
}

// Componente para o conteúdo da trilha
const TrackContent = ({
  stages,
  currentStage,
  nextStageIndex,
  onStagePress,
  trailId,
}: {
  stages: Stage[]
  currentStage: number
  nextStageIndex: number
  onStagePress: (index: number) => void
  trailId: string
}) => {
  // Calcula a altura da trilha de progresso
  const completedStagesPercentage = Math.max((stages.filter((s) => s.completed).length / stages.length) * 100, 10)

  return (
    <>
      {/* Trilha de fundo */}
      <TrackLine className="bg-tertiary/80" height="100%" zIndex={1} />

      {/* Trilha de progresso */}
      <TrackLine
        className="bg-secondary"
        height={`${completedStagesPercentage}%`}
        zIndex={2}
        style={styles.progressTrack}
      />

      {/* Estágios em ordem reversa */}
      <StagesList
        stages={stages}
        currentStage={currentStage}
        nextStageIndex={nextStageIndex}
        onStagePress={onStagePress}
        trailId={trailId}
      />
    </>
  )
}

// Componente para a linha da trilha
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

// Componente para a lista de estágios
const StagesList = ({
  stages,
  currentStage,
  nextStageIndex,
  onStagePress,
  trailId,
}: {
  stages: Stage[]
  currentStage: number
  nextStageIndex: number
  onStagePress: (index: number) => void
  trailId: string
}) => {
  // Inverte os estágios para renderizar de baixo para cima
  const reversedStages = [...stages].reverse()

  return (
    <>
      {reversedStages.map((stage, index) => {
        // Calcula o índice original (antes da inversão)
        const originalIndex = stages.length - 1 - index
        // Verifica se esta é a próxima etapa a ser concluída
        const isNextStage = originalIndex === nextStageIndex

        return (
          <View key={originalIndex} className="items-center z-10">
            <LessonBubble
              number={stage.number}
              isActive={currentStage === originalIndex}
              isCompleted={stage.completed}
              isNext={isNextStage}
              onPress={() => onStagePress(originalIndex)}
              title={stage.title}
              icon={stage.icon as "crown" | "zap" | "target" | "book"}
              description={stage.description}
              phaseId={stage.id}
            />

            {/* Espaço entre bolhas */}
            {index < stages.length - 1 && <View style={{ height: STAGE_SPACING }} />}
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
})

export default LearningPathTrack
