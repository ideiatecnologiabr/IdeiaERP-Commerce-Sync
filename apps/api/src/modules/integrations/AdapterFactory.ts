import { CommercePlatformAdapter } from './ports/CommercePlatformAdapter';
import { PlatformConfig } from './ports/PlatformConfig';
import { OpenCartAdapter } from './opencart/OpenCartAdapter';
import { VtexAdapter } from './vtex/VtexAdapter';
import { TokenManager } from './services/TokenManager';
import { AuthAdapter } from './ports/AuthAdapter';
import { OpenCartAuthAdapter } from './opencart/OpenCartAuthAdapter';
import { logger } from '../../config/logger';

export type PlatformType = 'opencart' | 'vtex';

export interface LojaConfig {
  lojavirtual_id: string;
  plataforma_nome: string | null;
  urlbase: string | null;
  apikey?: string | null;
  apiuser?: string | null;
}

export class AdapterFactory {
  /**
   * Create a platform adapter from LojaVirtual data
   * This is the recommended way to create adapters from database entities
   */
  static createFromLoja(loja: LojaConfig): CommercePlatformAdapter {
    // Validate required fields
    if (!loja.plataforma_nome) {
      throw new Error(`Loja ${loja.lojavirtual_id} has no plataforma_nome configured`);
    }
    if (!loja.urlbase) {
      throw new Error(`Loja ${loja.lojavirtual_id} has no urlbase configured`);
    }

    const platform = this.getPlatformType(loja.plataforma_nome);
    
    const platformConfig: PlatformConfig = {
      baseUrl: loja.urlbase,
      apiKey: loja.apikey || undefined,
      apiUser: loja.apiuser || undefined,
      username: loja.apiuser || undefined,
      password: loja.apikey || undefined,
      loginEndpoint: platform === 'opencart' ? 'api_ocft/admin/auth/login' : undefined,
    };

    const tokenManager = new TokenManager();
    
    return this.create(platform, platformConfig, tokenManager, loja.lojavirtual_id);
  }

  /**
   * Get normalized platform type from plataforma_nome
   */
  private static getPlatformType(plataforma_nome: string): PlatformType {
    const normalized = plataforma_nome.toLowerCase().trim();
    
    if (normalized.includes('opencart') || normalized.includes('open-cart')) {
      return 'opencart';
    }
    
    if (normalized.includes('vtex')) {
      return 'vtex';
    }

    // Default to opencart
    logger.warn(`Platform name "${plataforma_nome}" not recognized, defaulting to opencart`);
    return 'opencart';
  }

  /**
   * Create a platform adapter with configuration from lojavirtual
   * @param platform - Platform type (opencart, vtex)
   * @param config - Platform configuration (baseUrl, apiKey, apiUser, username, password)
   * @param tokenManager - Token manager instance for handling authentication
   * @param lojavirtual_id - ID of the virtual store (for token storage)
   * @returns Platform adapter instance
   */
  static create(
    platform: PlatformType,
    config: PlatformConfig,
    tokenManager: TokenManager,
    lojavirtual_id: string
  ): CommercePlatformAdapter {
    if (!config.baseUrl) {
      throw new Error(`Platform ${platform} requires baseUrl configuration`);
    }

    // Create auth adapter for the platform
    let authAdapter: AuthAdapter | null = null;
    if (config.username && config.password) {
      switch (platform) {
        case 'opencart':
          authAdapter = new OpenCartAuthAdapter(config);
          break;
        case 'vtex':
          // VTEX auth adapter not implemented yet
          break;
      }
    }

    switch (platform) {
      case 'opencart':
        return new OpenCartAdapter(config, tokenManager, authAdapter, lojavirtual_id);
      case 'vtex':
        return new VtexAdapter(config, tokenManager, authAdapter, lojavirtual_id);
      default:
        logger.error(`Unknown platform: ${platform}`);
        throw new Error(`Platform ${platform} not supported`);
    }
  }
}




