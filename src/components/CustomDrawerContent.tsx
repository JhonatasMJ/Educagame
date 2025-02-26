import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Foundation from '@expo/vector-icons/Foundation';
import ModalComponent from './modalComponent';
import { MOBILE_WIDTH } from '@/PlataformWrapper';
import useDeviceType from '@/useDeviceType';
import AcionarChamado from './AcionarChamado';

export const CustomDrawerContent = (props: any) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { isDesktop } = useDeviceType();
  const windowWidth = Dimensions.get('window').width;
  
  // Calculate modal width based on platform and device type
  const getModalWidth = () => {
    if (Platform.OS === 'web' && isDesktop) {
      return Math.min(400, MOBILE_WIDTH * 0.9); // Slightly smaller than simulator width
    }
    return Math.min(windowWidth * 0.9, 400); // Max width of 400px on mobile
  };
  
  return (
    <View style={{ flex: 1 }}>
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
            setOpen(true);
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
        <DrawerItem
          label="Sair da Conta"
          icon={({ color, size }) => (
            <MaterialIcons name="logout" size={size} color={color} />
          )}
          onPress={() => {
            router.push('/login');
          }}
        />
      </DrawerContentScrollView>
      
      <ModalComponent 
        state={open} 
        setState={setOpen}
        styles={[
          styles.modal,
          Platform.OS === 'web' && isDesktop && styles.webModal
        ]}
      >
        <View 
          style={[
            styles.modalContent,
            {
              width: getModalWidth(),
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Acionar Chamado</Text>
            <TouchableOpacity 
              onPress={() => setOpen(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
           <AcionarChamado setOpen={setOpen}/>
          </View>
        </View>
      </ModalComponent>
    </View>
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
  modal: {
    margin: 0,
    flex: 1,
    justifyContent: 'center', // Centers vertically
    alignItems: 'center', // Centers horizontally
  },
  webModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fefefe',
    zIndex: 1000,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.84,
    elevation: 6,
    position: 'absolute',
    left: '50%', // Centers horizontally
    top: '50%', // Centers vertically
    ...Platform.select({
      web: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: [
          { translateX: -195 },
          { translateY: -200 },
        ],
      },
      default: {
        
        transform: [
          { translateX: -170 },
          { translateY: -180 },
        ],
      }
    }),
    minHeight: 300, // Altura fixa para formato quadrado
    maxHeight: 400, // Altura máxima
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#56A6DC',
    width: 30,
    height: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});