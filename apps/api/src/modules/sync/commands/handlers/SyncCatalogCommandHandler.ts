import { SyncCatalogCommand } from '../SyncCatalogCommand';
import { logger } from '../../../../config/logger';
import { ProductQueryService } from '../../services/ProductQueryService';
import { AdapterFactory, PlatformType } from '../../../integrations/AdapterFactory';
import { PlatformConfig } from '../../../integrations/ports/PlatformConfig';

export class SyncCatalogCommandHandler {
  async handle(command: SyncCatalogCommand): Promise<void> {
    logger.info(`Starting catalog sync for loja ${command.lojavirtual_id}`, {
      lojavirtual_id: command.lojavirtual_id,
      force: command.force,
    });

    try {
      const productQueryService = new ProductQueryService();

      // 1. Load lojavirtual
      logger.debug('Step 1: Loading loja virtual', { lojavirtual_id: command.lojavirtual_id });
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

      logger.info('Loja virtual loaded', {
        lojavirtual_id: loja.lojavirtual_id,
        nome: loja.nome,
        plataforma_nome: loja.plataforma_nome,
        caracteristicaproduto_id: loja.caracteristicaproduto_id,
        tabelapreco_id: loja.tabelapreco_id,
        estoque_id: loja.estoque_id,
      });

      // 2. Get products by caracteristicaproduto_id
      // 3. Get prices from ProdutoTabelaPreco (included in getEligibleProducts)
      // 4. Get stock from produtoestoque (included in getEligibleProducts)
      logger.debug('Step 2-4: Getting eligible products with prices and stock');
      const products = await productQueryService.getEligibleProducts(command.lojavirtual_id);

      logger.info(`Found ${products.length} products eligible for sync`, {
        lojavirtual_id: command.lojavirtual_id,
        productCount: products.length,
      });

      // Log sample of products for debugging
      if (products.length > 0) {
        logger.debug('Sample products', {
          firstProduct: {
            produto_id: products[0].produto.produto_id,
            nome: products[0].produto.nome,
            codigo: products[0].produto.codigo,
            preco: products[0].preco,
            estoque: products[0].estoque,
          },
        });
      }

      // 5. Create adapter with platform configuration
      const platform = this.getPlatformType(loja.plataforma_nome);
      const platformConfig: PlatformConfig = {
        baseUrl: loja.urlbase,
        apiKey: loja.apikey,
        apiUser: loja.apiuser || undefined,
      };

      const adapter = AdapterFactory.create(platform, platformConfig);

      logger.debug('Adapter created', {
        platform,
        baseUrl: loja.urlbase,
      });

      // TODO: Steps 6-7 will be implemented later
      // 6. Sync via adapter (create/update)
      // 7. Update integracao_id via sync_mapping

      logger.info(`Catalog sync completed for loja ${command.lojavirtual_id}`, {
        productsProcessed: products.length,
      });
    } catch (error: any) {
      logger.error('Error during catalog sync', {
        lojavirtual_id: command.lojavirtual_id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get normalized platform type from plataforma_nome
   */
  private getPlatformType(plataforma_nome: string): PlatformType {
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
}

