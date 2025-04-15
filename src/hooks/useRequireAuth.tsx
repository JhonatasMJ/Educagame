"use client"

import { useEffect, useRef } from 'react';
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
 const hasNavigated = useRef(false);

 useEffect(() => {
   const checkAuthentication = async () => {
     if (!requireAuth) return;
     
     if (loading) return; // Wait until loading is complete

     if (!userData || !authUser) {
       if (!hasNavigated.current) {
         hasNavigated.current = true;
         
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
     } else {
       hasNavigated.current = false;
     }
   };

   checkAuthentication();
 }, [requireAuth, userData, authUser, loading]);

 return {
   isAuthenticated: !!(userData && authUser),
   isLoading: loading,
   userData,
   authUser
 };
};
