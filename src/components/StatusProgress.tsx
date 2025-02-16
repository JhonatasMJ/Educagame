import React from "react";
import { View, Text } from "react-native";

interface StatusProgressProps {
    progress: number,
    amountQuestion: number,
    color?: string
}

const StatusProgress = ({progress, amountQuestion, color}: StatusProgressProps) => {
    return (
        <View style={{width: '100%', backgroundColor: '#D9D9D9', height: 18, borderRadius: 50, justifyContent: 'center', alignItems: 'flex-start'}}>
            <View style={{width: `${(progress / amountQuestion) * 100}%`, backgroundColor: color || '#EAAE00', height: 18, borderRadius: 50}}>

            <Text style={{textAlign: 'center', color: '#1D2362', fontSize: 12, fontWeight: '600'}}>{progress}/{amountQuestion}</Text>

            </View>
        </View>
    )
};

export default StatusProgress