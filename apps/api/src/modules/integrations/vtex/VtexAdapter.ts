import { CommercePlatformAdapter, ProductDTO, OrderDTO, OrderFilters, HealthCheckResult } from '../ports/CommercePlatformAdapter';
import { PlatformConfig } from '../ports/PlatformConfig';
import { TokenManager } from '../services/TokenManager';
import { AuthAdapter } from '../ports/AuthAdapter';
import { logger } from '../../../config/logger';

export class VtexAdapter implements CommercePlatformAdapter {
  private baseUrl: string;
  private apiKey?: string;
  private apiUser?: string | null;
  private config: PlatformConfig;
  private tokenManager: TokenManager;
  private authAdapter: AuthAdapter | null;
  private lojavirtual_id: string;

  constructor(
    config: PlatformConfig,
    tokenManager: TokenManager,
    authAdapter: AuthAdapter | null,
    lojavirtual_id: string
  ) {
    if (!config.baseUrl) {
      throw new Error('VTEX baseUrl is required');
    }

    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.apiUser = config.apiUser;
    this.config = config;
    this.tokenManager = tokenManager;
    this.authAdapter = authAdapter;
    this.lojavirtual_id = lojavirtual_id;
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

  async checkHealth(): Promise<HealthCheckResult> {
    logger.warn('VTEX adapter health check not implemented yet');
    return { online: false, error: 'VTEX adapter not implemented' };
  }
}




