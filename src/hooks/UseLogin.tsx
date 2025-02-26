import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshUserData } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Erro',
        text2: 'Preencha todos os campos!',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Faz o login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Atualiza os dados do usuário no contexto
      await refreshUserData();

      // Navega para a home
      router.push('../(tabs)/home');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email' || error.code === 'auth/invalid-credential') {
        console.log(error);
        console.log(error.code);
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Erro',
          text2: 'Email ou senha inválidos!',
        });
      } else {
        console.log(error);
        console.log(error.code);
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Erro',
          text2: 'Email ou senha inválidos.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};