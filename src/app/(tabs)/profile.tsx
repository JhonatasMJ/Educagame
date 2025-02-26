import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from "react-native";
import BigAvatar1 from "../../../assets/images/grande-avatar1.svg";
import TextInputLabel from "@/src/components/TextInputLabel";
import Button from "@/src/components/Button";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { getDatabase, ref, update } from "firebase/database";

const Profile = () => {
  const { userData, authUser, refreshUserData } = useAuth();
  const [editar, setEditar] = useState(false);
  const [nome, setNome] = useState(userData?.nome || "");
  const [email, setEmail] = useState(authUser?.email || ""); 
  const [celular, setCelular] = useState(userData?.celular || "");
  const [sobrenome, setSobrenome] = useState(userData?.sobrenome|| "");
  
  
  const [senha, setSenha] = useState("");

  const handleEdit = async () => {
    if (editar) {
      if (authUser?.uid) {
        const db = getDatabase();
        const userRef = ref(db, `users/${authUser.uid}`);

        await update(userRef, { nome, celular, sobrenome });
        await refreshUserData();
      }
    }
    setEditar(!editar);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SafeAreaView className="flex-1 bg-primary bg-blue">
        <View className="text-center justify-center mx-auto">
          <BigAvatar1 width={200} />
        </View>

        <View className="flex-1 w-full rounded-3xl bg-zinc-700 p-6 h-1/2 pb-32 pt-12">
          <Text className="text-white text-4xl font-bold">Perfil</Text>
          <Text className="text-xl font-semibold text-secondary">
            Faça alterações no seu perfil:
          </Text>

          <View className="mt-4">
            <TextInputLabel
              label="Nome"
              placeholder="Digite seu nome"
              value={nome}
              onChangeText={setNome}
              editable={editar}
            />
<TextInputLabel
  label="Sobrenome"
  placeholder="Digite seu Sobrenome"
  value={sobrenome} // Corrigido
  onChangeText={setSobrenome} 
  editable={editar}
/>
            <TextInputLabel
              label="Email"
              placeholder="Digite seu email"
              value={email}
              editable={false}
            />
            <TextInputLabel
              label="Celular"
              placeholder="Digite seu celular"
              value={celular}
              onChangeText={setCelular}
              editable={editar}
            />
            <TextInputLabel
              label="Senha"
              placeholder="Digite sua senha"
              secureTextEntry={true}
              value={senha}
              onChangeText={setSenha}
              editable={editar}
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
      </SafeAreaView>
    </ScrollView>
  );
};

export default Profile;
