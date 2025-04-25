"use client"

import React from "react"
import { useState } from "react"
import { View, ImageBackground, StyleSheet, type ImageSourcePropType, Text } from "react-native"
import { SvgUri } from "react-native-svg"
import LessonBubble from "./LessonBubble"
import type { IconLibrary } from "../services/IconRenderer"

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
  etapas: EtapaInfo[] // Renomeado de stages para etapas para maior clareza
  currentEtapaIndex: number // Renomeado de currentStage para currentEtapaIndex
  onEtapaPress: (index: number) => void // Renomeado de onStagePress para onEtapaPress
  containerHeight: number
  backgroundImage?: ImageSourcePropType
  trailId?: string
}

// Constantes
const ETAPA_HEIGHT = 200
const BOTTOM_SPACE_ADJUSTMENT = 120
const TRACK_WIDTH = 8
const TRACK_BORDER_RADIUS = 4
const ETAPA_SPACING = 4

// Componente principal
const LearningPathTrack = ({
  etapas,
  currentEtapaIndex,
  onEtapaPress,
  containerHeight,
  backgroundImage,
  trailId = "1",
}: LearningPathTrackProps) => {
  // Cálculos para layout
  const nextEtapaIndex = etapas.findIndex((etapa) => !etapa.concluida)
  const totalContentHeight = etapas.length * ETAPA_HEIGHT
  const topPadding = Math.max(0, containerHeight - totalContentHeight - BOTTOM_SPACE_ADJUSTMENT)

  // Função para verificar se uma etapa está bloqueada
  const isEtapaBlocked = (index: number) => {
    // Uma etapa está bloqueada se:
    // 1. Não estiver completa
    // 2. Não for a próxima disponível (a primeira não completa)
    // 3. Não for a etapa atual
    return !etapas[index].concluida && index !== nextEtapaIndex && index !== currentEtapaIndex
  }

  // Função para lidar com o clique em uma etapa
  const handleEtapaPress = (index: number) => {
    // Só permite navegação se a etapa não estiver bloqueada
    if (!isEtapaBlocked(index)) {
      onEtapaPress(index)
    }
    // Se estiver bloqueada, não faz nada (ou poderia mostrar uma mensagem)
  }

  // Renderiza o conteúdo principal com o fundo apropriado
  return (
    <BackgroundContainer backgroundImage={backgroundImage} topPadding={topPadding}>
      <TrackContent
        etapas={etapas}
        currentEtapaIndex={currentEtapaIndex}
        nextEtapaIndex={nextEtapaIndex}
        onEtapaPress={handleEtapaPress}
        isEtapaBlocked={isEtapaBlocked}
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
  // Estado para controlar erros de carregamento de imagem
  const [imageError, setImageError] = useState(false)

  // Verifica se a imagem de fundo é um SVG
  const isSvgImage = typeof backgroundImage === "string" && (backgroundImage as string).endsWith(".svg")

  // Se não houver imagem ou ocorrer erro, use um fundo padrão
  if (!backgroundImage || imageError) {
    return (
      <View className="items-center bg-gray-100" style={[styles.container, { paddingTop: topPadding }]}>
        {/* Ícone de fundo padrão quando não há imagem ou ocorre erro */}
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

// Componente para o conteúdo da trilha
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
  // Calcula a altura da trilha de progresso
  const completedEtapasPercentage = Math.max((etapas.filter((e) => e.concluida).length / etapas.length) * 100, 10)

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

// Componente para a lista de etapas
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
  // Inverte as etapas para renderizar de baixo para cima
  const reversedEtapas = [...etapas].reverse()

  return (
    <>
      {reversedEtapas.map((etapa, index) => {
        // Calcula o índice original (antes da inversão)
        const originalIndex = etapas.length - 1 - index
        // Verifica se esta é a próxima etapa a ser concluída
        const isNextEtapa = originalIndex === nextEtapaIndex
        // Verifica se a etapa está bloqueada
        const isLocked = isEtapaBlocked(originalIndex)

        return (
          <View key={originalIndex} className="items-center z-10">
            <LessonBubble
              number={originalIndex + 1} // Número da etapa (1-based)
              isActive={currentEtapaIndex === originalIndex}
              isCompleted={etapa.concluida}
              isNext={isNextEtapa}
              isLocked={isLocked}
              onPress={() => onEtapaPress(originalIndex)}
              title={etapa.titulo}
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
      })}{" "}
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
