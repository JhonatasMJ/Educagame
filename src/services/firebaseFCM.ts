import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configura o handler para exibir a notificação conforme desejado
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Função para solicitar permissão de notificações e obter o token push (se necessário)
export async function registerForPushNotificationsAsync() {
  let token;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return console.log('Falha ao obter permissão para notificações push!');
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
    console.log('Token de notificação:', token);
  } catch (error) {
    console.log('Erro ao registrar para notificações:', error);
  }

  // Configura canal de notificação para Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}

// Função que dispara uma notificação local customizada
export async function showCustomNotification(data: { username: string; message: string }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Olá, ${data.username}!`,
      body: data.message,
      data: data,
      sound: 'notification.wav'  // Especifica o som a ser usado
    },
    trigger: null,
  });
}

// Listener para notificações em primeiro plano (opcional)
Notifications.addNotificationReceivedListener(notification => {
  console.log('Notificação recebida:', notification);
});
