import React from 'react'
import { TouchableOpacity, Text} from 'react-native'

interface ButtonProps {
    text:string
}

const Button = ({text}:ButtonProps)  => {
  return (
    <TouchableOpacity >
        <Text >{text}</Text>
    </TouchableOpacity>
  )
}

export default Button
