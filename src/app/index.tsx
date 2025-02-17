import React from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { Ionicons, MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import '../styles/global.css';

export default function Index() {
  // Carrega as fontes necessárias para os ícones do Ionicons
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FontAwesome.font,
    ...AntDesign.font
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return <Redirect href="/login" />;
}
