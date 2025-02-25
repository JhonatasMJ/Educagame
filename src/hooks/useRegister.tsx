import { useState } from "react";
import { auth } from "@/src/services/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (nome: string, sobrenome: string, email: string, avatarId: string) => {
    if (!nome || !sobrenome || !email) {
      Toast.show({ type: "error", text1: "Erro", text2: "Preencha todos os campos!" });
      return;
    }

    setIsLoading(true);

    try {
      // Navigate to step2 with user data
      router.push({
        pathname: "/(register)/step2",
        params: { nome, sobrenome, email, avatarId }
      });
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Erro", text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister, isLoading };
};