"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native"
import { Check, X } from "lucide-react-native"
import type { QuestionType } from "../../(tabs)/home"
import React from "react"

// Interface para as opções
interface Option {
  id: string
  text: string
}

// Interface para a questão de múltipla escolha
interface MultipleChoiceQuestion {
  id: string
  type: QuestionType.MULTIPLE_CHOICE
  description: string
  options: Option[]
  correctOptions: string[]
  multipleCorrect: boolean
  image?: string | any
  statementText?: string
  explanation?: string
}

interface MultipleChoiceProps {
  question: MultipleChoiceQuestion
  onAnswer: (correct: boolean, explanation?: string) => void
  questionNumber: number
}

const MultipleChoice = ({ question, onAnswer, questionNumber }: MultipleChoiceProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [optionStates, setOptionStates] = useState<{ [key: string]: "correct" | "incorrect" | "unselected" }>({})
  const [submitted, setSubmitted] = useState(false)
  const [disabledOptions, setDisabledOptions] = useState<{ [key: string]: boolean }>({})

  // Log para debug
  useEffect(() => {
    console.log("MultipleChoice component mounted with question:", question)

    // Inicializar o estado das opções
    const initialOptionStates: { [key: string]: "correct" | "incorrect" | "unselected" } = {}
    const initialDisabledOptions: { [key: string]: boolean } = {}

    question.options.forEach((option) => {
      initialOptionStates[option.id] = "unselected"
      initialDisabledOptions[option.id] = false
    })

    setOptionStates(initialOptionStates)
    setDisabledOptions(initialDisabledOptions)
  }, [question])

  // Reset states when question changes
  useEffect(() => {
    setSelectedOptions([])
    setSubmitted(false)

    // Reinicializar o estado das opções
    const initialOptionStates: { [key: string]: "correct" | "incorrect" | "unselected" } = {}
    const initialDisabledOptions: { [key: string]: boolean } = {}

    question.options.forEach((option) => {
      initialOptionStates[option.id] = "unselected"
      initialDisabledOptions[option.id] = false
    })

    setOptionStates(initialOptionStates)
    setDisabledOptions(initialDisabledOptions)

    console.log("Question changed, resetting states")
  }, [question.id])

  // Verificação de segurança para evitar o erro
  if (!question) {
    console.error("Question is undefined in MultipleChoice component")
    return (
      <View className="flex-1 p-4 justify-center items-center">
        <Text className="text-red-500">Erro: Questão não encontrada</Text>
      </View>
    )
  }

  const defaultStatementText = question.multipleCorrect
    ? "Selecione todas as opções corretas:"
    : "Selecione a opção correta:"
  const statementText = question.statementText || defaultStatementText

  // Função para verificar se todas as opções corretas foram selecionadas
  const checkAllCorrectSelected = (selected: string[]) => {
    const allSelected = question.correctOptions.every((option) => selected.includes(option))
    const noIncorrect = selected.every((option) => question.correctOptions.includes(option))
    return allSelected && noIncorrect
  }

  // Função para lidar com o clique em uma opção
  const handleOptionPress = (optionId: string) => {
    // Não permite clicar em opções já selecionadas ou desabilitadas
    if (disabledOptions[optionId] || submitted) return

    // Verificar se a opção é correta
    const isCorrect = question.correctOptions.includes(optionId)

    // Para questões com uma única resposta correta
    if (!question.multipleCorrect) {
      // Atualizar o estado visual da opção
      const newOptionStates = { ...optionStates }
      newOptionStates[optionId] = isCorrect ? "correct" : "incorrect"
      setOptionStates(newOptionStates)

      // Atualizar opções selecionadas
      setSelectedOptions([optionId])

      // Desabilitar todas as opções após a seleção
      const newDisabledOptions = { ...disabledOptions }
      question.options.forEach((option) => {
        newDisabledOptions[option.id] = true
      })
      setDisabledOptions(newDisabledOptions)

      // Marcar como submetido
      setSubmitted(true)

      // Notificar o componente pai
      onAnswer(isCorrect, question.explanation)
    }
    // Para questões com múltiplas respostas corretas
    else {
      // Atualizar opções selecionadas
      const newSelectedOptions = [...selectedOptions, optionId]
      setSelectedOptions(newSelectedOptions)

      // Atualizar o estado visual da opção - SEMPRE mostra se está correta ou incorreta
      const newOptionStates = { ...optionStates }
      newOptionStates[optionId] = isCorrect ? "correct" : "incorrect"
      setOptionStates(newOptionStates)

      // Desabilitar a opção que foi clicada
      const newDisabledOptions = { ...disabledOptions }
      newDisabledOptions[optionId] = true
      setDisabledOptions(newDisabledOptions)

      // Verificar se todas as opções corretas foram selecionadas
      const allCorrect = checkAllCorrectSelected(newSelectedOptions)
      const allCorrectOptionsSelected = question.correctOptions.every((id) => newSelectedOptions.includes(id))

      // Se o usuário selecionou uma opção incorreta ou todas as corretas
      if (!isCorrect || (allCorrect && allCorrectOptionsSelected)) {
        // Se selecionou uma incorreta ou todas as corretas, mostrar todas as corretas
        if (!isCorrect) {
          // Mostrar as opções corretas que não foram selecionadas
          question.options.forEach((option) => {
            if (question.correctOptions.includes(option.id) && !newSelectedOptions.includes(option.id)) {
              newOptionStates[option.id] = "correct"
            }
          })
        }

        // Desabilitar todas as opções
        question.options.forEach((option) => {
          newDisabledOptions[option.id] = true
        })

        // Marcar como submetido
        setSubmitted(true)

        // Notificar o componente pai
        onAnswer(isCorrect ? allCorrectOptionsSelected : false, question.explanation)
      }

      // Se selecionou todas as opções necessárias (corretas ou não)
      if (newSelectedOptions.length >= question.correctOptions.length) {
        // Verificar se todas as corretas foram selecionadas
        if (!allCorrectOptionsSelected) {
          // Mostrar as opções corretas que não foram selecionadas
          question.options.forEach((option) => {
            if (question.correctOptions.includes(option.id) && !newSelectedOptions.includes(option.id)) {
              newOptionStates[option.id] = "correct"
            }
          })
        }

        // Desabilitar todas as opções
        question.options.forEach((option) => {
          newDisabledOptions[option.id] = true
        })

        // Marcar como submetido
        setSubmitted(true)

        // Notificar o componente pai
        onAnswer(allCorrect && allCorrectOptionsSelected, question.explanation)
      }
    }
  }

  // Determinar como renderizar a imagem com base no tipo
  const renderImage = () => {
    if (!question.image) return null

    // Se for um objeto (require), use diretamente
    if (typeof question.image === "object") {
      return (
        <View className="mb-5 rounded-lg overflow-hidden border border-gray-200">
          <Image source={question.image} className="w-full h-48 rounded-lg" resizeMode="cover" />
        </View>
      )
    }

    // Se for uma string (URI), use como URI
    return (
      <View className="mb-5 rounded-lg overflow-hidden border border-gray-200">
        <Image source={{ uri: question.image as string }} className="w-full h-48 rounded-lg" resizeMode="cover" />
      </View>
    )
  }

  // Determinar o número de colunas com base no número de opções
  const getGridColumns = () => {
    const optionsCount = question.options.length

    // Se houver apenas 2 opções ou menos, use 1 coluna
    if (optionsCount <= 2) return 1

    // Se houver 3 ou 4 opções, use 2 colunas
    if (optionsCount <= 4) return 2

    // Se houver mais de 4 opções, use 2 colunas para melhor legibilidade
    return 2
  }

  const gridColumns = getGridColumns()

  // Função para obter a cor de fundo com base no estado da opção
  const getOptionBackgroundColor = (optionId: string) => {
    const state = optionStates[optionId]
    switch (state) {
      case "correct":
        return "bg-lime-500 border-green-700"
      case "incorrect":
        return "bg-red-500 border-red-700"
      default:
        return "bg-white border-gray-300"
    }
  }

  // Função para obter a cor do texto com base no estado da opção
  const getOptionTextColor = (optionId: string) => {
    const state = optionStates[optionId]
    switch (state) {
      case "correct":
      case "incorrect":
        return "text-white"
      default:
        return "text-gray-800"
    }
  }

  // Função para renderizar o ícone com base no estado da opção
  const renderOptionIcon = (optionId: string) => {
    const state = optionStates[optionId]
    switch (state) {
      case "correct":
        return <Check size={20} color="#fff" />
      case "incorrect":
        return <X size={20} color="#fff" />
      default:
        return null
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4">
      <View className="mb-5">
        <Text className="text-md font-medium text-gray-100 mb-4">Questão {questionNumber}:</Text>
        <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <Text className="text-lg text-gray-800 leading-relaxed">{question.description}</Text>
        </View>
      </View>

      {renderImage()}

      <View className="mb-6">
        <Text className="text-center text-lg font-semibold text-zinc-100">{statementText}</Text>
      </View>

      <View
        style={{
          flexDirection: gridColumns === 1 ? ("column" as const) : ("row" as const),
          flexWrap: "wrap" as const,
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {question.options.map((option) => (
          <View
            key={option.id}
            style={{
              width: gridColumns === 1 ? "100%" : "48%",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              className={`p-4 elevation-4 shadow-lg rounded-lg border-2 ${getOptionBackgroundColor(option.id)}`}
              style={{
                minHeight: 60, // Altura mínima para acomodar textos maiores
                opacity: disabledOptions[option.id] && optionStates[option.id] === "unselected" ? 0.6 : 1,
              }}
              onPress={() => handleOptionPress(option.id)}
              disabled={disabledOptions[option.id]}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-8 h-8 elevation-1 shadow-lg rounded-full justify-center items-center mr-3 ${
                    optionStates[option.id] !== "unselected" ? "bg-white" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      optionStates[option.id] !== "unselected"
                        ? optionStates[option.id] === "correct"
                          ? "text-green-500"
                          : "text-red-500"
                        : "text-gray-700"
                    }`}
                  >
                    {option.id.toUpperCase()}
                  </Text>
                </View>
                <Text className={`flex-1 text-base font-medium ${getOptionTextColor(option.id)}`}>{option.text}</Text>
                {renderOptionIcon(option.id)}
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default MultipleChoice
