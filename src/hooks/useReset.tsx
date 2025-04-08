"use client"

import { useState } from "react"
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "../services/firebaseConfig"
import Toast from "react-native-toast-message"

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [codeVerified, setCodeVerified] = useState(false)

  // Step 1: Send password reset email
  const sendResetEmail = async (userEmail: string) => {
    if (!userEmail) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Por favor, informe seu email.",
      })
      return
    }

    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, userEmail)
      setEmail(userEmail)
      setEmailSent(true)
      Toast.show({
        type: "success",
        position: "top",
        text1: "Sucesso",
        text2: "Email de redefinição enviado. Verifique sua caixa de entrada.",
      })
    } catch (error: any) {
      console.error("Error sending password reset email:", error)
      let errorMessage = "Não foi possível enviar o email de redefinição."
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "Não existe uma conta com este email."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde."
      }
      
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify the reset code
  const verifyCode = async (code: string) => {
    if (!code || code.length < 5) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Código inválido.",
      })
      return false
    }

    setIsLoading(true)
    try {
      // This will throw an error if the code is invalid
      const email = await verifyPasswordResetCode(auth, code)
      setVerificationCode(code)
      setCodeVerified(true)
      return true
    } catch (error: any) {
      console.error("Error verifying code:", error)
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Código inválido ou expirado.",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset password with the code and new password
  const resetPassword = async (newPassword: string, confirmPassword: string) => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Por favor, preencha todos os campos.",
      })
      return false
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "As senhas não coincidem.",
      })
      return false
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "A senha deve ter pelo menos 6 caracteres.",
      })
      return false
    }

    if (!verificationCode) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Código de verificação inválido.",
      })
      return false
    }

    setIsLoading(true)
    try {
      await confirmPasswordReset(auth, verificationCode, newPassword)
      Toast.show({
        type: "success",
        position: "top",
        text1: "Sucesso",
        text2: "Senha redefinida com sucesso!",
      })
      return true
    } catch (error: any) {
      console.error("Error resetting password:", error)
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Não foi possível redefinir a senha. Tente novamente.",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Reset the state (useful when navigating away or starting over)
  const resetState = () => {
    setEmailSent(false)
    setVerificationCode("")
    setEmail("")
    setCodeVerified(false)
  }

  return {
    isLoading,
    emailSent,
    email,
    codeVerified,
    sendResetEmail,
    verifyCode,
    resetPassword,
    resetState,
    setVerificationCode,
  }
}
