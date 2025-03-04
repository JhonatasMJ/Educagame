import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


interface RealoadButtonProps {
  onPress: () => void;
}

const RealoadButton = ( { onPress }: RealoadButtonProps) => {
  return (
    <TouchableOpacity style={{ width: 45, height: 45, borderRadius: 25, backgroundColor: '#56A6DC', alignItems: 'center', justifyContent: 'center' }} onPress={onPress}>
        <Ionicons name="reload-circle" size={32} color="#fff" />
    </TouchableOpacity>
  );
}

export default RealoadButton;