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
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Falha ao obter permissão para notificações push!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Token de notificação:', token);
  } else {
    alert('É necessário um dispositivo físico para notificações push');
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
      title: `Olá, ${data.username}!`, // Exemplo de variável personalizada
      body: data.message,
      data: data, // Dados extras, se necessário
    },
    trigger: null, // Dispara imediatamente
  });
}

// Listener para notificações em primeiro plano (opcional)
Notifications.addNotificationReceivedListener(notification => {
  console.log('Notificação recebida:', notification);
});
