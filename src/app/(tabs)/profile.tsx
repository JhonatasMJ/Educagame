import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import BigAvatar1 from "../../../assets/images/grande-avatar1.svg";
import BigAvatar2 from "../../../assets/images/grande-avatar2.svg";
import BigAvatar3 from "../../../assets/images/grande-avatar3.svg";
import BigAvatar4 from "../../../assets/images/grande-avatar4.svg";
import { useLocalSearchParams } from "expo-router";

import TextInputLabel from "@/src/components/TextInputLabel";
import Button from "@/src/components/Button";
import { FontAwesome } from "@expo/vector-icons";

const bigAvatarMapping: Record<string, React.FC<any>> = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
};

const Profile = () => {
  const [editar, setEditar] = useState('')
  const { avatarId, avatarSource } = useLocalSearchParams<{
    avatarId: string;
    avatarSource: string;
  }>();
  const SelectedBigAvatar = avatarSource
    ? bigAvatarMapping[avatarSource]
    : null;


    const handleEdit = () => {
        if (editar) {
          console.log("editando")
        }

        setEditar(!editar)
    }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SafeAreaView className="flex-1 bg-primary">
        <View className="text-center justify-center mx-auto ">
          <BigAvatar1 width={200} className="z-50  " />
        </View>

        <View className="flex-1 w-full  rounded-3xl bg-zinc-700 p-6 h-1/2 pb-32 pt-12  ">
          <View>
            <Text className="text-white text-4xl font-bold">Perfil</Text>
            <Text className="text-xl font-semibold text-secondary">
              Faça alterações do seu perfil:
            </Text>
            <View className="mt-4">
              <TextInputLabel label="Nome" placeholder="Digite seu nome" />
              <TextInputLabel label="Email" placeholder="Digite seu email" />
              <TextInputLabel
                label="Celular"
                placeholder="Digite seu celular"
              />
              <TextInputLabel
                label="Senha"
                placeholder="Digite sua senha"
                isLoading={false}
                secureTextEntry={true}
              />
            </View>
            <View className="flex-row items-center relative">
              <Button
                className={`p-4 rounded-lg flex-1 ${editar ? "bg-primary" : "bg-secondary"}`} 
                text={editar ? "Salvar" : "Editar"}  
                onPress={handleEdit}  
              />
              <FontAwesome
                name={editar ? "save" : "edit"}  
                className="absolute right-6"
                size={24}
                color="#111"
              />
            </View>
           
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Profile;
