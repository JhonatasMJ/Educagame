"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  View,
  ImageBackground,
  StyleSheet,
  type ImageSourcePropType,
  Text,
  ActivityIndicator,
  Platform,
} from "react-native"
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

// Modificar a interface LearningPathTrackProps para aceitar uma URL de imagem de fundo
interface LearningPathTrackProps {
  etapas: any[] // Dados brutos das etapas da trilha
  currentEtapaIndex: number
  onEtapaPress: (index: number) => void
  containerHeight: number
  backgroundImage?: ImageSourcePropType | string // Modificado para aceitar string (URL)
  backgroundUrl?: string // Nova propriedade para URL de imagem de fundo
  trailId: string // Agora é obrigatório para buscar o progresso do usuário
}

// Constantes
const ETAPA_HEIGHT = 200
const BOTTOM_SPACE_ADJUSTMENT = 120
const TRACK_WIDTH = 8
const TRACK_BORDER_RADIUS = 4
const ETAPA_SPACING = 150

// Função auxiliar para processar URLs do Firebase Storage
const processFirebaseUrl = (url: string): string => {
  // Verificar se é uma URL do Firebase Storage
  if (url && url.includes("firebasestorage.googleapis.com")) {
    // Verificar se já tem o parâmetro alt=media
    if (!url.includes("alt=media")) {
      // Adicionar o parâmetro alt=media
      return url + (url.includes("?") ? "&" : "?") + "alt=media"
    }
  }
  return url
}

// Define __DEV__ if it's not already defined (e.g., in a testing environment)
declare const __DEV__: boolean

