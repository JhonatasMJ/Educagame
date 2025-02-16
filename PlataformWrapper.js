import React from "react";
import { View, Platform, Dimensions, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import useDeviceType from "./useDeviceType";

export const MOBILE_WIDTH = 435; // Variável exportada

const PlatformWrapper = ({ children }) => {
  const { isDesktop, isMobileDevice, screenWidth } = useDeviceType();
  const screenHeight = Dimensions.get("window").height;

  // Se for dispositivo móvel (nativo ou web) ou tela pequena
  if (isMobileDevice || !isDesktop) {
    return (
      <SafeAreaProvider>
        <View style={styles.fullScreenContainer}>
          {Platform.OS === "web" ? (
            <SafeAreaView style={styles.container}>{children}</SafeAreaView>
          ) : (
            <View style={styles.container}>{children}</View>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  // Layout desktop (apenas web)
  return (
    <SafeAreaProvider>
      <View style={styles.desktopContainer}>
        <View
          style={[
            styles.mobileSimulator,
            {
              width: Math.min(screenWidth, MOBILE_WIDTH),
              height: Platform.OS === "web" ? "100vh" : screenHeight,
              borderRadius: Platform.OS === "web" ? 15 : 0,
            },
          ]}
        >
          {Platform.OS === "web" ? (
            <SafeAreaView style={styles.container}>{children}</SafeAreaView>
          ) : (
            <View style={styles.container}>{children}</View>
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3185BE",
  },
  fullScreenContainer: {
    flex: 1,
    width: "100%",
    height: Platform.OS === "web" ? "100vh" : "100%",
    backgroundColor: "#3185BE",
  },
  desktopContainer: {
    flex: 1,
    height: Platform.OS === "web" ? "100vh" : "100%",
    width: "100%",
    backgroundColor: "#3185BE",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" && {
      zIndex: 1,
      overflow: "visible",
    }),
  },
  mobileSimulator: {
    backgroundColor: "#fff",
    ...(Platform.OS === "web" && {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 5,
      overflow: "hidden",
    }),
  },
});

export default PlatformWrapper;
