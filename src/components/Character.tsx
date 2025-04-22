import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { SvgProps } from "react-native-svg";

interface CharacterProps {
  source: React.FC<SvgProps>;
  id: number;
  isSelected: boolean;
  onSelect: () => void;
}

const Character = ({ source: SvgImage, isSelected, onSelect }: CharacterProps) => {
  return (
    <TouchableOpacity 
      style={[styles.character, isSelected && styles.selectedCharacter]}
      onPress={onSelect}
    >
      <SvgImage width={170} height={170} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  character: {
    width: 170,
    height: 170,
    borderRadius: 85,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 5,
    /* backgroundColor: "#56A6DC", */
    borderColor: "transparent",
    margin: 5,
  },
  selectedCharacter: {
    borderColor: "#F1592E",
    backgroundColor: "#F1592E",
    borderWidth: 5,
  },
});

export default Character;
