"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import { Check, X } from "lucide-react-native"
import type { QuestionType } from "../../(tabs)/home" // Ajuste o caminho conforme necessário
import React from "react"

interface TrueOrFalseQuestion {
  id: string
  type: QuestionType.TRUE_OR_FALSE
  description: string
  image?: string | any // Aceita tanto string quanto objeto require()
  isTrue: boolean
  statementText?: string
  explanation?: string
}

interface TrueOrFalseProps {
  question: TrueOrFalseQuestion
  onAnswer: (correct: boolean, explanation?: string) => void
  questionNumber: number
}

const TrueOrFalse = ({ question, onAnswer, questionNumber }: TrueOrFalseProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)

  // Log para debug
  useEffect(() => {
    console.log("TrueOrFalse component mounted with question:", JSON.stringify(question))
  }, [question])

  // Reset selectedAnswer when question changes
  useEffect(() => {
    if (question && question.id) {
      setSelectedAnswer(null)
      console.log("Question changed, resetting selectedAnswer for question ID:", question.id)
    } else {
      console.error("Question is invalid or missing ID:", question)
    }
  }, [question])

  // Verificação de segurança para evitar o erro
  if (!question) {
    console.error("Question is undefined in TrueOrFalse component")
    return (
      <View className="flex-1 p-4 justify-center items-center">
        <Text className="text-red-500 text-lg">Erro: Questão não encontrada</Text>
        <Text className="text-gray-500 mt-2">Detalhes: A questão não foi carregada corretamente.</Text>
      </View>
    )
  }

  if (!question.id) {
    console.error("Question is missing ID:", question)
    return (
      <View className="flex-1 p-4 justify-center items-center">
        <Text className="text-red-500 text-lg">Erro: Questão inválida</Text>
        <Text className="text-gray-500 mt-2">Detalhes: A questão não possui um ID válido.</Text>
      </View>
    )
  }

  const defaultStatementText = "A afirmação é:"
  const statementText = question.statementText || defaultStatementText

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer)
    const correct = answer === question.isTrue
    onAnswer(correct, question.explanation)
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

  return (
    <View className="flex-1 p-4">
      <View className="mb-5">
        {question.description && (
        <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <Text className="text-lg text-gray-800 leading-relaxed">{question.description}</Text>
        </View>
        )}
      </View>

      {renderImage()}

      <View className="mb-6">
        <Text className="text-center text-lg font-semibold text-zinc-100">{statementText}</Text>
      </View>

      <View className="space-y-4">
        <TouchableOpacity
          className={`flex-row items-center p-4 ${
            selectedAnswer === true ? "bg-lime-500 border-green-500" : "bg-lime-100"
          }`}
          style={{
            borderRadius: 8,
            borderBottomWidth: 6,
            borderBottomColor: "#117805",
          }}
          onPress={() => handleAnswer(true)}
          disabled={selectedAnswer !== null}
          activeOpacity={0.8}
        >
          <View
            className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
              selectedAnswer === true ? "bg-lime-100" : "bg-lime-500"
            }`}
          >
            <Check width={20} height={20} color="#023614" />
          </View>
          <Text className={`text-lg font-medium ${selectedAnswer === true ? "text-green-800" : "text-lime-950"}`}>
            Verdadeiro
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center p-4 mt-4 ${selectedAnswer === false ? "bg-red-500" : "bg-red-100"}`}
          style={{
            borderRadius: 8,
            borderBottomWidth: 6,
            borderBottomColor: "#870000",
          }}
          onPress={() => handleAnswer(false)}
          disabled={selectedAnswer !== null}
          activeOpacity={0.8}
        >
          <View
            className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
              selectedAnswer === false ? "bg-red-100" : "bg-red-500"
            }`}
          >
            <X width={20} height={20} color="#5e0303" />
          </View>
          <Text className={`text-lg font-medium ${selectedAnswer === false ? "text-red-800" : "text-gray-800"}`}>
            Falso
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default TrueOrFalse

