import { CommercePlatformAdapter, ProductDTO, OrderDTO, OrderFilters, HealthCheckResult } from '../ports/CommercePlatformAdapter';
import { PlatformConfig } from '../ports/PlatformConfig';
import { TokenManager } from '../services/TokenManager';
import { AuthAdapter, LoginCredentials } from '../ports/AuthAdapter';
import { logger } from '../../../config/logger';
import { appDataSource } from '../../../config/database';
import { SyncMapping } from '../../../entities/app/SyncMapping';

interface OpenCartProductDescription {
  language_id: number;
  name: string;
  description?: string;
  meta_title: string;
}

interface OpenCartProduct {
  product_description: OpenCartProductDescription[];
  model: string;
  sku?: string;
  price: string;
  special?: string;
  quantity: string;
  status: number; // 0=Inativo, 1=Ativo
  weight?: string;
  manufacturer_id?: number;
  product_store?: number[];
  product_category?: number[];
  product_id?: number;
}

interface OpenCartResponse {
  success: boolean;
  data?: {
    product_id: number;
    message: string;
  };
  error?: string[];
}

export class OpenCartAdapter implements CommercePlatformAdapter {
  private baseUrl: string;
  private apiKey?: string; // Legacy, may not be needed with token auth
  private apiUser?: string | null;
  private config: PlatformConfig;
  private tokenManager: TokenManager;
  private authAdapter: AuthAdapter | null;
  private lojavirtual_id: string;
  private accessToken: string | null = null;
  private integracao_id: number | null; 

  constructor(
    config: PlatformConfig,
    tokenManager: TokenManager,
    authAdapter: AuthAdapter | null,
    lojavirtual_id: string,
    integracao_id?: number
  ) {
    if (!config.baseUrl) {
      throw new Error('OpenCart baseUrl is required');
    }

    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.apiUser = config.apiUser;
    this.config = config;
    this.tokenManager = tokenManager;
    this.authAdapter = authAdapter;
    this.lojavirtual_id = lojavirtual_id;
    this.integracao_id = integracao_id ?? null;
  }

  /**
   * Ensure we have a valid access token before making API calls
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.authAdapter) {
      throw new Error('Authentication adapter not configured. Username and password required.');
    }

    if (!this.accessToken) {
      const credentials: LoginCredentials = {
        username: this.config.username || '',
        password: this.config.password || '',
      };

      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required for OpenCart authentication');
      }

      const token = await this.tokenManager.getValidToken(
        this.lojavirtual_id,
        'opencart',
        this.authAdapter,
        credentials
      );

      if (!token) {
        throw new Error('Failed to obtain access token');
      }

      this.accessToken = token;
    }
  }

  /**
   * Make authenticated API request with automatic token refresh on 401
   */
  private async makeRequest(
    url: string,
    options: RequestInit = {},
    retryOn401: boolean = true
  ): Promise<Response> {
    await this.ensureAuthenticated();

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      ...options.headers,
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If 401 and retry enabled, try to refresh token and retry once
    if (response.status === 401 && retryOn401 && this.authAdapter) {
      logger.warn('Received 401, attempting token refresh', { url });
      
      // Clear current token to force refresh
      this.accessToken = null;
      
      // Get new token
      await this.ensureAuthenticated();
      
      // Retry request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });
    }

    return response;
  }

  private toOpenCartProduct(data: ProductDTO): OpenCartProduct {
    return {
      product_description: [
        {
          language_id: 2, // Default to Portuguese (configured via constant or env?)
          name: data.nome,
          description: data.descricao || '',
          meta_title: data.nome,
        }
      ],
      model: data.codigo || 'N/A',
      sku: data.codigo,
      price: data.preco.toFixed(2),
      quantity: data.estoque.toString(),
      status: 1, // Always active by default on create?
      product_store: this.integracao_id !== null ? [this.integracao_id] : [0]
      // TODO: Map categories, Manufacturer, etc.
    };
  }

