import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface CheckboxProps {
    title: string;
    isChecked: boolean;
    onCheck: (checked: boolean) => void;
}

const Checkbox = ({ title, isChecked, onCheck }: CheckboxProps) => {
    return (
        <View style={styles.checkboxContainer}>
            <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => onCheck(!isChecked)}
            >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>{title}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    checkboxContainer: {
        width: "80%",
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: "#56A6DC",
        borderRadius: 4,
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: "#56A6DC",
    },
    checkmark: {
        color: "white",
        fontSize: 14,
    },
    checkboxLabel: {
        fontSize: 16,
        color: "#333",
    },
});

export default Checkbox;