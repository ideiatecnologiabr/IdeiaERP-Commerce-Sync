import { SyncStockCommand } from '../SyncStockCommand';
import { logger } from '../../../../config/logger';
import { ProductQueryService } from '../../services/ProductQueryService';
import { AdapterFactory, PlatformType } from '../../../integrations/AdapterFactory';
import { PlatformConfig } from '../../../integrations/ports/PlatformConfig';
import { TokenManager } from '../../../integrations/services/TokenManager';
import { OpenCartAuthAdapter } from '../../../integrations/opencart/OpenCartAuthAdapter';

export class SyncStockCommandHandler {
  async handle(command: SyncStockCommand): Promise<void> {
    logger.info(`Starting stock sync for loja ${command.lojavirtual_id}`, {
      lojavirtual_id: command.lojavirtual_id,
      force: command.force,
    });

    try {
      const productQueryService = new ProductQueryService();

      // 1. Load lojavirtual
      const loja = await productQueryService.getLojaVirtual(command.lojavirtual_id);

      if (!loja) {
        logger.error(`Loja virtual ${command.lojavirtual_id} not found or inactive`);
        return;
      }

      // Validate platform configuration
      if (!loja.plataforma_nome) {
        logger.error(`Loja virtual ${command.lojavirtual_id} has no plataforma_nome configured`);
        return;
      }

      if (!loja.urlbase) {
        logger.error(`Loja virtual ${command.lojavirtual_id} has no urlbase configured`);
        return;
      }

      if (!loja.apikey) {
        logger.error(`Loja virtual ${command.lojavirtual_id} has no apikey configured`);
        return;
      }

      // 2. Create adapter with platform configuration
      const platform = this.getPlatformType(loja.plataforma_nome);
      const platformConfig: PlatformConfig = {
        baseUrl: loja.urlbase,
        apiKey: loja.apikey || undefined,
        apiUser: loja.apiuser || undefined,
        username: loja.apiuser || undefined,
        password: loja.apikey || undefined,
        loginEndpoint: 'api_ocft/admin/auth/login',
      };

      // Create token manager and auth adapter
      const tokenManager = new TokenManager();
      const authAdapter = platform === 'opencart' 
        ? new OpenCartAuthAdapter(platformConfig)
        : null;

      const adapter = AdapterFactory.create(platform, platformConfig, tokenManager, command.lojavirtual_id);

      // TODO: Steps 3-4 will be implemented later
      // 3. Get products with integracao_id
      // 4. Get stock from produtoestoque
      // 5. Sync via adapter

      logger.info(`Stock sync completed for loja ${command.lojavirtual_id}`);
    } catch (error: any) {
      logger.error('Error during stock sync', {
        lojavirtual_id: command.lojavirtual_id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  private getPlatformType(plataforma_nome: string): PlatformType {
    const normalized = plataforma_nome.toLowerCase().trim();
    
    if (normalized.includes('opencart') || normalized.includes('open-cart')) {
      return 'opencart';
    }
    
    if (normalized.includes('vtex')) {
      return 'vtex';
    }

    return 'opencart';
  }
}

