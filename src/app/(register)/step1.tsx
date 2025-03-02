import React, { useState } from "react";
import { View, Text, SafeAreaView, TextInput, StatusBar, StyleSheet, Dimensions, Platform } from "react-native";
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
  const [errors, setErrors] = useState<{nome?: boolean; sobrenome?: boolean; email?: boolean}>({});
  const [nomeFocused, setNomeFocused] = useState(false);
  const [sobrenomeFocused, setSobrenomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();
  const { handleRegister, isLoading } = useRegister();

  const getBorderColor = (field: 'nome' | 'sobrenome' | 'email', isFocused: boolean) => {
    if (errors[field]) return '#FF0000';
    if (isFocused) return '#56A6DC';
    return '#E8ECF4';
  };

  const updateField = (field: 'nome' | 'sobrenome' | 'email', value: string) => {
    if (field === 'nome') setNome(value);
    if (field === 'sobrenome') setSobrenome(value);
    if (field === 'email') setEmail(value);

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateAndContinue = () => {
    const newErrors: {nome?: boolean; sobrenome?: boolean; email?: boolean} = {};
    
    if (!nome.trim()) {
      newErrors.nome = true;
    }
    
    if (!sobrenome.trim()) {
      newErrors.sobrenome = true;
    }
    
    if (!email.trim()) {
      newErrors.email = true;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    handleRegister(nome, sobrenome, email, avatarId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent/>
      
      <View style={styles.backgroundContainer}>
        <Cloudsvg width="90%" height="40%" />
      </View>

      {avatarSource && <BigAvatar avatarSource={avatarSource} style={{ position: "absolute", zIndex: 2, top: getAvatarTop() }} />}
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Vamos criar sua conta!</Text>
        
        <View style={styles.inputsContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput 
            style={[
              styles.input,
              { borderColor: getBorderColor('nome', nomeFocused) },
              Platform.select({
                web: nomeFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
              })
            ]}
            placeholder="Digite seu nome" 
            value={nome} 
            onChangeText={(value) => updateField('nome', value)}
            cursorColor="#3B82F6"
            editable={!isLoading}
            onFocus={() => setNomeFocused(true)}
            onBlur={() => setNomeFocused(false)}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Sobrenome</Text>
          <TextInput 
            style={[
              styles.input,
              { borderColor: getBorderColor('sobrenome', sobrenomeFocused) },
              Platform.select({
                web: sobrenomeFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
              })
            ]}
            placeholder="Digite seu sobrenome" 
            value={sobrenome} 
            onChangeText={(value) => updateField('sobrenome', value)}
            cursorColor="#3B82F6"
            editable={!isLoading}
            onFocus={() => setSobrenomeFocused(true)}
            onBlur={() => setSobrenomeFocused(false)}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={[
              styles.input,
              { borderColor: getBorderColor('email', emailFocused) },
              Platform.select({
                web: emailFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
              })
            ]}
            placeholder="Digite seu email" 
            value={email} 
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            cursorColor="#3B82F6"
            editable={!isLoading}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Continuar"
            onPress={validateAndContinue}
            nextStep="/(register)/step2"
            /* isLoading={isLoading} */
          />
          <ProgressDots currentStep={1} />
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
    backgroundColor: "#56A6DC" 
  },
  backgroundContainer: { 
    ...StyleSheet.absoluteFillObject, 
    zIndex: 1, 
    alignItems: "center" 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    top: 10 
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
    zIndex: 3 
  },
  inputsContainer: { 
    flexDirection: "column", 
    width: "100%", 
    alignItems: "center", 
    height: "55%", 
    justifyContent: "space-evenly", 
    top: "5%" 
  },
  label: { 
    fontSize: 16, 
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 8, 
    width: "80%" 
  },
  input: { 
    width: "80%", 
    height: "20%", // Altura fixa em pixels
    borderWidth: 2, 
    borderRadius: 8, 
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F7F8F9",
    color: "#000000",
    marginBottom: 8
  },
  buttonContainer: { 
    zIndex: 3, 
    position: "absolute", 
    bottom: bottomHeight(), 
    justifyContent: "space-between", 
    height: "20%" 
  },
});

export default Step01;