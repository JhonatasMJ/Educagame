import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View, Image} from 'react-native'

interface CharacterProps {
    source:any
}

const Character = ( {source}:CharacterProps) => {
    return(
        <TouchableOpacity style={styles.character}>
             <Image source={source} resizeMode="contain" style={{ width: 100, height: 100 }} />
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    character: {
      width: 100,
      height: 100,
      margin: 5,
      justifyContent: "center",
      alignItems: "center",
    },
  });
  
export default Character;