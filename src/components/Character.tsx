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
      <SvgImage width={160} height={160} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  character: {
    width: 160,
    height: 160,
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
    borderColor: "#1e3a8a",
    backgroundColor: "#1e3a8a",
    borderWidth: 5,
  },
});

export default Character;
