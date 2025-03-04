import { useLocalSearchParams, router } from "expo-router"
import { View, Text, SafeAreaView, StyleSheet, StatusBar, Dimensions } from "react-native"
import CustomButton from "@/src/components/CustomButton"
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { getDatabase, ref, set } from "firebase/database"
import Toast from "react-native-toast-message"
import Cloudsvg from "../../../assets/images/cloud.svg"
import BigAvatar from "@/src/components/BigAvatar"
import ProgressDots from "@/src/components/ProgressDots"

const { height } = Dimensions.get("window")

const Step04 = () => {
  // Get all params from previous screens
  const { avatarId, avatarSource, nome, sobrenome, email, birthDate, phone, termsAccepted, lgpdAccepted, password } =
    useLocalSearchParams<{
      avatarId: string
      avatarSource: string
      nome: string
      sobrenome: string
      email: string
      birthDate: string
      phone: string
      termsAccepted: string
      lgpdAccepted: string
      password: string
    }>()

  const handleFinalRegister = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "E-mail ou senha não fornecidos!",
      })
      return
    }

    try {
      // Create user in Firebase Authentication
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Save user data to Firebase Realtime Database
      const db = getDatabase()
      await set(ref(db, "users/" + user.uid), {
        avatarId,
        avatarSource,
        nome,
        sobrenome,
        email,
        birthDate,
        phone,
        termsAccepted: termsAccepted === "true",
        lgpdAccepted: lgpdAccepted === "true",
        createdAt: new Date().toISOString(),
      })

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Conta criada com sucesso!",
      })

      // Navigate to home or login screen
      router.push("/home")
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: error.message || "Falha ao criar conta!",
      })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#85F995" />

      <View style={styles.backgroundContainer}>
        <Cloudsvg width="90%" height="40%" />
      </View>

      {avatarSource && (
        <BigAvatar avatarSource={avatarSource} style={{ position: "absolute", zIndex: 2, top: getAvatarTop() }} />
      )}

      <View style={styles.formContainer}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>
            <Text style={{ fontWeight: "bold", color: "#4A90E2" }}>{nome}, </Text>
            <Text style={{ fontWeight: "bold" }}>conta criada{"\n"}com sucesso!</Text>
          </Text>
        </View>
        <View style={styles.text}>
          <Text style={{ fontSize: 25, textAlign: "center", paddingHorizontal: "19%" }}>
            Agora é só entrar na sua conta e começar a estudar!
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton title="Continuar" onPress={handleFinalRegister} />
          <ProgressDots currentStep={4} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#85F995",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    top: 25,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    height: height <= 732 ? "60%" : "55%",
    marginTop: 20,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    alignItems: "center",
    zIndex: 3,
  },
  text: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    height: "55%",
    justifyContent: "center",
    top: "5%",
  },
  buttonContainer: {
    zIndex: 3,
    position: "absolute",
    bottom: bottomHeight(),
    justifyContent: "space-between",
    height: "20%",
  },
})

export default Step04

