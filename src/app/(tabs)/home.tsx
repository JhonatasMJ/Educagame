import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import React, { useRef, useState } from 'react';
import { trilhas } from '../../dados';
import TrilhaCard from '../../components/TrilhaCard';

const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNextTrilha = () => {
    // Animação de saída (fade out + slide para esquerda)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Atualiza o índice e reseta os valores
      setTrilhaAtualIndex(prev => 
        prev < trilhas.length - 1 ? prev + 1 : 0
      );
      
      // Prepara para entrada (inicia da direita)
      slideAnim.setValue(50);
      fadeAnim.setValue(0);

      // Animação de entrada (fade in + slide da direita)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.learningTrackContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }] 
          }}
        >
          {trilhas[trilhaAtualIndex].etapas.map((etapa) => (
            <TouchableOpacity 
              key={etapa.id} 
              style={styles.etapaContainer}
            >
              <Text style={styles.etapaTitulo}>{etapa.titulo}</Text>
              <Text style={styles.etapaDescricao}>{etapa.descricao}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <TrilhaCard 
        trilha={trilhas[trilhaAtualIndex]}
        onNext={handleNextTrilha}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  learningTrackContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  etapaContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: '#000',
    borderWidth: 2,
  },
  etapaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  etapaDescricao: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacing: {
    height: 100,
  }
});

export default Home;