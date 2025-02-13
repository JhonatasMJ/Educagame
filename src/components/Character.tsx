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
      <SvgImage width={150} height={150} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  character: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
    margin: 5,
  },
  selectedCharacter: {
    borderColor: "#1e3a8a",
    backgroundColor: "rgba(30, 58, 138, 0.1)",
    borderWidth: 4,
  },
});

export default Character;
