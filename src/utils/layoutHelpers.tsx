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
    return "2%";
  } else if (width >= 1800) {
    return "12%";
  } else {
    return "10%";
  }
};

export const bottomHeight = () => {
  if (width >= 940) {
    return "1%"; 
  }else if (height <= 732) {
    return "-2%";
   } else {
    return 0;
  }

};

export const bottomHeight1 = () => {
  if (width >= 940) {
    return "1%"; 
  }else if (height <= 732) {
    return "10%";
   } else {
    return 0;
  }



};

export const avatarSize = () => {
  if (width >= 1024 && width <= 1400) {
    return 150;
    } else if (width >= 1450){ 
      return 180;
  }
    else if (width >= 770 && width <= 819) {
      return 150;
    } else if (height <= 732) {
      return 150;
     } else{
      return 150;
     }
}