// Atualizar o componente principal para usar a nova propriedade
const LearningPathTrack = ({
  etapas,
  currentEtapaIndex,
  onEtapaPress,
  containerHeight,
  backgroundImage,
  backgroundUrl,
  trailId,
}: LearningPathTrackProps) => {
  // Obter o contexto de progresso do jogo
  const { getTrailProgress, getPhaseProgress } = useGameProgress()

  // Estado para armazenar o progresso processado
  const [processedEtapas, setProcessedEtapas] = useState<EtapaInfo[]>([])

  // Estado para debug de carregamento de imagem
  const [imageDebug, setImageDebug] = useState({
    loading: false,
    error: false,
    url: "",
    errorMessage: "",
  })

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

  // Processar a URL de fundo
  const processedBackgroundUrl = useMemo(() => {
    // Priorizar backgroundUrl sobre backgroundImage se ambos forem fornecidos
    const urlToProcess = backgroundUrl || (typeof backgroundImage === "string" ? backgroundImage : "")

    if (urlToProcess) {
      // Registrar para debug
      setImageDebug((prev) => ({ ...prev, url: urlToProcess, loading: true }))

      // Processar URL do Firebase
      return processFirebaseUrl(urlToProcess)
    }
    return ""
  }, [backgroundUrl, backgroundImage])

  // Renderiza o conteúdo principal com o fundo apropriado
  return (
    <BackgroundContainer
      backgroundImage={backgroundImage}
      backgroundUrl={processedBackgroundUrl}
      onImageLoad={() => setImageDebug((prev) => ({ ...prev, loading: false, error: false }))}
      onImageError={(error) =>
        setImageDebug((prev) => ({
          ...prev,
          loading: false,
          error: true,
          errorMessage: error?.toString() || "Erro desconhecido",
        }))
      }
    >
      {/* Adicionar indicador de debug apenas em desenvolvimento */}
      {typeof __DEV__ !== "undefined" && __DEV__ && imageDebug.error && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Erro ao carregar imagem:</Text>
          <Text style={styles.debugUrl}>{imageDebug.url}</Text>
          <Text style={styles.debugError}>{imageDebug.errorMessage}</Text>
        </View>
      )}

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

// Atualizar o componente BackgroundContainer para suportar URLs
const BackgroundContainer = ({
  backgroundImage,
  backgroundUrl,
  children,
  onImageLoad,
  onImageError,
}: {
  backgroundImage?: ImageSourcePropType | string
  backgroundUrl?: string
  children: React.ReactNode
  onImageLoad?: () => void
  onImageError?: (error?: Error) => void
}) => {
  // Estado para controlar erros de carga de imagem
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Determinar a URL da imagem de fundo
  const imageUrl = backgroundUrl || (typeof backgroundImage === "string" ? backgroundImage : undefined)

  // Verificar se temos uma URL de imagem
  const hasRemoteImage = !!imageUrl

  // Verificar se a imagem é um SVG
  const isSvgImage = imageUrl && (imageUrl.endsWith(".svg") || imageUrl.includes("svg"))

  // Função para lidar com erros de carregamento
  const handleImageError = (error?: Error) => {
    console.error("Erro ao carregar imagem de fundo:", imageUrl, error)
    setImageError(true)
    setIsLoading(false)
    if (onImageError) onImageError(error)
  }

  // Função para lidar com o carregamento bem-sucedido
  const handleImageLoad = () => {
    setIsLoading(false)
    if (onImageLoad) onImageLoad()
  }

  // Efeito para iniciar o carregamento
  useEffect(() => {
    if (imageUrl) {
      setIsLoading(true)
      setImageError(false)

      // Para URLs não-SVG, podemos pré-carregar a imagem
      if (!isSvgImage && typeof Platform !== "undefined" && Platform.OS === "web") {
        const img = document.createElement("img")
        img.addEventListener("load", handleImageLoad)
        img.addEventListener("error", () => handleImageError(new Error("Falha ao carregar imagem")))
        img.src = imageUrl
      }
    }
  }, [imageUrl, isSvgImage])

  // Se não há imagem ou ocorre erro, use um fundo padrão
  if ((!backgroundImage && !hasRemoteImage) || imageError) {
    return (
      <View className="items-center bg-gray-100" style={styles.container}>
        {/* Ícone de fundo padrão quando não há imagem ou ocorre erro */}
        <View style={styles.fallbackBackground}>
          <Text style={{ fontSize: 40, color: "#ccc" }}>🏞️</Text>
          {typeof __DEV__ !== "undefined" && __DEV__ && imageError && imageUrl && (
            <Text style={{ fontSize: 12, color: "#999", textAlign: "center", marginTop: 10 }}>
              Erro ao carregar: {imageUrl}
            </Text>
          )}
        </View>
        {children}
      </View>
    )
  }

  // Mostrar indicador de carregamento
  if (isLoading) {
    return (
      <View className="items-center bg-gray-100" style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F6A608" />
          <Text style={{ marginTop: 10, color: "#666" }}>Carregando imagem...</Text>
        </View>
        {children}
      </View>
    )
  }

  // Se for uma URL de SVG
  if (isSvgImage && imageUrl) {
    return (
      <View className="items-center" style={styles.container}>
        <SvgUri
          uri={imageUrl}
          style={styles.svgBackground}
          onError={() => handleImageError()}
          onLoad={handleImageLoad}
        />
        {children}
      </View>
    )
  }

  // Se for uma URL remota (não SVG)
  if (hasRemoteImage && imageUrl) {
    return (
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.container}
        imageStyle={styles.imageBackground}
        className="items-center"
        onError={() => handleImageError()}
        onLoad={handleImageLoad}
      >
        {children}
      </ImageBackground>
    )
  }

  // Caso contrário, é uma imagem local
  return (
    <ImageBackground
      source={backgroundImage as ImageSourcePropType}
      style={styles.container}
      imageStyle={styles.imageBackground}
      className="items-center"
      onError={() => handleImageError()}
      onLoad={handleImageLoad}
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

  // Reverse the etapas array to display from bottom to top
  const reversedEtapas = [...etapas].reverse()

  return (
    <>
      {reversedEtapas.map((etapa, reversedIndex) => {
        // Calculate the original index from the reversed index
        const originalIndex = etapas.length - 1 - reversedIndex

        // Verificar se etapa é um objeto válido
        if (!etapa || typeof etapa !== "object") return null

        // Verifica se esta é a próxima etapa a ser concluída
        const isNextEtapa = originalIndex === nextEtapaIndex

        // Verifica se a etapa está bloqueada
        const isLocked = isEtapaBlocked(originalIndex)

        return (
          <View key={originalIndex} className="items-center z-10 mb-8">
            <LessonBubble
              number={originalIndex + 1} // Número da etapa (1-based)
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
            {reversedIndex < reversedEtapas.length - 1 && <View style={{ height: ETAPA_SPACING }} />}
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
    height: "100%",
  },
  svgBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  imageBackground: {
    resizeMode: "cover",
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
  loadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  debugContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugText: {
    color: "red",
    fontWeight: "bold",
  },
  debugUrl: {
    color: "blue",
    fontSize: 12,
    marginVertical: 5,
  },
  debugError: {
    color: "red",
    fontSize: 12,
  },
})

export default LearningPathTrack
