import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, SafeAreaView, Alert } from "react-native";
import Character from "../../components/Character";
import RegisterButton from "@/src/components/CustomButton";
import Logo from "../../../assets/images/logo.svg";

import Avatar1 from "../../../assets/images/avatar1.svg";
import Avatar2 from "../../../assets/images/avatar2.svg";
import Avatar3 from "../../../assets/images/avatar3.svg";
import Avatar4 from "../../../assets/images/avatar4.svg";

const avatars = [
  { id: 1, source: Avatar1, sourceName: "avatar1" },
  { id: 2, source: Avatar2, sourceName: "avatar2" },
  { id: 3, source: Avatar3, sourceName: "avatar3" },
  { id: 4, source: Avatar4, sourceName: "avatar4" },
];

const Register = () => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [sourceAvatar, setSourceAvatar] = useState<string | null>(null);

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
      Alert.alert("Por favor, selecione um avatar para continuar");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={{ alignItems: "center" }}>
        <Logo style={{ width: 315, height: 65, marginTop: "3%" }} />
      </View>
      <View style={{ alignItems: "center", marginTop: "5%" }}>
        <Text className="text-xl font-semibold mb-2 text-primary top-3">Que tal</Text>
        <Text className="text-4xl font-bold mb-4">Escolher um avatar</Text>
      </View>

      <View style={{ alignItems: "center", marginTop: 20 }}>
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

      <RegisterButton 
        nextStep="/(register)/step1"
        validation={{
          isValid: selectedAvatarId !== null,
          message: "Por favor, selecione um avatar para continuar",
        }}
        params={{ avatarId: selectedAvatarId, avatarSource: sourceAvatar }}
        onPress={handleContinue}
      />

      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Text>o o o o o</Text>
      </View>
    </SafeAreaView>
  );
};

export default Register;
