import React from "react"
import { View, Text, StyleSheet } from "react-native"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        <View style={styles.textContainer}>
          <Text style={styles.stepText}>
            {currentStep}/{totalSteps}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    marginVertical: 15,
  },
  progressContainer: {
    height: 24,
    backgroundColor: "#BF720C",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#a86502", // Gold color
    borderRadius: 12,
    position: "absolute",
    left: 0,
    top: 0,
  },
  textContainer: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 10,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f2f2f2",
  },
})

export default StepIndicator

