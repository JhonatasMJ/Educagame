"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { useAuth } from "@/src/context/AuthContext"
import { router, useLocalSearchParams } from "expo-router"
import { useGameProgress } from "@/src/context/GameProgressContext"
import DuolingoHeader from "@/src/components/DuolingoHeader"
import LearningPathTrack from "@/src/components/LearningPathTrack"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import { useTrails } from "@/src/hooks/useTrails"
import { logSync, LogLevel } from "@/src/services/syncLogger"
import React from "react"

const { width, height } = Dimensions.get("window")

// Define question types
export enum QuestionType {
  TRUE_OR_FALSE = "trueOrFalse",
  MULTIPLE_CHOICE = "multipleChoice",
  MATCHING = "matching",
  ORDERING = "ordering",
}

// Define question interface
export interface Question {
  id: string
  type: QuestionType
  description: string
  image?: string
  // For true/false questions
  isTrue?: boolean
  // For multiple choice questions
  options?: string[]
  correctOptionIndex?: number
  explanation?: string
}

// Define stage interface
export interface Stage {
  id: string
  title: string
  description?: string
  completed: boolean
  pontos_chave?: string[] // Novos pontos-chave específicos do stage
  image?: string // Imagem específica do stage
  video?: string // URL do vídeo específico do stage
  tempo_estimado?: string // Tempo estimado para completar o stage
  questions: Question[]
}

