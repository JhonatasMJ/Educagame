"use client"

import { useState } from "react"
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal } from "react-native"
import BigAvatar1 from "../../../assets/images/grande-avatar1.svg"
import BigAvatar2 from "../../../assets/images/grande-avatar2.svg"
import BigAvatar3 from "../../../assets/images/grande-avatar3.svg"
import BigAvatar4 from "../../../assets/images/grande-avatar4.svg"
import TextInputLabel from "@/src/components/TextInputLabel"
import Button from "@/src/components/Button"
import { FontAwesome } from "@expo/vector-icons"
import { useAuth } from "@/src/context/AuthContext"
import { getDatabase, ref, update } from "firebase/database"


const avatarComponents = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
}

const Profile = () => {
  const { userData, authUser, refreshUserData } = useAuth()
  const [editar, setEditar] = useState(false)
  const [nome, setNome] = useState(userData?.nome || "")
  const [email, setEmail] = useState(authUser?.email || "")
  const [celular, setCelular] = useState(userData?.phone || "")
  const [sobrenome, setSobrenome] = useState(userData?.sobrenome || "")
  const [senha, setSenha] = useState("")
  const [avatarSource, setAvatarSource] = useState(userData?.avatarSource || "avatar1")
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  const AvatarComponent = avatarComponents[avatarSource as keyof typeof avatarComponents] || BigAvatar1

  const handleEdit = async () => {
    if (editar) {
      if (authUser?.uid) {
        const db = getDatabase()
        const userRef = ref(db, `users/${authUser.uid}`)

        await update(userRef, {
          nome,
          celular,
          sobrenome,
          avatarSource, 
        })
        await refreshUserData()
      }
    }
    setEditar(!editar)
  }

  const handleAvatarChange = (newAvatarSource: string) => {
    setAvatarSource(newAvatarSource)
    setShowAvatarModal(false)
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SafeAreaView className="flex-1 bg-primary bg-blue">
        <TouchableOpacity
          className="text-center justify-center mx-auto relative"
          onPress={() => editar && setShowAvatarModal(true)}
          activeOpacity={editar ? 0.7 : 1}
        >
          <AvatarComponent width={200} />
          {editar && (
            <View className="absolute bottom-0 right-0 bg-secondary p-2 rounded-full">
              <FontAwesome name="camera" size={20} color="#111" />
            </View>
          )}
        </TouchableOpacity>

        <View className="flex-1 w-full rounded-3xl bg-zinc-700 p-6 h-1/2 pb-32 pt-12">
          <Text className="text-white text-4xl font-bold">Perfil</Text>
          <Text className="text-xl font-semibold text-secondary">Faça alterações no seu perfil:</Text>

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
              value={sobrenome}
              onChangeText={setSobrenome}
              editable={editar}
            />
            <TextInputLabel label="Email" placeholder="Digite seu email" value={email} editable={false} />
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
            <FontAwesome name={editar ? "save" : "edit"} className="absolute right-6" size={24} color="#111" />
          </View>
        </View>


        <Modal
          visible={showAvatarModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-4/5 bg-white rounded-3xl p-5 items-center">
              <Text className="text-xl font-bold mb-5">Escolha seu avatar</Text>

              <View className="flex-row flex-wrap justify-center gap-4">
                <TouchableOpacity
                  className={`p-2.5 rounded-xl border-2 bg-primary ${
                    avatarSource === "avatar1" ? "border-[#56A6DC] bg-[#56A6DC]/10" : "border-transparent"
                  }`}
                  onPress={() => handleAvatarChange("avatar1")}
                >
                  <BigAvatar1 width={80} height={80} />
                </TouchableOpacity>

                <TouchableOpacity
                  className={`p-2.5 rounded-xl border-2 bg-primary ${
                    avatarSource === "avatar2" ? "border-[#56A6DC] bg-[#56A6DC]/10" : "border-transparent"
                  }`}
                  onPress={() => handleAvatarChange("avatar2")}
                >
                  <BigAvatar2 width={80} height={80} />
                </TouchableOpacity>

                <TouchableOpacity
                  className={`p-2.5 rounded-xl border-2 bg-primary ${
                    avatarSource === "avatar3" ? "border-[#56A6DC] bg-[#56A6DC]/10" : "border-transparent"
                  }`}
                  onPress={() => handleAvatarChange("avatar3")}
                >
                  <BigAvatar3 width={80} height={80} />
                </TouchableOpacity>

                <TouchableOpacity
                  className={`p-2.5 rounded-xl border-2 bg-primary ${
                    avatarSource === "avatar4" ? "border-[#56A6DC] bg-[#56A6DC]/10" : "border-transparent"
                  }`}
                  onPress={() => handleAvatarChange("avatar4")}
                >
                  <BigAvatar4 width={80} height={80} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                className="mt-5 p-2.5  rounded-xl w-full items-center bg-red-500"
                onPress={() => setShowAvatarModal(false)}
              >
                <Text className="text-white font-semibold  ">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScrollView>
  )
}

export default Profile
