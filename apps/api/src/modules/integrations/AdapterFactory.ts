import { CommercePlatformAdapter } from './ports/CommercePlatformAdapter';
import { PlatformConfig } from './ports/PlatformConfig';
import { OpenCartAdapter } from './opencart/OpenCartAdapter';
import { VtexAdapter } from './vtex/VtexAdapter';
import { logger } from '../../config/logger';

export type PlatformType = 'opencart' | 'vtex';

export class AdapterFactory {
  /**
   * Create a platform adapter with configuration from lojavirtual
   * @param platform - Platform type (opencart, vtex)
   * @param config - Platform configuration (baseUrl, apiKey, apiUser)
   * @returns Platform adapter instance
   */
  static create(platform: PlatformType, config: PlatformConfig): CommercePlatformAdapter {
    if (!config.baseUrl) {
      throw new Error(`Platform ${platform} requires baseUrl configuration`);
    }
    if (!config.apiKey) {
      throw new Error(`Platform ${platform} requires apiKey configuration`);
    }

    switch (platform) {
      case 'opencart':
        return new OpenCartAdapter(config);
      case 'vtex':
        return new VtexAdapter(config);
      default:
        logger.error(`Unknown platform: ${platform}`);
        throw new Error(`Platform ${platform} not supported`);
    }
  }
}



