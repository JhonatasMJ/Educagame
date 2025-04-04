// AiAssistent.js
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import ConversationField from "../../components/ConversationField";
import MessageBubble from "../../components/MessageBuble";
import conversationAi from "../../context/IaController";
import { useConversation } from "../../context/ContextIa";
import { useAuth } from "@/src/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";

const AiAssistent = () => {
  const { messages, addMessage, markAsRead } = useConversation();
  const [isLoading2, setIsLoading] = useState(false);
  const scrollViewRef = useRef<any>(null);
    const { userData, authUser } = useAuth();
    const nome = `${userData?.nome} ${userData?.sobrenome}`;

  // Quando a tela entrar em foco, marque as mensagens como lidas
  useFocusEffect(
    useCallback(() => {
      markAsRead();
    }, [markAsRead])
  );

  
    const { isAuthenticated, isLoading } = useRequireAuth();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
  
    // Adiciona a mensagem do usuário
    const userMessage = {
      id: `user_${Date.now()}`,
      text: message,
      type: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  
    addMessage(userMessage);
  
    try {
      setIsLoading(true);
      
      // Aqui você pode obter userData e authUser do contexto de autenticação
      // const { userData, authUser } = useAuth(); - se estiver usando um hook de autenticação
      // OU usando props se os valores vierem de um componente pai
      
      // Passando os parâmetros opcionais para o método sendMessage
      const aiResponse = await conversationAi.sendMessage(
        message,
        nome, // fonte real de userData
        userData,
        authUser  //fonte real de authUser
      );
  
      // Como a nova implementação retorna uma string diretamente, você pode simplificar:
      const aiMessage = {
        id: `ai_${Date.now()}`,
        text: aiResponse, // aiResponse já é a string de resposta
        type: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      
      addMessage(aiMessage);
    } catch (error) {
      const errorMessage = {
        id: `error_${Date.now()}`,
        text: "Desculpe, ocorreu um erro ao processar sua mensagem.",
        type: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#3185BE" }}
      enabled
    >
      <SafeAreaView
        style={{
          padding: 15,
          paddingTop: 35,
          paddingBottom: 86,
          backgroundColor: "#3185BE",
          flex: 1,
        }}
      >
        <View
          style={{
            padding: 5,
            height: 50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              backgroundColor: "#fefefe",
              width: 25,
              height: 25,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../../assets/images/icon.png")}
              resizeMode="contain"
              style={{ width: 23.5, height: 23.5, borderRadius: 30 }}
            />
          </View>
          <Text
            numberOfLines={1}
            style={{
              color: "#fefefe",
              fontSize: 20,
              marginLeft: 20,
              fontWeight: "700",
            }}
          >
            Assistente Virtual Espaço Aéreo
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((msg: any) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              type={msg.type}
              timestamp={msg.timestamp}
            />
          ))}

          {isLoading2 && (
            <MessageBubble
              text="Escrevendo ..."
              type="ai"
              timestamp={new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          )}
        </ScrollView>

        <ConversationField onSendMessage={handleSendMessage} placeholder="Tire suas dúvidas com nosso assistente!" color="#241f1f" />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default AiAssistent;