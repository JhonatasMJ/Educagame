import { useRouter } from "expo-router";
import React from "react"
import { Text, StyleSheet, TouchableOpacity, View } from "react-native"

interface AcionarChamadoProps {
    setOpen: (value: boolean) => void;
}

const AcionarChamado = ({ setOpen }: AcionarChamadoProps) => {
    const router = useRouter();

    const handleNavigation = (route: string) => {
        setOpen(false); // Fecha o modal
        setTimeout(() => {
            router.push(route as any); // Navega após um pequeno delay
        }, 100);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Escolha uma das duas opções para continuar
            </Text>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={() => handleNavigation("/openTicket")}
            >
                <Text style={styles.buttonText}>Novo Chamado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={() => handleNavigation("/searchTicket")}
            >
                <Text style={styles.buttonText}>Consultar Chamado</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    button: {
        backgroundColor: "#56A6DC",
        padding: 15.75,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 25,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
    },
})

export default AcionarChamado