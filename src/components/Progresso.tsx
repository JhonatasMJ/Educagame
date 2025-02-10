import React from "react";
import { View } from "react-native";

interface ProgressoProps { 	
    totalSteps: number;
    currentStep: number; 

}

const Progresso = ({ totalSteps, currentStep }: ProgressoProps) => {
  return (
    <View >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
         
        />
      ))}
    </View>
  );
};



export default Progresso;
