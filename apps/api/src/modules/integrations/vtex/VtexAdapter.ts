import { CommercePlatformAdapter, ProductDTO, OrderDTO, OrderFilters } from '../ports/CommercePlatformAdapter';
import { PlatformConfig } from '../ports/PlatformConfig';
import { logger } from '../../../config/logger';

export class VtexAdapter implements CommercePlatformAdapter {
  private baseUrl: string;
  private apiKey: string;
  private apiUser?: string | null;

  constructor(config: PlatformConfig) {
    if (!config.baseUrl) {
      throw new Error('VTEX baseUrl is required');
    }
    if (!config.apiKey) {
      throw new Error('VTEX apiKey is required');
    }

    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.apiUser = config.apiUser;
  }

  // Stub implementation for future VTEX integration

  async createProduct(data: ProductDTO): Promise<string> {
    logger.warn('VTEX adapter not implemented yet', { nome: data.nome });
    throw new Error('VTEX adapter not implemented');
  }

  async updateProduct(id: string, data: ProductDTO): Promise<void> {
    logger.warn('VTEX adapter not implemented yet', { id });
    throw new Error('VTEX adapter not implemented');
  }

  async syncStock(id: string, quantity: number): Promise<void> {
    logger.warn('VTEX adapter not implemented yet', { id });
    throw new Error('VTEX adapter not implemented');
  }

  async syncPrice(id: string, price: number): Promise<void> {
    logger.warn('VTEX adapter not implemented yet', { id });
    throw new Error('VTEX adapter not implemented');
  }

  async getOrders(filters: OrderFilters): Promise<OrderDTO[]> {
    logger.warn('VTEX adapter not implemented yet', { filters });
    throw new Error('VTEX adapter not implemented');
  }

  async getOrderById(id: string): Promise<OrderDTO> {
    logger.warn('VTEX adapter not implemented yet', { id });
    throw new Error('VTEX adapter not implemented');
  }
}



