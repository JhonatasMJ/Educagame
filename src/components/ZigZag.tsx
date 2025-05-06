import React from "react"
import { View, StyleSheet } from "react-native"
import Svg, { Path } from "react-native-svg"

interface ZigzagPathProps {
  height: number
  width: number
  steps: number
  color?: string
  strokeWidth?: number
}

const ZigzagPath: React.FC<ZigzagPathProps> = ({ height, width, steps, color = "#ddd", strokeWidth = 4 }) => {
  // Calcular a altura de cada segmento
  const segmentHeight = height / steps

  // Gerar o caminho zigzag
  const generatePath = () => {
    let path = `M ${width / 2} 0` // Começar no meio do topo

    for (let i = 0; i < steps; i++) {
      const y = (i + 1) * segmentHeight
      // Alternar entre esquerda e direita
      const x = i % 2 === 0 ? width * 0.2 : width * 0.8
      path += ` L ${x} ${y}`
    }

    return path
  }

  return (
    <View style={[styles.container, { height, width }]}>
      <Svg height={height} width={width}>
        <Path d={generatePath()} stroke={color} strokeWidth={strokeWidth} fill="none" />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: -1,
  },
})

export default ZigzagPath
