import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TextInput, StatusBar, Dimensions } from "react-native";
import CustomButton from "@/src/components/CustomButton";
import BigAvatar from "@/src/components/BigAvatar"; // Importando o componente criado para renderizar os avatares grandes
import Cloudsvg from "../../../assets/images/cloud.svg";  // Background SVG
import ProgressDots from '../../components/ProgressDots';

const {width, height} = Dimensions.get("window");

const Step01 = () => {
  const [isFocusedNome, setIsFocusedNome] = useState(false);
  const [isFocusedSobrenome, setIsFocusedSobrenome] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);


  const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();

  const getAvatarTop = () => {
    if (width >= 1024) {
      return "12%"; 
    } else if (height <= 732) {
      return "0%";
    } else {
      return "10%";
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#56A6DC" />
      {/* Background SVG */}
      <View style={styles.backgroundContainer}>
        <Cloudsvg width="90%" height="40%" />
      </View>

      {/* Renderizando o BigAvatar */}
      {avatarSource && (
        <BigAvatar
        avatarSource={avatarSource}
        style={{ position: "absolute", zIndex: 2, top: getAvatarTop() }}
      />
      
      )}
      {/* Campos de entrada */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Vamos criar sua conta!</Text>
        <View style={styles.inputsContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput 
            style={[styles.input, isFocusedNome && styles.inputFocused]} 
            placeholder="Digite seu nome"
            onFocus={() => setIsFocusedNome(true)}
            onBlur={() => setIsFocusedNome(false)}
          /> 

          <Text style={styles.label}>Sobrenome</Text>
          <TextInput 
            style={[styles.input, isFocusedSobrenome && styles.inputFocused]} 
            placeholder="Digite seu sobrenome"
            onFocus={() => setIsFocusedSobrenome(true)}
            onBlur={() => setIsFocusedSobrenome(false)}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput 
            keyboardType="email-address"
            style={[styles.input, isFocusedEmail && styles.inputFocused]} 
            placeholder="Digite seu email"
            onFocus={() => setIsFocusedEmail(true)}
            onBlur={() => setIsFocusedEmail(false)}
          />
        </View>
        <View style={{ zIndex: 3, position: "absolute", bottom: "8%", justifyContent: "space-between", height: "20%" }}>
        <CustomButton
          title="Continuar"
          nextStep="/(register)/step2"
          params={{ avatarId, avatarSource }}
        />

      <ProgressDots currentStep={1} />
      
      </View>
      </View>

      {/* Botão de continuar */}
 
    </SafeAreaView>
    
  );
};

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#56A6DC",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject, // Faz o SVG cobrir toda a tela
    zIndex: 1, // Coloca atrás de tudo
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    top: 10,
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
  inputsContainer: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    height: "55%",
    justifyContent: "space-evenly",
    top: "5%",
  },
  inputFocused: {
    borderColor: "#56A6DC",
    borderWidth: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    width: "80%",
  },
  input: {
    width: "80%",
    borderWidth: 2,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default Step01;
