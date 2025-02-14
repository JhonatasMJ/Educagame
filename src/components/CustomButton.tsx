import React from 'react';
import { router } from "expo-router";
import { TouchableOpacity, Text, StyleSheet, View, Alert } from 'react-native';

interface CustomButtonProps {
    nextStep: `/${string}` | (string & {});
    validation?: {
        isValid: boolean;
        message: string;
    };
    params?: Record<string, any>;
    onPress?: () => void; 
    title: string;
}

const CustomButton = ({ nextStep, validation, params, onPress, title }: CustomButtonProps) => {
    const goToNextStep = () => {
        if (onPress) {
            // Se uma função onPress for passada, executa ela
            onPress();
        } else {
            // Senão, segue a lógica padrão
            if (validation) {
                if (validation.isValid) {
                    router.push({
                        pathname: nextStep as any,
                        params: params
                    });
                } else {
                    Alert.alert(validation.message);
                }
            } else {
                router.push({
                    pathname: nextStep as any,
                    params: params
                });
            }
        }
    };

    return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
            <TouchableOpacity style={styles.button} onPress={goToNextStep}>
                <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold' }}>{title}</Text>
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

export default CustomButton;
