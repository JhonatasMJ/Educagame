import React from 'react';
import { router } from "expo-router";
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';


const RegisterButton = ({ nextStep }: { nextStep: any }) => {
    const goToNextStep = () => {
        router.push(nextStep)
    };

    return (
        <View style={{ alignItems: "center", justifyContent: "center", marginTop: 40 }}>
            <TouchableOpacity style={styles.button} onPress={goToNextStep}>
                <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold' }}>Continuar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 350,
        height: 52,
        backgroundColor: '#56A6DC',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
});

export default RegisterButton;
