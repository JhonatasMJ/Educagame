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
import { MOBILE_WIDTH } from '@/PlataformWrapper';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

const OpenTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const { userData, authUser } = useAuth()
  const router = useRouter();

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
        })
        .catch(error => {
          setLoading(false);
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Erro',
            text2: 'Ocorreu um erro ao abrir o chamado. Por favor, tente novamente. ' + error,
          });
        })
    }
  };

  const copyTicketNumber = async () => {
    await Clipboard.setStringAsync(ticketNumber);
    Toast.show({
      type: 'success',
      position: 'top',
      text1: '✨ Sucesso!',
      text2: 'Número do chamado copiado para a área de transferência',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header area */}
      <View style={{ padding: 20, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 20 }}>
          <TouchableOpacity onPress={() => router.back()}  style={{
                  backgroundColor: '#56A6DC',
                  width: 30,
                  height: 30,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }} >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000'}}>
            📝 Abrir Chamado
          </Text>
        </View>

        {/* Title Input */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ marginBottom: 8, color: '#666', fontWeight: '500' }}>
            Título do Chamado
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 10,
            paddingHorizontal: 15
          }}>
            <Ionicons name="document-text-outline" size={24} color="#56A6DC" />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 10,
                fontSize: 16,
                color: '#000'
              }}
              placeholder="Ex: Dúvidas ou Denuncias"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ marginBottom: 8, color: '#666', fontWeight: '500' }}>
            Descrição
          </Text>
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 10,
            paddingHorizontal: 15
          }}>
            <TextInput
              style={{
                paddingVertical: 12,
                paddingHorizontal: 10,
                fontSize: 16,
                color: '#000',
                height: 220,
                textAlignVertical: 'top'
              }}
              placeholder="Descreva seu motivo de abertura de chamado detalhadamente..."
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
            />
          </View>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 15,
            padding: 20,
            width: MOBILE_WIDTH * 0.85,
            alignItems: 'center'
          }}>
            <View style={{ alignItems: 'flex-end', width: '100%' }}>
              <TouchableOpacity onPress={() => {
                setShowConfirmation(false);
                setTitle('');
                setDescription('');
              }}
                style={{
                  backgroundColor: '#56A6DC',
                  width: 30,
                  height: 30,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
            <Text style={{
              fontSize: 22,
              fontWeight: 'bold',
              marginTop: 15,
              color: '#000',
              textAlign: 'center'
            }}>
              🎉 Chamado Aberto com Sucesso!
            </Text>

            <Text style={{
              marginTop: 20,
              fontSize: 16,
              color: '#666',
              textAlign: 'center'
            }}>
              Seu número de chamado é:
            </Text>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#56A6DC',
              marginTop: 10
            }}>
              #{ticketNumber}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: '#56A6DC',
                paddingVertical: 12,
                paddingHorizontal: 30,
                borderRadius: 8,
                marginTop: 20,
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={copyTicketNumber}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                Copiar Número
              </Text>
            </TouchableOpacity>

            <Text style={{
              marginTop: 15,
              fontSize: 14,
              color: '#666',
              textAlign: 'center'
            }}>
              ℹ️ Guarde este número para consultas futuras
            </Text>
          </View>
        </View>
      </Modal>

      {/* Bottom button */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: (title.trim() && description.trim()) ? '#56A6DC' : '#ccc',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={handleOpenTicket}
          disabled={!title.trim() || !description.trim() || loading}
        >
          {loading ? (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              ⏳ Abrindo chamado...
            </Text>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Abrir Chamado
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OpenTicket;