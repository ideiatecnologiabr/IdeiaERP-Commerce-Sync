export interface ProductDTO {
  nome: string;
  descricao?: string;
  codigo?: string;
  preco: number;
  estoque: number;
  categoria?: string;
  marca?: string;
  imagens?: string[];
  atributos?: Record<string, any>;
}

export interface OrderDTO {
  order_id: string;
  status: string;
  total: number;
  currency: string;
  customer: {
    nome: string;
    email: string;
    telefone?: string;
  };
  items: OrderItemDTO[];
  shipping_address?: AddressDTO;
  billing_address?: AddressDTO;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemDTO {
  product_id: string;
  sku: string;
  nome: string;
  quantidade: number;
  preco: number;
}

export interface AddressDTO {
  rua: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais?: string;
}

export interface OrderFilters {
  status?: string;
  since?: Date;
  limit?: number;
  page?: number;
}

export interface CommercePlatformAdapter {
  createProduct(data: ProductDTO): Promise<string>;
  updateProduct(id: string, data: ProductDTO): Promise<void>;
  syncStock(id: string, quantity: number): Promise<void>;
  syncPrice(id: string, price: number): Promise<void>;
  getOrders(filters: OrderFilters): Promise<OrderDTO[]>;
  getOrderById(id: string): Promise<OrderDTO>;
}



