"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Modal } from "react-native"
import { Feather, FontAwesome } from "@expo/vector-icons"
import { useAuth } from "@/src/context/AuthContext"

// Importando os componentes de avatar

import BigAvatar1 from "../../../assets/images/grande-avatar1.svg"
import BigAvatar2 from "../../../assets/images/grande-avatar2.svg"
import BigAvatar3 from "../../../assets/images/grande-avatar3.svg"
import BigAvatar4 from "../../../assets/images/grande-avatar4.svg"

import React from "react"

// Types para nossos dados
interface User {
  id: string
  name: string
  result: number
  avatarSource: string
}

interface UserDetails {
  miles: number
  hours: number
  consecutiveDays: number
  totalConsecutiveDays: number
}

// Mapeamento dos componentes de avatar
const avatarComponents = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
}

// Dados mock para a lista de ranking
const usersData: User[] = [
  { id: "1", name: "Vittor Patricio", result: 1000, avatarSource: "avatar1" },
  { id: "2", name: "Vittor Patricio", result: 1000, avatarSource: "avatar2" },
  { id: "3", name: "Vittor Patricio", result: 1000, avatarSource: "avatar3" },
  { id: "4", name: "Vittor Patricio", result: 1000, avatarSource: "avatar4" },
  { id: "5", name: "Vittor Patricio", result: 950, avatarSource: "avatar1" },
  { id: "6", name: "Vittor Patricio", result: 900, avatarSource: "avatar2" },
  { id: "7", name: "Vittor Patricio", result: 850, avatarSource: "avatar3" },
  { id: "8", name: "Vittor Patricio", result: 800, avatarSource: "avatar4" },
  { id: "9", name: "Vittor Patricio", result: 750, avatarSource: "avatar1" },
  { id: "10", name: "Vittor Patricio", result: 700, avatarSource: "avatar2" },
]

// Dados mock para os detalhes do usuário logado
const userDetailsData: UserDetails = {
  miles: 120,
  hours: 120,
  consecutiveDays: 25,
  totalConsecutiveDays: 120,
}

const RankingScreen = () => {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedAvatarSource, setSelectedAvatarSource] = useState<string>("avatar1")

  // Usando o contexto de autenticação para obter o usuário atual
  const { userData, authUser } = useAuth()

  // ID do usuário atual (simulando que o ID do Firebase é o mesmo do nosso mock)
  const currentUserId = authUser?.uid || "1" // Fallback para o ID 1 se não houver usuário autenticado

  const toggleHeader = () => {
    setIsHeaderExpanded(!isHeaderExpanded)
  }

  const handleAvatarPress = (userId: string, avatarSource: string) => {
    setSelectedUserId(userId)
    setSelectedAvatarSource(avatarSource)
    setShowAvatarModal(true)
  }

  const handleAvatarChange = (newAvatarSource: string) => {
    // Aqui você implementaria a lógica para atualizar o avatar no Firebase
    // Por enquanto, apenas fechamos o modal
    setShowAvatarModal(false)
  }

  const renderItem = ({ item, index }: { item: User; index: number }) => {
    const position = index + 1
    const isThirdPosition = position === 3
    const isCurrentUser = item.id === currentUserId

    // Determina o componente de avatar baseado no avatarSource do usuário
    const AvatarComponent = avatarComponents[item.avatarSource as keyof typeof avatarComponents] || BigAvatar1

    return (
      <View
        style={[styles.rankingItem, isThirdPosition && styles.highlightedItem, isCurrentUser && styles.currentUserItem]}
      >
        <View style={styles.positionContainer}>
          <Text style={styles.positionText}>{position}</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => handleAvatarPress(item.id, item.avatarSource)}>
          <AvatarComponent width={40} height={40} style={styles.avatar} />
        </TouchableOpacity>
        <Text style={styles.userName}>{item.name}</Text>
        <View style={styles.resultContainer}>
          <Feather name="flag" size={16} color="#FFA500" />
          <Text style={styles.resultText}>{item.result}</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Feather name="award" size={24} color="white" />
            <Text style={styles.title}>RANKING</Text>
          </View>
          <TouchableOpacity onPress={toggleHeader} style={styles.arrowButton}>
            <Feather name={isHeaderExpanded ? "chevron-down" : "chevron-up"} size={24} color="white" />
          </TouchableOpacity>
        </View>

        {isHeaderExpanded && (
          <View style={styles.userStatsContainer}>
            <Text style={styles.statsTitle}>Confira seus resultados:</Text>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="flag" size={20} color="#4A90E2" />
              </View>
              <Text style={styles.statValue}>{userDetailsData.miles}</Text>
              <Text style={styles.statLabel}>milhas</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="clock" size={20} color="#4A90E2" />
              </View>
              <Text style={styles.statValue}>{userDetailsData.hours}</Text>
              <Text style={styles.statLabel}>horas</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="calendar" size={20} color="#4A90E2" />
              </View>
              <Text style={styles.statValue}>{userDetailsData.consecutiveDays}</Text>
              <Text style={styles.statLabel}>dias seguidos</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="award" size={20} color="#4A90E2" />
              </View>
              <Text style={styles.statValue}>{userDetailsData.totalConsecutiveDays}</Text>
              <Text style={styles.statLabel}>dias seguidos</Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={usersData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de seleção de avatar */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha seu avatar</Text>

            <View style={styles.avatarGrid}>
              {Object.entries(avatarComponents).map(([key, AvatarComp]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.avatarOption, selectedAvatarSource === key && styles.selectedAvatarOption]}
                  onPress={() => setSelectedAvatarSource(key)}
                >
                  <AvatarComp width={85} height={85} style={{ borderRadius: 45 }} />

                  {selectedAvatarSource === key && (
                    <View style={styles.checkIcon}>
                      <FontAwesome name="check" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAvatarModal(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmButton} onPress={() => handleAvatarChange(selectedAvatarSource)}>
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A90E2",
  },
  header: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  arrowButton: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  userStatsContainer: {
    marginTop: 8,
  },
  statsTitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    marginVertical: 4,
    padding: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90E2",
    marginRight: 4,
  },
  statLabel: {
    fontSize: 16,
    color: "#888",
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  highlightedItem: {
    backgroundColor: "#FFA500",
  },
  currentUserItem: {
    backgroundColor: "#FFA500",
  },
  positionContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 8,
  },
  positionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#4A90E2",
    overflow: "hidden",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  resultText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 4,
  },
  // Estilos para o modal de seleção de avatar
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#333",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  avatarOption: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#444",
    position: "relative",
  },
  selectedAvatarOption: {
    borderColor: "#56A6DC",
    backgroundColor: "rgba(86, 166, 220, 0.1)",
  },
  checkIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#56A6DC",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E53935",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#FFA500",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
})

export default RankingScreen

