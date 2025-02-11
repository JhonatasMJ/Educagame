import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View, Image} from 'react-native'

interface CharacterProps {
    source:any
}

const Character = ( {source}:CharacterProps) => {
    return(
        <TouchableOpacity style={styles.character}>
             <Image source={source} resizeMode="contain" style={{ width: 150, height: 150 }} />
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    character: {
      width: 150,
      height: 150,
      margin: 4
    },
  });
  
export default Character;