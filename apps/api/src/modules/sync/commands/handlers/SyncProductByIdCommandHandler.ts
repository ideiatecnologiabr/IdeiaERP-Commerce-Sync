import { SyncProductByIdCommand } from '../SyncProductByIdCommand';
import { logger } from '../../../../config/logger';
import { ProductQueryService } from '../../services/ProductQueryService';
import { MappingService } from '../../services/MappingService';
import { AdapterFactory } from '../../../integrations/AdapterFactory';
import { ProductDTO } from '../../../integrations/ports/CommercePlatformAdapter';

export class SyncProductByIdCommandHandler {
  async handle(command: SyncProductByIdCommand): Promise<void> {
    logger.info(`Starting product sync for produto ${command.produto_id}`, {
      lojavirtual_id: command.lojavirtual_id,
      produto_id: command.produto_id,
    });

    try {
      const productQueryService = new ProductQueryService();
      const mappingService = new MappingService();

      // 1. Load lojavirtual
      logger.debug('Step 1: Loading loja virtual', { lojavirtual_id: command.lojavirtual_id });
      const loja = await productQueryService.getLojaVirtual(command.lojavirtual_id);

      if (!loja) {
        const errorMsg = `Loja virtual ${command.lojavirtual_id} not found or inactive`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Validate platform configuration
      if (!loja.plataforma_nome) {
        const errorMsg = `Loja virtual ${command.lojavirtual_id} has no plataforma_nome configured`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      if (!loja.urlbase) {
        const errorMsg = `Loja virtual ${command.lojavirtual_id} has no urlbase configured`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      if (!loja.apikey) {
        const errorMsg = `Loja virtual ${command.lojavirtual_id} has no apikey configured`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      logger.info('Loja virtual loaded', {
        lojavirtual_id: loja.lojavirtual_id,
        nome: loja.nome,
        plataforma_nome: loja.plataforma_nome,
        caracteristicaproduto_id: loja.caracteristicaproduto_id,
        tabelapreco_id: loja.tabelapreco_id,
        estoque_id: loja.estoque_id,
      });

      // 2. Get product by ID with price and stock
      logger.debug('Step 2: Getting product data', { produto_id: command.produto_id });
      const productData = await productQueryService.getProductById(
        command.lojavirtual_id,
        command.produto_id
      );

      if (!productData) {
        const errorMsg = `Product ${command.produto_id} not found or not eligible for sync`;
        logger.error(errorMsg, {
          produto_id: command.produto_id,
          lojavirtual_id: command.lojavirtual_id,
        });
        throw new Error(errorMsg);
      }

      logger.info('Product data loaded', {
        produto_id: productData.produto.produto_id,
        codigo: productData.produto.codigo,
        nome: productData.produto.nome,
        preco: productData.preco,
        estoque: productData.estoque,
      });

      // 3. Check if product already exists in platform (via SyncMapping)
      logger.debug('Step 3: Checking if product exists in platform');
      const existingPlatformId = await mappingService.getPlatformId(
        command.lojavirtual_id,
        'product',
        command.produto_id
      );

      logger.debug('Platform mapping check', {
        produto_id: command.produto_id,
        existingPlatformId,
        action: existingPlatformId ? 'update' : 'create',
      });

      // 4. Create adapter with platform configuration
      logger.debug('Step 4: Creating platform adapter', { platform: loja.plataforma_nome });
      const adapter = AdapterFactory.createFromLoja(loja);

      // 5. Build ProductDTO
      const productDTO: ProductDTO = {
        nome: productData.produto.nome || 'Sem nome',
        descricao: productData.produto.descricaodetalhada_web || productData.produto.descricaoresumida_web || undefined,
        codigo: productData.produto.codigo || undefined,
        preco: productData.preco,
        estoque: productData.estoque,
        categoria: productData.produto.categoria?.nome || undefined,
        marca: productData.produto.marca?.nome || undefined,
      };

      // 6. Sync product (create or update)
      if (existingPlatformId) {
        // Update existing product
        logger.info('Updating existing product in platform', {
          produto_id: command.produto_id,
          platform_id: existingPlatformId,
        });

        await adapter.updateProduct(
          command.produto_id,
          productDTO,
          parseInt(existingPlatformId)
        );

        logger.info('Product updated successfully', {
          produto_id: command.produto_id,
          codigo: productData.produto.codigo,
          platform_id: existingPlatformId,
        });
      } else {
        // Create new product
        logger.info('Creating new product in platform', {
          produto_id: command.produto_id,
        });

        const platformId = await adapter.createProduct(productDTO);

        logger.info('Product created successfully', {
          produto_id: command.produto_id,
          codigo: productData.produto.codigo,
          platform_id: platformId,
        });
      }

      logger.info('Product sync completed successfully', {
        lojavirtual_id: command.lojavirtual_id,
        produto_id: command.produto_id,
        action: existingPlatformId ? 'update' : 'create',
      });

    } catch (error: any) {
      logger.error('Error during product sync', {
        lojavirtual_id: command.lojavirtual_id,
        produto_id: command.produto_id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

