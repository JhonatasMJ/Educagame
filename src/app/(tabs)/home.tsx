"use client"

import React,{ useState, useEffect, useRef } from "react"
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
} from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { useAuth } from "@/src/context/AuthContext"
import { router } from "expo-router"
import { useGameProgress } from "@/src/context/GameProgressContext"
import DuolingoHeader from "@/src/components/DuolingoHeader"
import LearningPathTrack from "@/src/components/LearningPathTrack"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"

// At the top of the file, add these imports for the SVG backgrounds
import Background1 from "@/assets/images/fundo.svg"
import Background2 from "@/assets/images/fundo2.svg" // Make sure this file exists

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

// Update the trilhas data structure to include backgroundSvg property
// Find the trilhas declaration and modify the first two objects:
export const trilhas = [
  {
    id: "1",
    nome: "React Native Básico",
    descricao: "Aprenda os fundamentos do React Native",
    image: require("@/assets/images/fundo.svg"),
    backgroundSvg: Background1, // SVG component for background
    etapas: [
      {
        id: "2",
        titulo: "Componentes Básicos", // Título exibido na home
        descricao: "Aprenda sobre os componentes fundamentais",
        concluida: false, // Agora depende da conclusão de todos os stages
        icon: "book-open-text",
        iconLibrary: "lucide",
        // Novo array de stages
        stages: [
          {
            id: "stage1",
            title: "Introdução aos Componentes", // Título exibido no StartPhase
            description: "Conceitos básicos de componentes React Native",
            completed: true, // Este stage está concluído
            pontos_chave: [
              "Entender o que são componentes no React Native",
              "Conhecer os componentes básicos da plataforma",
              "Aprender a criar componentes personalizados",
            ],
            image: "https://reactnative.dev/img/tiny_logo.png",
            video: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
            tempo_estimado: "15-20 minutos",
            questions: [
              {
                id: "q1",
                type: QuestionType.TRUE_OR_FALSE,
                description: "React Native permite escrever código uma vez e executar em múltiplas plataformas.",
                isTrue: true,
                explanation:
                  "Correto! React Native permite que você escreva código JavaScript que funciona tanto em iOS quanto em Android.",
              },
              {
                id: "q2",
                type: QuestionType.TRUE_OR_FALSE,
                description: "React Native usa WebView para renderizar a interface do usuário.",
                isTrue: false,
                explanation:
                  "Incorreto! React Native não usa WebView, ele renderiza componentes nativos reais da plataforma.",
              },
            ],
          },
          {
            id: "stage2",
            title: "Componentes Avançados",
            description: "Aprofundamento em componentes complexos",
            completed: false, // Este stage está concluído
            pontos_chave: [
              "Trabalhar com FlatList e SectionList",
              "Implementar componentes com animações",
              "Otimizar o desempenho de listas longas",
            ],
            image: "https://t2.tudocdn.net/720005?w=1200&h=1200",
            video: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
            tempo_estimado: "25-30 minutos",
            questions: [
              {
                id: "q1",
                type: QuestionType.TRUE_OR_FALSE,
                description:
                  "React Native permite escrever código uma vez e executar em múltiplas plataformas.",
                isTrue: true,
                explanation:
                  "Correto! React Native permite que você escreva código JavaScript que funciona tanto em iOS quanto em Android.",
              },
              {
                id: "q2",
                type: QuestionType.MATCHING,
                description:
                  "Relacione os conceitos de React Native com suas descrições corretas:",
                leftColumn: [
                  { id: "l1", text: "Component" },
                  { id: "l2", text: "Props" },
                  { id: "l3", text: "State" },
                  { id: "l4", text: "Hook" },
                ],
                rightColumn: [
                  {
                    id: "r1",
                    text: "Parâmetros passados de um componente pai para um filho",
                  },
                  {
                    id: "r2",
                    text: "Função que permite usar recursos do React em componentes funcionais",
                  },
                  {
                    id: "r3",
                    text: "Bloco de construção básico de uma interface React",
                  },
                  {
                    id: "r4",
                    text: "Dados que um componente gerencia e que podem mudar ao longo do tempo",
                  },
                ],
                correctMatches: [
                  { left: "l1", right: "r3" },
                  { left: "l2", right: "r1" },
                  { left: "l3", right: "r4" },
                  { left: "l4", right: "r2" },
                ],
                statementText: "Relacione os conceitos com suas descrições!",
                explanation:
                  "Component é o bloco de construção básico, Props são parâmetros passados entre componentes, State gerencia dados mutáveis, e Hooks permitem usar recursos do React em componentes funcionais.",
              },
              
              {
                id: "q3",
                type: QuestionType.ORDERING,
                items: [
                  { id: "a", text: "1" },
                  { id: "b", text: "2" },
                  { id: "c", text: "3" },
                  { id: "d", text: "4" },
                ],
                correctOrder: ["a", "b", "c", "d"],
                statementText: "Coloque a ordem correta!",
                explanation:
                  "A ordem cronológica correta é: Descobrimento (1500), Independência (1822), Abolição (1888) e República (1889).",
              },
              
              {
                id: "q4",
                type: QuestionType.MULTIPLE_CHOICE,
                description:
                  "Quais são as formas de estilizar componentes no React Native?",
                options: [
                  { id: "a", text: "StyleSheet" },
                  { id: "b", text: "Inline styles" },
                  { id: "c", text: "CSS" },
                  { id: "d", text: "Styled Components" },
                ],
                correctOptions: ["a", "b", "d"],
                multipleCorrect: true,
                statementText: "Selecione todas as opções corretas:",
                explanation:
                  "React Native suporta StyleSheet, estilos inline e bibliotecas como Styled Components. CSS tradicional não é suportado diretamente.",
              },
            ],
          },
          {
            id: "stage3",
            title: "Estilização de Componentes",
            description: "Como estilizar componentes no React Native",
            completed: false, // Este stage não está concluído
            pontos_chave: [
              "Entender o sistema de estilização do React Native",
              "Aplicar estilos usando StyleSheet",
              "Trabalhar com estilos condicionais",
            ],
            video: "https://www.youtube.com/watch?v=KcC8KZ_Ga2M",
            tempo_estimado: "20-25 minutos",
            questions: [
              {
                id: "q4",
                type: QuestionType.MULTIPLE_CHOICE,
                description: "Quais são as formas de estilizar componentes no React Native?",
                options: [
                  { id: "a", text: "StyleSheet" },
                  { id: "b", text: "Inline styles" },
                  { id: "c", text: "CSS" },
                  { id: "d", text: "Styled Components" },
                ],
                correctOptions: ["a", "b", "d"],
                multipleCorrect: true,
                statementText: "Selecione todas as opções corretas:",
                explanation:
                  "React Native suporta StyleSheet, estilos inline e bibliotecas como Styled Components. CSS tradicional não é suportado diretamente.",
              },
            ],
          },
        ],
      },
      {
        id: "3",
        titulo: "Navegação",
        concluida: false,
        icon: "target",
        iconLibrary: "lucide",
        descricao: "Aprenda sobre navegação entre telas",
        // Novo array de stages
        stages: [
          {
            id: "stage1",
            title: "Conceitos de Navegação",
            description: "Entendendo os conceitos básicos de navegação",
            completed: false, // Este stage está concluído
            pontos_chave: [
              "Compreender os tipos de navegação em apps móveis",
              "Conhecer as principais bibliotecas de navegação",
              "Entender a estrutura de navegação em pilha",
            ],
            image: "https://reactnavigation.org/img/spiro.svg",
            tempo_estimado: "15-20 minutos",
            questions: [
              {
                id: "q1",
                type: QuestionType.MULTIPLE_CHOICE,
                description: "Quais das seguintes são bibliotecas de navegação para React Native?",
                options: [
                  { id: "a", text: "React Navigation" },
                  { id: "b", text: "Expo Router" },
                  { id: "c", text: "React Native Navigation" },
                  { id: "d", text: "React Router Native" },
                ],
                correctOptions: ["a", "b", "c", "d"],
                multipleCorrect: true,
                statementText: "Selecione todas as opções corretas:",
                explanation:
                  "Todas estas são bibliotecas de navegação populares para React Native, cada uma com suas próprias vantagens e abordagens.",
              },
            ],
          },
          {
            id: "stage2",
            title: "Navegação em Pilha",
            description: "Implementando navegação em pilha",
            completed: false, // Este stage não está concluído
            pontos_chave: [
              "Configurar o Stack Navigator",
              "Passar parâmetros entre telas",
              "Personalizar o header da navegação",
            ],
            video: "https://www.youtube.com/watch?v=nQVCkqvU1uE",
            tempo_estimado: "20-25 minutos",
            questions: [
              {
                id: "q2",
                type: QuestionType.MULTIPLE_CHOICE,
                description: "Qual navegador no React Navigation permite navegação em pilha entre telas?",
                options: [
                  { id: "a", text: "Stack Navigator" },
                  { id: "b", text: "Tab Navigator" },
                  { id: "c", text: "Drawer Navigator" },
                  { id: "d", text: "Bottom Navigator" },
                ],
                correctOptions: ["a"],
                multipleCorrect: false,
                explanation:
                  "O Stack Navigator empilha telas uma sobre a outra, permitindo navegação para frente e para trás.",
              },
            ],
          },
        ],
      },
      {
        id: "4",
        titulo: "Estado e Props",
        concluida: false,
        icon: "book",
        iconLibrary: "lucide",
        descricao: "Gerenciamento de estado e propriedades",
        // Novo array de stages
        stages: [
          {
            id: "stage1",
            title: "Introdução a Estado",
            description: "Conceitos básicos de estado no React",
            completed: false, // Este stage não está concluído
            pontos_chave: [
              "Entender o conceito de estado em React",
              "Utilizar o hook useState",
              "Atualizar o estado de forma correta",
            ],
            image: "https://legacy.reactjs.org/logo-og.png",
            tempo_estimado: "15-20 minutos",
            questions: [
              {
                id: "q1",
                type: QuestionType.MULTIPLE_CHOICE,
                description: "Quais dos seguintes são hooks do React para gerenciamento de estado?",
                options: [
                  { id: "a", text: "useState" },
                  { id: "b", text: "useEffect" },
                  { id: "c", text: "useReducer" },
                  { id: "d", text: "useContext" },
                ],
                correctOptions: ["a", "c", "d"],
                multipleCorrect: true,
                statementText: "Selecione todas as opções que são hooks de estado:",
                explanation:
                  "useState, useReducer e useContext são hooks relacionados ao gerenciamento de estado. useEffect é um hook para efeitos colaterais, não diretamente para estado.",
              },
            ],
          },
          {
            id: "stage2",
            title: "Props e Comunicação",
            description: "Comunicação entre componentes com props",
            completed: false, // Este stage não está concluído
            pontos_chave: [
              "Entender o conceito de props",
              "Passar dados entre componentes pai e filho",
              "Implementar comunicação entre componentes",
            ],
            video: "https://www.youtube.com/watch?v=FtUNQpu2b7Q",
            tempo_estimado: "15-20 minutos",
            questions: [
              {
                id: "q2",
                type: QuestionType.TRUE_OR_FALSE,
                description: "Props são imutáveis em componentes React.",
                isTrue: true,
                explanation: "Correto! Props são somente leitura e não devem ser modificadas dentro do componente.",
              },
            ],
          },
        ],
      },
      {
        id: "5",
        titulo: "APIs Nativas",
        concluida: false,
        icon: "crown",
        iconLibrary: "lucide",
        descricao: "Acesso a recursos nativos do dispositivo",
        // Novo array de stages
        stages: [
          {
            id: "stage1",
            title: "Armazenamento de Dados",
            description: "Opções para armazenar dados localmente",
            completed: false, // Este stage não está concluído
            pontos_chave: [
              "Conhecer as opções de armazenamento local",
              "Implementar AsyncStorage para dados simples",
              "Trabalhar com bancos de dados locais",
            ],
            image: "https://docs.expo.dev/static/images/og.png",
            tempo_estimado: "20-25 minutos",
            questions: [
              {
                id: "q1",
                type: QuestionType.MULTIPLE_CHOICE,
                description: "Quais das seguintes APIs são usadas para armazenamento de dados em React Native?",
                options: [
                  { id: "a", text: "AsyncStorage" },
                  { id: "b", text: "SQLite" },
                  { id: "c", text: "Realm" },
                  { id: "d", text: "Firebase Firestore" },
                ],
                correctOptions: ["a", "b", "c", "d"],
                multipleCorrect: true,
                image: require("@/assets/images/logo.png"),
                statementText: "Selecione todas as opções corretas:",
                explanation:
                  "Todas estas são opções válidas para armazenamento de dados em aplicativos React Native, cada uma com diferentes casos de uso e complexidade.",
              },
            ],
          },
          {
            id: "stage2",
            title: "Geolocalização",
            description: "Acessando a localização do dispositivo",
            completed: false, // Este stage não está concluído
            pontos_chave: [
              "Solicitar permissões de localização",
              "Obter a posição atual do usuário",
              "Monitorar mudanças de localização",
            ],
            video: "https://www.youtube.com/watch?v=qlELLakgO9o",
            tempo_estimado: "20-25 minutos",
            questions: [
              {
                id: "q2",
                type: QuestionType.MULTIPLE_CHOICE,
                description: "Qual API é usada para acessar a localização do dispositivo em React Native?",
                options: [
                  { id: "a", text: "react-native-geolocation" },
                  { id: "b", text: "expo-location" },
                  { id: "c", text: "react-native-maps" },
                  { id: "d", text: "react-native-gps" },
                ],
                correctOptions: ["a", "b"],
                multipleCorrect: true,
                explanation:
                  "react-native-geolocation e expo-location são APIs para acessar a localização do dispositivo. react-native-maps é para exibir mapas e react-native-gps não é uma biblioteca padrão.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    nome: "Básico 2",
    image: "",
    backgroundSvg: Background2, // Different SVG component for background
    etapas: [
      {
        id: "1",
        titulo: "Roupas",
        concluida: false,
        icon: "https://cdn-icons-png.flaticon.com/512/69/69544.png",
        descricao: "Vocabulário de vestuário",
        // Novo array de stages
        stages: [
          {
            id: "stage1",
            title: "Roupas Básicas",
            description: "Vocabulário de roupas básicas",
            completed: false, // Este stage não está concluído
            pontos_chave: [
              "Aprender nomes de roupas comuns",
              "Praticar a pronúncia correta",
              "Usar as palavras em contexto",
            ],
            image:
              "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2xvdGhpbmd8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
            tempo_estimado: "10-15 minutos",
            questions: [
              {
                id: "q1",
                type: QuestionType.MULTIPLE_CHOICE,
                description: "Quais das seguintes são peças de roupa para a parte superior do corpo?",
                options: [
                  { id: "a", text: "Camisa" },
                  { id: "b", text: "Calça" },
                  { id: "c", text: "Blusa" },
                  { id: "d", text: "Sapato" },
                ],
                correctOptions: ["a", "c"],
                multipleCorrect: true,
                statementText: "Selecione todas as opções corretas:",
                explanation:
                  "Camisa e blusa são peças de vestuário usadas na parte superior do corpo. Calça é usada na parte inferior e sapato nos pés.",
              },
            ],
          },
        ],
      },
      {
        id: "2",
        titulo: "Cores",
        concluida: false,
        icon: "palette",
        iconLibrary: "material",
        descricao: "Aprenda as cores",
        // Novo array de stages
        stages: [
          {
            id: "stage1",
            title: "Cores Primárias",
            description: "Aprendendo sobre cores primárias",
            completed: false, // Este stage não está concluído
            pontos_chave: [
              "Identificar as cores primárias",
              "Entender a teoria das cores",
              "Aplicar cores em contextos práticos",
            ],
            image:
              "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29sb3JzfGVufDB8fDB8fHww&w=1000&q=80",
            tempo_estimado: "10-15 minutos",
            questions: [
              {
                id: "q1",
                type: QuestionType.MULTIPLE_CHOICE,
                description: "Quais das seguintes são cores primárias no sistema de cores subtrativas?",
                options: [
                  { id: "a", text: "Vermelho" },
                  { id: "b", text: "Verde" },
                  { id: "c", text: "Azul" },
                  { id: "d", text: "Amarelo" },
                ],
                correctOptions: ["a", "c", "d"],
                multipleCorrect: true,
                statementText: "Selecione todas as cores primárias:",
                explanation:
                  "No sistema de cores subtrativas (como tintas), as cores primárias são vermelho, azul e amarelo. No sistema aditivo (como luz), são vermelho, verde e azul.",
              },
            ],
          },
          {
            id: "stage2",
            title: "Mistura de Cores",
            description: "Aprendendo a misturar cores",
            completed: false, // Este stage não está concluído
            pontos_chave: [
              "Entender como misturar cores primárias",
              "Criar cores secundárias e terciárias",
              "Aplicar misturas de cores em exemplos práticos",
            ],
            video: "https://www.youtube.com/watch?v=_2LLXnUdUIc",
            tempo_estimado: "15-20 minutos",
            questions: [
              {
                id: "q2",
                type: QuestionType.MULTIPLE_CHOICE,
                description: "Qual é a cor resultante da mistura de azul e amarelo?",
                options: [
                  { id: "a", text: "Verde" },
                  { id: "b", text: "Roxo" },
                  { id: "c", text: "Laranja" },
                  { id: "d", text: "Marrom" },
                ],
                correctOptions: ["a"],
                multipleCorrect: false,
                explanation: "A mistura de azul e amarelo resulta na cor verde.",
              },
            ],
          },
        ],
      },
    ],
  },
]

// Main Home component
const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0)
  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0)

  const { userData, authUser, refreshUserData } = useAuth()
  const { getPhaseCompletionPercentage } = useGameProgress()
  const { isAuthenticated, isLoading } = useRequireAuth()
  const nome = `${userData?.nome || ""} ${userData?.sobrenome || ""}`
  const scrollViewRef = useRef<ScrollView>(null)
  const [containerHeight, setContainerHeight] = useState(height - 200) // Altura inicial estimada

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
  const [currentBackgroundSvg, setCurrentBackgroundSvg] = useState(() => trilhas[0].backgroundSvg)

  // Estatísticas do usuário para o cabeçalho
  const [userStats, setUserStats] = useState({
    points: 1430,
    streak: 7,
    gems: 45,
    lives: 5,
  })

  // Dados da trilha atual
  const currentTrilha = trilhas[trilhaAtualIndex]

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

  // 2. Agora, vamos corrigir o mapeamento de etapas

  const stages = currentTrilha.etapas.map((etapa, index) => {
    // Calcular o progresso com base nos stages concluídos
    const progress = calculateEtapaProgress(etapa)

    // Verificar se a etapa está totalmente concluída
    const concluida = isEtapaCompleted(etapa)

    return {
      id: etapa.id,
      titulo: etapa.titulo,
      descricao: etapa.descricao || "Descrição da etapa não disponível",
      concluida: concluida,
      icon: etapa.icon || "crown",
      iconLibrary: etapa.iconLibrary || "lucide",
      stages: etapa.stages || [],
      progress: progress,
    } as EtapaInfo
  })

  // 3. Corrigir o acesso às propriedades no handleStagePress

  const handleStagePress = (index: number) => {
    setEtapaAtualIndex(index)

    // Get the current etapa
    const currentEtapa = currentTrilha.etapas[index]

    // Encontrar o primeiro stage não concluído ou o primeiro stage se todos estiverem concluídos
    const currentStageIndex = currentEtapa.stages.findIndex((stage) => !stage.completed)
    const stageIndex = currentStageIndex >= 0 ? currentStageIndex : 0
    const currentStage = currentEtapa.stages[stageIndex]

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
        video: (currentStage as StageInfo).video || "", // Type assertion to StageInfo
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
    setCurrentBackgroundSvg(() => trilhas[trilhaAtualIndex].backgroundSvg)
  }, [trilhaAtualIndex])

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

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#F6A608" />

      {/* Background SVG with parallax effect */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#F0E6D2", // Background color that shows if image ends
          zIndex: -1,
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateY: backgroundScrollY }],
          }}
        >
          {BackgroundSvg && (
            <BackgroundSvg
              width="100%"
              height={height * 1.5} // Make SVG taller than screen for scrolling effect
              preserveAspectRatio="xMidYMid slice"
            />
          )}
        </Animated.View>
      </View>

      <DuolingoHeader nome={nome} scrollY={scrollY} selectedQuestion={selectedQuestion} />

      <View className="bg-secondary px-4 py-6 flex-row justify-between items-center absolute bottom-20 left-0 right-0 z-20 border-t-2 border-tertiary">
        <TouchableOpacity
          onPress={handlePreviousTrilha}
          className="bg-tertiary p-2 rounded-md"
          disabled={trilhaAtualIndex === 0 || isAnimating}
        >
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-white font-bold text-lg mb-1">{currentTrilha.nome}</Text>
          <View className="flex-row justify-center items-center mt-1">
            {trilhas.map((_, index) => (
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
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNextTrilha}
          className="bg-tertiary p-2 rounded-md"
          disabled={trilhaAtualIndex === trilhas.length - 1 || isAnimating}
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
            alignItems: "center",
            paddingHorizontal: 16,
            paddingBottom: 96,
            paddingTop: 60, // Added padding to create space at the top
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16} // Standard value for smooth animation
          decelerationRate="normal" // Smoother deceleration
        >
          <View style={{ height: 60 }} /> {/* Increased padding to create more space between header and content */}
          <LearningPathTrack
            etapas={stages}
            currentEtapaIndex={etapaAtualIndex}
            onEtapaPress={handleStagePress}
            containerHeight={containerHeight}
            backgroundImage={currentTrilha.image}
            trailId={currentTrilha.id}
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </View>
  )
}

export default Home
