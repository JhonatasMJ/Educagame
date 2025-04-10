import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, SafeAreaView, Alert } from "react-native";
import Character from "../../components/Character";
import CustomButton from "@/src/components/CustomButton";
import Logo from "../../../assets/images/logo.svg";
import ProgressDots from '../../components/ProgressDots';

import Avatar1 from "../../../assets/images/avatar1.svg";
import Avatar2 from "../../../assets/images/avatar2.svg";
import Avatar3 from "../../../assets/images/avatar3.svg";
import Avatar4 from "../../../assets/images/avatar4.svg";
import Toast from "react-native-toast-message";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import ArrowBack from "@/src/components/ArrowBack";

const avatars = [
  { id: 1, source: Avatar1, sourceName: "avatar1" },
  { id: 2, source: Avatar2, sourceName: "avatar2" },
  { id: 3, source: Avatar3, sourceName: "avatar3" },
  { id: 4, source: Avatar4, sourceName: "avatar4" },
];

const Register = () => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [sourceAvatar, setSourceAvatar] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useRequireAuth({ requireAuth: false });

  const handleAvatarSelect = (id: number, sourceName: string) => {
    setSelectedAvatarId(id);
    setSourceAvatar(sourceName);
  };

  const handleContinue = () => {
    if (selectedAvatarId && sourceAvatar) {
      router.push({
        pathname: "/(register)/step1",
        params: { avatarId: selectedAvatarId.toString(), avatarSource: sourceAvatar },
      });
    } else {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro",
        text2: "Por favor, selecione um avatar para continuar",
      })
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-around">
       <ArrowBack onPress={() => router.back()} className="bg-primary" color="#f2f2f2" />
        
      <View style={{ alignItems: "center" }}>
        <Logo style={{ width: 315, height: 65, marginTop: "3%" }} />
      </View>
      <View style={{ alignItems: "center"}}>
        <Text className="text-xl font-semibold mb-2 text-primary top-3">Que tal</Text>
        <Text className="text-4xl font-bold mb-4">Escolher um avatar</Text>
      </View>

      <View style={{ alignItems: "center"}}>
        <View style={{ flexDirection: "row" }}>
          {avatars.slice(0, 2).map((avatar) => (
            <Character
              key={avatar.id}
              id={avatar.id}
              source={avatar.source}
              isSelected={selectedAvatarId === avatar.id}
              onSelect={() => handleAvatarSelect(avatar.id, avatar.sourceName)}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row" }}>
          {avatars.slice(2, 4).map((avatar) => (
            <Character
              key={avatar.id}
              id={avatar.id}
              source={avatar.source}
              isSelected={selectedAvatarId === avatar.id}
              onSelect={() => handleAvatarSelect(avatar.id, avatar.sourceName)}
            />
          ))}
        </View>
      </View>


      <CustomButton 
        title="Continuar"
        nextStep="/(register)/step1"
        validation={{
          isValid: selectedAvatarId !== null,
          message: "Por favor, selecione um avatar para continuar",
        }}
        params={{ avatarId: selectedAvatarId, avatarSource: sourceAvatar }}
        onPress={handleContinue}
      />

      <View style={{ justifyContent: "center", alignItems: "center", marginBottom: "3%" }}>
        <ProgressDots currentStep={0} />
      </View>
    </SafeAreaView>
  );
};

export default Register;
