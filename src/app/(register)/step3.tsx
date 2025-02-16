import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TextInput, StatusBar } from "react-native";
import CustomButton from "@/src/components/CustomButton";
import Checkbox from "@/src/components/Checkbox"; // Adjust the import path as needed

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
const Step03 = () => {
    const [isFocusedNome, setIsFocusedNome] = useState(false);
    const [isFocusedSobrenome, setIsFocusedSobrenome] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [lgpdAccepted, setLgpdAccepted] = useState(false);

    const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();
    const SelectedBigAvatar = avatarSource ? bigAvatarMapping[avatarSource] : null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#56A6DC" />
            
            <View style={styles.backgroundContainer}>
                <Cloudsvg width="90%" height="40%" />
            </View>

            {SelectedBigAvatar && (
                <SelectedBigAvatar 
                    width={182} 
                    height={300} 
                    style={{ marginBottom: "65%", position: "relative", zIndex: 2 }} 
                />
            )}

            <View style={styles.formContainer}>
                <Text style={styles.title}>Vamos criar uma senha!</Text>
                <View style={styles.inputsContainer}>
                    <View style={styles.inputArea}>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            style={[styles.input, isFocusedNome && styles.inputFocused]}
                            placeholder="Digite sua senha"
                            onFocus={() => setIsFocusedNome(true)}
                            onBlur={() => setIsFocusedNome(false)}
                        />
                    </View>

                    <View style={styles.inputArea}>
                        <Text style={styles.label}>Confirme sua senha</Text>
                        <TextInput
                            style={[styles.input, isFocusedSobrenome && styles.inputFocused]}
                            placeholder="Confirme sua senha"
                            keyboardType="numeric"
                            onFocus={() => setIsFocusedSobrenome(true)}
                            onBlur={() => setIsFocusedSobrenome(false)}
                        />
                    </View>
                </View>

               
            </View>

            <View style={{zIndex: 3}}>
                <CustomButton
                    title="Continuar"
                    nextStep="/(register)/step4"
                    params={{ avatarId, avatarSource }}
                />
            </View>
        </SafeAreaView>
    );
};

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
        height: "55%",
        justifyContent: "space-evenly",
        top: "5%",
      },
      inputArea: {
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
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

export default Step03;