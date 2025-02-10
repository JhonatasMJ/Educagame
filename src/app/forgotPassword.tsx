import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  ActivityIndicator,
} from "react-native";


const ForgotPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Referências para os inputs do código
  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef());

  const startResendTimer = () => {
    setTimeLeft(30); // 30 segundos para poder reenviar
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    try {
      setIsLoading(true);
     

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setCodeSent(true);
      startResendTimer();
      Alert.alert(
        "Código enviado!",
        `Um código de verificação foi enviado para ${email}`
      );
    } catch (error) {
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao enviar o código. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      Alert.alert("Erro", "Por favor, digite o código completo");
      return;
    }

    try {
      setIsLoading(true);
    


      await new Promise((resolve) => setTimeout(resolve, 1500));


      navigation.replace("ResetPassword", { email, code });
    } catch (error) {
      Alert.alert("Erro", "Código inválido ou expirado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (text, index) => {

    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

 
    if (text && index < 5) {
      inputRefs[index + 1].current.focus();
    }

    if (!text && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -500}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Recuperar Senha</Text>

            <Text style={styles.emailText}>{email}</Text>

            <Text style={styles.description}>
              {!codeSent
                ? "Enviaremos um código de 6 dígitos para seu e-mail para confirmar sua identidade."
                : "Digite o código de 6 dígitos enviado para seu e-mail."}
            </Text>

            {codeSent ? (
              <View style={styles.codeContainer}>
                {verificationCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={inputRefs[index]}
                    style={styles.codeInput}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    editable={!isLoading}
                  />
                ))}
              </View>
            ) : null}

            {!codeSent ? (
              <TouchableOpacity
                style={[styles.sendButton, isLoading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={isLoading}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? "Enviando..." : "Enviar código"}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleVerifyCode}
                  disabled={isLoading}
                >
                  <Text style={styles.sendButtonText}>
                    {isLoading ? "Verificando..." : "Verificar código"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.resendButton,
                    (timeLeft > 0 || isLoading) && styles.buttonDisabled,
                  ]}
                  onPress={handleSendCode}
                  disabled={timeLeft > 0 || isLoading}
                >
                  <Text style={styles.resendButtonText}>
                    {timeLeft > 0
                      ? `Reenviar código em ${timeLeft}s`
                      : "Reenviar código"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
