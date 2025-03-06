import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import Logo from "../../assets/images/logo.svg";
import CustomButton from "@/src/components/CustomButton";



const ForgotPasswordScreen = () => {
  const [codeFocused, setCodeFocused] = useState(false)
  const [codeFocused2, setCodeFocused2] = useState(false)
  const [codeFocused3, setCodeFocused3] = useState(false)
  const [codeFocused4, setCodeFocused4] = useState(false)
  const [codeFocused5, setCodeFocused5] = useState(false)

  const getBorderColor = (isFocused: boolean) => {/* 
      if (errors) return '#FF0000'; */
    if (isFocused) return '#56A6DC';
    return '#E8ECF4';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}>

          <View style={{ alignItems: "center" }}>
            <Logo style={{ width: 315, height: 65, marginBottom: marginTopDaLogo(), top: 30, position: 'relative' }} />
          </View>

          <View style={styles.containerText}>
            <View >
              <Text style={styles.attentionText}>Atenção</Text>
              <Text style={styles.titleText}>Verifique seu email</Text>
            </View>
          </View>

          <View style={styles.containerInput}>
            <Text style={styles.pleaseText}>Por favor digite o código para verificar o seu email</Text>
            <View style={styles.inputArea}>
              <TextInput style={[styles.input, { borderColor: getBorderColor(codeFocused) },
              Platform.select({ web: codeFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {} })]}
                onFocus={() => setCodeFocused(true)}
                onBlur={() => setCodeFocused(false)}
                keyboardType="numeric" maxLength={1}></TextInput>

              <TextInput style={[styles.input, { borderColor: getBorderColor(codeFocused2) },
              Platform.select({ web: codeFocused2 ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {} })]}
                onFocus={() => setCodeFocused2(true)}
                onBlur={() => setCodeFocused2(false)}
                keyboardType="numeric" maxLength={1}></TextInput>

              <TextInput style={[styles.input, { borderColor: getBorderColor(codeFocused3) },
              Platform.select({ web: codeFocused3 ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {} })]}
                onFocus={() => setCodeFocused3(true)}
                onBlur={() => setCodeFocused3(false)}
                keyboardType="numeric" maxLength={1}></TextInput>

              <TextInput style={[styles.input, { borderColor: getBorderColor(codeFocused4) },
              Platform.select({ web: codeFocused4 ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {} })]}
                onFocus={() => setCodeFocused4(true)}
                onBlur={() => setCodeFocused4(false)}
                keyboardType="numeric" maxLength={1}></TextInput>

              <TextInput style={[styles.input, { borderColor: getBorderColor(codeFocused5) },
              Platform.select({ web: codeFocused5 ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {} })]}
                onFocus={() => setCodeFocused5(true)}
                onBlur={() => setCodeFocused5(false)}
                keyboardType="numeric" maxLength={1}></TextInput>
            </View>
          </View>
          <View style={styles.containerBottom}>
            <View style={styles.containerEmailText}>
              <Text style={styles.codEmail}>Enviamos um código para o email </Text>
              <Text style={styles.email}>exem***@gmail.com </Text>
            </View>
            <View style={styles.buttonArea}>
              <CustomButton
                title="Confirmar código"
              />
              <View style={styles.textBottomArea}>
                <Text style={styles.bottomText}>Não recebeu o código?</Text>
                <TouchableOpacity>
                  <Text style={styles.bottomText2}>Reenviar código</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function marginTopDaLogo(): any {

  const {width, height} = Dimensions.get("window");
  if(width <= 500 && height < 732){ //para celular bemmm pequeno
    return '15%';
  } else if (height >= 732 && width > 409) {
    return "20%";
  }else { //nos que não se encaixam
    return 80;
  }
}  

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  containerText: {
    alignItems: "center",
    width: "80%",
    height: "20%",
    paddingTop: 30,
  },
  attentionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0072C6",
    textAlign: "left",
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "left",
  },
  containerInput: {
    alignItems: "center",
    width: "100%",
    height: "22%",
    flexDirection: "column",
    justifyContent: "space-between",
    textAlign: "center",
  },
  inputArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 15,
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
    height: 120,
  },
  pleaseText: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    width: "18%",
    height: 110,
    borderWidth: 4,
    borderRadius: 10,
    backgroundColor: "#F7F8F9",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  containerBottom: {
    alignItems: "center",
    width: "100%",
    height: "100%",
    justifyContent: "space-evenly",
    flexDirection: "column",
  },
  containerEmailText: {
    alignItems: "center",
    width: "100%",
    height: "10%",
  },
  codEmail: {
    fontSize: 14,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0072C6",
  },
  buttonArea: {
    height: "80%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "column",
    width: "100%",
  },
  textBottomArea: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "20%",
    justifyContent: "space-evenly",
    width: "70%",
    position: "absolute",
  },
  bottomText: {
    fontSize: 15,
    fontWeight: "600",
  },
  bottomText2: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0072C6",
  },


});

export default ForgotPasswordScreen;
