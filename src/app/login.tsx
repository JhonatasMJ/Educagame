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
  StyleSheet,
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateFormField = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateAndLogin = () => {
    const newErrors: Errors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "O e-mail é obrigatório";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "A senha é obrigatória";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    handleLogin(formData.email, formData.password);
  };

  const getBorderColor = (field: keyof Errors, isFocused: boolean) => {
    if (errors[field]) return '#FF0000';
    if (isFocused) return '#56A6DC';
    return '#E8ECF4';
  };

  const styles = StyleSheet.create({
    input: {
      width: '100%',
      height: 64,
      borderWidth: 2,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: '#F7F8F9',
      color: '#000000', // Garantindo que o texto seja preto em todas as plataformas
      outlineColor: '#56A6DC', // Para navegadores web
    },
    passwordInput: {
      paddingRight: 50, // Espaço para o ícone de olho
    },
    errorText: {
      color: '#FF0000',
      fontSize: 14,
      marginTop: 4,
    },
    eyeIconContainer: {
      position: 'absolute',
      right: 16,
      height: '100%',
      justifyContent: 'center',
    }
  });

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
          <View className="px-6 py-8 flex-1 justify-between">
            <View className="items-center mt-10">
              <Image 
                source={require('../../assets/images/logo.png')} 
                className="resizeMode-contain" 
              />
            </View>
            
            <View className="mt-5">
              <Text className="text-lg font-medium text-primary mb-1">Bem-vindo (a) 👋</Text>
              <Text className="text-3xl font-bold mb-4">Entre na sua conta</Text>
            </View>

            <View className="justify-center mt-2">
              <View className="mb-5">
                <Text className="text-base font-medium text-gray-700 mb-2">E-mail:</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: getBorderColor('email', emailFocused) },
                    Platform.select({
                      web: emailFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
                    })
                  ]}
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
                  placeholderTextColor="#999"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View className="mb-2">
                <Text className="text-base font-medium text-gray-700 mb-2">Senha:</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      { borderColor: getBorderColor('password', passwordFocused) },
                      Platform.select({
                        web: passwordFocused ? { outlineColor: '#56A6DC', outlineWidth: 2 } : {}
                      })
                    ]}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChangeText={(value: string) => updateFormField("password", value)}
                    secureTextEntry={!showPassword}
                    cursorColor="#3B82F6"
                    editable={!isLoading}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.eyeIconContainer}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome
                      name={showPassword ? "eye" : "eye-slash"}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View className="flex-row justify-between items-center mt-5 mb-6">
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

            <View className="mb-2">
              <TouchableOpacity
                className={`w-full py-4 bg-primary rounded-lg justify-center items-center mb-6 ${
                  isLoading ? 'opacity-70' : ''
                }`}
                onPress={validateAndLogin}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? "Carregando..." : "Entrar"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mb-8">
                <Text className="text-gray-600">Não tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.push("/(register)")}>
                  <Text className="text-primary font-medium underline">Criar conta</Text>
                </TouchableOpacity>
              </View>

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
                  <TouchableOpacity className="w-12 h-12 bg-red-500 rounded-full items-center justify-center">
                    <FontAwesome name="google" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity className="w-12 h-12 bg-pink-600 rounded-full items-center justify-center">
                    <FontAwesome name="instagram" size={24} color="#FFFFFF" />
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