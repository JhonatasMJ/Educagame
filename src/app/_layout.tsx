import { Stack } from 'expo-router';
import PlatformWrapper from '@/PlataformWrapper';
import { ConversationProvider } from '../context/ContextIa';

export default function Layout() {
  return (
    <ConversationProvider>
    <PlatformWrapper>
    <Stack screenOptions={{headerShown: false}}>
    <Stack.Screen name="login" options={{ headerShown: false }} />
    <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </PlatformWrapper>
    </ConversationProvider>
  );
}
