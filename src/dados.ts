import { Trilha } from "./types/types";

export const trilhas: Trilha[] = [
    {
      id: '1',
      nome: 'React Native Básico',
      descricao: 'Aprenda os fundamentos do React Native',
      etapas: [
        {
          id: '1-1',
          titulo: 'Introdução ao React Native',
          descricao: 'Conceitos básicos e configuração do ambiente',
          concluida: false,
        },
        {
          id: '1-2',
          titulo: 'Componentes Básicos',
          descricao: 'Aprenda sobre View, Text, Image e outros componentes',
          concluida: false,
        },
      ],
    },
    {
      id: '2',
      nome: 'React Native Avançado',
      descricao: 'Aprofunde seus conhecimentos',
      etapas: [
        {
          id: '2-1',
          titulo: 'Navegação',
          descricao: 'Implementação de diferentes tipos de navegação',
          concluida: false,
        },
        {
          id: '2-2',
          titulo: 'Estado e Context',
          descricao: 'Gerenciamento de estado global',
          concluida: false,
        },
      ],
    },
  ];