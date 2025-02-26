import { Stack } from 'expo-router';
import PlatformWrapper from '@/PlataformWrapper';
import { ConversationProvider } from '../context/ContextIa';
import { StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { registerForPushNotificationsAsync } from '../services/firebaseFCM';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';

export default function Layout() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <ConversationProvider>
    <AuthProvider>
    <PlatformWrapper>
   
    <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
    <Stack screenOptions={{headerShown: false}}>
    <Stack.Screen name="login" options={{ headerShown: false }} />
    <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
   
    </PlatformWrapper>
    <Toast/>
    </AuthProvider>
    </ConversationProvider>
  );
}