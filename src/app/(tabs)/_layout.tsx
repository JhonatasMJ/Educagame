"use client"
import  React from "react"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { Tabs } from "expo-router"
import { View, Animated, Pressable, StyleSheet } from "react-native"
import { useRef, useEffect } from "react"
import { FontAwesome6 } from "@expo/vector-icons"
import { useEditMode } from "@/src/context/EditableContext"

interface TabBarButtonProps {
  accessibilityState: { selected: boolean }
  onPress: () => void
}

interface TabButtonProps {
  icon: React.ReactNode
  isFocused: boolean
  onPress: () => void
}

function TabButton({ icon, isFocused, onPress }: TabButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const bgOpacityAnim = useRef(new Animated.Value(0)).current
  const { handleNavigationWithCheck } = useEditMode()

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.1 : 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacityAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }, [isFocused])

  // Wrap the onPress with our edit mode check
  const handlePress = () => {
    handleNavigationWithCheck(onPress)
  }

  return (
    <Pressable onPress={handlePress} style={styles.tabButtonContainer}>
      <Animated.View style={[styles.tabButtonBackground, { opacity: bgOpacityAnim }]} />
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Animated.View>
      {isFocused && <View style={styles.activeIndicator} />}
    </Pressable>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#EAAE00",
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingHorizontal: "5%",
          borderWidth: 5,
          borderColor: "#606060",
          backgroundColor: "#606060",
          height: 72,
          overflow: "hidden",
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 10, // Increased from 4
          zIndex: 1000, // Added to ensure it stays on top
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarButton: (props: TabBarButtonProps) => (
            <TabButton
              isFocused={props.accessibilityState.selected}
              onPress={props.onPress}
              icon={
                <MaterialCommunityIcons
                  name="target"
                  size={32}
                  color={props.accessibilityState.selected ? "#EAAE00" : "#FFFFFF"}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarButton: (props: TabBarButtonProps) => (
            <TabButton
              isFocused={props.accessibilityState.selected}
              onPress={props.onPress}
              icon={
                <FontAwesome size={32} name="user" color={props.accessibilityState.selected ? "#EAAE00" : "#FFFFFF"} />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Ranking",
          tabBarButton: (props: TabBarButtonProps) => (
            <TabButton
              isFocused={props.accessibilityState.selected}
              onPress={props.onPress}
              icon={
                <FontAwesome6
                  size={23.5}
                  name="ranking-star"
                  color={props.accessibilityState.selected ? "#EAAE00" : "#FFFFFF"}
                />
              }
            />
          ),
        }}
      />
      {/*  <Tabs.Screen
        name="Ia"
        options={{
          title: "Chat",
          tabBarButton: (props: TabBarButtonProps) => (
            <TabButton
              isFocused={props.accessibilityState.selected}
              onPress={props.onPress}
              icon={
                <Ionicons
                  name="chatbubbles-sharp"
                  size={32}
                  color={props.accessibilityState.selected ? "#EAAE00" : "#FFFFFF"}
                />
              }
            />
          ),
        }}
      /> */}
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    marginHorizontal: 10,
  },
  tabButtonBackground: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#505050",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -8,
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#EAAE00",
  },
})
