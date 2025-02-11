import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  StyleSheet 
} from "react-native";
import Character from "../components/Character";


const Register = () => {

    return(
        <SafeAreaView>
          <Image 
                source={require("../../assets/images/logo.png")}
            />
        <View>
            <Text className="text-xl font-semibold mb-2 text-primary" >Que tal</Text>
            <Text className="text-4xl font-bold mb-4">Escolher um avatar</Text>
        </View>

        
      <View style={styles.row}>
        <Character source={require("../../assets/images/avatar1.png")}></Character>
        <Character source={require("../../assets/images/avatar2.png")}></Character>
      </View>
      <View style={styles.row}>
      <Character source={require("../../assets/images/avatar3.png")}></Character>
      <Character source={require("../../assets/images/avatar4.png")}></Character>
      </View>

        </SafeAreaView>
        
    )

};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
    },
  });
  
export default Register;