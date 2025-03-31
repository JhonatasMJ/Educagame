"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Animated, StatusBar } from "react-native"
import { Feather } from "@expo/vector-icons"
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

// Dados mock para os detalhes do usuário logado
const userDetailsData: UserDetails = {
  miles: 120,
  hours: 120,
  consecutiveDays: 25,
  totalConsecutiveDays: 120,
}

const RankingScreen = () => {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  // Usando o contexto de autenticação para obter o usuário atual
  const { userData, authUser, getAllUsers } = useAuth()

  // ID do usuário atual
  const currentUserId = authUser?.uid || ""

  // Buscar usuários do Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const firebaseUsers = await getAllUsers()
        
        // Mapear os usuários para o formato esperado pelo componente
        const formattedUsers = firebaseUsers.map(user => ({
          id: user.id,
          name: user.nome || "Usuário",
          result: user.result || 0,
          avatarSource: user.avatarSource || "avatar1"
        }))
        
        setUsers(formattedUsers)
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [])

  // Animated values
  const statsHeight = useRef(new Animated.Value(isHeaderExpanded ? 1 : 0)).current
  const arrowRotation = useRef(new Animated.Value(isHeaderExpanded ? 0 : 1)).current

  // Calculate the rotation for the arrow icon
  const arrowRotationDegree = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  })

  // Effect to animate when isHeaderExpanded changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(statsHeight, {
        toValue: isHeaderExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(arrowRotation, {
        toValue: isHeaderExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start()
  }, [isHeaderExpanded])

  const toggleHeader = () => {
    setIsHeaderExpanded(!isHeaderExpanded)
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
        <View style={styles.avatarContainer}>
          <AvatarComponent width={40} height={40} style={styles.avatar} />
        </View>
        <Text style={styles.userName}>{item.name}</Text>
        <View style={styles.resultContainer}>
          <Feather name="flag" size={16} color="#FFA500" />
          <Text style={styles.resultText}>{item.result}</Text>
        </View>
      </View>
    )
  }

  // Calculate the max height for the stats container
  const maxStatsHeight = 170 // Reduzido para eliminar espaço vazio

  // Interpolate the height for the stats container
  const animatedStatsHeight = statsHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxStatsHeight],
  })

  // Interpolate opacity for the stats container
  const statsOpacity = statsHeight.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1],
  })

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#F6A608" />
    
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Feather name="award" size={24} color="white" />
            <Text style={styles.title}>RANKING</Text>
          </View>
          <TouchableOpacity onPress={toggleHeader} style={styles.arrowButton}>
            <Animated.View style={{ transform: [{ rotate: arrowRotationDegree }] }}>
              <Feather name="chevron-up" size={24} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Animated.View 
          style={[
            styles.userStatsContainer, 
            { 
              height: animatedStatsHeight,
              opacity: statsOpacity,
              overflow: 'hidden'
            }
          ]}
        >
          <Text style={styles.statsTitle}>Confira seus resultados detalhados:</Text>

          <View style={styles.statsGrid}>
            {/* Primeira linha do grid */}
            <View style={[styles.statsRow, {
    marginBottom: 10,}]}>
              {/* Item 1 - Milhas */}
              <View style={styles.statItemGrid}>
                <View style={styles.statIconContainer}>
                  <Feather name="flag" size={20} color="#4A90E2" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{userDetailsData.miles}</Text>
                  <Text style={styles.statLabel}>milhas</Text>
                </View>
              </View>

              {/* Item 2 - Horas */}
              <View style={styles.statItemGrid}>
                <View style={styles.statIconContainer}>
                  <Feather name="clock" size={20} color="#4A90E2" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{userDetailsData.hours}</Text>
                  <Text style={styles.statLabel}>horas</Text>
                </View>
              </View>
            </View>

            {/* Segunda linha do grid */}
            <View style={styles.statsRow}>
              {/* Item 3 - Dias seguidos */}
              <View style={styles.statItemGrid}>
                <View style={styles.statIconContainer}>
                  <Feather name="calendar" size={20} color="#4A90E2" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{userDetailsData.consecutiveDays}</Text>
                  <Text style={styles.statLabel}>dias seguidos</Text>
                </View>
              </View>

              {/* Item 4 - Total dias seguidos */}
              <View style={styles.statItemGrid}>
                <View style={styles.statIconContainer}>
                  <Feather name="award" size={20} color="#4A90E2" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{userDetailsData.totalConsecutiveDays}</Text>
                  <Text style={styles.statLabel}>dias seguidos</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 8,
  },
  arrowButton: {
    width: 32,
    height: 32,
    backgroundColor: '#BF720C',
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userStatsContainer: {
  },
  statsTitle: {
    color: "white",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  statsGrid: {
    marginTop: 10,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItemGrid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    width: '49%',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  statTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4A90E2",
    marginRight: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: '35%',
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 14,
    padding: 14.5,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default RankingScreen
