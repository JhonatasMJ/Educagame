"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer"
import { useRouter } from "expo-router"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import ModalComponent from "./modalComponent"
import { MOBILE_WIDTH } from "@/PlataformWrapper"
import useDeviceType from "@/useDeviceType"
import AcionarChamado from "./AcionarChamado"
import { useLogin } from "../hooks/UseLogin"
import { useAuth } from "../context/AuthContext"
import { logSync, LogLevel } from "../services/syncLogger"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BRAND_COLORS, TEXT_COLORS, UI_COLORS } from "../colors"
import React from "react"
import { USE_SIMPLIFIED_ONBOARDING } from "@/config/appConfig"

export const CustomDrawerContent = (props: any) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { isDesktop } = useDeviceType()
  const windowWidth = Dimensions.get("window").width

  const { clearSavedCredentials } = useLogin()
  const { logout, setShowLoadingTransition } = useAuth()

  // Calculate modal width based on platform and device type
  const getModalWidth = () => {
    if (Platform.OS === "web" && isDesktop) {
      return Math.min(400, MOBILE_WIDTH * 0.9) // Slightly smaller than simulator width
    }
    return Math.min(windowWidth * 0.9, 400) // Max width of 400px on mobile
  }

  // Função para limpar todos os dados locais manualmente
  const clearAllLocalData = async (): Promise<boolean> => {
    try {
      logSync(LogLevel.INFO, "Limpando manualmente todos os dados locais...")

      // Obter todas as chaves do AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys()

      // Remover todos os dados
      if (allKeys.length > 0) {
        await AsyncStorage.multiRemove(allKeys)
        logSync(LogLevel.INFO, `Removidos ${allKeys.length} itens do AsyncStorage`)
      } else {
        logSync(LogLevel.INFO, "Nenhum dado encontrado no AsyncStorage")
      }

      return true
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro ao limpar dados locais manualmente:", error)
      return false
    }
  }

  // Função aprimorada para logout completo
  const handleCompleteLogout = async () => {
    try {
      setIsLoggingOut(true)
      setShowLoadingTransition(true)
      logSync(LogLevel.INFO, "=== INICIANDO PROCESSO DE LOGOUT COMPLETO ===")

      // 1. Primeiro limpar todos os dados locais usando a função do hook
      logSync(LogLevel.INFO, "Limpando dados locais via hook...")
      const hookCleanupSuccess = await clearSavedCredentials()

      if (!hookCleanupSuccess) {
        logSync(LogLevel.WARNING, "Limpeza via hook falhou, tentando limpeza manual...")
        // Tentar limpeza manual como fallback
        await clearAllLocalData()
      }

      // 2. Fazer logout no Firebase
      logSync(LogLevel.INFO, "Executando logout no Firebase...")
      await logout()
      logSync(LogLevel.INFO, "Logout no Firebase concluído")

      // 3. Fechar o drawer
      if (props.navigation) {
        props.navigation.closeDrawer()
      }

      // 4. Redirecionar para a tela de login com parâmetros para forçar limpeza
      logSync(LogLevel.INFO, "Redirecionando para tela de login...")
      USE_SIMPLIFIED_ONBOARDING ? router.replace({
        pathname: "/quick-start",
        params: {
          clearCache: "true",
          timestamp: Date.now().toString(),
        },
      }) : router.replace({
        pathname: "/login",
        params: {
          clearCache: "true",
          timestamp: Date.now().toString(),
        },
      })

      logSync(LogLevel.INFO, "=== PROCESSO DE LOGOUT COMPLETO FINALIZADO ===")
    } catch (error) {
      logSync(LogLevel.ERROR, "Erro durante o processo de logout completo:", error)

      // Mostrar alerta de erro
      Alert.alert("Erro ao fazer logout", "Ocorreu um erro ao tentar sair da conta. Tente novamente.", [{ text: "OK" }])
    } finally {
      setIsLoggingOut(false)
      setShowLoadingTransition(false)
      setShowLogoutConfirm(false)
    }
  }

  // Função para confirmar logout
  const confirmLogout = () => {
    setShowLogoutConfirm(true)
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Recursos Adicionais</Text>
        </View>
        {/*  <DrawerItem
          label="Acionar Chamado"
          icon={({ color, size }) => (
            <MaterialIcons name="airplane-ticket" size={size} color={color} />
          )}
          onPress={() => {
            setOpen(true);
          }}
        />
        <DrawerItem
          label="Exportar Resultados em PDF"
          icon={({ color, size }) => (
            <Foundation name="page-export-pdf" size={size} color={color} />
          )}
          onPress={() => {
          }}
        />  */}
        <DrawerItem
          label={isLoggingOut ? "Saindo..." : "Sair da Conta"}
          icon={({ color, size }) =>
            isLoggingOut ? (
              <ActivityIndicator size="small" color={color} />
            ) : (
              <MaterialIcons name="logout" size={size} color={color} />
            )
          }
          onPress={confirmLogout}
          disabled={isLoggingOut}
        />
      </DrawerContentScrollView>

      {/* Modal de confirmação de logout */}
      <ModalComponent
        state={showLogoutConfirm}
        setState={setShowLogoutConfirm}
        styles={[styles.modal, Platform.OS === "web" && isDesktop && styles.webModal]}
      >
        <View
          style={[
            styles.modalContent,
            {
              width: getModalWidth(),
            },
          ]}
        >
          <View style={[styles.modalHeader, { backgroundColor: BRAND_COLORS.PRIMARY }]}>
            <Text style={styles.modalTitle}>Confirmar Logout</Text>
            <TouchableOpacity onPress={() => setShowLogoutConfirm(false)} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={TEXT_COLORS.LIGHT} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <MaterialIcons name="logout" size={48} color={BRAND_COLORS.PRIMARY} style={styles.logoutIcon} />

            <Text style={styles.confirmText}>Tem certeza que deseja sair da conta?</Text>
            <Text style={styles.confirmSubtext}>Todos os dados locais serão removidos.</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleCompleteLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color={TEXT_COLORS.LIGHT} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ModalComponent>

      {/* Modal de chamado */}
      <ModalComponent
        state={open}
        setState={setOpen}
        styles={[styles.modal, Platform.OS === "web" && isDesktop && styles.webModal]}
      >
        <View
          style={[
            styles.modalContent,
            {
              width: getModalWidth(),
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Acionar Chamado</Text>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <AcionarChamado setOpen={setOpen} />
          </View>
        </View>
      </ModalComponent>
    </View>
  )
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modal: {
    margin: 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    zIndex: 1000,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    position: "absolute",
    left: "50%",
    top: "50%",
    ...Platform.select({
      web: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: [{ translateX: -195 }, { translateY: -200 }],
      },
      default: {
        transform: [{ translateX: -170 }, { translateY: -180 }],
      },
    }),
    minHeight: 320,
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: TEXT_COLORS.LIGHT,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: {
    marginBottom: 16,
  },
  confirmText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: TEXT_COLORS.PRIMARY,
  },
  confirmSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    color: TEXT_COLORS.SECONDARY,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: UI_COLORS.INPUT_BG,
    borderWidth: 2,
    borderColor: UI_COLORS.INPUT_BORDER,
    marginRight: 12,
  },
  confirmButton: {
    backgroundColor: BRAND_COLORS.PRIMARY,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_COLORS.PRIMARY,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_COLORS.LIGHT,
  },
})
