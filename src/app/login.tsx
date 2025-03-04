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
  StatusBar,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLogin } from "../hooks/UseLogin";
import Checkbox from "../components/Checkbox";
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

  return (
    <SafeAreaView style={styles.container}>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        
        <ScrollView 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollViewContent}
          
        >
          <View style={styles.mainContainer}>
            <View style={styles.logoContainer}>
            <View style={{ alignItems: "center" }}>
                <Logo style={{ width: 315, height: 65 }} />
            </View>
            </View>
            
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Bem-vindo (a) 👋</Text>
              <Text style={styles.headerText}>Entre na sua conta</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>E-mail:</Text>
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

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha:</Text>
                <View style={styles.passwordContainer}>
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

              <View style={styles.rememberForgotContainer}>

                  <Checkbox title="Lembrar conta" isChecked={rememberMe} onCheck={setRememberMe} colorText="#3B82F6" />

                <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
                  <Text style={styles.linkText}>Esqueci minha senha</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={validateAndLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Carregando..." : "Entrar"}
                </Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.grayText}>Não tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.push("/(register)")}>
                  <Text style={styles.signupText}>Criar conta</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.socialContainer}>
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>ou entre com</Text>
                  <View style={styles.divider} />
                </View>
                
                <View style={styles.socialButtonsContainer}>
                  <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
                    <FontAwesome name="facebook" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
                    <FontAwesome name="google" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.socialButton, styles.instagramButton]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  mainContainer: {
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: 'space-evenly',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  logo: {
    resizeMode: 'contain',
  },
  welcomeContainer: {
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3B82F6',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    justifyContent: 'center',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 64,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F7F8F9',
    color: '#000000',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 4,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: "10%",
    width: '80%',
  },
  linkText: {
    fontSize: 14,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  actionContainer: {
    marginBottom: 8,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  grayText: {
    color: '#6B7280',
  },
  signupText: {
    color: '#3B82F6',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  socialContainer: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#6B7280',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookButton: {
    backgroundColor: '#1e40af',
  },
  googleButton: {
    backgroundColor: '#ef4444',
  },
  instagramButton: {
    backgroundColor: '#db2777',
  },
});

export default Login;