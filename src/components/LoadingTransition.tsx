"use client"

import React, { useEffect, useRef } from "react"
import { StyleSheet, Animated, Easing, ActivityIndicator } from "react-native"

interface LoadingTransitionProps {
  isVisible: boolean
  onAnimationComplete?: () => void
}

const LoadingTransition = ({ isVisible, onAnimationComplete }: LoadingTransitionProps) => {
  const slideAnim = useRef(new Animated.Value(isVisible ? 0 : -1000)).current
  const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current

  useEffect(() => {
    if (isVisible) {
      // Slide in from top
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        // Hold for a moment
        Animated.delay(600),
        // Slide out to top
        Animated.timing(slideAnim, {
          toValue: -1000,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      })

      // Fade in and out
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(600),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ActivityIndicator size="large" color="#FFFFFF" />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "#F1592E" ,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
})

export default LoadingTransition
