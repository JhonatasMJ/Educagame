import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, Animated, Platform } from "react-native"; // Importando o módulo Platform
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { trilhas } from "../../dados";
import BtnTrilha from "../../components/BtnTrilha";  // Importando o novo componente

const { width, height } = Dimensions.get("window");

const Home = () => {
  const [trilhaAtualIndex, setTrilhaAtualIndex] = useState(0);
  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0);

  const translateY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Inicia animação apenas se não for web
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trilhaAtualIndex]);

  const handleNextTrilha = () => {
    if (trilhaAtualIndex < trilhas.length - 1) {
      setTrilhaAtualIndex(trilhaAtualIndex + 1);
      setEtapaAtualIndex(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  };

  const handlePreviousTrilha = () => {
    if (trilhaAtualIndex > 0) {
      setTrilhaAtualIndex(trilhaAtualIndex - 1);
      setEtapaAtualIndex(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  };

  const handleNextEtapa = () => {
    if (etapaAtualIndex < trilhas[trilhaAtualIndex].etapas.length - 1) {
      setEtapaAtualIndex(etapaAtualIndex + 1);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Fundo da tela */}
      <Animated.Image
        className={"absolute bottom-0 left-0 right-0 "}
        source={require("../../../assets/images/fundo.png")}
        style={{
          height: height + 100,
          width: width,
          resizeMode: "cover",
          transform: [{ translateY }],
        }}
      />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Animated.ScrollView
          contentContainerStyle={{
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "column-reverse",
            paddingBottom: 100,
            paddingTop: 50,
          }}
          className="px-6"
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: translateY } } }], {
            useNativeDriver: false,
          })}
          showsVerticalScrollIndicator={false}
        >
          {trilhas[trilhaAtualIndex].etapas.map((exercicio, exerIndex) => (
            <BtnTrilha
              key={exercicio.id}
              etapa={exerIndex + 1}
              isConcluido={exerIndex <= etapaAtualIndex}
              onPress={() => exerIndex <= etapaAtualIndex && handleNextEtapa()}
            />
          ))}
        </Animated.ScrollView>
      </Animated.View>

      {/* Botões de navegação */}
      <View className="absolute bottom-24 left-0 right-0 flex-row justify-between px-6 items-center">
        {/* Removendo a animação se a plataforma for web */}
        <TouchableOpacity
          onPress={handlePreviousTrilha}
          className={`bg-blue-500 p-3 rounded-full ${Platform.OS === 'web' ? '' : 'transform-gpu'}`}
        >
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold text-white p-4 bg-primary rounded-lg">
          {trilhas[trilhaAtualIndex].nome}
        </Text>

        <TouchableOpacity
          onPress={handleNextTrilha}
          className={`bg-blue-500 p-3 rounded-full ${Platform.OS === 'web' ? '' : 'transform-gpu'}`}
        >
          <ChevronRight size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;
