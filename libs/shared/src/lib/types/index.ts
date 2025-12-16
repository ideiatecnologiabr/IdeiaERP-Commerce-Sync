// Shared types between frontend and backend

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Usuario {
  usuario_id: number;
  nome: string;
  email: string;
  privilegiado?: number;
}

export interface LojaVirtual {
  lojavirtual_id: number;
  nome: string;
  urlbase?: string;
  tabelapreco_id?: number;
  estoque_id?: number;
  caracteristicaproduto_id?: number;
}

export interface Produto {
  produto_id: number;
  nome: string;
  codigo?: string;
  descricao?: string;
  integracao_id?: string;
}

export interface SyncLog {
  sync_log_id: number;
  lojavirtual_id: number;
  tipo: string;
  acao: string;
  entidade: string;
  status: 'success' | 'error' | 'warning';
  mensagem?: string;
  datacadastro: Date;
}



