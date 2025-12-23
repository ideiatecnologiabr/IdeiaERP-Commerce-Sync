import { CommercePlatformAdapter, ProductDTO, OrderDTO, OrderFilters, HealthCheckResult } from '../ports/CommercePlatformAdapter';
import { PlatformConfig } from '../ports/PlatformConfig';
import { TokenManager } from '../services/TokenManager';
import { AuthAdapter, LoginCredentials } from '../ports/AuthAdapter';
import { logger } from '../../../config/logger';

export class OpenCartAdapter implements CommercePlatformAdapter {
  private baseUrl: string;
  private apiKey?: string; // Legacy, may not be needed with token auth
  private apiUser?: string | null;
  private config: PlatformConfig;
  private tokenManager: TokenManager;
  private authAdapter: AuthAdapter | null;
  private lojavirtual_id: string;
  private accessToken: string | null = null;

  constructor(
    config: PlatformConfig,
    tokenManager: TokenManager,
    authAdapter: AuthAdapter | null,
    lojavirtual_id: string
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

  async createProduct(data: ProductDTO): Promise<string> {
    logger.info('Creating product in OpenCart', { nome: data.nome });

    const response = await this.makeRequest(`${this.baseUrl}/api/rest/products`, {
      method: 'POST',
      body: JSON.stringify({
        name: data.nome,
        description: data.descricao || '',
        model: data.codigo || '',
        price: data.preco,
        quantity: data.estoque,
        status: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenCart createProduct error', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }

    const result = await response.json() as { product_id?: number };
    return result.product_id?.toString() || '';
  }

  async updateProduct(id: string, data: ProductDTO): Promise<void> {
    logger.info('Updating product in OpenCart', { id, nome: data.nome });

    const response = await this.makeRequest(`${this.baseUrl}/api/rest/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: data.nome,
        description: data.descricao || '',
        model: data.codigo || '',
        price: data.preco,
        quantity: data.estoque,
      }),
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
