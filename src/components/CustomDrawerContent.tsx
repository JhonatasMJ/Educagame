// CustomDrawerContent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Foundation from '@expo/vector-icons/Foundation';

export const CustomDrawerContent = (props: any) => {
  const router = useRouter();
  
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Recursos Adicionais</Text>
      </View>
      <DrawerItem
        label="Acionar Chamado"
        icon={({ color, size }) => (
            <MaterialIcons name="airplane-ticket" size={size} color={color} />
        )}
        onPress={() => {
         /*  router.push('/profile/edit'); */
        }}
      />
      <DrawerItem
        label="Exportar Resultados em PDF"
        icon={({ color, size }) => (
            <Foundation name="page-export-pdf" size={size} color={color} />
        )}
        onPress={() => {
          /* router.push('/settings'); */
        }}
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});