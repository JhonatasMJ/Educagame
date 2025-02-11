import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
 import ImagemAdaptativa from "../components/ImagemAdaptativa"; 


interface Errors {
  email?: string;
  password?: string;
}

// Definindo a interface de dados do formulário
interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  // Tipando o estado de formData
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  // Tipando o estado de erros
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Função de validação do e-mail com tipagem explícita
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.email) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função de login
  const handleLogin = async () => {
    try {
      if (validateForm()) {
        setIsLoading(true);
        console.log("Dados do login:", formData);
        router.push("../(tabs)/home");

      
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar os campos do formulário
  const updateFormField = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Função de recuperação de senha
  const handleForgotPassword = () => {
    if (!formData.email) {
      setErrors((prev) => ({
        ...prev,
        email: "Digite seu e-mail para recuperar a senha",
      }));
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Digite um e-mail válido",
      }));
      return;
    }
   /*  navigation.navigate("ForgotPasswordScreen", { email: formData.email }); */
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
     
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          className="flex-1"
        >
          <View className="p-5 flex-1 justify-center mt-28">
          <ImagemAdaptativa nome="logo"  estilo={{ width: '80%', height: '30%' }} />

            <View>
              <Text className="text-xl font-semibold mb-2 text-primary" >Bem-vindo (a) 👋</Text>
              <Text className="text-4xl font-bold mb-4">Entre na sua conta</Text>
            </View>
            <View>
              <View>
                <Text className="text-lg font-medium text-gray-800 mb-2">E-mail:</Text>
                <TextInput
                  className={` w-full border-2 rounded-lg p-4 text-lg bg-secondary ${errors.email ? 'border-red-500' : 'border-primary'}`}
                  placeholder="E-mail"
                  value={formData.email}
                  onChangeText={(value: string) => updateFormField("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  cursorColor="blue"
                  editable={!isLoading}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">{errors.email}</Text>
                )}
              </View>

              <View className="mt-6">
                <Text className="text-lg font-medium text-gray-800 mb-2">Senha:</Text>
                <TextInput
                  className={`w-full border-2 rounded-lg p-4 text-lg bg-secondary ${errors.password ? 'border-red-500' : 'border-primary'}`}
                  placeholder="Senha"
                  value={formData.password}
                  onChangeText={(value: string) => updateFormField("password", value)}
                  secureTextEntry
                  cursorColor="blue"
                  editable={!isLoading}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">{errors.password}</Text>
                )}
                     <Text className="text-primary underline text-sm text-right font-bold mt-2">
                  Esqueci minha senha
                </Text>
              </View>
            </View>

            <View className="h-1/3 w-full justify-between items-center">
              <TouchableOpacity
                className={`w-full h-14 bg-primary rounded-lg justify-center items-center mt-8 ${isLoading ? 'bg-primary' : ''}`}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? "Carregando..." : "Entrar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-3 py-2"
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
           
              </TouchableOpacity>

              <TouchableOpacity
                className="py-2"
             /*    onPress={() => navigation.navigate("Step")} */
                disabled={isLoading}
              >
                <Text className="text-primary font-bold text-sm text-center">
                  Não tem uma conta? Cadastre-se
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default  Login;
