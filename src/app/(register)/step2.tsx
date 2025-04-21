"use client"

import { useState, useRef, useEffect } from "react"
import { 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  StatusBar, 
  Dimensions, 
  Platform, 
  ScrollView,
  Keyboard
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import Toast from "react-native-toast-message"
import CustomButton from "@/src/components/CustomButton"
import Checkbox from "@/src/components/Checkbox"
import Cloudsvg from "../../../assets/images/cloud.svg"
import BigAvatar from "@/src/components/BigAvatar"
import ProgressDots from "@/src/components/ProgressDots"
import { MaskedTextInput } from "react-native-mask-text"
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers"
import React from "react"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import ArrowBack from "@/src/components/ArrowBack"

const { height } = Dimensions.get("window")

const Step02 = () => {
  // Get params from previous screen
  const { nome, sobrenome, avatarId, avatarSource } = useLocalSearchParams<{
    nome: string
    sobrenome: string
    avatarId: string
    avatarSource: string
  }>()

  // Email moved to step 3
  const [birthDate, setBirthDate] = useState("")
  const [phone, setPhone] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
  const [errors, setErrors] = useState<{
    birthDate?: boolean
    phone?: boolean
  }>({})

  const [field1Focused, setField1Focused] = useState(false)
  const [field2Focused, setField2Focused] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const { isAuthenticated, isLoading } = useRequireAuth({ requireAuth: false });

  // Modified keyboard event listeners to prevent infinite loops
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 200, animated: true });
      }, 100);
    });
  
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    });
  
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  

  const getBorderColor = (field: "birthDate" | "phone", isFocused: boolean) => {
    if (errors[field]) return "#FF0000"
    if (isFocused) return "#56A6DC"
    return "#E8ECF4"
  }

  const handleContinue = () => {
    const newErrors: { birthDate?: boolean; phone?: boolean } = {}

    if (!birthDate) newErrors.birthDate = true
    if (!phone) newErrors.phone = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      Toast.show({ type: "error", text1: "Erro", text2: "Preencha todos os campos!" })
      return
    }

    if (!termsAccepted || !lgpdAccepted) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Você precisa aceitar os termos para continuar!",
      })
      return
    }

    // Using consistent params format for navigation
    router.push({
      pathname: "/(register)/step3",
      params: {
        nome,
        sobrenome,
        birthDate,
        phone,
        termsAccepted: termsAccepted.toString(),
        lgpdAccepted: lgpdAccepted.toString(),
        avatarId,
        avatarSource,
      },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
     <ArrowBack onPress={() => router.back()} className="top-3 left-3 absolute bg-white" color="#56A6DC" /> 
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
            <Text style={styles.title}>{nome}, falta pouco!</Text>

            <View style={styles.inputsContainer}>
              <View style={styles.inputCada}>
                <Text style={styles.label}>Data Nascimento</Text>
                <MaskedTextInput
                  style={[styles.input, { borderColor: getBorderColor("birthDate", field1Focused) },
                    Platform.select({
                      web: field1Focused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
                    })
                  ]}
                  onFocus={() => setField1Focused(true)}
                  onBlur={() => setField1Focused(false)}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#999"
                  value={birthDate}
                  onChangeText={setBirthDate}
                  keyboardType="numeric"
                  mask="99/99/9999"
                />
              </View>

              <View style={styles.inputCada}>
                <Text style={styles.label}>Celular</Text>
                <MaskedTextInput
                  style={[styles.input, { borderColor: getBorderColor("phone", field2Focused) },
                    Platform.select({
                      web: field2Focused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
                    })
                  ]}
                  onFocus={() => setField2Focused(true)}
                  onBlur={() => setField2Focused(false)}
                  placeholder="+55 __ _____-____"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="numeric"
                  mask="+55 99 99999-9999"
                />
              </View>

              <View style={styles.checkboxesContainer}>
                <Checkbox title="Termos de uso" isChecked={termsAccepted} onCheck={setTermsAccepted} />
                <Checkbox title="LGPD" isChecked={lgpdAccepted} onCheck={setLgpdAccepted} />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              
                                  <View style={{paddingHorizontal: 30, width: '100%'}}>
              <CustomButton title="Continuar" onPress={handleContinue} />
              </View>
              <View style={{height: 5}}/>
              <ProgressDots currentStep={2} />
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
    height: height <= 732 ? "60%" : "65%",
  },
  inputsContainer: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
    top: height <= 732 ? "0%" : "0%",
    height: "60%",
    gap: 15,
  },
  inputCada: {
    width: "100%",
    height: "30%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height <= 732 ? 5 : 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    width: "80%",
    marginBottom: 5,
  },
  checkboxesContainer: {
    width: "100%",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  input: {
    width: "80%",
    height: 55,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F7F8F9",
    color: "#000000",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    height: "5%",
    marginTop: 5,
    bottom: bottomHeight(),
  },
})

export default Step02