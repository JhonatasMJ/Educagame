export interface Etapa  {
  id: string;
  titulo: string;
  descricao: string;
  concluida: boolean;
  icone?: string;
};

export interface Trilha  {
  id: string;
  nome: string;
  descricao: string;
  etapas: Etapa[];
};


export interface User {
  id?: string;
  nome?: string;
  email?: string;
  phone?: string;
  sobrenome?: string;
  avatarSource?: string;
  points?: number;
}