import React, { useState } from 'react';
import {
  Text,
  View,
  Modal,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'expo-router';
import { styles } from './styles';
import { useRequireAuth } from '@/src/hooks/useRequireAuth';

const OpenTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const { userData, authUser } = useAuth()
  const router = useRouter();

  
    const { isAuthenticated, isLoading } = useRequireAuth({ requireAuth: false });
  
  const handleOpenTicket = () => {
    if (title.trim() && description.trim()) {
      setLoading(true);
      // Simulando abertura do chamado
      fetch('https://workflow.educagame.com.br/webhook/open-chamado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          userData,
          authUser,
        }),
      }

      ).then(response => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error(response.status.toString());
        }
      })
        .then(data => {
          const ticketData = JSON.parse(data);
          setShowConfirmation(true);
          setLoading(false);
          setTicketNumber(ticketData.return);
        })
        .catch(error => {
          setLoading(false);
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Erro',
            text2: 'Ocorreu um erro ao abrir o chamado. Por favor, tente novamente. ' + error.message,
          });
        });
    }
  };

  const copyTicketNumber = async () => {
    await Clipboard.setStringAsync(ticketNumber);
    Toast.show({
      type: 'success',
      position: 'top',
      text1: '✨ Sucesso!',
      text2: 'Número do chamado copiado para a área de transferência',
      visibilityTime: 1500,
    });
  };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerArea}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() =>  router.push("/(tabs)/perfil")} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>📝 Abrir Chamado</Text>
          </View>
  
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Título do Chamado</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="document-text-outline" size={24} color="#56A6DC" />
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Dúvidas ou Denuncias"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>
  
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descrição</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Descreva seu motivo de abertura de chamado detalhadamente..."
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
              />
            </View>
          </View>
        </View>
  
        <Modal
          visible={showConfirmation}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => setShowConfirmation(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ alignItems: 'flex-end', width: '100%' }}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowConfirmation(false);
                    setTitle('');
                    setDescription('');
                  }}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
  
              <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
              <Text style={styles.modalTitle}>🎉 Chamado Aberto com Sucesso!</Text>
  
              <Text style={styles.ticketNumberLabel}>Seu número de chamado é:</Text>
              <Text style={styles.ticketNumber}>#{ticketNumber}</Text>
  
              <TouchableOpacity style={styles.copyButton} onPress={copyTicketNumber}>
                <Ionicons name="copy-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.copyButtonText}>Copiar Número</Text>
              </TouchableOpacity>
  
              <Text style={styles.infoText}>ℹ️ Guarde este número para consultas futuras</Text>
            </View>
          </View>
        </Modal>
  
        <View style={styles.bottomButton}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: (title.trim() && description.trim()) ? '#56A6DC' : '#ccc' }
            ]}
            onPress={handleOpenTicket}
            disabled={!title.trim() || !description.trim() || loading}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>⏳ Abrindo chamado...</Text>
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Abrir Chamado</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
};

export default OpenTicket;