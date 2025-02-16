import { Stack } from 'expo-router';
import PlatformWrapper from '@/PlataformWrapper';
import { ConversationProvider } from '../context/ContextIa';
import { StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';

export default function Layout() {
  return (
    <ConversationProvider>
    
    <PlatformWrapper>
   
    <StatusBar barStyle="dark-content" backgroundColor="transparent" />
    <Stack screenOptions={{headerShown: false}}>
    <Stack.Screen name="login" options={{ headerShown: false }} />
    <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
   
    </PlatformWrapper>
    <Toast/>
  
    </ConversationProvider>
  );
}
