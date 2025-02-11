import { Stack } from 'expo-router';
import PlatformWrapper from '@/PlataformWrapper';

export default function Layout() {
  return (
    <PlatformWrapper>
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </PlatformWrapper>
  );
}
