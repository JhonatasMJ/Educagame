// src/utils/layoutHelpers.ts

import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export const getAvatarTop = () => {
  if (width >= 1024) {
    return "2%"; 
  } else if (height <= 732) {
    return "0%";
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
