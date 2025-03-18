"use client"

import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal, Platform } from "react-native"
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
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#56A6DC' }}>
    
        <View className="h-40"></View>
        
  
        <View className="absolute top-6 left-0 right-0 z-10 items-center">
          <TouchableOpacity
            onPress={() => editar && setShowAvatarModal(true)}
            activeOpacity={editar ? 0.7 : 1}
            className="relative"
          >
            <AvatarComponent className="-z-10" width={200} height={270} />
            {editar && (
              <View className="absolute bottom-12 right-0 bg-secondary z-50 p-2 rounded-full shadow-md">
                <FontAwesome name="camera" size={20} color="#111" />
              </View>
            )}
          </TouchableOpacity>
        </View>

    
        <View className="flex-1 w-full h-screen rounded-t-3xl bg-menu p-6 pb-20 mt-32 z-30">
          <View className="flex-row justify-between items-center mb-6 pb-2 mt-6 border-b border-zinc-600">
            <View>
              <Text className="text-white text-2xl font-bold">Perfil</Text>
              <Text className="text-secondary text-sm">
                {editar ? "Editando informações" : "Suas informações pessoais"}
              </Text>
            </View>
            
            <TouchableOpacity
              className={`flex-row items-center py-2 px-4 rounded-lg ${
                editar ? "bg-primary" : "bg-secondary"
              }`}
              onPress={handleEdit}
            >
              <FontAwesome 
                name={editar ? "save" : "edit"} 
                size={16} 
                color="#111" 
              />
              <Text className="ml-2 font-medium text-zinc-800">
                {editar ? "Salvar" : "Editar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form fields */}
          <View className="space-y-4">
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
        </View>

      
        <Modal
          visible={showAvatarModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-4/5 bg-zinc-800 rounded-3xl p-6 items-center">
              <Text className="text-xl font-bold mb-5 text-white">Escolha seu avatar</Text>

              <View className="flex-row flex-wrap justify-center gap-4">
                {Object.entries(avatarComponents).map(([key, AvatarComp]) => (
                  <TouchableOpacity
                    key={key}
                    className={`p-3 rounded-xl border-2 relative ${
                      avatarSource === key 
                        ? "border-[#56A6DC] bg-[#56A6DC]/10" 
                        : "border-transparent bg-zinc-700"
                    }`}
                    onPress={() => handleAvatarChange(key)}
                  >
                    <AvatarComp width={80} height={80} />
                    
                    {avatarSource === key && (
                      <View className="absolute bottom-1 right-1 bg-[#56A6DC] rounded-full w-6 h-6 items-center justify-center">
                        <FontAwesome name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row w-full gap-3 mt-6">
                <TouchableOpacity 
                  className="flex-1 bg-red-500 py-3 rounded-xl items-center"
                  onPress={() => setShowAvatarModal(false)}
                >
                  <Text className="text-white font-semibold">Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 bg-secondary py-3 rounded-xl items-center"
                  onPress={() => setShowAvatarModal(false)}
                >
                  <Text className="text-zinc-800 font-semibold">Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScrollView>
  )
}

export default Profile