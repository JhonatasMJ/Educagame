"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  Modal,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { createDrawerNavigator } from "@react-navigation/drawer"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import BigAvatar1 from "../../../assets/images/grande-avatar1.svg"
import BigAvatar2 from "../../../assets/images/grande-avatar2.svg"
import BigAvatar3 from "../../../assets/images/grande-avatar3.svg"
import BigAvatar4 from "../../../assets/images/grande-avatar4.svg"
import { CustomDrawerContent } from "@/src/components/CustomDrawerContent"
import useDeviceType from "@/useDeviceType"
import { MOBILE_WIDTH } from "@/PlataformWrapper"
import CustomWebDrawer from "@/src/components/CustomWebDrawer"
import { useAuth } from "@/src/context/AuthContext"
import { getDatabase, ref, update } from "firebase/database"
import TextInputLabel from "@/src/components/TextInputLabel"
import Toast from "react-native-toast-message"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import { useEditMode } from "@/src/context/EditableContext"
import UnsavedChangesModal from "@/src/components/UnsavedChangesModal"
import React from "react"
const { height, width } = Dimensions.get("window")
const Drawer = createDrawerNavigator()

const avatarComponents = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
}

const PerfilContent = ({ navigation, onOpenDrawer }: any) => {
  const { isDesktop, isMobileDevice } = useDeviceType()
  const { userData, authUser, refreshUserData, loading } = useAuth()
  const [editar, setEditar] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [celular, setCelular] = useState("")
  const [sobrenome, setSobrenome] = useState("")
  const [senha, setSenha] = useState("")
  const [avatarSource, setAvatarSource] = useState("avatar1")
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  // Get edit mode context
  const {
    setIsEditMode,
    showUnsavedChangesModal,
    setShowUnsavedChangesModal,
    pendingNavigation,
    setPendingNavigation,
    resetEditState,
  } = useEditMode()

  // For protected routes
  const { isAuthenticated, isLoading } = useRequireAuth()

  // Update the edit mode context when local edit state changes
  useEffect(() => {
    setIsEditMode(editar)
  }, [editar, setIsEditMode])

  // Handle confirming navigation (discard changes)
  const handleConfirmNavigation = () => {
    // Reset form to original values
    if (userData) {
      setNome(userData.nome || "")
      setSobrenome(userData.sobrenome || "")
      setCelular(userData.phone || "")
      setAvatarSource(userData.avatarSource || "avatar1")
    }

    // Exit edit mode
    setEditar(false)

    // Close modal
    setShowUnsavedChangesModal(false)

    // Execute the pending navigation if it exists
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
  }

  // Handle canceling navigation (continue editing)
  const handleCancelNavigation = () => {
    setShowUnsavedChangesModal(false)
    setPendingNavigation(null)
  }

  useEffect(() => {
    if (userData) {
      setNome(userData.nome || "")
      setSobrenome(userData.sobrenome || "")
      setCelular(userData.phone || "")
      setAvatarSource(userData.avatarSource || "avatar1")
    }

    if (authUser) {
      setEmail(authUser.email || "")
    }
  }, [userData, authUser])

  useEffect(() => {
    refreshUserData()
  }, [])

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
        Toast.show({
          type: "success",
          text1: "Perfil atualizado com sucesso!",
          position: "top",
          visibilityTime: 2000,
        })

        // Reset edit state in context
        resetEditState()
      }
    }
    setEditar(!editar)
  }

  const handleAvatarChange = (newAvatarSource: string) => {
    setAvatarSource(newAvatarSource)
  }

  const handleSelectAvatar = (newAvatarSource: string) => {
    setAvatarSource(newAvatarSource)
    setShowAvatarModal(false)
  }

  // Nova lógica para o drawer
  const handleOpenDrawer = () => {
    // Se estiver na web (desktop ou mobile), usa o CustomWebDrawer
    if (Platform.OS === "web") {
      onOpenDrawer?.() // Usa a função customizada para web
    } else {
      // Em dispositivos nativos, usa o drawer do navigation
      navigation?.openDrawer()
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />
      <SafeAreaView className="flex-1 bg-tertiary">
        {loading ? (
          <View className="text-center flex- justify-center items-center h-screen">
            <ActivityIndicator color="#fff" size={32} />
            <Text className="text-white text-lg mt-6">Carregando perfil...</Text>
          </View>
        ) : (
          <>
            <View className="h-40"></View>

            <View className="absolute top-8 left-0 right-0 z-10 items-center">
              {editar ? (
                <TouchableOpacity
                  onPress={() => editar && setShowAvatarModal(true)}
                  activeOpacity={editar ? 0.7 : 1}
                  className="relative"
                >
                  <AvatarComponent className="-z-10" width={200} height={270} />

                  <View className="absolute bottom-10 right-0 bg-primary z-50 p-2 rounded-full shadow-md">
                    <FontAwesome name="camera" size={20} color="#111" />
                  </View>
                </TouchableOpacity>
              ) : (
                <View className="relative">
                  <AvatarComponent className="-z-10" width={200} height={270} />

                  <TouchableOpacity
                    onPress={() => {
                      setShowAvatarModal(true)
                      setEditar(true)
                    }}
                    activeOpacity={editar ? 0.7 : 1}
                    className="absolute bottom-10 right-0 bg-secondary z-50 p-2 rounded-full shadow-md"
                  >
                    <FontAwesome name="camera" size={20} color="#111" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.topSection}>
              <TouchableOpacity onPress={handleOpenDrawer} style={styles.settingsButton} activeOpacity={0.7}>
                <FontAwesome size={28} name="gear" color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 w-full h-screen rounded-t-3xl bg-menu p-6 pb-20 mt-32 z-30">
              <View className="flex-row justify-between items-center mb-6 pb-4 mt-4 border-b border-zinc-600">
                <View>
                  <Text className="text-white text-4xl font-bold mb-1">Perfil</Text>
                  <Text className="text-secondary text-md">
                    {editar ? "Editando informações" : "Suas informações pessoais"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className={`flex-row justify-center items-center py-3 px-8 rounded-lg mb-4 ${
                  editar ? "bg-primary" : "bg-secondary"
                }`}
                onPress={() => {
                  handleEdit()
                  setEditar(!editar)
                }}
              >
                <FontAwesome name={editar ? "save" : "edit"} size={26} color="#111" />
                <Text className="ml-4 text-xl font-medium text-zinc-800">{editar ? "Salvar" : "Editar"}</Text>
              </TouchableOpacity>

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
            </View>

            <Modal
              visible={showAvatarModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowAvatarModal(false)}
            >
              <View className="flex-1 justify-center items-center bg-black/50">
                <View className={`w-[${MOBILE_WIDTH - 150}] bg-zinc-800 rounded-3xl p-8 items-center`}>
                  <Text className="text-xl font-bold mb-5 text-white">Escolha seu avatar</Text>

                  <View className="flex-row flex-wrap justify-center gap-8">
                    {Object.entries(avatarComponents).map(([key, AvatarComp]) => (
                      <TouchableOpacity
                        key={key}
                        className={`p-3 rounded-xl border-2 relative ${
                          avatarSource === key ? "border-[#56A6DC] bg-[#56A6DC]/10" : "border-transparent bg-zinc-700"
                        }`}
                        onPress={() => handleAvatarChange(key)}
                      >
                        <AvatarComp width={85} height={85} style={{ borderRadius: 45 }} />

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
                      onPress={() => handleSelectAvatar(avatarSource)}
                    >
                      <Text className="text-zinc-800 font-semibold">Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}

        <UnsavedChangesModal
          visible={showUnsavedChangesModal}
          onCancel={handleCancelNavigation}
          onConfirm={handleConfirmNavigation}
        />
      </SafeAreaView>
    </ScrollView>
  )
}

const PerfilScreen = () => {
  const { isDesktop, isMobileDevice } = useDeviceType()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { width } = Dimensions.get("window")

  if (Platform.OS === "web") {
    return (
      <View style={[styles.navigatorContainer, { overflow: "hidden" }]}>
        <PerfilContent onOpenDrawer={() => setIsDrawerOpen(true)} />
        <CustomWebDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          drawerWidth={Math.min(320, width * 0.8)} // Ajusta largura baseado na tela
        >
          <CustomDrawerContent closeDrawer={() => setIsDrawerOpen(false)} />
        </CustomWebDrawer>
      </View>
    )
  }

  // Em dispositivos nativos, usa o drawer do ReactNavigation
  return (
    <View style={styles.navigatorContainer}>
      <Drawer.Navigator
        screenOptions={{
          drawerPosition: "right",
          drawerType: "slide",
          overlayColor: "rgba(0,0,0,0.7)",
          drawerStyle: {
            backgroundColor: "#fff",
            width: width * 0.8,
          },
          headerShown: false,
        }}
        drawerContent={(props: any) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="PerfilContent"
          component={PerfilContent}
          options={{
            drawerLabel: "Stats",
          }}
        />
      </Drawer.Navigator>
    </View>
  )
}

const styles = StyleSheet.create({
  navigatorContainer: {
    flex: 1,
    position: "relative",
    ...(Platform.OS === "web" && {
      overflow: "hidden",
    }),
  },
  topSection: {
    height: 120,
    width: "100%",
    position: "absolute",
    zIndex: 999,
  },
  settingsButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
})

export default PerfilScreen
