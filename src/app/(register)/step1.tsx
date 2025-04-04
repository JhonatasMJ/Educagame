"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  StatusBar,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import CustomButton from "@/src/components/CustomButton"
import BigAvatar from "@/src/components/BigAvatar"
import Cloudsvg from "../../../assets/images/cloud.svg"
import ProgressDots from "@/src/components/ProgressDots"
import { getAvatarTop } from "@/src/utils/layoutHelpers"
import React from "react"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"

const { width, height } = Dimensions.get("window")

const Step01 = () => {
  const [nome, setNome] = useState("")
  const [sobrenome, setSobrenome] = useState("")
  const [errors, setErrors] = useState<{ nome?: boolean; sobrenome?: boolean }>({})
  const [nomeFocused, setNomeFocused] = useState(false)
  const [sobrenomeFocused, setSobrenomeFocused] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const { isAuthenticated, isLoading } = useRequireAuth({ requireAuth: false });
  

  // Get params from previous screen
  const { avatarId, avatarSource } = useLocalSearchParams<{
    avatarId: string
    avatarSource: string
  }>()

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardVisible(true)
      // Scroll to input area when keyboard appears
      scrollViewRef.current?.scrollTo({ y: 200, animated: true })
    })

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
      // Optionally scroll back to top when keyboard hides
      scrollViewRef.current?.scrollTo({ y: 0, animated: true })
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const getBorderColor = (field: "nome" | "sobrenome", isFocused: boolean) => {
    if (errors[field]) return "#FF0000"
    if (isFocused) return "#56A6DC"
    return "#E8ECF4"
  }

  const updateField = (field: "nome" | "sobrenome", value: string) => {
    if (field === "nome") setNome(value)
    if (field === "sobrenome") setSobrenome(value)

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateAndContinue = () => {
    const newErrors: { nome?: boolean; sobrenome?: boolean } = {}

    if (!nome.trim()) {
      newErrors.nome = true
    }

    if (!sobrenome.trim()) {
      newErrors.sobrenome = true
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Using consistent params format for navigation
    router.push({
      pathname: "/(register)/step2",
      params: {
        nome,
        sobrenome,
        avatarId,
        avatarSource,
      },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {avatarSource && <BigAvatar avatarSource={avatarSource} style={{ marginBottom: -20 }} />}
          <View style={styles.backgroundContainer}>
            <Cloudsvg width="90%" height="40%" />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Vamos criar sua conta!</Text>

            <View style={styles.inputsContainer}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: getBorderColor("nome", nomeFocused) },
                  Platform.select({
                    web: nomeFocused ? { outlineColor: "#56A6DC", outlineWidth: 2 } : {},
                  }),
                ]}
                placeholder="Digite seu nome"
                value={nome}
                onChangeText={(value) => updateField("nome", value)}
                cursorColor="#3B82F6"
                onFocus={() => setNomeFocused(true)}
                onBlur={() => setNomeFocused(false)}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Sobrenome</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: getBorderColor("sobrenome", sobrenomeFocused) },
                  Platform.select({
                    web: sobrenomeFocused ? { outlineColor: "#56A6DC", outlineWidth: 2 } : {},
                  }),
                ]}
                placeholder="Digite seu sobrenome"
                value={sobrenome}
                onChangeText={(value) => updateField("sobrenome", value)}
                cursorColor="#3B82F6"
                onFocus={() => setSobrenomeFocused(true)}
                onBlur={() => setSobrenomeFocused(false)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.buttonContainer}>
              <CustomButton title="Continuar" onPress={validateAndContinue} />
              <ProgressDots currentStep={1} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#56A6DC",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: getAvatarTop(),
    paddingBottom: 50,
  },
  contentContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  formContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    alignItems: "center",
    paddingBottom: 20,
    minHeight: height * 0.2,
  },
  inputsContainer: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
    top: "4%",
    height: "55%",
    gap: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    width: "80%",
    marginBottom: 0,
  },
  input: {
    width: "80%",
    height: "21%",
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F7F8F9",
    color: "#000000",
    marginBottom: 8,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    height: 80,
    marginTop: 0,
  },
})

export default Step01

