import { View, Text, TextInput, TextInputProps as RNTextInputProps, KeyboardTypeOptions } from "react-native";

interface TextInputProps extends RNTextInputProps {
  label: string;
  isLoading?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

const TextInputLabel = ({
  label,
  isLoading = false,
  value,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  ...props
}: TextInputProps) => {
  return (
    <View>
      <Text className="text-xl font-bold text-white mb-2">{label}:</Text>
      <TextInput
        className="bg-inputBg border-2 border-inputBor rounded-lg py-4 px-4 focus-visible:border-primary mb-4"
        value={value}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading} 
        placeholder={placeholder}
      
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        {...props}
      />
    </View>
  );
};

export default TextInputLabel;
