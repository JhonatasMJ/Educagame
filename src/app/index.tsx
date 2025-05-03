"use client"
import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import AppLoading from "expo-app-loading"
import { useRouter } from "expo-router"
import { Ionicons, MaterialIcons, FontAwesome, AntDesign } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import { USE_SIMPLIFIED_ONBOARDING } from "@/config/appConfig"
import "../styles/global.css"
import { Text, View } from "react-native"
import React from "react"

export default function Index() {
  const router = useRouter()
  const { authUser, loading } = useAuth()
  const [redirecting, setRedirecting] = useState(false)

  // Carrega as fontes necessárias para os ícones
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FontAwesome.font,
    ...AntDesign.font,
  })

  useEffect(() => {
    if (fontsLoaded && !loading && !redirecting) {
      setRedirecting(true)

      // Pequeno atraso para garantir que o estado seja atualizado
      setTimeout(() => {
        if (authUser) {
          console.log("Redirecionando para home")
          router.replace("/(tabs)/home")
        } else if (USE_SIMPLIFIED_ONBOARDING) {
          router.replace("/quick-start")
        } else {
          router.replace("/login")
        }
      }, 100)
    }
  }, [fontsLoaded, loading, authUser, router, redirecting])

  // Aguarda o carregamento das fontes e da autenticação
  if (!fontsLoaded || loading) {
    return <AppLoading />
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Carregando...</Text>
    </View>
  )
}
