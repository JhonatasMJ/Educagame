import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

interface CheckboxProps {
  title: string;
  isChecked: boolean;
  colorText?: string;
  onCheck: (checked: boolean) => void;
}

const Checkbox = ({ title, isChecked, onCheck, colorText }: CheckboxProps) => {
  return (
    <View className="w-[80%]">
      <TouchableOpacity
        className="flex-row items-center"
        onPress={() => onCheck(!isChecked)}
      >
        <View
          className={`w-5 h-5 border-2 rounded border-primary mr-2 justify-center items-center ${
            isChecked ? 'bg-primary' : ''
          }`}
        >
          {isChecked && <Text className="text-white text-sm">✓</Text>}
        </View>
        <Text className="text-base" style={{ color: colorText ?? '#333' }}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Checkbox;
