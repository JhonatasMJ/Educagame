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
  