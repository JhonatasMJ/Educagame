import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ButtonProps {
  text: string;
  className?: string;
  onPress: () => void;  
}

const Button = ({ text, className, onPress }: ButtonProps) => {
  return (
    <TouchableOpacity className={className} onPress={onPress}>
      <Text className="text-center font-bold text-xl">{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;
