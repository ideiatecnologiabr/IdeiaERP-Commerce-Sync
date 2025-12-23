import { CommercePlatformAdapter } from './ports/CommercePlatformAdapter';
import { PlatformConfig } from './ports/PlatformConfig';
import { OpenCartAdapter } from './opencart/OpenCartAdapter';
import { VtexAdapter } from './vtex/VtexAdapter';
import { TokenManager } from './services/TokenManager';
import { AuthAdapter } from './ports/AuthAdapter';
import { OpenCartAuthAdapter } from './opencart/OpenCartAuthAdapter';
import { logger } from '../../config/logger';

export type PlatformType = 'opencart' | 'vtex';

export class AdapterFactory {
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




