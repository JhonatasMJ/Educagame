import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#EAAE00',
        headerShown: false,
        tabBarShowLabel: false, // Remove os textos
        /* tabBarHideOnKeyboard: true,  *///faz a tab ficar escondida quando o teclado aparecer
        tabBarStyle: {
          paddingHorizontal: '5%',
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
          borderWidth: 5,
          borderColor: '#606060',
          backgroundColor: '#606060',
          height: 72,
          overflow: 'hidden',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 4,
          flexDirection: 'row',
          gap: 30,
          justifyContent: 'center',
          alignItems: 'center',
          
    ...Platform.select({
      web: {
        paddingBottom: 0,
      },
      default: {
        paddingBottom: 29.5,
      }
    }),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="target" size={32} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome size={32} name="user" color={color} />,
        }}
      />

      <Tabs.Screen
        name="ranking"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color }) => <FontAwesome size={32} name="gear" color={color} />,
        }}
      />

      <Tabs.Screen
        name="Ia"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-sharp" size={32} color={color} />,
        }}
      />

    </Tabs>

  );
}
