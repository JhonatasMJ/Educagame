import { View, ImageBackground } from "react-native"
import LessonBubble from "./LessonBubble"
import React from "react"

interface Stage {
  number: number
  completed: boolean
  title: string
  icon: string
  description?: string
}

interface LearningPathTrackProps {
  stages: Stage[]
  currentStage: number
  onStagePress: (index: number) => void
  containerHeight: number
  backgroundImage?: string
}

const LearningPathTrack = ({
  stages,
  currentStage,
  onStagePress,
  containerHeight,
  backgroundImage,
}: LearningPathTrackProps) => {
  // Encontrar o índice da próxima etapa não concluída
  const nextStageIndex = stages.findIndex((stage) => !stage.completed)

  // Calcular a altura disponível para distribuir os estágios
  const stageHeight = 200 // Altura aproximada de cada estágio
  const totalContentHeight = stages.length * stageHeight

  // Calcular o padding superior para alinhar ao fundo quando há poucos estágios
  const topPadding = Math.max(0, containerHeight - totalContentHeight - 120) // 120 é um ajuste para considerar o espaço da barra inferior

  // Render with or without background image
  if (backgroundImage) {
    return (
      <ImageBackground
        source={{ uri: backgroundImage }}
        style={{ width: "100%", paddingTop: topPadding }}
        imageStyle={{ opacity: 0.3 }}
        className="items-center"
      >
        {renderTrackContent()}
      </ImageBackground>
    )
  }

  return (
    <View className="items-center" style={{ paddingTop: topPadding }}>
      {renderTrackContent()}
    </View>
  )

  // Helper function to render the track content
  function renderTrackContent() {
    return (
      <>
        {/* Trilha de fundo contínua */}
        <View
          className="absolute bg-purple-300"
          style={{
            width: 8,
            height: "100%",
            borderRadius: 4,
            zIndex: 1,
          }}
        />
        {/* Trilha de progresso */}
        <View
          className="absolute bg-purple-700"
          style={{
            width: 8,
            height: `${Math.max((stages.filter((s) => s.completed).length / stages.length) * 100, 10)}%`,
            borderRadius: 4,
            zIndex: 2,
            bottom: 0, // Começa de baixo
          }}
        />
        {/* Estágios em ordem reversa (de baixo para cima) */}
        {[...stages].reverse().map((stage, index) => {
          // Calcular o índice original (antes da inversão)
          const originalIndex = stages.length - 1 - index
          // Verificar se esta é a próxima etapa a ser concluída
          const isNextStage = originalIndex === nextStageIndex

          return (
            <View key={originalIndex} className="items-center z-10">
              <LessonBubble
                number={stage.number}
                isActive={currentStage === originalIndex}
                isCompleted={stage.completed}
                isNext={isNextStage}
                onPress={() => onStagePress(originalIndex)}
                title={stage.title}
                icon={stage.icon as "crown" | "zap" | "target" | "book"}
                description={stage.description}
              />

              {/* Espaço entre bolhas - aumentado */}
              {index < stages.length - 1 && <View style={{ height: 60 }} />}
            </View>
          )
        })}
      </>
    )
  }
}

export default LearningPathTrack

