// BigAvatar.tsx
import React from 'react';

// Importação dos SVGs dos avatares grandes
import BigAvatar1 from "../../assets/images/grande-avatar1.svg";
import BigAvatar2 from "../../assets/images/grande-avatar2.svg";
import BigAvatar3 from "../../assets/images/grande-avatar3.svg";
import BigAvatar4 from "../../assets/images/grande-avatar4.svg";

// Mapeamento: associa uma string a cada componente SVG
const bigAvatarMapping: Record<string, React.FC<any>> = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
};

interface BigAvatarProps {
    avatarSource: string;
    style?: any;
  }
  
  const BigAvatar: React.FC<BigAvatarProps> = ({ avatarSource, style }) => {
    const width = 232;
    const height = 350;
    const SelectedBigAvatar = bigAvatarMapping[avatarSource];
  
    if (!SelectedBigAvatar) return null;
  
    return <SelectedBigAvatar width={width} height={height} style={style} />;
  };
export default BigAvatar;
