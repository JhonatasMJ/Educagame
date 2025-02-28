import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons} from "@expo/vector-icons";
import colors from "../colors";

interface ConversationFieldProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  color?: string;
}

const ConversationField = ({ onSendMessage, placeholder, color }: ConversationFieldProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <View style={{ borderRadius: 10, overflow: "hidden", backgroundColor: '#fefefe', borderColor: color ? '#56A6DC' : 'none', borderWidth: color ? 2 : 0 }}>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <TextInput
          selectionColor={'#3185BE'}
          style={{
            width: "100%",
            color: '#121313',
            fontSize: 10* 1.7,
            padding: 10,
            paddingLeft: 10* 3.75,
            paddingRight: 10* 3.75,
          }}
          value={message}
          placeholder={placeholder}
          placeholderTextColor={'#171B1E'}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
        />
        <Image
              source={require("../../assets/images/icon.png")}
          style={{
            position: "absolute",
            left: 4,
            width: 28,
            height: 28,
            borderRadius: 28
          }}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={handleSend}
          style={{ position: "absolute", right: 10}}
        >
          <Ionicons
            name="send"
            size={10* 2.25}
            color={message.trim() ? '#3185BE' : '#171B1E'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConversationField;