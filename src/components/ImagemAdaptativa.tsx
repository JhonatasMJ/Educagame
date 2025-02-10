/* import React from 'react';
import { Image, Platform } from 'react-native';

// Mapeamento de imagens
const imagensMap = {
  'logo': require('../../assets/images/logo.png'), // Ajuste este caminho conforme sua estrutura de projeto
  'avatar1': require('../../assets/images/avatar1.png'),
  'avatar2': require('../../assets/images/avatar2.png'),
  'avatar3': require('../../assets/images/avatar3.png'),
  'avatar4': require('../../assets/images/avatar4.png'),
};


interface ImagemAdptativaProps { 
    source: string;
    nome: keyof typeof imagensMap; 
    caminhoLocal?: string;
    estilo: any;
    caminhoBundled?: string;
    modoRedimensionamento?: 'contain' | 'cover';
}
const ImagemAdaptativa = ({ 
  nome, 
  caminhoLocal, 
  caminhoBundled, 
  estilo, 
  modoRedimensionamento = 'contain',

} : ImagemAdptativaProps) => {

  let fonteImagem;

  if (nome && imagensMap[nome]) {
   
    fonteImagem = imagensMap[nome];
  } else if (caminhoLocal) {
    // Tenta caminho local
    try {
      fonteImagem = typeof caminhoLocal === 'string' 
        ? { uri: caminhoLocal }
        : caminhoLocal;
    } catch (error) {
      console.warn('Erro ao carregar imagem local:', error);
    }
  } else if (caminhoBundled) {
    // Tenta caminho bundled
    try {
      fonteImagem = typeof caminhoBundled === 'string' 
        ? { uri: caminhoBundled }
        : caminhoBundled;
    } catch (error) {
      console.warn('Erro ao carregar imagem bundled:', error);
    }
  }


  if (!fonteImagem) {
    fonteImagem = { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==' };
  }

  return (
    <Image
    source={typeof fonteImagem === 'object' && fonteImagem.uri ? fonteImagem : { uri: '' }}
    style={estilo}
    resizeMode={modoRedimensionamento}

    />
  );
};

export default ImagemAdaptativa; */