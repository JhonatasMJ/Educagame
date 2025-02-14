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

    const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();
    const SelectedBigAvatar = avatarSource ? bigAvatarMapping[avatarSource] : null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#85F995" />


            {SelectedBigAvatar && (
                <SelectedBigAvatar 
                    width={182} 
                    height={300} 
                    style={{ marginBottom: "65%", position: "relative", zIndex: 2 }} 
                />
            )}

            <View style={styles.formContainer}>
                <View style={{ alignItems: "center" }}>
                    <Text style={styles.title}>
                        <Text style={{ fontWeight: "bold", color: "#4A90E2" }}>[Nome], </Text>
                        <Text style={{ fontWeight: "bold" }}>conta criada{"\n"}com sucesso!</Text>
                    </Text>
                </View>
                <View style={styles.text}>
                    <Text style={{fontSize: 25, textAlign: "center", paddingHorizontal: "19%"}}>Agora é só entrar na sua conta e começar a estudar!</Text>

                </View>

               
            </View>

            <View style={{zIndex: 3}}>
                <CustomButton
                    title="Começar!"
                    nextStep="../(tabs)/home"
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
        backgroundColor:"#85F995",
      },
      backgroundContainer: {
        ...StyleSheet.absoluteFillObject, // Faz o SVG cobrir toda a tela
        zIndex: 1, // Coloca atrás de tudo
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
      text:{
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
        height: "55%",
        justifyContent: "center",
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