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


const Step02 = () => {
    return (
        <SafeAreaView>
            <Text>Essa é a tela Step 02</Text>

            
            <RegisterButton nextStep="/(register)/step2" />
        </SafeAreaView>
    );
};

export default Step02;