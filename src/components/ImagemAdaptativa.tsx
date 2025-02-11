import React from 'react';
import { Image } from 'react-native';

// Mapeamento de imagens locais
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
  estilo?: object;
  caminhoBundled?: string;
  modoRedimensionamento?: 'contain' | 'cover';
}

const ImagemAdaptativa = ({
  nome,
  caminhoLocal,
  caminhoBundled,
  estilo,
  modoRedimensionamento = 'contain',
}: ImagemAdaptativaProps) => {
  let fonteImagem = imagensMap[nome] || null;

  // Se não encontrar no mapeamento, tenta outros caminhos
  if (!fonteImagem) {
    if (caminhoLocal) {
      fonteImagem = { uri: caminhoLocal };
    } else if (caminhoBundled) {
      fonteImagem = { uri: caminhoBundled };
    } else {
      // Fallback para um placeholder
      fonteImagem = require('../../assets/images/logo.png');
    }
  }

  return <Image source={fonteImagem} style={estilo} resizeMode={modoRedimensionamento} />;
};

export default ImagemAdaptativa;
