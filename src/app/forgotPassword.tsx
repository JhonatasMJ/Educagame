import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Platform,
} from "react-native";

import Logo from "../../assets/images/logo.svg";



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
      <View style={{ alignItems: "center" }}>
        <Logo style={{ width: 315, height: 65, marginTop: 50 }} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerText: {
    alignItems: "center",
    width: "80%",
    height: "20%",
    paddingTop: 35,
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



});

export default ForgotPasswordScreen;
