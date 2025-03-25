import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native"
import { Check, X } from "lucide-react-native"
import React from "react"

interface FeedbackModalProps {
  visible: boolean
  isCorrect: boolean
  title?: string
  description?: string
  buttonText?: string
  onContinue: () => void
}

const FeedbackModal = ({
  visible,
  isCorrect,
  title,
  description,
  buttonText = "CONTINUAR",
  onContinue,
}: FeedbackModalProps) => {
  // Default values based on isCorrect
  const defaultTitle = isCorrect ? "Parabéns!" : "Incorreto"
  const defaultDescription = isCorrect ? "Você está On!" : "Que pena! Você está em Off!"

  // Use provided values or defaults
  const displayTitle = title || defaultTitle
  const displayDescription = description || defaultDescription

  // Use styles from StyleSheet instead of Tailwind classes
  const styles = StyleSheet.create({
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isCorrect ? "#dcfce7" : "#fee2e2", // Explicit green-100 or red-100
    },
    titleText: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 8,
      color: isCorrect ? "#15803d" : "#b91c1c", // Explicit green-700 or red-700
    },
    button: {
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      width: "100%",
      backgroundColor: isCorrect ? "#16a34a" : "#dc2626", // Explicit green-600 or red-600
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "85%",
      borderRadius: 12,
      padding: 24,
      backgroundColor: "white",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    iconWrapper: {
      alignItems: "center",
      marginBottom: 16,
    },
    contentContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    descriptionText: {
      color: "#374151",
      fontSize: 16,
      textAlign: "center",
    },
  })

  return (
    <Modal visible={visible} transparent={true} animationType="slide" statusBarTranslucent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Icon */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconContainer}>
              {isCorrect ? (
                <Check width={32} height={32} color="#16A34A" />
              ) : (
                <X width={32} height={32} color="#DC2626" />
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.titleText}>{displayTitle}</Text>
            <Text style={styles.descriptionText}>{displayDescription}</Text>
          </View>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={onContinue} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default FeedbackModal

