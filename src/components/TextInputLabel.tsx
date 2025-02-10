import { View, Text, TextInput } from "react-native";


interface TextInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    label: string;
    isLoading: boolean;
    color: string;
    keyboardType?: string
}

const TextInputLabel = ({
  label,
  color,
  isLoading,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: TextInputProps) => {
  return (
    <View >
      <Text >{label}</Text>
      <TextInput
        value={value}
        autoCapitalize="none"
        autoCorrect={false}
        editable={isLoading}
        placeholder={placeholder}
        onChangeText={onChangeText}
        cursorColor={color}
      />
    </View>
  );
};
