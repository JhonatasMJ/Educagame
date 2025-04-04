"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Easing } from "react-native"
import type { QuestionType } from "../../(tabs)/home"
import React from "react"

// Interface para os itens que precisam ser ordenados
interface OrderItem {
  id: string
  text?: string
  image?: string | any // Aceita tanto string quanto objeto require()
}

// Interface para a questão de ordenação
interface OrderingQuestion {
  id: string
  type: QuestionType.ORDERING
  description: string
  items: OrderItem[]
  correctOrder: string[] // Array com os IDs dos itens na ordem correta
  statementText?: string
  explanation?: string
}

interface OrderingProps {
  question: OrderingQuestion
  onAnswer: (correct: boolean, explanation?: string) => void
  questionNumber: number
}

const Ordering = ({ question, onAnswer, questionNumber }: OrderingProps) => {
  // Estado para armazenar a ordem selecionada pelo usuário
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  // Estado para armazenar os itens disponíveis (ainda não selecionados)
  const [availableItems, setAvailableItems] = useState<OrderItem[]>([])
  // Estado para controlar se a resposta foi submetida
  const [submitted, setSubmitted] = useState(false)
  // Referências para animações
  const animRefs = useRef<{ [key: string]: Animated.Value }>({})
  const positionRefs = useRef<{ [key: string]: { x: number; y: number } }>({})

  // Log para debug
  useEffect(() => {
    console.log("Ordering component mounted with question:", question)

    // Inicializar os itens disponíveis
    if (question && question.items) {
      setAvailableItems([...question.items])

      // Inicializar as referências de animação para cada item
      question.items.forEach((item) => {
        animRefs.current[item.id] = new Animated.Value(0)
      })
    }
  }, [question])

  // Reset quando a questão mudar
  useEffect(() => {
    if (question && question.id) {
      setSelectedOrder([])
      setAvailableItems([...question.items])
      setSubmitted(false)

      // Resetar animações
      Object.keys(animRefs.current).forEach((key) => {
        animRefs.current[key].setValue(0)
      })

      console.log("Question changed, resetting states")
    }
  }, [question])

  // Verificação de segurança para evitar o erro
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
    if (selectedOrder.length !== question.correctOrder.length) return false

    for (let i = 0; i < selectedOrder.length; i++) {
      if (selectedOrder[i] !== question.correctOrder[i]) return false
    }

    return true
  }

  // Função para registrar a posição de um slot
  const registerPosition = (id: string, x: number, y: number) => {
    positionRefs.current[id] = { x, y }
  }

  // Função para lidar com a seleção de um item
  const handleItemSelect = (item: OrderItem) => {
    if (submitted) return

    // Adicionar o item à ordem selecionada
    const newSelectedOrder = [...selectedOrder, item.id]
    setSelectedOrder(newSelectedOrder)

    // Remover o item dos disponíveis
    const newAvailableItems = availableItems.filter((i) => i.id !== item.id)
    setAvailableItems(newAvailableItems)

    // Animar o item para a posição de destino
    const positionIndex = selectedOrder.length // A próxima posição disponível
    const positionId = `position-${positionIndex}`

    if (positionRefs.current[positionId]) {
      Animated.timing(animRefs.current[item.id], {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()
    }

    // Se todos os itens foram selecionados, verificar a resposta
    if (newSelectedOrder.length === question.items.length) {
      setSubmitted(true)
      const isCorrect = checkOrder()
      onAnswer(isCorrect, question.explanation)
    }
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
        <View
          key={`position-${index}`}
          className="flex-row items-center mb-4"
          onLayout={(event) => {
            const { x, y } = event.nativeEvent.layout
            registerPosition(`position-${index}`, x, y)
          }}
        >
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
    // Calcular o número de colunas com base no número de itens
    const columns = availableItems.length > 3 ? 2 : 1

    return (
      <View className="flex-row flex-wrap justify-between mt-4">
        {availableItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            className={`bg-white border-2 border-indigo-100 rounded-full p-4 mb-4 items-center justify-center ${
              columns === 2 ? "w-[48%]" : "w-full"
            }`}
            style={{ minHeight: 60 }}
            onPress={() => handleItemSelect(item)}
            disabled={submitted}
            activeOpacity={0.8}
          >
            {renderItemContent(item)}
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 p-4">
      <View className="mb-5">
        <Text className="text-md font-medium text-gray-100 mb-4">Questão {questionNumber}:</Text>
        <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <Text className="text-lg text-gray-800 leading-relaxed">{question.description}</Text>
        </View>
      </View>

      {/* Área de posições para ordenação */}
      <View className="mb-8">{renderPositions()}</View>
        

      <View className="mb-6">
        <Text className="text-center text-lg font-semibold text-zinc-100">{statementText}</Text>
      </View>
      {/* Itens disponíveis para seleção */}
      {renderAvailableItems()}
    </ScrollView>
  )
}

export default Ordering

