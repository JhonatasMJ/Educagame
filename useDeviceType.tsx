// useDeviceType.js
import { useState, useEffect } from "react";
import { Platform, Dimensions } from "react-native";

const useDeviceType = () => {
  const dimensions = Dimensions.get("window");
  const MOBILE_BREAKPOINT = 768;

  const [deviceInfo] = useState({
    isDesktop:
      (Platform.OS === "web" || Platform.OS === "windows") &&
      dimensions.width > MOBILE_BREAKPOINT,
    isMobileDevice: dimensions.width <= MOBILE_BREAKPOINT,
    screenWidth: dimensions.width,
  });

  return deviceInfo;
};

export default useDeviceType;
