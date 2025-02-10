import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Trilha } from '../types/types';

type TrilhaCardProps = {
  trilha: Trilha;
  onNext: () => void;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
};

const TrilhaCard = ({ trilha, onNext, fadeAnim, slideAnim }: TrilhaCardProps) => {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.cardContainer}>
        <Animated.View 
          style={[
            styles.card,
            { 
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }] 
            }
          ]}
        >
          <Text style={styles.nome}>{trilha.nome}</Text>
        </Animated.View>
        <TouchableOpacity onPress={onNext} style={styles.nextButton}>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  cardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingBottom: 60, // Espaço para o tab navigator
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#4A90E2', // Cor azul para o card
  },
  card: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center', // Centraliza o texto
  },
  nome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff', // Texto branco para contrastar
    textAlign: 'center', // Garante que o texto fique centralizado
  },
  nextButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#fff', // Seta branca para contrastar
  }
});

export default TrilhaCard;