import React from 'react';
import { Image } from 'react-native';

const imagensMap = {
  logo: require('../../assets/images/logo.png'),
  avatar1: require('../../assets/images/avatar1.png'),
  avatar2: require('../../assets/images/avatar2.png'),
  avatar3: require('../../assets/images/avatar3.png'),
  avatar4: require('../../assets/images/avatar4.png'),
};

interface ImagemAdaptativaProps {
  nome: keyof typeof imagensMap;
  caminhoLocal?: string;
  caminhoBundled?: string;
  modoRedimensionamento?: 'contain' | 'cover';
  className?: string; // Agora pode ser usado com NativeWind
}

const ImagemAdaptativa = ({
  nome,
  caminhoLocal,
  caminhoBundled,
  modoRedimensionamento = 'contain',
  className,
}: ImagemAdaptativaProps) => {
  let fonteImagem = imagensMap[nome] || null;

  if (!fonteImagem) {
    if (caminhoLocal) {
      fonteImagem = { uri: caminhoLocal };
    } else if (caminhoBundled) {
      fonteImagem = { uri: caminhoBundled };
    } else {
      fonteImagem = require('../../assets/images/logo.png');
    }
  }

  return <Image source={fonteImagem} resizeMode={modoRedimensionamento} className={className} />;
};

export default ImagemAdaptativa;
