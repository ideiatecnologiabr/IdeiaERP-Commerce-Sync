/**
 * Configuration interface for e-commerce platform adapters
 * Contains connection details from lojavirtual table
 */
export interface PlatformConfig {
  /** Base URL of the platform API (from lojavirtual.urlbase) */
  baseUrl: string;
  
  /** API Key for authentication (from lojavirtual.apikey) - legacy, may be used for some platforms */
  apiKey?: string;
  
  /** API User for authentication (from lojavirtual.apiuser) - optional */
  apiUser?: string | null;

  /** Username for login authentication */
  username?: string;

  /** Password for login authentication */
  password?: string;

  /** Custom login endpoint (e.g., 'api_ocft/admin/auth/login') */
  loginEndpoint?: string;

  /** Custom refresh token endpoint */
  refreshEndpoint?: string;

  /** ID of the integration (from lojavirtual.integracao_id) */
  integracao_id?: number | null;
}


