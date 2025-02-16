import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Touchable,
  TouchableOpacity,
} from "react-native";
import BigAvatar1 from "../../../assets/images/grande-avatar1.svg";
import BigAvatar2 from "../../../assets/images/grande-avatar2.svg";
import BigAvatar3 from "../../../assets/images/grande-avatar3.svg";
import BigAvatar4 from "../../../assets/images/grande-avatar4.svg";
import { useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

const { height, width } = Dimensions.get("window");

const bigAvatarMapping: Record<string, React.FC<any>> = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
};

const Profile = () => {
  const { avatarId, avatarSource } = useLocalSearchParams<{
    avatarId: string;
    avatarSource: string;
  }>();
  const SelectedBigAvatar = avatarSource
    ? bigAvatarMapping[avatarSource]
    : null;

  // Animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Create more dramatic movement for the avatar
  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -250], // Move much further up to ensure it goes off-screen
    extrapolate: "clamp",
  });

  const avatarScale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.7],
    extrapolate: "clamp",
  });

  const avatarOpacity = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.4],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        pointerEvents="auto"
        style={[
          styles.avatarContainer,
          {
            transform: [
              { translateY: avatarTranslateY },
              { scale: avatarScale },
            ],
            opacity: avatarOpacity,
            zIndex: 2,
          },
        ]}
      >
        <BigAvatar1 style={styles.avatar} width={200} height={350} />
      </Animated.View>

      <Animated.ScrollView
        style={[styles.scrollView, { zIndex: 15 }]} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View
          style={styles.statsContainerWrapper}
          className="flex-1 w-full  rounded-3xl bg-zinc-700 "
        ></View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#56A6DC",
  },
  avatarContainer: {
    width: "100%",
    position: "absolute",
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  scrollView: {
    zIndex: 3,
  },

  avatar: {
    marginTop: "6.7%",
    zIndex: 2,
  },

  statsContainerWrapper: {
    top: height * 0.32,
    minHeight: height * 0.7,
  },
});

export default Profile;
