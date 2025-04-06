"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Easing } from "react-native"
import type { QuestionType } from "../../(tabs)/home"
import React from "react"

// Interface para os itens que precisam ser ordenados
interface OrderItem {
  id: string
  text?: string
  image?: string | any
}

// Interface para a questão de ordenação
interface OrderingQuestion {
  id: string
  type: QuestionType.ORDERING
  description: string
  items: OrderItem[]
  correctOrder: string[]
  statementText?: string
  explanation?: string
}

interface OrderingProps {
  question: OrderingQuestion
  onAnswer: (correct: boolean, explanation?: string) => void
  questionNumber: number
}

const Ordering = ({ question, onAnswer, questionNumber }: OrderingProps) => {
  // Estados principais
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const [availableItemIds, setAvailableItemIds] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  // Estado para animações
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null)
  const fadeAnim = useState(new Animated.Value(1))[0]
  const scaleAnim = useState(new Animated.Value(1))[0]

  // Ref para armazenar a ordem selecionada atual (para evitar problemas com closures)
  const selectedOrderRef = useRef<string[]>([])

  // Inicialização
  useEffect(() => {
    console.log("Ordering component mounted with question:", question)
    console.log("Correct order is:", question.correctOrder)

    if (question && question.items) {
      // Inicializar os IDs dos itens disponíveis
      const itemIds = question.items.map((item) => item.id)
      setAvailableItemIds(itemIds)
    }
  }, [question])

  // Reset quando a questão mudar
  useEffect(() => {
    if (question) {
      setSelectedOrder([])
      selectedOrderRef.current = []
      setAvailableItemIds(question.items.map((item) => item.id))
      setSubmitted(false)
      setAnimatingItemId(null)
      console.log("Question changed, resetting states")
    }
  }, [question.id])

  // Verificação de segurança
  if (!question) {
    console.error("Question is undefined in Ordering component")
    return (
      <View className="flex-1 p-4 justify-center items-center">
        <Text className="text-red-500">Erro: Questão não encontrada</Text>
      </View>
    )
  }

  const defaultStatementText = "Coloque na ordem correta!"
  const statementText = question.statementText || defaultStatementText

  // Função para verificar se a ordem está correta
  const checkOrder = () => {
    // Usar a referência para garantir que temos o valor mais atualizado
    const currentSelectedOrder = selectedOrderRef.current

    console.log("Checking order - Selected:", JSON.stringify(currentSelectedOrder))
    console.log("Checking order - Correct:", JSON.stringify(question.correctOrder))

    // Verificar se todos os itens foram selecionados
    if (currentSelectedOrder.length !== question.correctOrder.length) {
      console.log("Length mismatch - selected:", currentSelectedOrder.length, "correct:", question.correctOrder.length)
      return false
    }

    // Comparação item por item com logs detalhados
    for (let i = 0; i < currentSelectedOrder.length; i++) {
      console.log(`Comparing position ${i}: selected=${currentSelectedOrder[i]}, correct=${question.correctOrder[i]}`)
      if (currentSelectedOrder[i] !== question.correctOrder[i]) {
        console.log(`Mismatch at position ${i}: ${currentSelectedOrder[i]} !== ${question.correctOrder[i]}`)
        return false
      }
    }

    console.log("Final validation result: CORRECT")
    return true
  }

  // Função para lidar com a seleção de um item
  const handleItemSelect = (itemId: string) => {
    if (submitted || animatingItemId) return

    // Marcar este item como o que está sendo animado
    setAnimatingItemId(itemId)

    // Animar o item selecionado
    Animated.sequence([
      // 1. Escala para cima (efeito de "pegar" o item)
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      // 2. Escala para o tamanho normal
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start()

    // Animar o desaparecimento
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Após a animação, atualizar os estados
      const newSelectedOrder = [...selectedOrderRef.current, itemId]

      // Atualizar tanto o estado quanto a referência
      setSelectedOrder(newSelectedOrder)
      selectedOrderRef.current = newSelectedOrder

      setAvailableItemIds((prev) => prev.filter((id) => id !== itemId))
      setAnimatingItemId(null)
      fadeAnim.setValue(1) // Reset para próxima animação

      console.log("Item selected:", itemId)
      console.log("Updated selected order:", newSelectedOrder)

      // Verificar se todos os itens foram selecionados
      if (newSelectedOrder.length === question.items.length) {
        console.log("All items selected, checking order...")
        setTimeout(() => {
          setSubmitted(true)
          const isCorrect = checkOrder()
          console.log("Validation result:", isCorrect)
          onAnswer(isCorrect, question.explanation)
        }, 300)
      }
    })
  }

  // Função para renderizar um item (texto ou imagem)
  const renderItemContent = (item: OrderItem) => {
    if (item.image) {
      // Se for um objeto (require), use diretamente
      if (typeof item.image === "object") {
        return <Image source={item.image} className="w-full h-full" resizeMode="contain" />
      }

      // Se for uma string (URI), use como URI
      return <Image source={{ uri: item.image as string }} className="w-full h-full" resizeMode="contain" />
    }

    // Se for apenas texto
    return <Text className="text-center text-gray-800 font-medium">{item.text}</Text>
  }

  // Renderizar as posições de destino
  const renderPositions = () => {
    return question.items.map((_, index) => {
      const isOccupied = selectedOrder.length > index
      const itemId = isOccupied ? selectedOrder[index] : null
      const item = itemId ? question.items.find((i) => i.id === itemId) : null

      return (
        <View key={`position-${index}`} className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-full bg-indigo-900 items-center justify-center mr-3">
            <Text className="text-white font-bold text-xl">{index + 1}</Text>
          </View>
          <View className="flex-1 h-14 bg-gray-400 rounded-lg justify-center px-4">
            {isOccupied && item && <View className="w-full h-full justify-center">{renderItemContent(item)}</View>}
          </View>
        </View>
      )
    })
  }

  // Renderizar os itens disponíveis para seleção
  const renderAvailableItems = () => {
    return (
      <View className="mt-4">
        {question.items.map((item) => {
          const isAvailable = availableItemIds.includes(item.id)
          const isAnimating = animatingItemId === item.id

          if (!isAvailable) return null

          return (
            <Animated.View
              key={item.id}
              style={{
                marginBottom: 16,
                opacity: isAnimating ? fadeAnim : 1,
                transform: [{ scale: isAnimating ? scaleAnim : 1 }],
              }}
            >
              <TouchableOpacity
                className="bg-white border-2 border-indigo-100 rounded-full p-4 items-center justify-center"
                onPress={() => handleItemSelect(item.id)}
                disabled={submitted || animatingItemId !== null}
                activeOpacity={0.8}
              >
                {renderItemContent(item)}
              </TouchableOpacity>
            </Animated.View>
          )
        })}
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 pl-4 pr-4 pt-0 pb-0" showsVerticalScrollIndicator={false}>
      <View className="mb-5">
        {question.description && (
          <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <Text className="text-lg text-gray-800 leading-relaxed">{question.description}</Text>
          </View>
        )}
      </View>

      {/* Área de posições para ordenação */}
      <View>{renderPositions()}</View>

      <View className="mt-1 mb-1">
        <Text className="text-center text-lg font-semibold text-zinc-100">{statementText}</Text>
      </View>

      {/* Itens disponíveis para seleção */}
      {renderAvailableItems()}
    </ScrollView>
  )
}
export default Ordering

