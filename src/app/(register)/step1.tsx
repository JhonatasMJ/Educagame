import React, { useState } from "react";
import { View, Text, SafeAreaView, TextInput, StatusBar, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import CustomButton from "@/src/components/CustomButton";
import BigAvatar from "@/src/components/BigAvatar";
import Cloudsvg from "../../../assets/images/cloud.svg";
import ProgressDots from "@/src/components/ProgressDots";
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers";
import { useRegister } from "@/src/hooks/useRegister";

const { width, height } = Dimensions.get("window");

const Step01 = () => {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");

  const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();
  const { handleRegister, isLoading } = useRegister();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#56A6DC" />
      
      <View style={styles.backgroundContainer}>
        <Cloudsvg width="90%" height="40%" />
      </View>

      {avatarSource && <BigAvatar avatarSource={avatarSource} style={{ position: "absolute", zIndex: 2, top: getAvatarTop() }} />}
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Vamos criar sua conta!</Text>
        
        <View style={styles.inputsContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} placeholder="Digite seu nome" value={nome} onChangeText={setNome} />

          <Text style={styles.label}>Sobrenome</Text>
          <TextInput style={styles.input} placeholder="Digite seu sobrenome" value={sobrenome} onChangeText={setSobrenome} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Digite seu email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Continuar"
            onPress={() => handleRegister(nome, sobrenome, email, avatarId)}
            isLoading={isLoading}
          />
          <ProgressDots currentStep={1} />
        </View>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#56A6DC" },
  backgroundContainer: { ...StyleSheet.absoluteFillObject, zIndex: 1, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", top: 10 },
  formContainer: { width: "100%", height: height <= 732 ? "60%" : "55%", marginTop: 20, backgroundColor: "#fff", position: "absolute", bottom: 0, borderTopRightRadius: 30, borderTopLeftRadius: 30, alignItems: "center", zIndex: 3 },
  inputsContainer: { flexDirection: "column", width: "100%", alignItems: "center", height: "55%", justifyContent: "space-evenly", top: "5%" },
  label: { fontSize: 16, marginBottom: 4, width: "80%" },
  input: { width: "80%", borderWidth: 2, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 10 },
  buttonContainer: { zIndex: 3, position: "absolute", bottom: bottomHeight(), justifyContent: "space-between", height: "20%" },
});

export default Step01;
