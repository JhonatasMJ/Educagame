import React, { useRef, useEffect } from "react";
import { TouchableOpacity, View, Text, Animated, Platform } from "react-native";  // Importando Platform
import { Plane } from "lucide-react-native";


interface BtnTrilhaProps {
  etapa: number;
  isConcluido: boolean;  
  onPress: () => void;
}

const BtnTrilha: React.FC<BtnTrilhaProps> = ({ etapa, isConcluido, onPress }) => {

  const planeScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {  // Verificação para rodar animação apenas em plataformas nativas
      Animated.loop(
        Animated.sequence([
          Animated.timing(planeScaleAnim, {
            toValue: 1.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(planeScaleAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);  // Apenas aplica animação se não for Web

  return (
    <Animated.View
      style={{
        transform: Platform.OS !== 'web' ? [{ scale: planeScaleAnim }] : [],  // Condição para aplicar animação
      }}
    >
      <TouchableOpacity
        className={`border-8 p-8 rounded-full mb-6 max-w-xs relative ${isConcluido ? 'bg-green-500 border-green-700' : 'bg-secondary border-secondary/50'}`} // Cor condicionada
        onPress={onPress}
      >
        <View className="flex-row items-center justify-between">
          <Plane color={isConcluido ? "#fff" : "#111"} size={38} />  {/* Ícone do avião */}
        
          <Text className={`text-xl font-bold absolute bottom-16 right-0 ${isConcluido ? 'bg-green-700 text-white ' : 'bg-red-500'} px-4 py-2 rounded-full`}>
            {etapa}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default BtnTrilha;
