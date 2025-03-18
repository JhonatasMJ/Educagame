import { Book, Code, PlayCircle, CheckCircle } from "lucide-react-native"; // importando ícones
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
        concluida: true,
      },
      {
        id: '1-2',
        titulo: 'Componentes Básicos',
        descricao: 'Aprenda sobre View, Text, Image e outros componentes',
        concluida: false,
      },
      {
        id: '1-3',
        titulo: 'Componentes Básicos',
        descricao: 'Aprenda sobre View, Text, Image e outros componentes',
        concluida: false,
      },
      {
        id: '1-4',
        titulo: 'Componaentes Básicos',
        descricao: 'Aprenda sobre View, Text, Image e outros componentes',
        concluida: false,
      },
      {
        id: '1-5',
        titulo: 'Componwentes Básicos',
        descricao: 'Aprenda sobre View, Text, Image e outros componentes',
        concluida: false,
      },
      {
        id: '1-6',
        titulo: 'Componeentes Básicos',
        descricao: 'Aprenda sobre View, Text, Image e outros componentes',
        concluida: false,
      },
      {
        id: '1-7',
        titulo: 'Componentses Básicos',
        descricao: 'Aprenda sobre View, Text, Image e outros componentes',
        concluida: false,
      },
      {
        id: '1-8',
        titulo: 'Componewntes Básicos',
        descricao: 'Apreenda sobre View, Text, Image e outros componentes',
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
  {
    id: '3',
    nome: 'React Básico',
    descricao: 'Aprenda os conceitos básicos de React',
    etapas: [
      {
        id: '3-1',
        titulo: 'Introdução ao React',
        descricao: 'Configuração do ambiente e conceitos iniciais',
        concluida: false,
      },
      {
        id: '3-2',
        titulo: 'JSX e Componentes',
        descricao: 'Entenda a sintaxe JSX e crie componentes simples',
        concluida: false,
      },
      {
        id: '3-3',
        titulo: 'Props e State',
        descricao: 'Entenda a comunicação entre componentes com props e estado',
        concluida: false,
      },
    ],
  },
  {
    id: '4',
    nome: 'React Avançado',
    descricao: 'Aprofundamento no React',
    etapas: [
      {
        id: '4-1',
        titulo: 'Hooks em React',
        descricao: 'Compreenda o uso de hooks como useState, useEffect, etc.',
        concluida: false,
      },
      {
        id: '4-2',
        titulo: 'Context API',
        descricao: 'Gerencie o estado global com Context API',
        concluida: false,
      },
      {
        id: '4-3',
        titulo: 'React Router',
        descricao: 'Navegação entre páginas com React Router',
        concluida: false,
      },
    ],
  },
  {
    id: '5',
    nome: 'Redux Básico',
    descricao: 'Aprenda o básico sobre Redux',
    etapas: [
      {
        id: '5-1',
        titulo: 'O que é Redux?',
        descricao: 'Entenda o conceito e fluxo de dados com Redux',
        concluida: false,
      },
      {
        id: '5-2',
        titulo: 'Actions e Reducers',
        descricao: 'Aprenda a criar Actions e Reducers em Redux',
        concluida: false,
      },
      {
        id: '5-3',
        titulo: 'Middleware e Thunk',
        descricao: 'Entenda como usar middleware e redux-thunk para requisições assíncronas',
        concluida: false,
      },
    ],
  },
  {
    id: '6',
    nome: 'Firebase no React Native',
    descricao: 'Integração do Firebase com React Native',
    etapas: [
      {
        id: '6-1',
        titulo: 'Configuração do Firebase',
        descricao: 'Configure o Firebase no seu projeto React Native',
        concluida: false,
      },
      {
        id: '6-2',
        titulo: 'Autenticação',
        descricao: 'Implemente autenticação usando o Firebase Auth',
        concluida: false,
      },
      {
        id: '6-3',
        titulo: 'Firestore',
        descricao: 'Salve e recupere dados com o Firebase Firestore',
        concluida: false,
      },
    ],
  },
  {
    id: '7',
    nome: 'Node.js Básico',
    descricao: 'Fundamentos do Node.js para backend',
    etapas: [
      {
        id: '7-1',
        titulo: 'Introdução ao Node.js',
        descricao: 'Configure o ambiente e aprenda os conceitos do Node.js',
        concluida: false,
      },
      {
        id: '7-2',
        titulo: 'Módulos no Node.js',
        descricao: 'Aprenda a usar módulos nativos do Node.js',
        concluida: false,
      },
      {
        id: '7-3',
        titulo: 'Express.js',
        descricao: 'Crie APIs RESTful com o Express.js',
        concluida: false,
      },
    ],
  },
  {
    id: '8',
    nome: 'Express e MongoDB',
    descricao: 'Aprofundamento em Express.js e banco de dados MongoDB',
    etapas: [
      {
        id: '8-1',
        titulo: 'MongoDB Basics',
        descricao: 'Aprenda como funciona o MongoDB e como conectar ao banco',
        concluida: false,
      },
      {
        id: '8-2',
        titulo: 'CRUD com Express',
        descricao: 'Implemente operações CRUD com Express e MongoDB',
        concluida: false,
      },
    ],
  },
  {
    id: '9',
    nome: 'TypeScript para React',
    descricao: 'Aprenda TypeScript aplicando em projetos React',
    etapas: [
      {
        id: '9-1',
        titulo: 'Introdução ao TypeScript',
        descricao: 'Entenda os conceitos básicos do TypeScript',
        concluida: false,
      },
      {
        id: '9-2',
        titulo: 'Tipando Componentes React',
        descricao: 'Aprenda a tipar componentes React com TypeScript',
        concluida: false,
      },
    ],
  },
  {
    id: '10',
    nome: 'Design Systems',
    descricao: 'Crie e implemente sistemas de design no React Native',
    etapas: [
      {
        id: '10-1',
        titulo: 'Introdução ao Design System',
        descricao: 'Compreenda o conceito e as vantagens de usar um design system',
        concluida: false,
      },
      {
        id: '10-2',
        titulo: 'Componentes Reutilizáveis',
        descricao: 'Crie componentes reutilizáveis e bem estilizados',
        concluida: false,
      },
      {
        id: '10-3',
        titulo: 'Integração com Storybook',
        descricao: 'Aprenda a usar o Storybook para visualizar e documentar seus componentes',
        concluida: false,
      },
    ],
  },
  {
    id: '11',
    nome: 'APIs RESTful',
    descricao: 'Aprenda a construir e consumir APIs RESTful',
    etapas: [
      {
        id: '11-1',
        titulo: 'Conceitos de APIs',
        descricao: 'Compreenda os conceitos de REST e HTTP',
        concluida: false,
      },
      {
        id: '11-2',
        titulo: 'Criação de API com Express',
        descricao: 'Construa uma API simples utilizando Express.js',
        concluida: false,
      },
    ],
  },
  {
    id: '12',
    nome: 'UI/UX Design para Mobile',
    descricao: 'Conceitos e práticas de UI/UX para mobile',
    etapas: [
      {
        id: '12-1',
        titulo: 'Introdução ao UI/UX',
        descricao: 'Aprenda os conceitos de design de interface e experiência do usuário',
        concluida: false,
      },
      {
        id: '12-2',
        titulo: 'Wireframes e Protótipos',
        descricao: 'Crie wireframes e protótipos com ferramentas como Figma',
        concluida: false,
      },
    ],
  },
];
