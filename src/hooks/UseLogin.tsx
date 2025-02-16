import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      await signInWithEmailAndPassword(auth, email, password);

      router.push('../(tabs)/home');
    } catch (error: any) {
    
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Erro',
          text2: 'Email ou senha inválidos!',
        });
      } else {
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