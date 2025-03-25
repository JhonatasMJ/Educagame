import { View, Text, Modal, StyleSheet } from "react-native"
import { Check, X } from "lucide-react-native"
import ButtonFeedbackModal from "./ButtonFeedbackModal"
import React from "react"

interface FeedbackModalProps {
  visible: boolean
  isCorrect: boolean
  title?: string
  description?: string
  buttonText?: string
  color?: string
  onContinue: () => void
}

const FeedbackModal = ({
  visible,
  isCorrect,
  title,
  description,
  buttonText = "CONTINUAR",
  color,
  onContinue,
}: FeedbackModalProps) => {
  // Default values based on isCorrect
  const defaultTitle = isCorrect ? "Parabéns!" : "Incorreto"
  const defaultDescription = isCorrect ? "Você está On!" : "Que pena! Você está em Off!"
  const defaultColor = isCorrect ? "#8FE388" : "#FF9B9B"
  const iconColor = isCorrect ? "#1E4620" : "#8B0000"
  const buttonColor = isCorrect ? "#1A2B6D" : "#8B0000"

  // Use provided values or defaults
  const displayTitle = title || defaultTitle
  const displayDescription = description || defaultDescription
  const backgroundColor = color || defaultColor

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
            {isCorrect ? <Check width={30} height={30} color="white" /> : <X width={30} height={30} color="white" />}
          </View>

          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.description}>{displayDescription}</Text>

          {/* Using ButtonFeedbackModal instead of a regular button */}
          <ButtonFeedbackModal
            title={buttonText}
            nextStep="#" // This will be ignored since we're using onPress
            style={{ backgroundColor: buttonColor, width: "100%" }}
            onPress={onContinue}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
})

export default FeedbackModal

