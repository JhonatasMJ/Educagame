import React, { useState } from 'react';
import { Text, View, Modal, SafeAreaView, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOBILE_WIDTH } from '@/PlataformWrapper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import Toast from 'react-native-toast-message';
import ConversationField from '@/src/components/ConversationField';
import { styles } from './styles';
import MessageBubble from '@/src/components/MessageBuble';
import RealoadButton from '@/src/components/RealoadButton';


interface Message {
  type: 'user' | 'contact';
  date: string;
  time: string;
  content: string;
}


const SearchTicket = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState('');
  const [status, setStatsus] = useState('');
  const [hour, setHour] = useState('');
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const router = useRouter();
  const { userData, authUser } = useAuth();

  const handleSearch = async () => {
    if (!ticketNumber.trim()) return;
    setRefresh(true);
    setLoading(true);
    // Remove the date pattern (DDMMYYYY) and keep the remaining digits
    const ticketLastDigits = ticketNumber.slice(8); // This will get everything after position 8


    try {
      const response = await fetch('https://workflow.educagame.com.br/webhook/consulta-chamado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketNumber,
          ticketLastDigits,
          userData,
          authUser,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data.mensagens);

      if (!data || !data.dia || !data.status || !data.hora) {
        throw new Error('Dados inválidos recebidos do servidor');
      }
      console.log(data);

      setDay(data.dia);
      setStatsus(data.status);
      setHour(data.hora);
      if(ready){
        setShowFeedback(false);
      } else{
        setShowFeedback(true);
      }

    } catch (error) {
      let errorMessage = 'Por favor, tente novamente mais tarde.';

      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error instanceof Error && error.message.includes('HTTP error')) {
        errorMessage = 'Número de chamado não encontrado.';
      } else if (error instanceof Error && error.message.includes('Dados inválidos')) {
        errorMessage = 'Número de chamado não encontrado.';
      }

      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Erro ao buscar chamado',
        text2: errorMessage
      });

      console.error('Error details:', error);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };


  const handleStop = () => {
    setSendingMessage(false);
    setTicketNumber('');
    setReady(false);
  }

  const handleStart = () => {
    setShowFeedback(false);
    setReady(true);
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() && ready) return;
    setSendingMessage(true);
    handleSearch();
    const ticketLastDigits = ticketNumber.slice(8); // This will get everything after position 8
    try {
      const response = await fetch('https://workflow.educagame.com.br/webhook/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          ticketLastDigits
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSendingMessage(false);

    } catch (error) {

      let errorMessage = 'Por favor, tente novamente mais tarde.';

      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error instanceof Error && error.message.includes('HTTP error')) {
        errorMessage = 'Numero de chamado nao encontrado.';
      } else if (error instanceof Error && error.message.includes('Dados inválidos')) {
        errorMessage = 'Resposta inválida do servidor.';
      }

      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Erro ao buscar chamado',
        text2: errorMessage
      });
      setSendingMessage(false);

      console.error('Error details:', error);
    }

  }



  const renderHeader = () => (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/stats")} style={styles.backButton}>
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
      <KeyboardAvoidingView
        style={{ flex: 1}}
        behavior="padding"
        enabled
      >
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFeedbackModal()}

      {ready && (
        <View style={{position: 'absolute', right: 35, bottom: 95, zIndex: 999}}>
          <RealoadButton onPress={handleSearch} />
        </View>
      )}
      {ready && (
        <ScrollView style={{ flex: 1, padding: 15, 
          paddingTop: 15, 
          paddingBottom: 90, }}>
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              text={message.content}
              type={message.type}
              timestamp={`${message.date} ${message.time}`}
            />
          ))}
        </ScrollView>
      )}
      <View style={styles.bottomButton}>
        {ready ? (
          <ConversationField
            onSendMessage={handleSendMessage}
            placeholder={
              refresh 
                ? 'Carregando mensagens...' 
                : sendingMessage 
                  ? 'Enviando mensagem...' 
                  : 'Digite sua Mensagem'
            }
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
        </KeyboardAvoidingView>
  );
};
export default SearchTicket;
