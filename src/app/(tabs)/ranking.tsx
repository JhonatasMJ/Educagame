"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Animated, StatusBar } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useAuth } from "@/src/context/AuthContext"
import { useRequireAuth } from "@/src/hooks/useRequireAuth"

// Importando os componentes de avatar
import BigAvatar1 from "../../../assets/images/grande-avatar1.svg"
import BigAvatar2 from "../../../assets/images/grande-avatar2.svg"
import BigAvatar3 from "../../../assets/images/grande-avatar3.svg"
import BigAvatar4 from "../../../assets/images/grande-avatar4.svg"
import React from "react"

interface User {
  id: string
  name: string
  points: number
  avatarSource: string
  hours: number
  consecutiveDays: number
  consecutiveCorrect: number
  totalConsecutiveDays: number
  position?: number
}

// Mapeamento dos componentes de avatar
const avatarComponents = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
}

const RankingScreen = () => {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [displayUsers, setDisplayUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useRequireAuth({ requireAuth: true, showToast: true })

  const { userData, authUser, getAllUsers } = useAuth()

  // ID do usuário atual
  const currentUserId = authUser?.uid || ""

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const firebaseUsers = await getAllUsers()

        const formattedUsers = firebaseUsers.map((user) => ({
          id: user.id,
          name: user.nome || "Usuário",
          points: user.points || 0,
          avatarSource: user.avatarSource || "avatar1",
        }))

        formattedUsers.sort((a, b) => b.points - a.points)

        const usersWithPosition = formattedUsers.map((user, index) => ({
          ...user,
          position: index + 1,
        }))

        setUsers(usersWithPosition)

        reorganizeUsersForDisplay(usersWithPosition)
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const reorganizeUsersForDisplay = (usersWithPosition: User[]) => {
    const currentUserIndex = usersWithPosition.findIndex((user) => user.id === currentUserId)

    if (currentUserIndex === -1) {
      setDisplayUsers(usersWithPosition)
      return
    }

    const currentUser = usersWithPosition[currentUserIndex]

    if (currentUserIndex < 3) {
      setDisplayUsers(usersWithPosition)
      return
    }

    const topThree = usersWithPosition.slice(0, 3)
    const usersAfterCurrentUser = usersWithPosition.filter((user, index) => index > currentUserIndex)
    const usersBetweenThirdAndCurrent = usersWithPosition.filter((user, index) => index > 2 && index < currentUserIndex)

    const reorganizedUsers = [...topThree, currentUser, ...usersBetweenThirdAndCurrent, ...usersAfterCurrentUser]

    const uniqueUsers = reorganizedUsers.filter(
      (user, index, self) => index === self.findIndex((u) => u.id === user.id),
    )

    setDisplayUsers(uniqueUsers)
  }

  const statsHeight = useRef(new Animated.Value(isHeaderExpanded ? 1 : 0)).current
  const arrowRotation = useRef(new Animated.Value(isHeaderExpanded ? 0 : 1)).current

  const arrowRotationDegree = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  })

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
      }),
    ]).start()
  }, [isHeaderExpanded])

  const toggleHeader = () => {
    setIsHeaderExpanded(!isHeaderExpanded)
  }

  const renderItem = ({ item, index }: { item: User; index: number }) => {
    const position = item.position || index + 1
    const isCurrentUser = item.id === currentUserId

    const AvatarComponent = avatarComponents[item.avatarSource as keyof typeof avatarComponents] || BigAvatar1

    return (
      <View
        className={`flex-row items-center ${isCurrentUser ? "bg-secondary  mx-1" : "bg-white"
          } rounded-lg mb-3.5 p-3.5 shadow-md`}
        style={
          isCurrentUser
            ? {
              transform: [{ scale: 1.05 }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
              zIndex: 10,
            }
            : {}
        }
      >
        <View className={`${isCurrentUser ? "w-8" : "w-6"} items-center mr-2`}>
          <Text className={`${isCurrentUser ? "text-xl" : "text-lg"} font-bold`}>{position}</Text>
        </View>
        <View
          className={`${isCurrentUser ? "w-12 h-12" : "w-10 h-10"} rounded-lg bg-primary overflow-hidden mr-3 justify-center items-center`}
        >
          <AvatarComponent
            width={isCurrentUser ? 48 : 40}
            height={isCurrentUser ? 48 : 40}
            className={isCurrentUser ? "w-12 h-12" : "w-10 h-10"}
          />
        </View>
        <Text className={`flex-1 ${isCurrentUser ? "text-lg" : "text-base"} font-bold capitalize`}>{item.name}</Text>
        <View className={`flex-row items-center ${isCurrentUser ? "bg-[#333]" : "bg-[#444]"} px-3 py-1.5 rounded`}>
          <Feather name="award" size={isCurrentUser ? 20 : 16} color="#FFA500" />
          <Text className={`text-white font-bold ml-1 ${isCurrentUser ? "text-base" : ""}`}>{item.points}</Text>
        </View>
      </View>
    )
  }

  const userDetailsData: User = {
    points: userData?.points || 0,
    hours: 120,
    consecutiveDays: 25,
    consecutiveCorrect: 10,
    totalConsecutiveDays: 120,
    id: "",
    name: "",
    avatarSource: "",
  }

  // Calculate the max height for the stats container
  const maxStatsHeight = 170

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
    <SafeAreaView className="flex-1 bg-tertiary">
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#F6A608" />

      <View className="bg-primary px-4 rounded-bl-4xl rounded-br-4xl mb-1.5 shadow-md">
        <View className="flex-row justify-between items-center py-5">
          <View className="flex-row items-center">
            <Feather name="award" size={24} color="white" />
            <Text className="text-white text-2xl font-bold ml-2">RANKING</Text>
          </View>
          <TouchableOpacity
            onPress={toggleHeader}
            className="w-8 h-8 bg-tertiary rounded justify-center items-center shadow"
          >
            <Animated.View style={{ transform: [{ rotate: arrowRotationDegree }] }}>
              <Feather name="chevron-up" size={24} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={{
            height: animatedStatsHeight,
            opacity: statsOpacity,
            overflow: "hidden",
          }}
        >
          <Text className="text-white text-base mt-1.5 mb-2">Confira seus resultados detalhados:</Text>

          <View className="mt-2.5 w-full">
            {/* Primeira linha do grid */}
            <View className="flex-row justify-between mb-2.5">
              {/* Item 1 - Onocash */}
              <View className="flex-row items-center bg-white rounded-lg p-2.5 w-[49%] shadow">
                <View className="w-7 h-7 rounded-full bg-[#F0F8FF] justify-center items-center mr-2">
                  <Feather name="award" size={20} color="#4A90E2" />
                </View>
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-[15px] font-bold text-[#4A90E2] mr-1">{userDetailsData.points}</Text>
                  <Text className="text-sm text-gray-500">Onocash</Text>
                </View>
              </View>

              {/* Item 2 - Horas */}
              <View className="flex-row items-center bg-white rounded-lg p-2.5 w-[49%] shadow">
                <View className="w-7 h-7 rounded-full bg-[#F0F8FF] justify-center items-center mr-2">
                  <Feather name="clock" size={20} color="#4A90E2" />
                </View>
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-[15px] font-bold text-[#4A90E2] mr-1">{userDetailsData.hours}</Text>
                  <Text className="text-sm text-gray-500">horas</Text>
                </View>
              </View>
            </View>

            {/* Segunda linha do grid */}
            <View className="flex-row justify-between">
              {/* Item 3 - Dias seguidos */}
              <View className="flex-row items-center bg-white rounded-lg p-2.5 w-[49%] shadow">
                <View className="w-7 h-7 rounded-full bg-[#F0F8FF] justify-center items-center mr-2">
                  <Feather name="calendar" size={20} color="#4A90E2" />
                </View>
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-[15px] font-bold text-[#4A90E2] mr-1">{userDetailsData.consecutiveDays}</Text>
                  <Text className="text-sm text-gray-500">dias seguidos</Text>
                </View>
              </View>

              {/* Item 4 - Total dias seguidos */}
              <View className="flex-row items-center bg-white rounded-lg p-2.5 w-[49%] shadow">
                <View className="w-7 h-7 rounded-full bg-[#F0F8FF] justify-center items-center mr-2">
                  <Feather name="award" size={20} color="#4A90E2" />
                </View>
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-[15px] font-bold text-[#4A90E2] mr-1">
                    {userDetailsData.totalConsecutiveDays}
                  </Text>
                  <Text className="text-sm text-gray-500">dias seguidos</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-base font-bold">Carregando usuários...</Text>
        </View>
      ) : (
        <FlatList
          data={displayUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4 mt-4"
          contentContainerStyle={{ paddingBottom: "35%" }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

export default RankingScreen
