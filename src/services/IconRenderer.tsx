import React from "react"
import { View, Image, StyleSheet } from "react-native"
import * as LucideIcons from "lucide-react-native"
import { FontAwesome, MaterialIcons, Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons"

// Tipos de bibliotecas de ícones suportadas
export type IconLibrary = "lucide" | "fontawesome" | "material" | "ionicons" | "feather" | "material-community"

// Interface para as props do componente
export interface IconProps {
  name: string
  library?: IconLibrary
  size?: number
  color?: string
  imageUrl?: string
}

/**
 * Componente para renderizar ícones de diferentes bibliotecas ou imagens
 */
const IconRenderer: React.FC<IconProps> = ({ name, library = "lucide", size = 24, color = "white", imageUrl }) => {
  // Se for uma URL de imagem, renderiza a imagem
  if (imageUrl && isValidUrl(imageUrl)) {
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={{ width: size * 1.5, height: size * 1.5 }} resizeMode="contain" />
      </View>
    )
  }

  // Renderiza ícone baseado na biblioteca especificada
  switch (library) {
    case "lucide":
      return renderLucideIcon(name, size, color)
    case "fontawesome":
      return <FontAwesome name={name as any} size={size} color={color} />
    case "material":
      return <MaterialIcons name={name as any} size={size} color={color} />
    case "ionicons":
      return <Ionicons name={name as any} size={size} color={color} />
    case "feather":
      return <Feather name={name as any} size={size} color={color} />
    case "material-community":
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />
    default:
      // Fallback para ícone padrão do Lucide
      return <LucideIcons.BookOpenText size={size} color={color} />
  }
}
/**
 * Renderiza um ícone do Lucide dinamicamente pelo nome
 */
const renderLucideIcon = (name: string, size: number, color: string) => {
  // Converte kebab-case para PascalCase (ex: "book-open" -> "BookOpen")
  const pascalCaseName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

  // Verifica se o ícone existe no Lucide
  const LucideIcon = (LucideIcons as any)[pascalCaseName]

  // Se o ícone existir, renderiza-o, senão usa o ícone padrão
  if (LucideIcon) {
    return <LucideIcon size={size} color={color} />
  }

  // Fallback para ícone padrão
  return <LucideIcons.BookOpenText size={size} color={color} />
}

/**
 * Verifica se uma string é uma URL válida
 */
const isValidUrl = (str: string): boolean => {
  try {
    return str.startsWith("http://") || str.startsWith("https://") || str.startsWith("data:image/")
  } catch (e) {
    return false
  }
}

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
})

export default IconRenderer
