import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
  screenOptions={{
    tabBarActiveTintColor: '#EAAE00',
    headerShown: false,
    tabBarShowLabel: false, // Remove os textos
    tabBarStyle: {
      paddingHorizontal: '5%',
      borderTopRightRadius: 15,
      borderTopLeftRadius: 15,
      borderWidth: 5,
      borderColor: '#606060',
      backgroundColor: '#606060',
      height: 86,
      overflow: 'hidden',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      elevation: 4,
      flexDirection: 'row',
      justifyContent: 'space-evenly', // Centraliza os itens na TabBar
      alignItems: 'center',
    },
  }}
>

  
        <StatusBar barStyle="light-content" backgroundColor="#fff" />
      <Tabs.Screen
        name="home"
        options={{
         title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="target" size={32} color={color} />,
        }}
      />

<Tabs.Screen
        name="profile"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => <FontAwesome size={32} name="gear" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color }) => <FontAwesome size={32} name="star" color={color} />,
        }}
      />
            <Tabs.Screen
        name="ia"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <FontAwesome size={32} name="star" color={color} />,
        }}
      />
    </Tabs>

  );
}
