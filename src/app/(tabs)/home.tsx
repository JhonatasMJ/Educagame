// Importação das bibliotecas necessárias
// Componentes básicos do React Native para construir a interface
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import React, { useRef, useState, useCallback } from 'react';
// Bibliotecas para lidar com gestos do usuário (como arrastar na tela)
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
// Biblioteca para criar animações suaves
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
// Dados das trilhas de aprendizado e componente personalizado
import { trilhas } from '../../dados';
import TrilhaCard from '@/src/components/TrilhaCard';
import { MOBILE_WIDTH } from '@/PlataformWrapper';

// Obtém a largura da tela do dispositivo
const {width} = Platform.OS === 'web' ? {width: MOBILE_WIDTH} : Dimensions.get('window');
// Define o limite de arrasto como 30% da largura da tela
const THRESHOLD_PERCENTAGE = 0.3; // 30%

const THRESHOLD = width * THRESHOLD_PERCENTAGE;

const Home = () => {
  // Estado para controlar qual trilha está sendo exibida atualmente
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0);
  // Valor compartilhado para controlar a animação de deslize horizontal
  const translateX = useSharedValue(0);
  
  // Função para atualizar o índice da trilha atual de forma segura
  const updateIndex = useCallback((newIndex: number) => {
    setTrilhaAtualIndex(newIndex);
  }, []);

  // Função para avançar para a próxima trilha
  const handleNextTrilha = () => {
    if (trilhaAtualIndex < trilhas.length - 1) {
      const newIndex = trilhaAtualIndex + 1;
      // Anima o deslize para a esquerda
      translateX.value = withTiming(-width * newIndex);
      // Atualiza o índice da trilha
      runOnJS(updateIndex)(newIndex);
    }
  };

  // Função para voltar para a trilha anterior
  const handlePreviousTrilha = () => {
    if (trilhaAtualIndex > 0) {
      const newIndex = trilhaAtualIndex - 1;
      // Anima o deslize para a direita
      translateX.value = withTiming(-width * newIndex);
      // Atualiza o índice da trilha
      runOnJS(updateIndex)(newIndex);
    }
  };

  // Configuração do gesto de arrastar (pan)
  const gesture = Gesture.Pan()
    // Atualiza a posição enquanto o usuário arrasta
    .onUpdate((e) => {
      const newValue = -width * trilhaAtualIndex + e.translationX;
      // Adiciona resistência quando tentar arrastar além dos limites
      if (
        (trilhaAtualIndex === 0 && newValue > 0) || 
        (trilhaAtualIndex === trilhas.length - 1 && newValue < -width * (trilhas.length - 1))
      ) {
        translateX.value = -width * trilhaAtualIndex + e.translationX / 3; // Resistência nos limites
      } else {
        translateX.value = newValue;
      }
    })
    // Lida com o fim do gesto de arrastar
    .onEnd((e) => {
      // Se o arrasto foi maior que o limite (THRESHOLD)
      if (Math.abs(e.translationX) > THRESHOLD) {
        // Arrasto para direita e não é a primeira trilha
        if (e.translationX > 0 && trilhaAtualIndex > 0) {
          translateX.value = withTiming(-width * (trilhaAtualIndex - 1));
          runOnJS(updateIndex)(trilhaAtualIndex - 1);
        } 
        // Arrasto para esquerda e não é a última trilha
        else if (e.translationX < 0 && trilhaAtualIndex < trilhas.length - 1) {
          translateX.value = withTiming(-width * (trilhaAtualIndex + 1));
          runOnJS(updateIndex)(trilhaAtualIndex + 1);
        } 
        // Volta para a posição original se não puder mudar de trilha
        else {
          translateX.value = withTiming(-width * trilhaAtualIndex);
        }
      } 
      // Se o arrasto foi menor que o limite, volta para a posição original
      else {
        translateX.value = withTiming(-width * trilhaAtualIndex);
      }
    });

  // Estilo animado para o container das trilhas
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      flexDirection: 'row',
      width: width * trilhas.length,
      height: '100%',
    };
  });

  // Interface do componente
  return (
    // Container principal que permite gestos
    <GestureHandlerRootView style={styles.container}>
      {/* Detector de gestos para controlar o deslize */}
      <GestureDetector gesture={gesture}> 
          {/* Container animado que move as trilhas horizontalmente */}
          <Animated.View style={animatedStyle}>
            {/* Mapeia todas as trilhas disponíveis */}
            {trilhas.map((trilha, index) => (
              <View key={trilha.id} style={styles.trilhaContainer}>
                {/* Lista rolável vertical para as etapas da trilha */}
                <ScrollView
                  style={styles.learningTrackContainer}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  <View>
                    {/* Mapeia todas as etapas da trilha atual */}
                    {trilha.etapas.map((etapa) => (
                      <TouchableOpacity 
                        key={etapa.id} 
                        style={styles.etapaContainer}
                      >
                        <Text style={styles.etapaTitulo}>{etapa.titulo}</Text>
                        <Text style={styles.etapaDescricao}>{etapa.descricao}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Cartão com informações da trilha e botões de navegação */}
                <TrilhaCard 
                  trilha={trilha} 
                  onNext={handleNextTrilha} 
                  onPrevious={handlePreviousTrilha}
                  isFirst={index === 0}
                  isLast={index === trilhas.length - 1}
                />
              </View>
            ))}
          </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

// Estilos do componente
const styles = StyleSheet.create({
  // Container principal que ocupa toda a tela
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  // Estilo do container da lista de etapas
  learningTrackContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Espaçamento adicional no final da lista para não sobrepor o card
  scrollContent: {
    paddingBottom: 100, // Espaço para o card do título
  },
  // Estilo do container de cada etapa
  etapaContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: '#000',
    borderWidth: 2,
  },

  // Estilo do container da trilha
  trilhaContainer: {
    width: width,
    height: '100%',
  },
  // Estilo do título da etapa
  etapaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  // Estilo da descrição da etapa
  etapaDescricao: {
    fontSize: 14,
    color: '#666',
  },
});

export default Home;