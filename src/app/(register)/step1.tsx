import { useLocalSearchParams } from "expo-router";
import React,{ useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TextInput, StatusBar } from "react-native";
import CustomButton from "@/src/components/CustomButton";

// Importando os avatares grandes
import BigAvatar1 from "../../../assets/images/grande-avatar1.svg";
import BigAvatar2 from "../../../assets/images/grande-avatar2.svg";
import BigAvatar3 from "../../../assets/images/grande-avatar3.svg";
import BigAvatar4 from "../../../assets/images/grande-avatar4.svg";

// Importando o background SVG
import Cloudsvg from "../../../assets/images/cloud.svg"; 


// Mapeamento dos avatares grandes
const bigAvatarMapping: Record<string, React.FC<any>> = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
};

const Step01 = () => {

  const [isFocusedNome, setIsFocusedNome] = useState(false);
  const [isFocusedSobrenome, setIsFocusedSobrenome] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);

  // Pegando os parâmetros da navegação
  const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();

  // Obtendo o componente correto do avatar grande
  const SelectedBigAvatar = avatarSource ? bigAvatarMapping[avatarSource] : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#56A6DC" />
      {/* Background SVG */}
      <View style={styles.backgroundContainer}>
        <Cloudsvg width="90%" height="40%" />
      </View>

      {/* Renderizando o avatar grande */}
      {SelectedBigAvatar && <SelectedBigAvatar width={182} height={300} style={{ marginBottom: "65%", position: "relative", zIndex: 2 }} />}

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
          ></TextInput> 

          <Text style={styles.label}>Sobrenome</Text>
          <TextInput 
          style={[styles.input, isFocusedSobrenome && styles.inputFocused]} 
          placeholder="Digite seu sobrenome"
          onFocus={() => setIsFocusedSobrenome(true)}
          onBlur={() => setIsFocusedSobrenome(false)}
          ></TextInput>

          <Text style={styles.label}>Email</Text>
          <TextInput 
          keyboardType="email-address"
          style={[styles.input, isFocusedEmail && styles.inputFocused]} 
          placeholder="Digite seu email"
          onFocus={() => setIsFocusedEmail(true)}
          onBlur={() => setIsFocusedEmail(false)}
          ></TextInput>
        </View>
      </View>

      {/* Botão de continuar */}
      <View style={{zIndex: 3}}>
        <CustomButton
          nextStep="/(register)/step2"
          params={{ avatarId, avatarSource }}
        />
      </View>
    </SafeAreaView>
  );
};

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:"#56A6DC",
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
    height: "60%",
    marginTop: 20,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    alignItems: "center",
    zIndex: 3,
  },
  inputsContainer:{
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    height: "60%",
    justifyContent: "space-evenly",
    top: "5%"
  },
  inputFocused:{
    borderColor: "#56A6DC",
    borderWidth: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    width: "80%"
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
