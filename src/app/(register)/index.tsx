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
import Character from "../../components/Character";
import RegisterButton from "@/src/components/CustomButton";
import { green } from "react-native-reanimated/lib/typescript/Colors";


const Register = () => {
    const RegisterStep1 = () => {
          router.push("/(register)/step1");
    };

    return(
      <SafeAreaView>
        <View style={{alignItems: "center"}}>
          <Image style={{width: 315, height: 65, marginTop: 60}}
                  source={require("../../../assets/images/logo.png")}
            />
        </View>
        <View style={{alignItems: "center", marginTop: 40}}>
            <Text className="text-xl font-semibold mb-2 text-primary top-3" >Que tal</Text>
            <Text className="text-4xl font-bold mb-4">Escolher um avatar</Text>
        </View>

        
      <View style={{alignItems: "center", marginTop: 20}}>
        <View style={{flexDirection: "row"}}>
          <Character source={require("../../../assets/images/avatar1.png")}></Character>
          <Character source={require("../../../assets/images/avatar2.png")}></Character>
        </View>
        <View style={{flexDirection: "row"}}>
        <Character source={require("../../../assets/images/avatar3.png")}></Character>
        <Character source={require("../../../assets/images/avatar4.png")}></Character>
        </View>
      </View>

       <RegisterButton></RegisterButton>
      

      </SafeAreaView>
        
    )

};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
  
export default Register;