import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trilha } from '../types/types';
import { MaterialIcons } from '@expo/vector-icons';


type TrilhaCardProps = {
  trilha: Trilha;
  onNext: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
};



const TrilhaCard = ({ trilha, onNext, onPrevious, isFirst = false, isLast = false }: TrilhaCardProps) => {


  return (
    <View style={styles.cardWrapper}>
      {!isFirst && onPrevious && (
        <TouchableOpacity onPress={onPrevious} style={styles.previousButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      )}
      
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.nome}>{trilha.nome}</Text>

        </View>
      </View>
      
      {!isLast && (
        <TouchableOpacity onPress={onNext} style={styles.nextButton}>
          <MaterialIcons name="arrow-forward" size={24} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: '12%',
    flexDirection: 'row',
  },
  cardContainer: {
    width: '50%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  nome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  nextButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: '10%',
  },
  previousButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: '10%',
  }
});

export default TrilhaCard;