import { TouchableOpacity, StyleSheet, Animated } from "react-native"
import { HelpCircle } from "lucide-react-native"
import React from "react"

interface HelpButtonProps {
  onPress: () => void
  pulseAnimation?: Animated.Value
}

const HelpButton = ({ onPress, pulseAnimation }: HelpButtonProps) => {
  // If pulseAnimation is provided, use it for scaling, otherwise use a static scale
// Certifique-se de que a interpolação no HelpButton também tem pelo menos 2 elementos
const scale = pulseAnimation
  ? pulseAnimation.interpolate({
      inputRange: [0, 0.5],
      outputRange: [1, 1.2],
    })
  : 1


  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.helpButton}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel="Ajuda sobre como jogar"
        accessibilityHint="Mostra um tutorial sobre como jogar este tipo de jogo"
      >
        <HelpCircle size={18} color="#666" />
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  helpButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
})

export default HelpButton
