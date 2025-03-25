import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { router } from "expo-router"
import React from "react"

interface ButtonFeedbackModalProps {
  title: string
  nextStep: string
  style?: any
  onPress?: () => void
}

const ButtonFeedbackModal = ({ title, nextStep, style, onPress }: ButtonFeedbackModalProps) => {
  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.push(nextStep as any)
    }
  }

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handlePress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#223AD2",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
})

export default ButtonFeedbackModal

