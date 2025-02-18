import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps?: number;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ currentStep, totalSteps = 5 }) => {
  return (
    <View className="flex flex-row justify-center items-center space-x-4 mt-4 ">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentStep ? '#56A6DC' : '#D1D5DB'
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 20,  // tamanho em pixels
    height: 20, // tamanho em pixels
    borderRadius: 10, // metade do width/height para manter circular
    marginHorizontal: 5,
    
  },
});

export default ProgressDots;