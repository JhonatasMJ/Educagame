"use client"
import { Stack } from "expo-router"
import PlatformWrapper from "@/PlataformWrapper"
import { ConversationProvider } from "../context/ContextIa"
import { StatusBar } from "react-native"
import Toast from "react-native-toast-message"
import { registerForPushNotificationsAsync } from "../services/firebaseFCM"
import React, { useEffect } from "react"
import { AuthProvider } from "../context/AuthContext"
import { GameProgressProvider } from "../context/GameProgressContext"
import { TutorialProvider } from "../context/TutorialContext"
import { EditModeProvider } from "../context/EditableContext"
import { getAuthToken } from "../services/apiService" // Importe o serviço de API

// Modify the Layout function to wrap the content with EditModeProvider
export default function Layout() {
  useEffect(() => {
    registerForPushNotificationsAsync()

    // Verificar se há um token JWT válido ao iniciar o app
    const checkToken = async () => {
      try {
        const token = await getAuthToken()
        console.log("Token JWT encontrado:", token ? "Sim" : "Não")
      } catch (error) {
        console.error("Erro ao verificar token JWT:", error)
      }
    }

    checkToken()
  }, [])

  return (
    <ConversationProvider>
      <TutorialProvider>
        <AuthProvider>
          <EditModeProvider>
            <GameProgressProvider>
              <PlatformWrapper>
                <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="register" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="quick-start" options={{ headerShown: false }} />
                </Stack>
              </PlatformWrapper>
              <Toast />
            </GameProgressProvider>
          </EditModeProvider>
        </AuthProvider>
      </TutorialProvider>
    </ConversationProvider>
  )
}
