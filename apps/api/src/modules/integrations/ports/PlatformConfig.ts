/**
 * Configuration interface for e-commerce platform adapters
 * Contains connection details from lojavirtual table
 */
export interface PlatformConfig {
  /** Base URL of the platform API (from lojavirtual.urlbase) */
  baseUrl: string;
  
  /** API Key for authentication (from lojavirtual.apikey) */
  apiKey: string;
  
  /** API User for authentication (from lojavirtual.apiuser) - optional */
  apiUser?: string | null;
}
