import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TextInput, StatusBar, Dimensions, Platform } from "react-native";
import CustomButton from "@/src/components/CustomButton";
import { getAvatarTop, bottomHeight } from "@/src/utils/layoutHelpers";



const {width, height} = Dimensions.get("window");

// Importando o background SVG
import Cloudsvg from "../../../assets/images/cloud.svg"; 
import BigAvatar from "@/src/components/BigAvatar";
import ProgressDots from "@/src/components/ProgressDots";
import Toast from "react-native-toast-message";


const Step03 = () => {
    const [isFocusedNome, setIsFocusedNome] = useState(false);
    const [isFocusedSobrenome, setIsFocusedSobrenome] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [lgpdAccepted, setLgpdAccepted] = useState(false);
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState<{password?: boolean; confirmPassword?: boolean}>({})
    const [field1Focused, setField1Focused] = useState(false)
    const [field2Focused, setField2Focused] = useState(false)


    const getBorderColor = (field: 'password' | 'confirmPassword', isFocused: boolean) => {
      if (errors[field]) return '#FF0000'
      if (isFocused) return '#56A6DC'
      return '#E8ECF4'
    }
    

    const handleContinue = async () => {
      const newErrors: {password?: boolean; confirmPassword?: boolean} = {}
      
      if (!password) newErrors.password = true
      if (!confirmPassword) newErrors.confirmPassword = true
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        Toast.show({ type: "error", text1: "Erro", text2: "Preencha todos os campos!" })
        return
      }
    }

    const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();

    

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
                            style={[
                              styles.input,
                              { borderColor: getBorderColor('password', field1Focused) },
                              Platform.select({
                                web: field1Focused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
                              })
                            ]}
                            placeholder="Digite sua senha"
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => setField1Focused(true)}
                            onBlur={() => setField1Focused(false)}
                            secureTextEntry
                        />
                    </View>

                        <View style={styles.inputArea}>
                        <Text style={styles.label}>Confirme sua senha</Text>
                        <TextInput
                           style={[
                            styles.input,
                            { borderColor: getBorderColor('confirmPassword', field2Focused) },
                            Platform.select({
                              web: field2Focused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
                            })
                          ]}
                          placeholder="Confirme sua senha"
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          onFocus={() => setField2Focused(true)}
                          onBlur={() => setField2Focused(false)}
                          secureTextEntry
                        />
                        </View>
                  
                </View>

                <View style={{ zIndex: 3, position: "absolute", bottom: bottomHeight(), justifyContent: "space-between", height: "20%" }}>
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
      inputsContainer:{
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
        height: "47%",
        justifyContent: "space-around",
        top: "8%",
      },
      inputArea: {
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "35%", // Changed from "20%" to fixed height
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
        borderRadius: 8, 
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#F7F8F9",
        color: "#000000",
        marginBottom: 8
      },
      
      

});

export default Step03;