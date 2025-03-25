"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Clock } from "lucide-react-native"
import React from "react"

interface GameTimerProps {
  isRunning: boolean
  onTimeUpdate?: (seconds: number) => void
  showVisual?: boolean // New prop to control visibility
}

const GameTimer = ({ isRunning, onTimeUpdate, showVisual = true }: GameTimerProps) => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1
          if (onTimeUpdate) {
            onTimeUpdate(newSeconds)
          }
          return newSeconds
        })
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // If showVisual is false, return null for the UI but keep the timer running
  if (!showVisual) {
    return null
  }

  return (
    <View style={styles.container}>
      <Clock size={16} color="#555" />
      <Text style={styles.timeText}>{formatTime(seconds)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 100,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginLeft: 5,
  },
})

export default GameTimer

