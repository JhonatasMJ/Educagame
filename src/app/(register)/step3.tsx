import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TextInput, StatusBar, Dimensions } from "react-native";
import CustomButton from "@/src/components/CustomButton";
import Checkbox from "@/src/components/Checkbox"; // Adjust the import path as needed


const {width, height} = Dimensions.get("window");

// Importando o background SVG
import Cloudsvg from "../../../assets/images/cloud.svg"; 
import BigAvatar from "@/src/components/BigAvatar";
import ProgressDots from "@/src/components/ProgressDots";


const Step03 = () => {
    const [isFocusedNome, setIsFocusedNome] = useState(false);
    const [isFocusedSobrenome, setIsFocusedSobrenome] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [lgpdAccepted, setLgpdAccepted] = useState(false);

    const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();

    const getAvatarTop = () => {
      if (width >= 1024) {
        return "2%"; 
      } else if (height <= 708) {
        return "0%";
      } else {
        return "10%";
      }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#56A6DC" />
            
            <View style={styles.backgroundContainer}>
                <Cloudsvg width="90%" height="40%" />
            </View>

            {/* Renderizando o BigAvatar */}
            {avatarSource && (
              <BigAvatar
                avatarSource={avatarSource}
                style={{ position: "absolute", zIndex: 2, top: getAvatarTop()}}
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

                <View style={{ zIndex: 3, position: "absolute", bottom: "8%", justifyContent: "space-between", height: "20%" }}>
        <CustomButton
          title="Continuar"
          nextStep="/(register)/step4"
          params={{ avatarId, avatarSource }}
        />

      <ProgressDots currentStep={3} />
      
      </View>
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
        top: "4%",
      },
      formContainer: {
        width: "100%",
        height: height <= 708 ? "60%" : "55%",
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
        height: "45%",
        justifyContent: "space-evenly",
        top: "8%",
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