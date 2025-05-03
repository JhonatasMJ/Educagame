"use client"

import  React from "react"
import { useState, useEffect } from "react"
import { View, ImageBackground, StyleSheet, type ImageSourcePropType, Text } from "react-native"
import { SvgUri } from "react-native-svg"
import LessonBubble from "./LessonBubble"
import type { IconLibrary } from "../services/IconRenderer"
import { useGameProgress } from "../context/GameProgressContext"
import { calculatePhaseProgress } from "../services/userProgressService"
import { logSync, LogLevel } from "../services/syncLogger"

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
const ETAPA_SPACING = 150

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

  // Estado para armazenar o progresso processado
  const [processedEtapas, setProcessedEtapas] = useState<EtapaInfo[]>([])

  // Buscar o progresso do usuário para esta trilha e processar as etapas
  useEffect(() => {
    // Garantir que etapas seja sempre um array antes de usar map
    const etapasArray = Array.isArray(etapas) ? etapas : []

    // Buscar o progresso da trilha pelo ID
    const trailProgress = trailId ? getTrailProgress(trailId) : null

    logSync(
      LogLevel.INFO,
      `Processando etapas para trilha ${trailId}, progresso encontrado: ${trailProgress ? "Sim" : "Não"}`,
    )

    // Processar as etapas com o progresso do usuário
    const processed = etapasArray.map((etapa) => {
      if (!etapa || typeof etapa !== "object") {
        // Retornar um objeto padrão se etapa não for válido
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

      if (phaseProgress) {
        logSync(LogLevel.INFO, `Encontrado progresso para fase ${etapa.id}: completed=${phaseProgress.completed}`)
      }

      // Determinar se a etapa está concluída com base no progresso do usuário
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

    setProcessedEtapas(processed)
  }, [etapas, trailId, getTrailProgress, getPhaseProgress])

  // Cálculos para layout - Proteger contra arrays vazios
  const nextEtapaIndex = processedEtapas.length > 0 ? processedEtapas.findIndex((etapa) => !etapa.concluida) : -1

  // Se não encontrar nenhuma etapa não concluída, usar 0 ou -1 se o array estiver vazio
  const safeNextEtapaIndex = nextEtapaIndex === -1 ? (processedEtapas.length > 0 ? 0 : -1) : nextEtapaIndex

  const totalContentHeight = processedEtapas.length * ETAPA_HEIGHT
  const topPadding = Math.max(0, containerHeight - totalContentHeight - BOTTOM_SPACE_ADJUSTMENT)

  // Função para verificar se uma etapa está bloqueada
  const isEtapaBlocked = (index: number) => {
    // Verificar se o índice é válido
    if (index < 0 || index >= processedEtapas.length) return true

    // Uma etapa está bloqueada se:
    // 1. Não está completa
    // 2. Não é a próxima disponível (a primeira não completa)
    // 3. Não é a etapa atual
    return !processedEtapas[index].concluida && index !== safeNextEtapaIndex && index !== currentEtapaIndex
  }

  // Função para lidar com o clique em uma etapa
  const handleEtapaPress = (index: number) => {
    // Verificar se o índice é válido
    if (index < 0 || index >= processedEtapas.length) return

    // Só permite navegação se a etapa não estiver bloqueada
    if (!isEtapaBlocked(index)) {
      onEtapaPress(index)
    }
    // Se estiver bloqueada, não faz nada (ou poderia mostrar uma mensagem)
  }

  // Renderiza o conteúdo principal com o fundo apropriado
  return (
    <BackgroundContainer backgroundImage={backgroundImage} >
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

// Componente para o container de fundo
const BackgroundContainer = ({
  backgroundImage,
  children,
}: {
  backgroundImage?: ImageSourcePropType
  children: React.ReactNode
}) => {
  // Estado para controlar erros de carga de imagem
  const [imageError, setImageError] = useState(false)

  // Verifica se a imagem de fundo é um SVG
  const isSvgImage = typeof backgroundImage === "string" && (backgroundImage as string).endsWith(".svg")

  // Se não há imagem ou ocorre erro, use um fundo padrão
  if (!backgroundImage || imageError) {
    return (
      <View className="items-center bg-gray-100" style={[styles.container]}>
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
      <View className="items-center" style={[styles.container]}>
        <SvgUri uri={backgroundImage as string} style={styles.svgBackground} onError={() => setImageError(true)} />
        {children}
      </View>
    )
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.container]}
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
    <View style={{ width: "100%" }}>
      {/* Trilha de fundo */}

      {/* Etapas em ordem normal (de cima para baixo) */}
      <EtapasList
        etapas={etapas}
        currentEtapaIndex={currentEtapaIndex}
        nextEtapaIndex={nextEtapaIndex}
        onEtapaPress={onEtapaPress}
        isEtapaBlocked={isEtapaBlocked}
        trailId={trailId}
      />
    </View>
  )
}


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
  // Verificar se etapas é um array válido
  if (!Array.isArray(etapas) || etapas.length === 0) {
    return null
  }

  return (
    <>
      {etapas.map((etapa, index) => {
        // Verificar se etapa é um objeto válido
        if (!etapa || typeof etapa !== "object") return null

        // Verifica se esta é a próxima etapa a ser concluída
        const isNextEtapa = index === nextEtapaIndex

        // Verifica se a etapa está bloqueada
        const isLocked = isEtapaBlocked(index)

        return (
          <View key={index} className="items-center z-10 mb-8">
            <LessonBubble
              number={index + 1} // Número da etapa (1-based)
              isActive={currentEtapaIndex === index}
              isCompleted={etapa.concluida}
              isNext={isNextEtapa}
              isLocked={isLocked}
              onPress={() => onEtapaPress(index)}
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
  },
  imageBackground: {
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
  },
})

export default LearningPathTrack
