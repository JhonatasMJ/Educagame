import React, { useState } from "react";
import { router } from "expo-router";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { showCustomNotification } from "../services/firebaseFCM";

import { FontAwesome } from "@expo/vector-icons";
import { useLogin } from "../hooks/UseLogin";
import Logo from "../../assets/images/logo.svg"; 

interface Errors {
  email?: string;
  password?: string;
}

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const { handleLogin, isLoading } = useLogin(); // Hook para login com email/senha
 

  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});

  const updateFormField = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-between">
      <KeyboardAvoidingView className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} className="flex-1">
          <View className="p-5 flex-1 justify-center">
           <View className="mb-6">
              <Logo />

           </View>
            <View>
              <Text className="text-xl font-semibold mb-2 text-primary">Bem-vindo (a) 👋</Text>
              <Text className="text-4xl font-bold mb-4">Entre na sua conta</Text>
            </View>

            <View>
              <View>
                <Text className="text-lg font-medium text-gray-800 mb-2">E-mail:</Text>
                <TextInput
                  className={`w-full border-2 rounded-lg px-4 py-4 text-lg bg-gray-100 ${errors.email ? 'border-red-500' : 'border-primary'}`}
                  placeholder="E-mail"
                  value={formData.email}
                  onChangeText={(value: string) => updateFormField("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  cursorColor="blue"
                  editable={!isLoading}
                />
                {errors.email && <Text className="text-red-500 text-sm mt-1 ml-1">{errors.email}</Text>}
              </View>

              <View className="mb-5 mt-2">
                <Text className="text-lg font-medium text-gray-800 mb-2">Senha:</Text>
                <TextInput
                  className={`w-full border-2 rounded-lg px-4 py-4 text-lg bg-gray-100 ${errors.password ? 'border-red-500' : 'border-primary'}`}
                  placeholder="Senha"
                  value={formData.password}
                  onChangeText={(value: string) => updateFormField("password", value)}
                  secureTextEntry
                  cursorColor="blue"
                  editable={!isLoading}
                />
                {errors.password && <Text className="text-red-500 text-sm mt-1 ml-1">{errors.password}</Text>}
              </View>
            </View>

            <View className="h-1/3 w-full justify-between items-center">
              <TouchableOpacity
                className={`w-full py-5 bg-primary rounded-lg justify-center items-center mt-8 ${isLoading ? 'bg-primary' : ''}`}
                onPress={() => handleLogin(formData.email, formData.password)}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? "Carregando..." : "Entrar"}
                </Text>
              </TouchableOpacity>
{/*               <TouchableOpacity
                className={`w-full py-5 bg-primary rounded-lg justify-center items-center mt-8 `}
                onPress={() => showCustomNotification({
                  username: 'Carlos',
                  message: 'Esta é uma notificação de teste!',
                })}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-semibold">
                  Notificação
                </Text>
              </TouchableOpacity>
 */}
              <View className="flex-row gap-24 mt-4">
                <TouchableOpacity
                  className="bg-primary p-2 rounded-lg"
            
                >
                  <FontAwesome size={32} name="google" color={"#fff"} />
                </TouchableOpacity>
              </View>

              {/* {googleError && <Text className="text-red-500 mt-2">{googleError}</Text>} */}

              <TouchableOpacity onPress={() => router.push("/(register)")} >
                <View className="flex-row gap-2">
                  <Text className="text-primary">Não tem uma conta?</Text>
                  <Text className="text-primary underline">Cadastre-se</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
