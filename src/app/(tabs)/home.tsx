import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Animated } from "react-native";
import { ChevronLeft, ChevronRight, Plane } from "lucide-react-native"; 
import { trilhas } from "../../dados";


const { width, height } = Dimensions.get("window");

const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0); 
  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0); 

  // Variáveis de animação
  const translateY = new Animated.Value(0); 

  const handleNextTrilha = () => {
    if (trilhaAtualIndex < trilhas.length - 1) {
      setTrilhaAtualIndex(trilhaAtualIndex + 1);
      setEtapaAtualIndex(0); 
    }
  };

  const handlePreviousTrilha = () => {
    if (trilhaAtualIndex > 0) {
      setTrilhaAtualIndex(trilhaAtualIndex - 1);
      setEtapaAtualIndex(0); 
    }
  };

  const handleNextEtapa = () => {
    if (etapaAtualIndex < trilhas[trilhaAtualIndex].etapas.length - 1) {
      setEtapaAtualIndex(etapaAtualIndex + 1);
    }
  };

  const handlePreviousEtapa = () => {
    if (etapaAtualIndex > 0) {
      setEtapaAtualIndex(etapaAtualIndex - 1);
    }
  };


  const marginBottom = trilhas[trilhaAtualIndex].etapas.length > 3 ? 140 : 60;

  return (
    <View className="flex-1 bg-gray-100">
     
      <Animated.Image
        source={require('../../../assets/images/fundo.png')}
        style={{ 
          position: 'absolute', 
          bottom: 0,  
          left: 0, 
          right: 0, 
          height: height + 100,  
          width: width,  
          resizeMode: 'cover', 
          transform: [
            { translateY }   
          ]
        }}
      />


      <Animated.ScrollView 
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom,  
        }}
        className="px-6"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: translateY } } }],  
          { useNativeDriver: false }
        )}
      >
        {trilhas[trilhaAtualIndex].etapas.map((exercicio, exerIndex) => (
          <TouchableOpacity
            key={exercicio.id}
            className="bg-secondary p-10 rounded-full mb-6 max-w-xs"
            onPress={() => exerIndex <= etapaAtualIndex && handleNextEtapa()}
          >
            <View className="flex-row items-center justify-between">
              <Plane color="#111" size={32} />
            

            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      <View className="absolute bottom-24 left-0 right-0 flex-row justify-between px-6 items-center">
        <TouchableOpacity onPress={handlePreviousTrilha} className="bg-blue-500 p-3 rounded-full">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-white p-4 bg-primary rounded-lg">{trilhas[trilhaAtualIndex].nome}</Text>
        <TouchableOpacity onPress={handleNextTrilha} className="bg-blue-500 p-3 rounded-full">
          <ChevronRight size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;
