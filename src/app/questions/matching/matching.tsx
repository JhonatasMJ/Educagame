"use client"

import React, { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Easing, StyleSheet } from "react-native"
import type { QuestionType } from "../../(tabs)/home"
import Svg, { Line } from "react-native-svg"

// Definição das interfaces para os itens das colunas
interface ColumnItem {
  id: string
  text?: string
  image?: string | any
}

// Interface para a questão de relacionar colunas
interface MatchingQuestion {
  id: string
  type: QuestionType.MATCHING
  description: string
  leftColumn: ColumnItem[]
  rightColumn: ColumnItem[]
  correctMatches: { left: string; right: string }[]
  statementText?: string
  explanation?: string
}

interface MatchingProps {
  question: MatchingQuestion
  onAnswer: (correct: boolean, explanation?: string) => void
  questionNumber: number
}

const Matching = ({ question, onAnswer, questionNumber }: MatchingProps) => {
  // Estados para controlar a seleção e correspondências
  const [selectedItem, setSelectedItem] = useState<{ id: string; side: "left" | "right" } | null>(null)
  const [matches, setMatches] = useState<{ left: string; right: string }[]>([])
  const [submitted, setSubmitted] = useState(false)

  // Referências para as posições dos itens
  const leftItemPositions = useRef<{ [key: string]: { x: number; y: number; height: number } }>({})
  const rightItemPositions = useRef<{ [key: string]: { x: number; y: number; height: number } }>({})

  // Estados para animações
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null)
  const scaleAnim = useRef(new Animated.Value(1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Referência para o ScrollView
  const scrollViewRef = useRef<ScrollView>(null)

  // Resetar o estado quando a questão mudar
  useEffect(() => {
    if (question) {
      setSelectedItem(null)
      setMatches([])
      setSubmitted(false)
      setAnimatingItemId(null)
      leftItemPositions.current = {}
      rightItemPositions.current = {}
      console.log("Question changed, resetting states")
    }
  }, [question])

  // Iniciar animação de pulso para o item selecionado
  useEffect(() => {
    if (selectedItem) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [selectedItem])

  // Verificação de segurança
  if (!question) {
    console.error("Question is undefined in Matching component")
    return (
      <View className="flex-1 p-4 justify-center items-center">
        <Text className="text-red-500 text-lg">Erro: Questão não encontrada</Text>
      </View>
    )
  }

  const defaultStatementText = "Relacione as colunas!"
  const statementText = question.statementText || defaultStatementText

  // Registrar a posição de um item da coluna esquerda
  const registerLeftItemPosition = (id: string, x: number, y: number, height: number) => {
    leftItemPositions.current[id] = { x, y, height }
  }

  // Registrar a posição de um item da coluna direita
  const registerRightItemPosition = (id: string, x: number, y: number, height: number) => {
    rightItemPositions.current[id] = { x, y, height }
  }

  // Manipular a seleção de um item (de qualquer coluna)
  const handleItemPress = (itemId: string, side: "left" | "right") => {
    if (submitted) return

    // Se já existe um match para este item, não permite selecionar
    if (
      (side === "left" && matches.some((match) => match.left === itemId)) ||
      (side === "right" && matches.some((match) => match.right === itemId))
    ) {
      return
    }

    // Animar o item selecionado
    setAnimatingItemId(itemId)
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start(() => {
      setAnimatingItemId(null)

      // Se já temos um item selecionado
      if (selectedItem) {
        // Se o item clicado é o mesmo que já estava selecionado, desseleciona
        if (selectedItem.id === itemId && selectedItem.side === side) {
          setSelectedItem(null)
          return
        }

        // Se o item clicado é do mesmo lado que o já selecionado, troca a seleção
        if (selectedItem.side === side) {
          setSelectedItem({ id: itemId, side })
          return
        }

        // Se o item clicado é do lado oposto, cria um match
        let newMatch
        if (selectedItem.side === "left") {
          newMatch = { left: selectedItem.id, right: itemId }
        } else {
          newMatch = { left: itemId, right: selectedItem.id }
        }

        const newMatches = [...matches, newMatch]
        setMatches(newMatches)
        setSelectedItem(null)

        // Verificar se todas as correspondências foram feitas
        if (newMatches.length === question.leftColumn.length) {
          // Verificar se as correspondências estão corretas
          checkMatches(newMatches)
        }
      } else {
        // Se não temos item selecionado, seleciona este
        setSelectedItem({ id: itemId, side })
      }
    })
  }

  // Remover um match existente
  const removeMatch = (leftId: string, rightId: string) => {
    if (submitted) return

    setMatches(matches.filter((match) => !(match.left === leftId && match.right === rightId)))
  }

  // Verificar se as correspondências estão corretas
  const checkMatches = (currentMatches: { left: string; right: string }[]) => {
    setSubmitted(true)

    // Verificar se todas as correspondências estão corretas
    const allCorrect = question.correctMatches.every((correctMatch) => {
      return currentMatches.some((match) => match.left === correctMatch.left && match.right === correctMatch.right)
    })

    // Notificar o componente pai
    onAnswer(allCorrect, question.explanation)
  }

  // Verificar se um match está correto
  const isMatchCorrect = (leftId: string, rightId: string): boolean => {
    if (!submitted) return true // Durante o jogo, todos os matches são considerados "corretos" visualmente

    return question.correctMatches.some((match) => match.left === leftId && match.right === rightId)
  }

  // Renderizar o conteúdo de um item (texto ou imagem)
  const renderItemContent = (item: ColumnItem) => {
    if (item.image) {
      // Se for um objeto (require), use diretamente
      if (typeof item.image === "object") {
        return (
          <View className="w-full h-full justify-center items-center">
            <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
          </View>
        )
      }

      // Se for uma string (URI), use como URI
      return (
        <View className="w-full h-full justify-center items-center">
          <Image source={{ uri: item.image as string }} style={styles.itemImage} resizeMode="contain" />
        </View>
      )
    }

    // Se for apenas texto
    return <Text className="text-center text-gray-800 font-medium px-2">{item.text}</Text>
  }

  // Renderizar as linhas de conexão entre os itens correspondentes
  const renderMatchLines = () => {
    return matches.map((match, index) => {
      const leftPos = leftItemPositions.current[match.left]
      const rightPos = rightItemPositions.current[match.right]

      if (!leftPos || !rightPos) return null

      // Calcular as coordenadas para a linha
      const x1 = leftPos.x + 150 // Largura do item da esquerda
      const y1 = leftPos.y + leftPos.height / 2
      const x2 = rightPos.x
      const y2 = rightPos.y + rightPos.height / 2

      const isCorrect = isMatchCorrect(match.left, match.right)
      const lineColor = submitted ? (isCorrect ? "#22c55e" : "#ef4444") : "#3b82f6"
      const lineWidth = submitted ? 3 : 2

      return (
        <Svg key={`line-${index}`} style={StyleSheet.absoluteFill}>
          <Line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeDasharray={submitted ? "" : "5,5"}
          />
        </Svg>
      )
    })
  }

  // Renderizar os itens da coluna esquerda
  const renderLeftColumn = () => {
    return question.leftColumn.map((item, index) => {
      const isSelected = selectedItem?.id === item.id && selectedItem?.side === "left"
      const isMatched = matches.some((match) => match.left === item.id)
      const isAnimating = animatingItemId === item.id

      // Determinar o estilo com base no estado do item
      let itemStyle = "bg-white border-2 border-gray-300"
      if (isSelected) {
        itemStyle = "bg-yellow-100 border-2 border-yellow-500 shadow-md" // Alterado para amarelo claro
      } else if (isMatched) {
        if (submitted) {
          const match = matches.find((m) => m.left === item.id)
          const isCorrect = match ? isMatchCorrect(match.left, match.right) : false
          itemStyle = isCorrect ? "bg-green-100 border-2 border-green-500" : "bg-red-100 border-2 border-red-500"
        } else {
          itemStyle = "bg-indigo-50 border-2 border-indigo-300"
        }
      }

      return (
        <Animated.View
          key={`left-${item.id}`}
          style={{
            transform: [{ scale: isAnimating ? scaleAnim : isSelected ? pulseAnim : 1 }],
            opacity: isMatched && !isSelected ? 0.8 : 1,
            marginBottom: 5,
          }}
          onLayout={(event) => {
            const { x, y, height } = event.nativeEvent.layout
            registerLeftItemPosition(item.id, x, y, height)
          }}
        >
          <TouchableOpacity
            className={`rounded-xl p-4 min-h-[50px] justify-center items-center ${itemStyle}`}
            style={{ width: 150, maxWidth: 150 }}
            onPress={() => handleItemPress(item.id, "left")}
            disabled={submitted || isMatched}
            activeOpacity={0.7}
          >
            {renderItemContent(item)}
          </TouchableOpacity>
        </Animated.View>
      )
    })
  }

  // Renderizar os itens da coluna direita
  const renderRightColumn = () => {
    return question.rightColumn.map((item, index) => {
      const isSelected = selectedItem?.id === item.id && selectedItem?.side === "right"
      const isMatched = matches.some((match) => match.right === item.id)
      const isAnimating = animatingItemId === item.id

      // Determinar o estilo com base no estado do item
      let itemStyle = "bg-white border-2 border-gray-300"
      if (isSelected) {
        itemStyle = "bg-yellow-100 border-2 border-yellow-500 shadow-md" // Alterado para amarelo claro
      } else if (isMatched) {
        if (submitted) {
          const match = matches.find((m) => m.right === item.id)
          const isCorrect = match ? isMatchCorrect(match.left, match.right) : false
          itemStyle = isCorrect ? "bg-green-100 border-2 border-green-500" : "bg-red-100 border-2 border-red-500"
        } else {
          itemStyle = "bg-indigo-50 border-2 border-indigo-300"
        }
      }

      return (
        <Animated.View
          key={`right-${item.id}`}
          style={{
            transform: [{ scale: isAnimating ? scaleAnim : isSelected ? pulseAnim : 1 }],
            opacity: isMatched && !isSelected ? 0.8 : 1,
            marginBottom: 5,
          }}
          onLayout={(event) => {
            const { x, y, height } = event.nativeEvent.layout
            registerRightItemPosition(item.id, x, y, height)
          }}
        >
          <TouchableOpacity
            className={`rounded-xl p-4 min-h-[50px] justify-center items-center ${itemStyle}`}
            style={{ width: 150, maxWidth: 150 }}
            onPress={() => handleItemPress(item.id, "right")}
            disabled={submitted || isMatched}
            activeOpacity={0.7}
          >
            {renderItemContent(item)}
          </TouchableOpacity>
        </Animated.View>
      )
    })
  }

  return (
    <ScrollView ref={scrollViewRef} className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      {/* Descrição da questão */}
      {question.description && (
        <View className="mb-5">
          <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <Text className="text-lg text-gray-800 leading-relaxed">{question.description}</Text>
          </View>
        </View>
      )}

      {/* Título da atividade */}
      {statementText && (
        <View className="mb-5">
          <Text className="text-center text-lg font-semibold text-zinc-100">{statementText}</Text>
        </View>
      )}

      {/* Área de correspondência */}
      <View className="flex-1 relative mb-1">
        {/* Linhas de conexão */}
        {renderMatchLines()}

        {/* Colunas */}
        <View className="flex-row w-[100%]">
          {/* Coluna esquerda */}
          <View
            className="flex-1 items-start"
            style={{
              height: "100%",
              justifyContent: "space-around",
            }}
          >
            {renderLeftColumn()}
          </View>

          {/* Coluna direita */}
          <View
            className="flex-1 items-end"
            style={{
              height: "100%",
              justifyContent: "space-around",
            }}
          >
            {renderRightColumn()}
          </View>
        </View>
      </View>

      {/* Espaço adicional no final para garantir que tudo seja visível */}
      <View style={{ height: 20 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  itemImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
})

export default Matching
