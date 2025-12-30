import { SyncCatalogCommand } from '../SyncCatalogCommand';
import { logger } from '../../../../config/logger';
import { ProductQueryService } from '../../services/ProductQueryService';
import { AdapterFactory } from '../../../integrations/AdapterFactory';
import { ProductDTO } from '../../../integrations/ports/CommercePlatformAdapter';

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


      // 5. Create adapter with platform configuration
      const adapter = AdapterFactory.createFromLoja(loja);

      logger.debug('Adapter created', {
        platform: loja.plataforma_nome,
        baseUrl: loja.urlbase,
      });


      // 6. Sync products via adapter
      let successCount = 0;
      let errorCount = 0;

      logger.info('Starting product sync', { total: products.length });

      for (const productData of products) {
        try {
          const productDTO: ProductDTO = {
            nome: productData.produto.nome || 'Sem nome',
            descricao: productData.produto.descricaodetalhada_web || productData.produto.descricaoresumida_web || undefined,
            codigo: productData.produto.codigo || undefined,
            preco: productData.preco,
            estoque: productData.estoque,
            categoria: productData.produto.categoria?.nome || undefined,
            marca: productData.produto.marca?.nome || undefined,
          };

          // This already saves to SyncMapping (local app DB)
          const platformId = await adapter.createProduct(productDTO);
          
          successCount++;
          logger.debug('Product synced successfully', {
            produto_id: productData.produto.produto_id,
            codigo: productData.produto.codigo,
            platform_id: platformId,
          });
        } catch (error: any) {
          errorCount++;
          logger.error('Error syncing product', {
            produto_id: productData.produto.produto_id,
            codigo: productData.produto.codigo,
            error: error.message,
          });
        }
      }

      logger.info('Catalog sync completed', {
        lojavirtual_id: command.lojavirtual_id,
        total: products.length,
        success: successCount,
        errors: errorCount,
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
}

