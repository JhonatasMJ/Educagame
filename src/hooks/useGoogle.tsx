/* import { useState } from "react";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential, getAuth } from "firebase/auth";

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Verifica se os serviços do Google estão disponíveis
      await GoogleSignin.hasPlayServices();
      
      // Inicia o fluxo de login
      const userInfo = await GoogleSignin.signIn();

      // Obtém a credencial do Firebase usando o token do Google
      const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);

      // Realiza a autenticação no Firebase
      const auth = getAuth();
      await signInWithCredential(auth, googleCredential);

      console.log("Usuário autenticado com Google!");
    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setError("Login cancelado pelo usuário");
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError("Login já em andamento");
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError("Serviços do Google não disponíveis");
      } else {
        setError("Erro desconhecido ao autenticar com Google");
      }

      console.error("Erro ao autenticar com Google:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, isLoading, error };
};
 */