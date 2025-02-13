// step2.tsx
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
    View,
    Text,
    SafeAreaView,
} from "react-native";

import Avatar1 from "../../../assets/images/avatar1.svg";
import Avatar2 from "../../../assets/images/avatar2.svg";
import Avatar3 from "../../../assets/images/avatar3.svg";
import Avatar4 from "../../../assets/images/avatar4.svg";
import CustomButton from "@/src/components/CustomButton";

const avatarMapping: Record<string, React.FC<any>> = {
  avatar1: Avatar1,
  avatar2: Avatar2,
  avatar3: Avatar3,
  avatar4: Avatar4,
};


const Step02 = () => {
    const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();

    const SelectedAvatar = avatarSource ? avatarMapping[avatarSource] : null;

    return (
        <SafeAreaView  className="flex-1 bg-white">
            <Text>Essa é a tela Step 02</Text>
            <Text>Avatar selecionado: {avatarId}</Text>
      {SelectedAvatar && <SelectedAvatar width={150} height={150} />}

            <CustomButton 
                nextStep="/(register)/step3" // Supondo que haja uma step3
                params={{ avatarId, avatarSource }} // Continua passando o avatarId adiante
            />
        </SafeAreaView>
    );
};

export default Step02;