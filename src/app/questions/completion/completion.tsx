import { View, Text, SafeAreaView, StyleSheet, Image } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { useLocalSearchParams } from "expo-router"
import { Clock, Award, Target } from "lucide-react-native"
import React from "react"

const CompletionPage = () => {
  const params = useLocalSearchParams()
  const totalTime = Number.parseInt((params.totalTime as string) || "0")
  const wrongAnswers = Number.parseInt((params.wrongAnswers as string) || "0")

  // Calculate points based on time and wrong answers
  const basePoints = 100
  const timeDeduction = Math.floor(totalTime / 10) // Deduct points for time
  const wrongAnswerDeduction = wrongAnswers * 10 // Deduct 10 points per wrong answer
  const totalPoints = Math.max(basePoints - timeDeduction - wrongAnswerDeduction, 10) // Minimum 10 points

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.trophy}>
          <Image source={{ uri: "/placeholder.svg?height=150&width=150" }} style={styles.trophyImage} />
        </View>

        <Text style={styles.title}>Parabéns!</Text>
        <Text style={styles.subtitle}>Você completou esta fase!</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Award size={24} color="#223AD2" />
            <Text style={styles.statValue}>+{totalPoints}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>

          <View style={styles.statItem}>
            <Clock size={24} color="#223AD2" />
            <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>

          <View style={styles.statItem}>
            <Target size={24} color="#223AD2" />
            <Text style={styles.statValue}>{wrongAnswers}</Text>
            <Text style={styles.statLabel}>Erros</Text>
          </View>
        </View>

        <Text style={styles.message}>Continue praticando para melhorar suas habilidades!</Text>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton title="CONTINUAR" nextStep="../../(tabs)/home" />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  trophy: {
    marginBottom: 30,
  },
  trophyImage: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 22,
    color: "#333",
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    minWidth: 100,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#223AD2",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  buttonContainer: {
    padding: 20,
  },
})

export default CompletionPage

