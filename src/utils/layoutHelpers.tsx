// src/utils/layoutHelpers.ts

import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export const getAvatarTop = () => {
  if (width >= 1024 && width <= 1799) {
    return "2%"; 
  } else if (width >= 770 && width <= 819) {
    return "18%";
  } else if (width >= 820 && width <= 1020) {
    return "16%";
  } else if (height <= 732) {
    return "0%";
  } else if (width >= 1800) {
    return "12%";
  } else {
    return "10%";
  }
};

export const bottomHeight = () => {
  if (width >= 940) {
    return "4%"; 
  } else {
    return "8%";
  }
};
