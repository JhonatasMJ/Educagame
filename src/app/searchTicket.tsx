import React, { useState } from 'react';
import { Text, View, Modal, SafeAreaView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchTicket = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (ticketNumber.trim()) {
      setLoading(true);
      // Simulando uma busca
      setTimeout(() => {
        setShowFeedback(true);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header search area */}
      <View style={{ padding: 20, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 15 }}>
          <Ionicons name="search-outline" size={24} color="#56A6DC" />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 16, color: '#000' }}
            placeholder="Digite o número do chamado"
            value={ticketNumber}
            onChangeText={setTicketNumber}
            keyboardType="numeric"
          />
          {ticketNumber.length > 0 && (
            <TouchableOpacity onPress={() => setTicketNumber('')}>
              <Ionicons name="close-circle" size={24} color="#56A6DC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedback}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFeedback(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 15, padding: 20, width: '85%', alignItems: 'center' }}>
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
              Status: Em andamento{'\n'}
              Última atualização: Hoje às 14:30
            </Text>
            
            <TouchableOpacity 
              style={{ 
                backgroundColor: '#56A6DC',
                paddingVertical: 12,
                paddingHorizontal: 30,
                borderRadius: 8,
                marginTop: 20
              }}
              onPress={() => setShowFeedback(false)}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom button */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: ticketNumber.trim() ? '#56A6DC' : '#ccc',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
          }}
          onPress={handleSearch}
          disabled={!ticketNumber.trim() || loading}
        >
          {loading ? (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Buscando...</Text>
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Buscar Chamado</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SearchTicket;