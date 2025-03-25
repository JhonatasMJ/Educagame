import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Register for native Google authentication
WebBrowser.maybeCompleteAuthSession();

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const router = useRouter();
  const { refreshUserData } = useAuth();


 
/*   const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '192448973264-696og487kp5lovckl4lu0872sktcj8g7.apps.googleusercontent.com',
    redirectUri: Platform.select({
      web: 'https://auth.expo.io/@vittorpatricio/educagame',
      default: undefined
    })
  }); */



  // Handle Google Sign In response
/*   useEffect(() => {
    if (response?.type === 'success') {
      setGoogleLoading(true);
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);
 */
  // Load saved email when hook initializes
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('rememberedEmail');
        if (email) {
          setSavedEmail(email);
        }
      } catch (error) {
        console.error('Error loading saved email:', error);
      }
    };
    
    loadSavedEmail();
  }, []);

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
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
      // Save or remove email based on rememberMe checkbox
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email);
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
      }
      
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

  const handleGoogleLogin = async (idToken: string) => {
    try {
      // Create a Google credential with the token
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      
      // Update user data in context
      await refreshUserData();
      
      // Navigate to home
      router.push('../(tabs)/home');
      
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Sucesso',
        text2: 'Login com Google realizado!',
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Erro',
        text2: 'Falha ao fazer login com Google.',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error starting Google sign in:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Erro',
        text2: 'Não foi possível iniciar o login com Google.',
      });
      setGoogleLoading(false);
    }
  };

  return { handleLogin, signInWithGoogle, isLoading, googleLoading, savedEmail };
};