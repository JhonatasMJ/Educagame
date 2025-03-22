import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import { Crown, Zap, Target, BookOpen } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LessonBubbleProps {
  number: number;
  isActive: boolean;
  isCompleted: boolean;
  isNext: boolean;
  onPress: () => void;
  title: string;
  icon: "crown" | "zap" | "target" | "book";
  description?: string;
}

const LessonBubble = ({
  number,
  isActive,
  isCompleted,
  isNext,
  onPress,
  title,
  icon,
  description,
}: LessonBubbleProps) => {
  const bubbleSize = 80;
  const numberSize = 30;

  // Valor de animação apenas para a próxima etapa
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Cores para efeito 3D
  const baseColor = isCompleted ? "#10b981" : "#f97316"; // Verde para completo, laranja para incompleto
  const shadowColor = isCompleted ? "#059669" : "#ea580c"; // Sombra mais escura para efeito 3D
  const highlightColor = isCompleted ? "#34d399" : "#fdba74"; // Destaque mais claro para efeito 3D

  // Função para renderizar o ícone correto
  const renderIcon = () => {
    switch (icon) {
      case "crown":
        return <Crown size={24} color="white" />;
      case "zap":
        return <Zap size={24} color="white" />;
      case "target":
        return <Target size={24} color="white" />;
      case "book":
        return <BookOpen size={24} color="white" />;
      default:
        return <Crown size={24} color="white" />;
    }
  };

  // Efeito para iniciar animação de pulso apenas na próxima etapa
  useEffect(() => {
    if (isNext) {
      // Animação de pulso contínua apenas para a próxima etapa
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Parar animação para outras etapas
      pulseAnim.setValue(1);
      pulseAnim.stopAnimation();
    }
  }, [isNext]);

  return (
    <Pressable onPress={onPress} className="stage-bubble">
      <Animated.View
        className="items-center my-8 relative"
        style={{
          transform: [{ scale: isNext ? pulseAnim : 1 }],
        }}
      >
        <View className="items-center">
          {/* Sombra para efeito 3D - centralizada */}
          <View
            style={{
              position: "absolute",
              width: bubbleSize + 16,
              height: bubbleSize + 16,
              borderRadius: (bubbleSize + 16) / 2,
              backgroundColor: "rgba(0,0,0,0.2)",
              top: 4,
              zIndex: 1,
            }}
          />

          {/* Contêiner principal com borda condicional */}
          <View
            className={`items-center justify-center rounded-full ${
              isActive
                ? "border-4 border-purple-700"
                : isCompleted
                ? "border-2 border-green-700"
                : ""
            }`}
            style={{
              width: bubbleSize + 8,
              height: bubbleSize + 8,
              zIndex: 2,
              elevation: isActive ? 8 : 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: isActive ? 4 : 2 },
              shadowOpacity: isActive ? 0.3 : 0.2,
              shadowRadius: isActive ? 6 : 3,
            }}
          >
            {/* Gradiente para efeito 3D */}
            <LinearGradient
              colors={[highlightColor, baseColor, shadowColor]}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 0.8, y: 0.8 }}
              className="rounded-full items-center justify-center"
              style={{ width: bubbleSize, height: bubbleSize }}
            >
              {/* Ícone dentro da bolha */}
              <View className="items-center justify-center">
                {renderIcon()}
              </View>

              {isCompleted && (
                <View className="bg-green-700 absolute top-0 right-0 w-6 h-6 rounded-full items-center justify-center">
                  <Text className="text-white font-bold">✓</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Número da etapa */}
          <View
            className="bg-purple-800 rounded-full absolute items-center justify-center z-10"
            style={{
              width: numberSize,
              height: numberSize,
              top: -2,
              elevation: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Text className="text-white font-bold">{number}</Text>
          </View>

          {/* Título e descrição abaixo da bolha */}
          <View className="mt-4 items-center max-w-[200px]">
            <View
              className="bg-purple-700 px-3 py-1 rounded-lg mb-2 w-full"
              style={{
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
              }}
            >
              <Text
                className="text-white font-medium text-sm text-center"
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>

            {description && (
              <View
                className="bg-purple-600/80 px-3 py-1 rounded-lg w-full"
                style={{
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOffset: { width: 1, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                }}
              >
                <Text
                  className="text-white text-xs text-center"
                  numberOfLines={3}
                >
                  {description}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default LessonBubble;
