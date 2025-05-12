import React from "react";
import { TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from "react-native";

interface CharacterProps {
  source: ImageSourcePropType;
  id: number;
  isSelected: boolean;
  onSelect: () => void;
}

const Character = ({ source, isSelected, onSelect }: CharacterProps) => {
  return (
    <TouchableOpacity 
      style={[styles.character, isSelected && styles.selectedCharacter]}
      onPress={onSelect}
    >
      <Image source={source} style={styles.image} resizeMode="contain" />
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
    borderColor: "#223AD2",
    backgroundColor: "#223AD2",
    borderWidth: 5,
  },
  image: {
    width: "100%",
    height: "100%",
  }
});

export default Character;