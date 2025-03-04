import React from "react";
import { View, Text } from "react-native";
import colors from "../colors";

// MessageBubble component to be used in the conversation
const MessageBubble = ({
  text = '',
  type = "user",
  timestamp = new Date().toLocaleTimeString(),
}) => {
  // Reverse the logic here - 'user' messages will be on the right
  const isUserMessage = type === "user";

  return (
    <View
      style={{
        // This will now correctly align user messages to the right
        alignSelf: isUserMessage ? "flex-start" : "flex-end",
        maxWidth: "80%",
        marginVertical: 10 / 2,
      }}
    >
      <View
        style={{
          backgroundColor: isUserMessage
            ? '#56A6DC'  // User message background
            : '#0B273A', // Contact message background
          borderRadius: 10,
          padding: 10,
          paddingHorizontal: 10 * 1.5,
        }}
      >
        <Text
          style={{
            color: isUserMessage ? '#1E1E1E' : colors.white_less,
            fontSize: 10 * 1.6,
          }}
        >
          {text}
        </Text>
        <Text
          style={{
            color: isUserMessage ? colors["dark-light"] : '#fefefe',
            fontSize: 10 * 1.2,
            alignSelf: "flex-end",
            marginTop: 10 / 2,
          }}
        >
          {timestamp}
        </Text>
      </View>
    </View>
  );
};


export default MessageBubble;