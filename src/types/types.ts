export interface Etapa  {
    id: string;
    titulo: string;
    descricao: string;
    concluida: boolean;
  };
  
  export interface Trilha  {
    id: string;
    nome: string;
    descricao: string;
    etapas: Etapa[];
  };
  
  
  export interface User {
    id?: string;
    displayName?: string;
    email?: string;
  }