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
import ConversationField from "../../components/ConversationIa";
import MessageBubble from "../../components/MessageBuble";
import conversationAi from "../../context/IaController";
import { useConversation } from "../../context/ContextIa";
import { useFocusEffect } from "@react-navigation/native";

const AiAssistent = () => {
  const { messages, addMessage, markAsRead } = useConversation();
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // Quando a tela entrar em foco, marque as mensagens como lidas
  useFocusEffect(
    useCallback(() => {
      markAsRead();
    }, [markAsRead])
  );

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
      const aiResponse = await conversationAi.sendMessage(message);

      // Se a resposta for um array (como nos logs que você mostrou), trate-a assim:
      const responses = Array.isArray(aiResponse)
        ? aiResponse
        : [{ response: aiResponse }];

      responses.forEach((item) => {
        const aiMessage = {
          id: `ai_${Date.now()}`,
          text: item.response,
          type: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        addMessage(aiMessage);
      });
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
      style={{ flex: 1 }}
      behavior="padding"
      enabled
    >
      <SafeAreaView
        style={{
          padding: 15,
          paddingTop: 35,
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
              width: 20,
              height: 20,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../../assets/images/icon.png")}
              resizeMode="contain"
              style={{ width: 15, height: 15 }}
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
            Assistente Virtual Banco Votorantim
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

          {isLoading && (
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

        <ConversationField onSendMessage={handleSendMessage} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default AiAssistent;