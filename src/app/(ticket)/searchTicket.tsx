import React, { useState } from 'react';
import { Text, View, Modal, SafeAreaView, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOBILE_WIDTH } from '@/PlataformWrapper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import Toast from 'react-native-toast-message';
import ConversationField from "../../components/ConversationField";


const SearchTicket = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState('');
  const [status, setStatsus] = useState('');
  const [hour, setHour] = useState('');
  const [ready, setReady] = useState(false);
  
  const router = useRouter();
  const { userData, authUser } = useAuth();

  const handleSearch = async () => {
    if (!ticketNumber.trim()) return;
    
    setLoading(true);
    const ticketLastDigits = ticketNumber.slice(-2);
  
    try {
      const response = await fetch(`https://workflow.educagame.com.br/webhook/consulta?ticketLastDigits=${ticketLastDigits}&userData=${userData}&authUser=${authUser}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data || !data.dia || !data.status || !data.hora) {
        throw new Error('Dados inválidos recebidos do servidor');
      }
  
      setDay(data.dia);
      setStatsus(data.status);
      setHour(data.hora);
      setShowFeedback(true);
  
    } catch (error) {
      let errorMessage = 'Por favor, tente novamente mais tarde.';
  
      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error instanceof Error && error.message.includes('HTTP error')) {
        errorMessage = 'Número de chamado não encontrado.';
      } else if (error instanceof Error && error.message.includes('Dados inválidos')) {
        errorMessage = 'Resposta inválida do servidor.';
      }
  
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar chamado',
        text2: errorMessage
      });
      
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleStop = ( ) => {
    setTicketNumber('');
    setReady(false);
  }

  const handleStart = () => {
    setShowFeedback(false);
    setReady(true);
  }

  const handleSendMessage = (message: string) => {
    // Lógica para enviar a mensagem para o atendente
  console.log('Mensagem enviada:', message);    
  }



  const renderHeader = () => (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={24} color="#56A6DC" />
          <TextInput
            style={styles.input}
            placeholder="Digite o número do chamado"
            value={ticketNumber}
            onChangeText={setTicketNumber}
            keyboardType="numeric"
          />
          {ticketNumber.length > 0 && (
            <TouchableOpacity onPress={handleStop}>
              <Ionicons name="close-circle" size={24} color="#56A6DC" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderFeedbackModal = () => (
    <Modal
      visible={showFeedback}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => setShowFeedback(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={{ alignItems: 'flex-end', width: '100%' }}>
            <TouchableOpacity onPress={() => setShowFeedback(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <Ionicons name="document-text-outline" size={50} color="#56A6DC" />
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 15, color: '#000' }}>
            Chamado #{ticketNumber}
          </Text>
          <Text style={{ marginTop: 10, textAlign: 'center', color: '#666' }}>
            Status: {status}{'\n'}
            Última atualização: {day} às {hour}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Conversar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={() => setShowFeedback(false)}>
              <Text style={{ color: '#56A6DC', fontWeight: '600' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFeedbackModal()}

       {ready && <ScrollView>

        </ScrollView>}
      
  <View style={styles.bottomButton}> 
        {ready ? (
  <ConversationField 
    onSendMessage={handleSendMessage} 
    placeholder='Digite sua mensagem'
    color='#56A6DC' 
  />
) : (
    <TouchableOpacity
      style={[styles.primaryButton, { backgroundColor: ticketNumber.trim() ? '#56A6DC' : '#ccc' }]}
      onPress={handleSearch}
      disabled={!ticketNumber.trim() || loading}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
        {loading ? 'Buscando...' : 'Buscar Chamado'}
      </Text>
    </TouchableOpacity>

)}
</View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  backButton: {
    backgroundColor: '#56A6DC',
    width: 30,
    height: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBar: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: MOBILE_WIDTH * 0.85,
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#56A6DC',
    paddingVertical: 12,
    alignItems: 'center',
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20
  },
  outlineButton: {
    borderColor: '#56A6DC',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20
  }
});


export default SearchTicket;
