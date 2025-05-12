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
  Image
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
import { getDatabase, ref, update, get, set } from "firebase/database"
import TextInputLabel from "@/src/components/TextInputLabel"
import Toast from "react-native-toast-message"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"
import { useEditMode } from "@/src/context/EditableContext"
import UnsavedChangesModal from "@/src/components/UnsavedChangesModal"
import { BRAND_COLORS, TEXT_COLORS } from "@/src/colors"
import { SIMPLIFIED_ONBOARDING_CONFIG } from "@/config/appConfig"
import {
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { auth } from "@/src/services/firebaseConfig"
import { logSync, LogLevel } from "@/src/services/syncLogger"
import { useRouter } from "expo-router"
import React from "react"

const { height, width } = Dimensions.get("window")
const Drawer = createDrawerNavigator()


const avatarImages = {
  avatar1: require("../../../assets/images/grande-avatar1.png"),
  avatar2: require("../../../assets/images/grande-avatar2.png"),
  avatar3: require("../../../assets/images/grande-avatar3.png"),
  avatar4: require("../../../assets/images/grande-avatar4.png"),
}

const avatarComponents = {
  avatar1: avatarImages.avatar1,
  avatar2: avatarImages.avatar2,
  avatar3: avatarImages.avatar3,
  avatar4: avatarImages.avatar4,
}

const PerfilContent = ({ navigation, onOpenDrawer }: any) => {
  const { isDesktop, isMobileDevice } = useDeviceType()
  const { userData, authUser, refreshUserData, loading, setShowLoadingTransition } = useAuth()
  const [editar, setEditar] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [celular, setCelular] = useState("")
  const [sobrenome, setSobrenome] = useState("")
  const [senha, setSenha] = useState("")
  const [avatarSource, setAvatarSource] = useState("avatar1")
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [usedQuickRegistration, setUsedQuickRegistration] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [emailChanged, setEmailChanged] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const router = useRouter()

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
      setEmail(authUser?.email || "")
      setSenha("")
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
      // Verificar se o usuário usou o cadastro rápido (email contém o domínio específico)
      if (userData.email && userData.email.includes(SIMPLIFIED_ONBOARDING_CONFIG.AUTO_EMAIL_DOMAIN)) {
        setUsedQuickRegistration(true)
      }

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

  // Detectar mudanças no email e senha
  useEffect(() => {
    if (authUser && email !== authUser.email) {
      setEmailChanged(true)
    } else {
      setEmailChanged(false)
    }

    if (senha.length > 0) {
      setPasswordChanged(true)
    } else {
      setPasswordChanged(false)
    }
  }, [email, senha, authUser])

  const AvatarComponent = avatarComponents[avatarSource as keyof typeof avatarComponents] || BigAvatar1

  const handleEdit = async () => {
    if (editar) {
      // Se o email ou senha foram alterados, precisamos de autenticação adicional
      if ((emailChanged || passwordChanged) && authUser?.email) {
        // Se o usuário usou cadastro rápido e está definindo email/senha pela primeira vez
        if (usedQuickRegistration && authUser.email.includes(SIMPLIFIED_ONBOARDING_CONFIG.AUTO_EMAIL_DOMAIN)) {
          // Não precisamos de reautenticação, apenas criar uma nova conta
          await handleSaveChanges()
        } else {
          // Precisamos de reautenticação para usuários normais
          setShowPasswordConfirmModal(true)
        }
      } else {
        // Apenas atualizações normais de perfil
        await handleSaveChanges()
      }
    } else {
      // Entrar no modo de edição
      setEditar(true)
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      if (!authUser?.uid) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Usuário não autenticado",
          position: "top",
        })
        return
      }

      // 1. Atualizar dados básicos no Realtime Database
      const db = getDatabase()
      const userRef = ref(db, `users/${authUser.uid}`)

      await update(userRef, {
        nome,
        sobrenome,
        celular,
        avatarSource,
      })

      logSync(LogLevel.INFO, "Dados básicos do usuário atualizados com sucesso")

      // 2. Lidar com mudanças de email e senha
      let needsRefresh = false

      // Verificar se o usuário usou cadastro rápido e está definindo email/senha pela primeira vez
      if (usedQuickRegistration && authUser.email?.includes(SIMPLIFIED_ONBOARDING_CONFIG.AUTO_EMAIL_DOMAIN)) {
        if (email && senha && email !== authUser.email) {
          try {
            logSync(LogLevel.INFO, "Criando nova conta para usuário de cadastro rápido")
            setShowLoadingTransition(true)

            // 1. Obter todos os dados do usuário atual
            const userSnapshot = await get(userRef)
            if (!userSnapshot.exists()) {
              throw new Error("Dados do usuário não encontrados")
            }

            const userData = userSnapshot.val()

            // 2. Criar nova conta com o email e senha fornecidos
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
            const newUser = userCredential.user

            // 3. Atualizar o perfil do novo usuário
            await updateProfile(newUser, {
              displayName: `${nome} ${sobrenome}`,
              photoURL: avatarSource,
            })

            // 4. Copiar todos os dados do usuário antigo para o novo
            const newUserRef = ref(db, `users/${newUser.uid}`)

            // Preparar dados atualizados
            const updatedUserData = {
              ...userData,
              nome,
              sobrenome,
              email,
              celular,
              avatarSource,
              usedQuickRegistration: false,
              migratedFromQuickRegistration: true,
              migrationDate: new Date().toISOString(),
              oldUid: authUser.uid,
            }

            // 5. Salvar dados no novo usuário
            await set(newUserRef, updatedUserData)

            // 6. Marcar o usuário antigo como migrado
            await update(userRef, {
              migratedTo: newUser.uid,
              migrationDate: new Date().toISOString(),
              isMigrated: true,
            })

            // 7. Sair do modo de edição
            setEditar(false)
            resetEditState()

            // 8. Mostrar mensagem de sucesso
            Toast.show({
              type: "success",
              text1: "Conta criada com sucesso!",
              text2: "Suas informações foram atualizadas",
              position: "top",
              visibilityTime: 3000,
            })

            // 9. Redirecionar para a tela inicial após um breve delay
            setTimeout(() => {
              router.replace("/(tabs)/home")
            }, 1500)

            return
          } catch (error: any) {
            setShowLoadingTransition(false)
            logSync(LogLevel.ERROR, `Erro ao criar nova conta: ${error.message}`)
            Toast.show({
              type: "error",
              text1: "Erro ao criar conta",
              text2: error.message || "Tente novamente com outro email",
              position: "top",
            })
            return
          }
        } else {
          Toast.show({
            type: "error",
            text1: "Dados incompletos",
            text2: "Forneça email e senha para criar sua conta",
            position: "top",
          })
          return
        }
      }

      // Para usuários normais, atualizar email e senha se necessário
      if (emailChanged && email) {
        try {
          await updateEmail(authUser, email)
          await update(userRef, { email })
          logSync(LogLevel.INFO, "Email do usuário atualizado com sucesso")
          needsRefresh = true
        } catch (error: any) {
          logSync(LogLevel.ERROR, `Erro ao atualizar email: ${error.message}`)
          Toast.show({
            type: "error",
            text1: "Erro ao atualizar email",
            text2: error.message,
            position: "top",
          })
        }
      }

      if (passwordChanged && senha) {
        try {
          await updatePassword(authUser, senha)
          logSync(LogLevel.INFO, "Senha do usuário atualizada com sucesso")
          setSenha("") // Limpar a senha após atualização
        } catch (error: any) {
          logSync(LogLevel.ERROR, `Erro ao atualizar senha: ${error.message}`)
          Toast.show({
            type: "error",
            text1: "Erro ao atualizar senha",
            text2: error.message,
            position: "top",
          })
        }
      }

      // 3. Atualizar o perfil no Firebase Auth
      try {
        await updateProfile(authUser, {
          displayName: `${nome} ${sobrenome}`,
          photoURL: avatarSource,
        })
        logSync(LogLevel.INFO, "Perfil do usuário atualizado com sucesso no Firebase Auth")
      } catch (error: any) {
        logSync(LogLevel.ERROR, `Erro ao atualizar perfil no Firebase Auth: ${error.message}`)
      }

      // 4. Atualizar dados locais
      await refreshUserData()

      Toast.show({
        type: "success",
        text1: "Perfil atualizado com sucesso!",
        position: "top",
        visibilityTime: 2000,
      })

      // Reset edit state in context
      resetEditState()
      setEditar(false)
    } catch (error: any) {
      logSync(LogLevel.ERROR, `Erro ao salvar alterações: ${error.message}`)
      Toast.show({
        type: "error",
        text1: "Erro ao atualizar perfil",
        text2: error.message || "Tente novamente mais tarde",
        position: "top",
      })
    } finally {
      setIsSaving(false)
      setShowPasswordConfirmModal(false)
    }
  }

  const handleReauthenticate = async () => {
    if (!authUser?.email || !currentPassword) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Email ou senha atual não fornecidos",
        position: "top",
      })
      return
    }

    setIsSaving(true)
    try {
      // Criar credencial com email atual e senha fornecida
      const credential = EmailAuthProvider.credential(authUser.email, currentPassword)

      // Reautenticar o usuário
      await reauthenticateWithCredential(authUser, credential)

      // Fechar modal e prosseguir com as alterações
      setShowPasswordConfirmModal(false)
      setCurrentPassword("")

      // Salvar as alterações
      await handleSaveChanges()
    } catch (error: any) {
      logSync(LogLevel.ERROR, `Erro na reautenticação: ${error.message}`)
      Toast.show({
        type: "error",
        text1: "Senha incorreta",
        text2: "A senha atual fornecida está incorreta",
        position: "top",
      })
    } finally {
      setIsSaving(false)
    }
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
                  <Image
                    source={avatarComponents[avatarSource as keyof typeof avatarComponents] || avatarComponents.avatar1}
                    style={{
                      width: 200,
                      height: 270,
                      borderRadius: 100,
                    }}
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-10 right-0 bg-primary z-50 p-2 rounded-full shadow-md">
                    <FontAwesome name="camera" size={20} color="#111" />
                  </View>
                </TouchableOpacity>
              ) : (
                <View className="relative">
                  <Image
                    source={avatarComponents[avatarSource as keyof typeof avatarComponents] || avatarComponents.avatar1}
                    style={{
                      width: 200,
                      height: 270,
                      borderRadius: 100,
                    }}
                    resizeMode="cover"
                  />
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
              {usedQuickRegistration && (
                <View style={styles.quickRegisterNotice}>
                  <Text style={styles.quickRegisterNoticeText}>
                    Complete seu perfil adicionando seu email e outras informações para melhorar sua experiência.
                  </Text>
                </View>
              )}
              <TouchableOpacity
                className={`flex-row justify-center items-center py-3 px-8 rounded-lg mb-4 ${editar ? "bg-primary" : "bg-secondary"
                  }`}
                onPress={handleEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#111" size="small" />
                ) : (
                  <>
                    <FontAwesome name={editar ? "save" : "edit"} size={26} color="#111" />
                    <Text className="ml-4 text-xl font-medium text-zinc-800">{editar ? "Salvar" : "Editar"}</Text>
                  </>
                )}
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

                <TextInputLabel
                  label="Email"
                  placeholder="Digite seu email"
                  value={email}
                  onChangeText={setEmail}
                  editable={editar}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInputLabel
                  label="Celular"
                  placeholder="Digite seu celular"
                  value={celular}
                  onChangeText={setCelular}
                  editable={editar}
                  keyboardType="phone-pad"
                />

                <TextInputLabel
                  label="Senha"
                  placeholder={editar ? "Digite uma nova senha" : "••••••••"}
                  secureTextEntry={true}
                  value={senha}
                  onChangeText={setSenha}
                  editable={editar}
                />

                {editar && (
                  <Text className="text-zinc-400 text-xs mt-1">
                    {usedQuickRegistration
                      ? "Defina seu email e senha para criar sua conta permanente"
                      : "Deixe a senha em branco se não quiser alterá-la"}
                  </Text>
                )}
              </View>
            </View>

            {/* Modal de seleção de avatar */}
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
                        className={`p-3 rounded-xl border-2 relative ${avatarSource === key ? "border-[#56A6DC] bg-[#56A6DC]/10" : "border-transparent bg-zinc-700"
                          }`}
                        onPress={() => handleAvatarChange(key)}
                      >

                        <Image
                          source={avatarComponents[key as keyof typeof avatarComponents]}
                          style={{
                            width: 85,
                            height: 85,
                            borderRadius: 45
                          }}
                          resizeMode="cover"
                        />

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

            {/* Modal de confirmação de senha */}
            <Modal
              visible={showPasswordConfirmModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowPasswordConfirmModal(false)}
            >
              <View className="flex-1 justify-center items-center bg-black/50">
                <View className={`w-[${MOBILE_WIDTH - 150}] bg-zinc-800 rounded-3xl p-8 items-center`}>
                  <Text className="text-xl font-bold mb-5 text-white">Confirme sua senha</Text>

                  <Text className="text-zinc-300 text-center mb-4">
                    Para alterar seu email ou senha, precisamos confirmar sua identidade.
                  </Text>

                  <TextInputLabel
                    label="Senha atual"
                    placeholder="Digite sua senha atual"
                    secureTextEntry={true}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    editable={!isSaving}
                  />

                  <View className="flex-row w-full gap-3 mt-6">
                    <TouchableOpacity
                      className="flex-1 bg-red-500 py-3 rounded-xl items-center"
                      onPress={() => setShowPasswordConfirmModal(false)}
                      disabled={isSaving}
                    >
                      <Text className="text-white font-semibold">Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-secondary py-3 rounded-xl items-center"
                      onPress={handleReauthenticate}
                      disabled={isSaving || !currentPassword}
                    >
                      {isSaving ? (
                        <ActivityIndicator color="#111" size="small" />
                      ) : (
                        <Text className="text-zinc-800 font-semibold">Confirmar</Text>
                      )}
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
  quickRegisterNotice: {
    backgroundColor: "rgba(246, 166, 8, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: BRAND_COLORS.SECONDARY,
    width: "100%",
  },
  quickRegisterNoticeText: {
    color: TEXT_COLORS.BRANCO,
    fontSize: 14,
  },
})

export default PerfilScreen
