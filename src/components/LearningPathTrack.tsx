"use client"

import  React from "react"
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

// Componente principal
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
  const trailProgress = getTrailProgress(trailId)

  // Processar as etapas com o progresso do usuário
  const processedEtapas: EtapaInfo[] = etapas.map((etapa) => {
    // Buscar o progresso do usuário para esta etapa
    const phaseProgress = getPhaseProgress(etapa.id)

    // Determinar se a etapa está concluída com base no progresso do usuário
    const concluida = phaseProgress ? phaseProgress.completed : false

    // Calcular o progresso da etapa com base nas questões respondidas
    const progress = phaseProgress ? calculatePhaseProgress(phaseProgress) : 0

    return {
      id: etapa.id,
      titulo: etapa.titulo,
      descricao: etapa.descricao || "Descrição da etapa não disponível",
      concluida: concluida,
      icon: etapa.icon || "crown",
      iconLibrary: etapa.iconLibrary || "lucide",
      stages: etapa.stages || [],
      progress: progress,
    }
  })

  // Cálculos para layout
  const nextEtapaIndex = processedEtapas.findIndex((etapa) => !etapa.concluida)
  const totalContentHeight = processedEtapas.length * ETAPA_HEIGHT
  const topPadding = Math.max(0, containerHeight - totalContentHeight - BOTTOM_SPACE_ADJUSTMENT)

  // Função para verificar se uma etapa está bloqueada
  const isEtapaBlocked = (index: number) => {
    // Uma etapa está bloqueada se:
    // 1. Não estiver completa
    // 2. Não for a próxima disponível (a primeira não completa)
    // 3. Não for a etapa atual
    return !processedEtapas[index].concluida && index !== nextEtapaIndex && index !== currentEtapaIndex
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
        etapas={processedEtapas}
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