  async createProduct(data: ProductDTO): Promise<string> {
    if (!data.codigo) {
      throw new Error('Product code (model) is required for creation/mapping');
    }

    logger.info('Processing product for OpenCart', { nome: data.nome, codigo: data.codigo });

    const mappingRepo = appDataSource.getRepository(SyncMapping);    
    
    const existingMapping = await mappingRepo.findOne({
      where: {
        lojavirtual_id: this.lojavirtual_id,
        entidade: 'product',
        erp_id: data.codigo, 
        platform: 'opencart'
      }
    });

    if (existingMapping) {
      logger.info('Product already mapped, updating instead of creating', { 
        erp_id: data.codigo, 
        platform_id: existingMapping.platform_id 
      });
      await this.updateProduct(existingMapping.platform_id, data, Number(existingMapping.platform_id));
      return existingMapping.platform_id;
    }

    const openCartProduct = this.toOpenCartProduct(data);
    
    logger.info('Creating new product in OpenCart', { payload: openCartProduct });

    const response = await this.makeRequest(`${this.baseUrl}/index.php?route=api_ocft/admin/products/add`, {
      method: 'POST',
      body: JSON.stringify(openCartProduct),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenCart createProduct error', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }

    const result = await response.json() as OpenCartResponse;

    if (!result.success || !result.data?.product_id) {
       logger.error('OpenCart createProduct failed business validation', { result });
       throw new Error('Failed to create product in OpenCart: ' + (result.error?.join(', ') || 'Unknown error'));
    }

    const platformId = result.data.product_id.toString();

    // Create mapping
    const newMapping = mappingRepo.create({
      lojavirtual_id: this.lojavirtual_id,
      entidade: 'product',
      erp_id: data.codigo,
      platform_id: platformId,
      platform: 'opencart'
    });

    await mappingRepo.save(newMapping);
    logger.info('Product created and mapped successfully', { platformId });

    return platformId;
  }

  async updateProduct(id: string, data: ProductDTO, productPlatformId: number): Promise<void> {
    logger.info('Updating product in OpenCart', { id, nome: data.nome });
    
    const openCartProduct = this.toOpenCartProduct(data);
    openCartProduct.product_id = productPlatformId;

    const response = await this.makeRequest(`${this.baseUrl}/index.php?route=api_ocft/admin/products/edit`, {
      method: 'PUT',
      body: JSON.stringify(openCartProduct),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenCart updateProduct error', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }
  }

  async syncStock(id: string, quantity: number): Promise<void> {
    logger.info('Syncing stock in OpenCart', { id, quantity });

    const response = await this.makeRequest(`${this.baseUrl}/api/rest/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenCart syncStock error', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }
  }

  async syncPrice(id: string, price: number): Promise<void> {
    logger.info('Syncing price in OpenCart', { id, price });

    const response = await this.makeRequest(`${this.baseUrl}/api/rest/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ price }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenCart syncPrice error', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }
  }

  async getOrders(filters: OrderFilters): Promise<OrderDTO[]> {
    logger.info('Getting orders from OpenCart', { filters });

    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.since) params.append('date_added', filters.since.toISOString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const response = await this.makeRequest(`${this.baseUrl}/api/rest/orders?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenCart getOrders error', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }

    const result = await response.json() as { orders?: OrderDTO[] };
    // TODO: Map OpenCart order format to OrderDTO
    return result.orders || [];
  }

  async getOrderById(id: string): Promise<OrderDTO> {
    logger.info('Getting order from OpenCart', { id });

    const response = await this.makeRequest(`${this.baseUrl}/api/rest/orders/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenCart getOrderById error', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }

    const result = await response.json() as { order: OrderDTO };
    // TODO: Map OpenCart order format to OrderDTO
    return result.order;
  }

  async checkHealth(): Promise<HealthCheckResult> {
    logger.info('Checking OpenCart health', { baseUrl: this.baseUrl });

    try {
      if (!this.authAdapter) {
        return { online: false, error: 'Autenticação não configurada' };
      }

      const credentials: LoginCredentials = {
        username: this.config.username || '',
        password: this.config.password || '',
      };

      if (!credentials.username || !credentials.password) {
        return { online: false, error: 'Credenciais não configuradas' };
      }

      // Try to login to verify credentials
      const timeoutPromise = new Promise<HealthCheckResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Health check timeout'));
        }, 5000);
      });

      const loginPromise = this.authAdapter.login(credentials).then(() => {
        return { online: true } as HealthCheckResult;
      }).catch((error: any) => {
        return {
          online: false,
          error: error.message || 'Erro ao fazer login',
        } as HealthCheckResult;
      });

      const result = await Promise.race([loginPromise, timeoutPromise]);
      return result;
    } catch (error: any) {
      logger.error('OpenCart health check error', {
        baseUrl: this.baseUrl,
        error: error.message,
      });

      if (error.message === 'Health check timeout') {
        return { online: false, error: 'Timeout: a conexão demorou mais de 5 segundos' };
      }

      return { online: false, error: error.message || 'Erro de conexão' };
    }
  }
}
