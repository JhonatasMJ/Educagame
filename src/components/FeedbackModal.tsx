import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Image } from "react-native"
import { Check, X } from "lucide-react-native"
import { MOBILE_WIDTH } from "@/PlataformWrapper"
import React from "react"

// Interface for explanation data
interface ExplanationData {
  title?: string
  description?: string
  imageUrl?: string
}

interface FeedbackModalProps {
  visible: boolean
  isCorrect: boolean
  title?: string
  description?: string
  buttonText?: string
  onContinue: () => void
  // New props for custom explanations
  correctExplanation?: ExplanationData
  incorrectExplanation?: ExplanationData
}

const FeedbackModal = ({
  visible,
  isCorrect,
  title,
  description,
  buttonText = "CONTINUAR",
  onContinue,
  correctExplanation,
  incorrectExplanation,
}: FeedbackModalProps) => {
  const { width } = Dimensions.get("window")

  // Determine which explanation to use
  const customExplanation = isCorrect ? correctExplanation : incorrectExplanation

  // Check if we should use custom explanation
  const useCustomExplanation =
    customExplanation && (customExplanation.title || customExplanation.description || customExplanation.imageUrl)

  // Default values based on isCorrect
  const defaultTitle = isCorrect ? "Parabéns!" : "Incorreto"
  const defaultDescription = isCorrect ? "Você está On!" : "Que pena! Você está em Off!"

  // Use custom explanation if available, otherwise use provided values or defaults
  const displayTitle = useCustomExplanation ? customExplanation?.title : title || defaultTitle

  const displayDescription = useCustomExplanation ? customExplanation?.description : description || defaultDescription

  const displayImage = useCustomExplanation ? customExplanation?.imageUrl : undefined

  // Use styles from StyleSheet instead of Tailwind classes
  const styles = StyleSheet.create({
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    titleText: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 8,
      textAlign: "center",
    },
    button: {
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      width: "100%",
      backgroundColor: isCorrect ? "#16a34a" : "#dc2626", // Explicit green-600 or red-600

      marginBottom: 6,
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
      alignItems: "flex-start",
      justifyContent: "space-between",
      width: width < MOBILE_WIDTH ? "80%" : "100%",
      maxWidth: 400,
      borderRadius: 14,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    iconWrapper: {
      position: 'absolute',
      top: 15,
      left: 15,
      alignItems: "center",
    },
    contentContainer: {
      alignItems: "flex-start",
      justifyContent: "flex-start",
      marginBottom: 16,
    },
    descriptionText: {
      fontSize: 16,
      textAlign: "left",
    },
    imageContainer: {
      position: 'absolute',
      marginBottom: 16,
      borderRadius: 8,
    },
    image: {
      width: "100%",
      height: "100%",
    },
  })

  return (
    <Modal visible={visible} transparent={true} animationType="slide" statusBarTranslucent={true}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: isCorrect ? "#A4D1CF" : "#444343", height: isCorrect ? 265 : 280 }]}>
          {/* Image (if available) */}
          {displayImage && (
            <View style={[styles.imageContainer, {
              right: isCorrect ? -20 : -15,
              top: isCorrect ? -90 : -85,
              width: isCorrect ? 220 : 200,
              height: isCorrect ? 280 : 280,
            }]}>
              <Image source={{ uri: displayImage }} style={styles.image} resizeMode="contain" />
            </View>
          )}

          <View style={styles.iconWrapper}>
            <TouchableOpacity onPress={onContinue} style={[styles.iconContainer, {

              backgroundColor: isCorrect ? "#1D2362" : "#fee2e2", // Explicit green-100 or red-100
            }]}>
              {isCorrect ? (
                <Check width={25} height={25} color="#16A34A" />
              ) : (
                <X width={25} height={25} color="#DC2626" />
              )}
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={[styles.contentContainer, {
            marginTop: isCorrect ? 40 : 50,
            paddingRight: isCorrect ? 110 : 125,
          }]}>
            <Text style={[styles.titleText, { color: isCorrect ? "#223AD2" : "#fff" }]}>{displayTitle}</Text>
            <Text style={[styles.descriptionText, {
              color: isCorrect ? "#1D2362" : "#fff"
            }]}>{displayDescription}</Text>
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
