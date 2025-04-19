"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { QuestionType } from "../app/(tabs)/home";
import { Hand, X, Info } from "lucide-react-native";
import { MOBILE_WIDTH } from "@/PlataformWrapper";

interface GameTutorialProps {
  visible: boolean;
  onClose: () => void;
  gameType: QuestionType;
}

const GameTutorial = ({ visible, onClose, gameType }: GameTutorialProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const handAnim = useRef(new Animated.Value(0)).current;
  const [tutorialContent, setTutorialContent] = useState({
    title: "",
    steps: [""],
    handPositions: [{ x: 0, y: 0 }],
  });

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Set tutorial content based on game type
      setTutorialContentByType(gameType);

      // Start hand animation
      startHandAnimation();
    } else {
      // Reset animations when modal closes
      fadeAnim.setValue(0);
      handAnim.setValue(0);
    }
  }, [visible, gameType]);

  const setTutorialContentByType = (type: QuestionType) => {
    switch (type) {
      case QuestionType.TRUE_OR_FALSE:
        setTutorialContent({
          title: "Verdadeiro ou Falso",
          steps: [
            "Leia a afirmação com atenção",
            "Toque em 'Verdadeiro' ou 'Falso' para responder",
          ],
          handPositions: [
            { x: 150, y: 300 }, // Position for reading
            { x: 75, y: 400 }, // Position for tapping true/false
            { x: 150, y: 300 }, // Position for reading
            { x: 75, y: 400 }, // Position for tapping true/false
            { x: 150, y: 300 }, // Position for reading
          ],
        });
        break;
      case QuestionType.MULTIPLE_CHOICE:
        setTutorialContent({
          title: "Múltipla Escolha",
          steps: [
            "Leia a pergunta cuidadosamente",
            "Selecione a opção correta tocando nela",
            "Em algumas questões, mais de uma opção pode estar correta",
          ],
          handPositions: [
            { x: 100, y: 325 }, // Position for reading
            { x: 150, y: 400 }, // Position for selecting option
            { x: 100, y: 325 }, // Position for reading
            { x: 150, y: 400 }, // Position for selecting option
          ],
        });
        break;
      case QuestionType.ORDERING:
        setTutorialContent({
          title: "Ordenação",
          steps: [
            "Observe os itens disponíveis abaixo",
            "Toque nos itens na ordem correta",
            "Os itens serão colocados nas posições numeradas",
          ],
          handPositions: [
            { x: 150, y: 340 }, // Position for looking at items
            { x: 150, y: 400 }, // Position for tapping items
            { x: 150, y: 340 }, // Position for looking at items
            { x: 150, y: 400 }, // Position for tapping items
          ],
        });
        break;
      case QuestionType.MATCHING:
        setTutorialContent({
          title: "Relacionar Colunas",
          steps: [
            "Toque em um item da coluna esquerda",
            "Em seguida, toque no item correspondente da coluna direita",
            "Os itens serão relacionados e a cor de cada item mudará",
          ],
          handPositions: [
            { x: 100, y: 350 }, // Position for left column
            { x: 250, y: 350 }, // Position for right column
            { x: 100, y: 350 }, // Position for left column
            { x: 250, y: 350 }, // Position for right column
          ],
        });
        break;
      default:
        setTutorialContent({
          title: "Como Jogar",
          steps: [
            "Leia as instruções",
            "Responda à questão conforme solicitado",
          ],
          handPositions: [
            { x: 150, y: 300 },
            { x: 170, y: 350 },
            { x: 150, y: 300 },
            { x: 170, y: 350 },
          ],
        });
    }
  };

  const startHandAnimation = () => {
    // Reset animation value
    handAnim.setValue(0);

    // Create sequence of animations for each step
    const animations = tutorialContent.handPositions.map((_, index) => {
      return Animated.timing(handAnim, {
        toValue: index + 1,
        duration: 2500,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      });
    });

    // Add delay between steps
    const sequenceWithDelays = [];
    for (let i = 0; i < animations.length; i++) {
      sequenceWithDelays.push(animations[i]);
      sequenceWithDelays.push(Animated.delay(1000)); // 1 second delay between steps
    }

    // Loop the animation
    Animated.loop(Animated.sequence(sequenceWithDelays), {
      iterations: -1, // Infinite loop
    }).start();
  };

  // Modificar a função handPosition para garantir pelo menos 2 elementos
  const handPosition = {
    x: handAnim.interpolate({
      inputRange:
        tutorialContent.handPositions.length === 1
          ? [0, 1]
          : tutorialContent.handPositions.map((_, i) => i),
      outputRange:
        tutorialContent.handPositions.length === 1
          ? [
              tutorialContent.handPositions[0].x,
              tutorialContent.handPositions[0].x,
            ]
          : tutorialContent.handPositions.map((pos) => pos.x),
      extrapolate: "clamp",
    }),
    y: handAnim.interpolate({
      inputRange:
        tutorialContent.handPositions.length === 1
          ? [0, 1]
          : tutorialContent.handPositions.map((_, i) => i),
      outputRange:
        tutorialContent.handPositions.length === 1
          ? [
              tutorialContent.handPositions[0].y,
              tutorialContent.handPositions[0].y,
            ]
          : tutorialContent.handPositions.map((pos) => pos.y),
      extrapolate: "clamp",
    }),
  };

  const stepOpacity = tutorialContent.steps.map((_, index) => {
    // Se houver apenas um ou dois passos, use uma interpolação mais simples
    if (tutorialContent.steps.length <= 2) {
      return handAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1],
        extrapolate: "clamp",
      });
    }

    // Para mais de dois passos, use uma interpolação que garanta valores crescentes
    return handAnim.interpolate({
      inputRange: [
        Math.max(0, index - 1), // Valor anterior
        index, // Valor atual
        Math.min(tutorialContent.steps.length - 1, index + 1), // Próximo valor
      ],
      outputRange: [0.3, 1, 0.3],
      extrapolate: "clamp",
    });
  });

  const marginTopFunction = () => {
    switch (tutorialContent.title) {
      case "Verdadeiro ou Falso":
        return -320;
      case "Múltipla Escolha":
        return 0;
      case "Ordenação":
        return 0;
      case "Relacionar Colunas":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <View
          style={[
            [styles.tutorialContainer, { marginTop: marginTopFunction() }],
          ]}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Info size={24} color="#F1592E" />
              <Text style={styles.title}>{tutorialContent.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButtonIcon}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {tutorialContent.steps.map((step, index) => (
              <Animated.View
                key={index}
                style={[styles.stepContainer, { opacity: stepOpacity[index] }]}
              >
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Animated hand icon */}
          <Animated.View
            style={[
              styles.handContainer,
              {
                transform: [
                  { translateX: handPosition.x },
                  { translateY: handPosition.y },
                  { rotate: "15deg" },
                ],
              },
            ]}
          >
            <Hand size={40} color="#F1592E" />
          </Animated.View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  tutorialContainer: {
    width: MOBILE_WIDTH - 30,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    marginTop: -5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "relative",
    minHeight: 300,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  closeButtonIcon: {
    padding: 5,
  },
  closeButton: {
    position: "absolute",
    transform: [{ translateX: 150 }],
    bottom: 10,
    padding: 8,
    zIndex: 1,
    backgroundColor: "#F1592E",
    borderRadius: 8,
    elevation: 3,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
  },
  closeButtonText: {
    color: "#f2f2f2",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F1592E",
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: "#F1592E",
    borderRadius: 12,
    color: "white",
    textAlign: "center",
    lineHeight: 24,
    marginRight: 10,
    fontWeight: "bold",
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  handContainer: {
    position: "absolute",
    width: 40,
    height: 40,
    zIndex: 10,
  },
});

export default GameTutorial;
