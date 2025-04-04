import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

interface UseRequireAuthOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  showToast?: boolean;
}

export const useRequireAuth = ({
  requireAuth = true,
  redirectTo = '/login',
  showToast = true,
}: UseRequireAuthOptions = {}) => {
  const { userData, authUser, refreshUserData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!requireAuth) return;

      await refreshUserData();
      
      if (!userData || !authUser) {
        if (showToast) {
          Toast.show({
            type: 'error',
            text1: 'Erro de autenticação ⚠️',
            text2: 'Você não está autenticado. Redirecionando para a tela de login...',
            visibilityTime: 3000,
          });
        }
        
        setTimeout(() => {
          router.replace(redirectTo as any);
        }, showToast ? 3500 : 0);
      }
    };

    checkAuthentication();
  }, [requireAuth]);

  return {
    isAuthenticated: !!(userData && authUser),
    isLoading: loading,
    userData,
    authUser
  };
};
