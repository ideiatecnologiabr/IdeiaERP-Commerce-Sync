import { CommercePlatformAdapter, ProductDTO, OrderDTO, OrderFilters } from '../ports/CommercePlatformAdapter';
import { PlatformConfig } from '../ports/PlatformConfig';
import { logger } from '../../../config/logger';

export class OpenCartAdapter implements CommercePlatformAdapter {
  private baseUrl: string;
  private apiKey: string;
  private apiUser?: string | null;

  constructor(config: PlatformConfig) {
    if (!config.baseUrl) {
      throw new Error('OpenCart baseUrl is required');
    }
    if (!config.apiKey) {
      throw new Error('OpenCart apiKey is required');
    }

    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.apiUser = config.apiUser;
  }

  async createProduct(data: ProductDTO): Promise<string> {
    logger.info('Creating product in OpenCart', { nome: data.nome });

    // TODO: Implement OpenCart API call
    // POST /api/rest/products
    // Headers: X-Oc-Restadmin-Id, Authorization
    // Body: product data

    const response = await fetch(`${this.baseUrl}/api/rest/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Oc-Restadmin-Id': this.apiKey,
      },
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
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }

    const result = await response.json() as { product_id?: number };
    return result.product_id?.toString() || '';
  }

  async updateProduct(id: string, data: ProductDTO): Promise<void> {
    logger.info('Updating product in OpenCart', { id, nome: data.nome });

    // TODO: Implement OpenCart API call
    // PUT /api/rest/products/{id}

    const response = await fetch(`${this.baseUrl}/api/rest/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Oc-Restadmin-Id': this.apiKey,
      },
      body: JSON.stringify({
        name: data.nome,
        description: data.descricao || '',
        model: data.codigo || '',
        price: data.preco,
        quantity: data.estoque,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }
  }

  async syncStock(id: string, quantity: number): Promise<void> {
    logger.info('Syncing stock in OpenCart', { id, quantity });

    // TODO: Implement OpenCart API call
    // PATCH /api/rest/products/{id}
    // Update only quantity field

    const response = await fetch(`${this.baseUrl}/api/rest/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Oc-Restadmin-Id': this.apiKey,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }
  }

  async syncPrice(id: string, price: number): Promise<void> {
    logger.info('Syncing price in OpenCart', { id, price });

    // TODO: Implement OpenCart API call
    // PATCH /api/rest/products/{id}
    // Update only price field

    const response = await fetch(`${this.baseUrl}/api/rest/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Oc-Restadmin-Id': this.apiKey,
      },
      body: JSON.stringify({ price }),
    });

    if (!response.ok) {
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }
  }

  async getOrders(filters: OrderFilters): Promise<OrderDTO[]> {
    logger.info('Getting orders from OpenCart', { filters });

    // TODO: Implement OpenCart API call
    // GET /api/rest/orders
    // Query params: status, date_added, limit, page

    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.since) params.append('date_added', filters.since.toISOString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const response = await fetch(`${this.baseUrl}/api/rest/orders?${params}`, {
      method: 'GET',
      headers: {
        'X-Oc-Restadmin-Id': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }

    const result = await response.json() as { orders?: OrderDTO[] };
    // TODO: Map OpenCart order format to OrderDTO
    return result.orders || [];
  }

  async getOrderById(id: string): Promise<OrderDTO> {
    logger.info('Getting order from OpenCart', { id });

    // TODO: Implement OpenCart API call
    // GET /api/rest/orders/{id}

    const response = await fetch(`${this.baseUrl}/api/rest/orders/${id}`, {
      method: 'GET',
      headers: {
        'X-Oc-Restadmin-Id': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`OpenCart API error: ${response.statusText}`);
    }

    const result = await response.json() as { order: OrderDTO };
    // TODO: Map OpenCart order format to OrderDTO
    return result.order;
  }
}

