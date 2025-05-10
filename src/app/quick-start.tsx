"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { BRAND_COLORS, TEXT_COLORS, BUTTON_COLORS, UI_COLORS, FORM_COLORS } from "../colors"
import { useQuickRegister } from "../hooks/useQuickRegister"
import { useRequireAuth } from "../hooks/useRequireAuth"
import Toast from "react-native-toast-message"

// Importando os avatares SVG
import Avatar1 from "../../assets/images/avatar1.svg"
import Avatar2 from "../../assets/images/avatar2.svg"
import Avatar3 from "../../assets/images/avatar3.svg"
import Avatar4 from "../../assets/images/avatar4.svg"
import Character from "../components/Character"
import React from "react"
import { router } from "expo-router"

const avatars = [
  { id: "1", source: Avatar1, sourceName: "avatar1" },
  { id: "2", source: Avatar2, sourceName: "avatar2" },
  { id: "3", source: Avatar3, sourceName: "avatar3" },
  { id: "4", source: Avatar4, sourceName: "avatar4" },
]

const { width } = Dimensions.get("window")
const AVATAR_SIZE = width * 0.16 // Tamanho reduzido dos avatares

export default function QuickStart() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const { handleQuickRegister, isLoading } = useQuickRegister()

  // Validação em tempo real do nome
  const [nameError, setNameError] = useState<string | null>(null)

  // Função para validar o nome enquanto o usuário digita e separar nome/sobrenome
  const validateName = (text: string) => {
    setName(text)

    // Separar nome e sobrenome
    const nameParts = text.trim().split(/\s+/)
    if (nameParts.length > 0) {
      setFirstName(nameParts[0])
      setLastName(nameParts.length > 1 ? nameParts.slice(1).join(" ") : "")
    }

    if (text.trim().length > 0 && text.trim().length < 3) {
      setNameError("Nome deve ter pelo menos 3 caracteres")
    } else {
      setNameError(null)
    }
  }

  // Animações
  const fadeIn = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(50)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const avatarAnimations = useRef(avatars.map(() => new Animated.Value(0))).current

  useRequireAuth({
    requireAuth: false,
    showToast: false,
  })

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      // Animação sequencial dos avatares
      ...avatarAnimations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: 300 + index * 100,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
      ),
    ]).start()
  }, [])

  // Animação do botão ao pressionar
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  const handleRegister = async () => {
    if (!selectedAvatar) {
      Alert.alert("Escolha um avatar", "Por favor, selecione um avatar para continuar")
      return
    }

    if (name.trim().length < 3) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Nome muito curto",
        text2: "O nome deve ter pelo menos 3 caracteres",
        visibilityTime: 3000,
        autoHide: true,
      })
      return
    }

    try {
      // Passar nome, sobrenome e nome completo para o registro
      await handleQuickRegister(name, selectedAvatar, firstName, lastName)
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar sua conta. Tente novamente.")
      console.error(error)
    }
  }

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId)

    // Animação de seleção
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Determinar o texto de ajuda para o nome
  const getNameHelperText = () => {
    if (firstName && lastName) {
      return `Nome: ${firstName} | Sobrenome: ${lastName}`
    } else if (firstName) {
      return `Nome: ${firstName}`
    }
    return ""
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <Text style={styles.title}>Comece sua jornada!</Text>
          <Text style={styles.description}>Personalize seu perfil para começar a jogar e aprender</Text>

          <View style={styles.section}>
            <Text style={styles.subtitle}>Escolha seu avatar</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-evenly",
                width: "100%",
              }}
            >
              {avatars.map((avatar, index) => {
                return (
                  <Animated.View
                    key={avatar.id}
                    style={{
                      opacity: avatarAnimations[index],
                      transform: [
                        {
                          scale: avatarAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          }),
                        },
                      ],
                      width: "35%", // Define a largura para aproximadamente metade do container
                      alignItems: "center",
                    }}
                  >
                    <Character
                      source={avatar.source}
                      id={Number(avatar.id)}
                      isSelected={selectedAvatar === avatar.id}
                      onSelect={() => handleAvatarSelect(avatar.id)}
                    />
                  </Animated.View>
                )
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>Como podemos te chamar?</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Digite seu nome completo"
              placeholderTextColor={UI_COLORS.PLACEHOLDER}
              value={name}
              onChangeText={validateName}
              maxLength={40}
              autoCapitalize="words"
            />
            {nameError && <Text style={styles.errorText}>{nameError}</Text>}
            
          </View>

          <Animated.View
            style={{
              width: "100%",
              transform: [{ scale: buttonScale }],
            }}
          >
            <TouchableOpacity
              style={[styles.button, (!name || !selectedAvatar) && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={!name || !selectedAvatar || isLoading}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    { color: !name || !selectedAvatar ? BRAND_COLORS.PRIMARY : BUTTON_COLORS.SECONDARY_TEXT },
                  ]}
                >
                  {!selectedAvatar ? "Escolha seu avatar" : !name ? "Digite seu nome" : "JOGAR!"}
                </Text>
              )}
            </TouchableOpacity>
            <View style={{ height: 20 }} />
            <TouchableOpacity style={{ alignItems: "center", justifyContent: "center", flexDirection: "row" }} onPress={() => router.replace("/login")}>
              <Text style={styles.subtitle}>Ja possui uma conta?</Text>
              <View style={{ width: 6.75 }} />
              <Text style={[styles.subtitle, { textDecorationLine: "underline"}]}>Clique aqui!</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.TERTIARY,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: TEXT_COLORS.LIGHT,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: TEXT_COLORS.LIGHT,
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 6.78,
    maxWidth: "80%",
  },
  section: {
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_COLORS.LIGHT,
    marginBottom: 8,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    width: "100%",
  },
  avatarContainer: {
    width: AVATAR_SIZE / 1.85,
    height: AVATAR_SIZE / 1.85,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedAvatarContainer: {
    borderColor: BRAND_COLORS.SECONDARY,
    borderWidth: 3,
    shadowColor: BRAND_COLORS.SECONDARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: FORM_COLORS.INPUT_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: TEXT_COLORS.PRIMARY,
    borderWidth: 1,
    borderColor: FORM_COLORS.INPUT_BORDER,
  },
  button: {
    width: "100%",
    height: 56,
    backgroundColor: BRAND_COLORS.PRIMARY,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: BRAND_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: BUTTON_COLORS.DISABLED_BG,
    shadowOpacity: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  buttonText2: {
    color: BRAND_COLORS.WHITE,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 5,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  helperText: {
    color: TEXT_COLORS.LIGHT,
    fontSize: 14,
    marginTop: 5,
    alignSelf: "flex-start",
    marginLeft: 5,
    opacity: 0.8,
  },
})
