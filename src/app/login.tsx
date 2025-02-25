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
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLogin } from "../hooks/UseLogin";

interface Errors {
  email?: string;
  password?: string;
}

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const { handleLogin, isLoading } = useLogin();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [rememberMe, setRememberMe] = useState(false);
  // Estados para controlar o foco dos inputs
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const updateFormField = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Função para validar os campos antes de fazer login
  const validateAndLogin = () => {
    const newErrors: Errors = {};
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "O e-mail é obrigatório";
    }
    
    // Validar senha
    if (!formData.password.trim()) {
      newErrors.password = "A senha é obrigatória";
    }
    
    // Se houver erros, atualiza o estado e não prossegue
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Se não houver erros, continua com o login
    handleLogin(formData.email, formData.password);
  };

  // Função para determinar a cor da borda baseado no estado de foco e erro
  const getBorderColor = (field: keyof Errors, isFocused: boolean) => {
    if (errors[field]) return '#FF0000'; // Cor de erro (vermelho)
    if (isFocused) return '#56A6DC'; // Cor quando selecionado
    return '#E8ECF4'; // Cor normal
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1"
        >
          {/* Main Container with even padding */}
          <View className="px-6 py-8 flex-1 justify-between">
            {/* Top Section - Logo */}
            <View className="items-center mt-10">
              <Image 
                source={require('../../assets/images/logo.png')} 
                className="resizeMode-contain" 
              />
            </View>
            
            {/* Middle Section - Welcome Text */}
            <View className="mt-5">
              <Text className="text-lg font-medium text-primary mb-1">Bem-vindo (a) 👋</Text>
              <Text className="text-3xl font-bold mb-4">Entre na sua conta</Text>
            </View>

            {/* Form Inputs */}
            <View className="justify-center mt-2">
              <View className="mb-5">
                <Text className="text-base font-medium text-gray-700 mb-2">E-mail:</Text>
                <TextInput
                  style={{
                    width: '100%',
                    height: 64,
                    borderWidth: 2,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: '#F7F8F9',
                    borderColor: getBorderColor('email', emailFocused),
                  }}
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChangeText={(value: string) => updateFormField("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  cursorColor="#3B82F6"
                  editable={!isLoading}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
                {errors.email && <Text style={{ color: '#FF0000', fontSize: 14, marginTop: 4 }}>{errors.email}</Text>}
              </View>

              <View className="mb-2">
                <Text className="text-base font-medium text-gray-700 mb-2">Senha:</Text>
                <TextInput
                  style={{
                    width: '100%',
                    height: 64,
                    borderWidth: 2,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    backgroundColor: '#F7F8F9',
                    borderColor: getBorderColor('password', passwordFocused),
                  }}
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChangeText={(value: string) => updateFormField("password", value)}
                  secureTextEntry
                  cursorColor="#3B82F6"
                  editable={!isLoading}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                {errors.password && <Text style={{ color: '#FF0000', fontSize: 14, marginTop: 4 }}>{errors.password}</Text>}
              </View>
              
              {/* Remember Me and Forgot Password */}
              <View className="flex-row justify-between items-center mt-2 mb-6">
                <TouchableOpacity 
                  className="flex-row items-center" 
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Text className="text-sm text-primary">Lembrar conta</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="text-sm text-primary">Esqueci minha senha</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Section - Login Button and Alternatives */}
            <View className="mb-20">
              {/* Login Button */}
              <TouchableOpacity
                className={`w-full py-4 bg-primary rounded-lg justify-center items-center mb-6 ${
                  isLoading ? 'opacity-70' : ''
                }`}
                onPress={validateAndLogin} // Alterado para usar a nova função de validação
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? "Carregando..." : "Entrar"}
                </Text>
              </TouchableOpacity>

              {/* No Account Text */}
              <View className="flex-row justify-center mb-8">
                <Text className="text-gray-600">Não tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.push("/(register)")}>
                  <Text className="text-primary font-medium">Criar conta</Text>
                </TouchableOpacity>
              </View>

              {/* Social Login Options */}
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="px-4 text-gray-500">ou entre com</Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>
                
                <View className="flex-row justify-center gap-7">
                  <TouchableOpacity className="w-12 h-12 bg-blue-800 rounded-full items-center justify-center">
                    <FontAwesome name="facebook" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity className="w-12 h-12 bg-pink-600 rounded-full items-center justify-center">
                    <FontAwesome name="instagram" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity className="w-12 h-12 bg-red-500 rounded-full items-center justify-center">
                    <FontAwesome name="google" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;