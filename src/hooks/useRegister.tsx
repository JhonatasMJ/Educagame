import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/src/services/firebaseConfig';
import { getDatabase, ref, set } from 'firebase/database';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';


export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Usuário criado com sucesso:', user.uid);

      const db = getDatabase();
      const userRef = ref(db, 'users/' + user.uid);  
      await set(userRef, {
        username: name,
        email: email,
      });

      console.log('Dados do usuário salvos no Realtime Database');

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Sucesso',
        text2: 'Conta criada com sucesso!',
      });

   
      router.push('../screens/Home');
    } catch (error) {
      console.error('Erro ao criar conta:', error);

      let errorMessage = 'Ocorreu um erro ao criar sua conta. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso!';
      }

      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Erro',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister, isLoading };
};