// Main Home component
const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0)
  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0)

  const { userData, authUser, refreshUserData, isTokenLoaded, justRegistered, setJustRegistered } = useAuth()
  const { getPhaseCompletionPercentage, syncProgress, isSyncing } = useGameProgress()
  const { isAuthenticated, isLoading } = useRequireAuth()
  const nome = `${userData?.nome || ""} ${userData?.sobrenome || ""}`
  const scrollViewRef = useRef<ScrollView>(null)
  const [containerHeight, setContainerHeight] = useState(height - 200) // Altura inicial estimada
  const [hasLoadedTrails, setHasLoadedTrails] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Receber parâmetros da URL
  const params = useLocalSearchParams()
  const needsMultipleRefresh = params.needsMultipleRefresh === "true"
  const refreshCount = Number.parseInt((params.refreshCount as string) || "0", 10)
  const refreshTimestamp = params.refreshTimestamp || Date.now().toString()
  const forceFullRefresh = params.forceFullRefresh === "true"

  // Referência para controlar os refreshes
  const refreshCountRef = useRef(0)
  const lastRefreshTimeRef = useRef<number>(0)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadCompleteRef = useRef(false)

  // Animated scroll value for header animation
  const scrollY = useRef(new Animated.Value(0)).current

  // Add a new animated value for background parallax effect after the scrollY declaration
  const backgroundScrollY = useRef(new Animated.Value(0)).current

  // Animação para transição de trilhas
  const slideAnim = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<{
    titulo: string
    descricao: string
  } | null>(null)

  // Add state to track the current background SVG after the selectedQuestion state
  const [currentBackgroundSvg, setCurrentBackgroundSvg] = useState<any>(null)

  // In the Home component, add the following after the other useState declarations:
  const { trails: trilhas, isLoading: trailsLoading, error: trailsError, fetchTrails } = useTrails()

  // Adicione um estado para controlar o refresh inicial
  const [initialRefreshDone, setInitialRefreshDone] = useState(false)

  // Função para atualizar trilhas com feedback visual
  async function refreshTrails(forceUpdate = false) {
    console.log("Iniciando refresh de trilhas", forceUpdate ? "(forçado)" : "")
    logSync(LogLevel.INFO, `Iniciando refresh de trilhas ${forceUpdate ? "(forçado)" : ""}`)

    // Evitar múltiplos cliques em sequência
    if (trailsLoading || isSyncing || isRefreshing) {
      console.log("Já está carregando, ignorando requisição")
      return
    }

    try {
      // Mostrar indicador de carregamento
      setIsRefreshing(true)

      // Atualizar timestamp do último refresh
      lastRefreshTimeRef.current = Date.now()

      // Mostrar alerta para debug (remover em produção)
      if (Platform.OS === "web") {
        console.log("Iniciando refresh das trilhas...")
      }

      // Buscar trilhas
      await fetchTrails()

      // Sincronizar progresso do usuário
      if (authUser) {
        await syncProgress()
      }

      // Atualizar dados do usuário
      await refreshUserData()

      // Registrar timestamp final
      const timeElapsed = Date.now() - lastRefreshTimeRef.current
      logSync(LogLevel.INFO, `Refresh completo em ${timeElapsed}ms`)
      console.log(`Refresh completo em ${timeElapsed}ms`)

      // Incrementar contador de refreshes
      refreshCountRef.current += 1

      // Mostrar alerta para debug (remover em produção)
      if (Platform.OS === "web") {
        console.log("Refresh concluído com sucesso!")
      }
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao atualizar trilhas:", error)
      console.error("Erro ao atualizar trilhas:", error)

      // Mostrar alerta para debug (remover em produção)
      if (Platform.OS === "web") {
        console.error("Erro ao atualizar trilhas:", error)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Estatísticas do usuário para o cabeçalho
  const [userStats, setUserStats] = useState({
    points: userData?.points || 0,
  })

  // Atualizar pontos quando userData mudar
  useEffect(() => {
    if (userData) {
      setUserStats((prev) => ({
        ...prev,
        points: userData.points || 0,
      }))
    }
  }, [userData])

  // Dados da trilha atual
  const currentTrilha = trilhas && trilhas.length > 0 ? trilhas[trilhaAtualIndex] : null

  // Função para calcular o progresso de uma etapa com base nos stages concluídos
  const calculateEtapaProgress = (etapa: any): number => {
    if (!etapa.stages || etapa.stages.length === 0) {
      return etapa.concluida ? 100 : 0
    }

    const completedStages = etapa.stages.filter((stage: any) => stage.completed).length
    const totalStages = etapa.stages.length

    // Calcular a porcentagem de conclusão
    return Math.round((completedStages / totalStages) * 100)
  }

  // Verificar se uma etapa está totalmente concluída (todos os stages concluídos)
  const isEtapaCompleted = (etapa: any): boolean => {
    if (!etapa.stages || etapa.stages.length === 0) {
      return etapa.concluida
    }

    return etapa.stages.every((stage: any) => stage.completed)
  }

  // 1. Primeiro, vamos definir interfaces mais claras para os tipos que estamos usando

  // Interface para o Stage (fase dentro de uma etapa)
  interface StageInfo {
    id: string
    title: string
    description?: string
    completed: boolean
    pontos_chave?: string[]
    image?: string
    video?: string
    tempo_estimado?: string
    questions: Question[]
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

  // Modifique a parte que processa as etapas para garantir que etapas seja sempre um array
  // Substitua o bloco de código que define a constante stages por:

  // 2. Now, let's correct the mapping of etapas
  const stages = (() => {
    // Verificar se currentTrilha existe
    if (!currentTrilha) return []

    try {
      // Garantir que etapas seja um array
      let etapasArray = []

      if (currentTrilha.etapas) {
        if (Array.isArray(currentTrilha.etapas)) {
          etapasArray = currentTrilha.etapas
        } else if (typeof currentTrilha.etapas === "object") {
          etapasArray = Object.values(currentTrilha.etapas)
        }
      }

      // Se ainda não temos um array, retornar array vazio
      if (!Array.isArray(etapasArray)) {
        console.error("Não foi possível converter etapas para array:", currentTrilha.etapas)
        return []
      }

      // Mapear as etapas para o formato esperado
      return etapasArray.map((etapa: any, index: number) => {
        // Verificar se etapa é um objeto válido
        if (!etapa || typeof etapa !== "object") {
          return {
            id: `default-${Math.random().toString(36).substring(2, 9)}`,
            titulo: "",
            descricao: "Descrição da etapa não disponível",
            concluida: false,
            icon: "crown",
            iconLibrary: "lucide",
            stages: [],
            progress: 0,
          }
        }

        // Garantir que stages seja um array
        let stagesArray = []

        if (etapa.stages) {
          if (Array.isArray(etapa.stages)) {
            stagesArray = etapa.stages
          } else if (typeof etapa.stages === "object") {
            stagesArray = Object.values(etapa.stages)
          }
        }

        // Calcular o progresso com base nos stages concluídos
        const progress = calculateEtapaProgress({
          ...etapa,
          stages: stagesArray,
        })

        // Verificar se a etapa está totalmente concluída
        const concluida = isEtapaCompleted({
          ...etapa,
          stages: stagesArray,
        })

        return {
          id: etapa.id || `etapa-${Math.random().toString(36).substring(2, 9)}`,
          titulo: etapa.titulo,
          descricao: etapa.descricao || "Descrição da etapa não disponível",
          concluida: concluida,
          icon: etapa.icon || "crown",
          iconLibrary: etapa.iconLibrary || "lucide",
          stages: stagesArray,
          progress: progress,
        } as EtapaInfo
      })
    } catch (error) {
      console.error("Erro ao processar etapas:", error)
      return []
    }
  })()

  // 3. Corrigir o acesso às propriedades no handleStagePress
  const handleStagePress = (index: number) => {
    setEtapaAtualIndex(index)

    // Verificar se temos uma trilha atual e se o índice é válido
    if (!currentTrilha || !stages || index >= stages.length) return

    const currentEtapa = stages[index]
    if (!currentEtapa || !currentEtapa.stages || currentEtapa.stages.length === 0) return

    // Encontrar o primeiro stage não concluído ou o primeiro stage se todos estiverem concluídos
    const currentStageIndex = currentEtapa.stages.findIndex((stage: any) => !stage.completed)
    const stageIndex = currentStageIndex >= 0 ? currentStageIndex : 0
    const currentStage = currentEtapa.stages[stageIndex]

    if (!currentStage) return

    // Navigate to the start phase with the stage data
    router.push({
      pathname: "/questions/start/startPhase",
      params: {
        phaseId: currentEtapa.id,
        trailId: currentTrilha.id,
        stageId: currentStage.id,
        title: currentStage.title,
        description: currentStage.description || "",
        image: currentStage.image || "",
        video: (currentStage as StageInfo).video || "",
        tempo_estimado: currentStage.tempo_estimado || "10-15 minutos",
        pontos_chave: JSON.stringify(currentStage.pontos_chave || []),
      },
    } as any)

    // Simulação de ganho de pontos ao clicar em uma etapa
    if (!stages[index].concluida) {
      // Mudado de completed para concluida
      setUserStats((prev) => ({
        ...prev,
        points: prev.points + 10,
      }))
    }
  }

  // Medir a altura do container para posicionar os estágios corretamente
  const onContainerLayout = (event: {
    nativeEvent: { layout: { height: number } }
  }) => {
    const { height } = event.nativeEvent.layout
    setContainerHeight(height)
  }

  // SISTEMA DE MÚLTIPLOS REFRESHES
  useEffect(() => {
    // Limpar qualquer timer existente
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }

    // Verificar se precisamos fazer múltiplos refreshes
    if (needsMultipleRefresh && refreshCount > 0) {
      const performRefresh = async (currentRefresh: number) => {
        if (currentRefresh > refreshCount) {
          // Todos os refreshes concluídos
          logSync(LogLevel.INFO, `Sequência de ${refreshCount} refreshes concluída com sucesso`)
          console.log(`Sequência de ${refreshCount} refreshes concluída com sucesso`)

          // Limpar parâmetros
          router.setParams({})
          return
        }

        // Log para debug
        logSync(LogLevel.INFO, `Executando refresh ${currentRefresh} de ${refreshCount}`)
        console.log(`Executando refresh ${currentRefresh} de ${refreshCount}`)

        try {
          // Executar refresh com força
          await refreshTrails(true)

          // Agendar próximo refresh após delay
          const delay = 2000 + currentRefresh * 500 // Aumenta o delay a cada refresh
          refreshTimerRef.current = setTimeout(() => performRefresh(currentRefresh + 1), delay)
        } catch (error) {
          logSync(LogLevel.ERROR, `Erro no refresh ${currentRefresh}:`, error)
          console.error(`Erro no refresh ${currentRefresh}:`, error)

          // Tentar novamente após um delay maior
          refreshTimerRef.current = setTimeout(() => performRefresh(currentRefresh), 3000)
        }
      }

      // Iniciar sequência de refreshes
      refreshTimerRef.current = setTimeout(() => performRefresh(1), 1000)
    }

    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [needsMultipleRefresh, refreshCount, refreshTimestamp])

  // Efeito para lidar com usuário recém-registrado
  useEffect(() => {
    if (justRegistered && !initialLoadCompleteRef.current) {
      logSync(LogLevel.INFO, "Usuário recém-registrado detectado, iniciando refreshes")
      console.log("Usuário recém-registrado detectado, iniciando refreshes")

      // Iniciar sequência de refreshes
      router.setParams({
        needsMultipleRefresh: "true",
        refreshCount: "5", // Aumentado para 5 refreshes
        refreshTimestamp: Date.now().toString(),
        forceFullRefresh: "true",
      })

      // Resetar flag
      setJustRegistered(false)
    }

    // Marcar carregamento inicial como concluído
    initialLoadCompleteRef.current = true
  }, [justRegistered])

  // Scroll para a etapa atual quando mudar
  useEffect(() => {
    if (scrollViewRef.current) {
      if (Platform.OS !== "web") {
        // Para dispositivos móveis - agora invertido
        setTimeout(() => {
          // Calcular posição para rolar - de baixo para cima
          const totalHeight = stages.length * 200 // Altura aproximada de todos os estágios (aumentada)
          const position = totalHeight - (etapaAtualIndex + 1) * 200 // Posição a partir de baixo

          scrollViewRef.current?.scrollTo({ y: position, animated: true })
        }, 300)
      } else {
        // Para web
        setTimeout(() => {
          const elements = document.querySelectorAll(".stage-bubble")
          if (elements && elements[stages.length - 1 - etapaAtualIndex]) {
            elements[stages.length - 1 - etapaAtualIndex].scrollIntoView({
              behavior: "smooth",
              block: "center",
            })
          }
        }, 300)
      }
    }
  }, [etapaAtualIndex, stages.length])

  const handleNextTrilha = () => {
    if (trilhaAtualIndex < trilhas.length - 1 && !isAnimating) {
      setIsAnimating(true)

      // Animar para a direita
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start(() => {
        setTrilhaAtualIndex(trilhaAtualIndex + 1)
        setEtapaAtualIndex(0)
        slideAnim.setValue(width) // Preparar para deslizar da direita para o centro

        // Animar de volta ao centro
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start(() => {
          setIsAnimating(false)
        })
      })
    }
  }

  const handlePreviousTrilha = () => {
    if (trilhaAtualIndex > 0 && !isAnimating) {
      setIsAnimating(true)

      // Animar para a esquerda
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start(() => {
        setTrilhaAtualIndex(trilhaAtualIndex - 1)
        setEtapaAtualIndex(0)
        slideAnim.setValue(-width) // Preparar para deslizar da esquerda para o centro

        // Animar de volta ao centro
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start(() => {
          setIsAnimating(false)
        })
      })
    }
  }

  // Add this effect to update the background SVG when the trail changes
  useEffect(() => {
    setCurrentBackgroundSvg(() => (trilhas && trilhas.length > 0 ? trilhas[trilhaAtualIndex].backgroundSvg : null))
  }, [trilhaAtualIndex, trilhas])

  // Update the handleScroll function to include background parallax effect
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: (event) => {
      const offsetY = event.nativeEvent.contentOffset.y
      backgroundScrollY.setValue(-offsetY * 0.5)
    },
  })

  // Create a dynamic SVG background component variable before the return statement
  const BackgroundSvg = currentBackgroundSvg

  // Adicione isso após suas declarações de estado
  const fetchTrailsRef = useRef(fetchTrails)

  useEffect(() => {
    // Atualiza a referência quando fetchTrails mudar
    fetchTrailsRef.current = fetchTrails
  }, [fetchTrails])

  // Substitua seu useEffect atual por este
  useEffect(() => {
    // Usamos uma flag para garantir que a requisição só aconteça uma vez
    let isMounted = true

    const loadTrails = async () => {
      // Verificamos se o usuário está autenticado e o token foi carregado
      if (authUser && isTokenLoaded && isMounted) {
        logSync(LogLevel.INFO, "Carregando trilhas inicial")
        console.log("Iniciando carregamento inicial de trilhas")

        // Mostrar indicador de carregamento
        setIsRefreshing(true)

        try {
          // Forçar atualização completa
          await fetchTrailsRef.current()

          // Sincronizar o progresso
          if (isMounted) {
            await syncProgress()

            // Atualizar dados do usuário
            await refreshUserData()

            // Marcar como carregado
            setHasLoadedTrails(true)
            setInitialRefreshDone(true)
            console.log("Carregamento inicial concluído com sucesso")
          }
        } catch (error) {
          console.error("Erro no carregamento inicial:", error)
          logSync(LogLevel.ERROR, "Erro no carregamento inicial:", error)
        } finally {
          if (isMounted) {
            setIsRefreshing(false)
          }
        }
      }
    }

    // Executar carregamento inicial imediatamente
    if (!initialRefreshDone) {
      loadTrails()
    }

    // Cleanup function para evitar memory leaks e chamadas após desmontagem
    return () => {
      isMounted = false
    }
  }, [authUser, isTokenLoaded, initialRefreshDone])

  const TAB_HEIGHT = 50
  const TRAIL_SELECTOR_HEIGHT = 80

  return (
    <View className="flex-1" style={{ backgroundColor: "transparent" }}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#F6A608" />

      {(trailsLoading || isSyncing || isRefreshing) && (
        <View className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <View className="bg-white p-6 rounded-xl shadow-lg">
            <Text className="text-lg font-medium text-center mb-4">
              {isRefreshing
                ? `Sincronizando dados (${refreshCountRef.current}/${refreshCount || 1})...`
                : isSyncing
                  ? "Sincronizando progresso..."
                  : "Carregando trilhas..."}
            </Text>
            <ActivityIndicator size="large" color="#F6A608" />
          </View>
        </View>
      )}

      {trailsError && (
        <View className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <View className="bg-white p-6 rounded-xl shadow-lg">
            <Text className="text-lg font-medium text-center mb-4 text-red-500">Erro ao carregar trilhas</Text>
            <Text className="text-gray-600 mb-4">{trailsError}</Text>
            <TouchableOpacity className="bg-primary py-2 px-4 rounded-lg" onPress={() => refreshTrails(true)}>
              <Text className="text-white font-medium">Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!trailsLoading && !isSyncing && !isRefreshing && trilhas && trilhas.length === 0 && (
        <View className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <View className="bg-white p-6 rounded-xl shadow-lg">
            <Text className="text-lg font-medium text-center mb-4">Nenhuma trilha encontrada</Text>
            <TouchableOpacity className="bg-primary py-2 px-4 rounded-lg" onPress={() => refreshTrails(true)}>
              <Text className="text-white font-medium">Atualizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <>
        <DuolingoHeader nome={nome} scrollY={scrollY} selectedQuestion={selectedQuestion} />

      </>
      {/* Navegador de trilha */}
      <View className="bg-secondary px-4 py-6 flex-row justify-between items-center absolute bottom-16 left-0 right-0 z-20 border-t-2 border-tertiary">
        <TouchableOpacity
          onPress={handlePreviousTrilha}
          className="bg-tertiary p-2 rounded-md"
          disabled={trilhaAtualIndex === 0 || isAnimating}
        >
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-white font-bold text-lg mb-1">
            {currentTrilha ? currentTrilha.nome : "Carregando..."}
          </Text>
          <View className="flex-row justify-center items-center mt-1">
            {trilhas && trilhas.length > 0
              ? trilhas.map((_, index) => (
                  <TouchableOpacity
                    key={`indicator-${index}`}
                    onPress={() => {
                      if (index < trilhaAtualIndex) {
                        handlePreviousTrilha()
                      } else if (index > trilhaAtualIndex) {
                        handleNextTrilha()
                      }
                    }}
                    className="mx-1"
                  >
                    <View
                      className={`rounded-full ${trilhaAtualIndex === index ? "bg-white w-3 h-3" : "bg-tertiary w-2 h-2"}`}
                    />
                  </TouchableOpacity>
                ))
              : null}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNextTrilha}
          className="bg-tertiary p-2 rounded-md"
          disabled={trilhaAtualIndex === trilhas?.length - 1 || isAnimating}
        >
          <ChevronRight size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal com trilha de aprendizado - agora com animação de slide */}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: slideAnim }],
        }}
        onLayout={onContainerLayout}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{
            flexGrow: stages.length > 3 ? 1 : 0, // Only use flexGrow: 1 when there are enough stages
            backgroundColor: "transparent", // Make background transparent
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="normal"
          // Adicione estas propriedades para iniciar o scroll na parte inferior
          contentOffset={{ x: 0, y: 10000 }} // Um valor grande para garantir que comece no final
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        >
          <LearningPathTrack
            etapas={stages}
            currentEtapaIndex={etapaAtualIndex}
            onEtapaPress={handleStagePress}
            containerHeight={containerHeight}
            backgroundUrl={currentTrilha?.backgroundSvg || ""} // Usar backgroundSvg da trilha atual
            trailId={currentTrilha?.id || ""}
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </View>
  )
}

export default Home
