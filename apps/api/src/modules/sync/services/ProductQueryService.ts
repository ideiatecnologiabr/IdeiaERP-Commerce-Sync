import { erpConnectionProvider } from '../../settings/services/ErpDbConnectionProvider';
import { LojaVirtual, Produtos, ProdutoCaracteristicaProduto, ProdutoTabelaPreco, ProdutoEstoque } from '../../../entities/erp';
import { logger } from '../../../config/logger';

export interface ProductSyncData {
  produto: Produtos;
  preco: number;
  estoque: number;
}

export class ProductQueryService {
  /**
   * CRITICAL: Always start with lojavirtual table
   */
  async getLojaVirtual(lojavirtual_id: string): Promise<LojaVirtual | null> {
    // Ensure ERP-DB connection
    await erpConnectionProvider.ensureConnection();
    const erpDataSource = erpConnectionProvider.getDataSource();
    
    const repository = erpDataSource.getRepository(LojaVirtual);

    // Buscar loja virtual não excluída (flagexcluido = 0 ou NULL)
    const loja = await repository
      .createQueryBuilder('lv')
      .where('lv.lojavirtual_id = :lojavirtual_id', { lojavirtual_id })
      .andWhere('(lv.flagexcluido = 0 OR lv.flagexcluido IS NULL)')
      .leftJoinAndSelect('lv.tabelaPreco', 'tabelaPreco')
      .leftJoinAndSelect('lv.estoque', 'estoque')
      .leftJoinAndSelect('lv.caracteristicaProduto', 'caracteristicaProduto')
      .getOne();

    if (!loja) {
      logger.warn(`Loja virtual ${lojavirtual_id} not found or inactive`);
    }

    return loja;
  }

  /**
   * Get products eligible for sync based on lojavirtual.caracteristicaproduto_id
   */
  async getEligibleProducts(lojavirtual_id: string): Promise<ProductSyncData[]> {
    const loja = await this.getLojaVirtual(lojavirtual_id);

    if (!loja || !loja.caracteristicaproduto_id) {
      logger.warn(`Loja ${lojavirtual_id} has no caracteristicaproduto_id configured`);
      return [];
    }

    // Get ERP DataSource
    const erpDataSource = erpConnectionProvider.getDataSource();

    const produtoRepo = erpDataSource.getRepository(Produtos);
    const pcpRepo = erpDataSource.getRepository(ProdutoCaracteristicaProduto);
    const ptpRepo = erpDataSource.getRepository(ProdutoTabelaPreco);
    const peRepo = erpDataSource.getRepository(ProdutoEstoque);

    // Get products with the characteristic
    // Usar o relacionamento TypeORM para fazer o join corretamente
    const produtosComCaracteristica = await pcpRepo
      .createQueryBuilder('pcp')
      .innerJoin('pcp.produto', 'p')
      .where('pcp.caracteristicaproduto_id = :caracteristicaproduto_id', {
        caracteristicaproduto_id: loja.caracteristicaproduto_id,
      })
      .andWhere('pcp.flagexcluido = 0')
      .andWhere('p.flagexcluido = 0')
      .getMany();

    // Extrair produto_id diretamente da entidade (é uma coluna direta de ProdutoCaracteristicaProduto)
    const produtoIds = produtosComCaracteristica.map((pcp) => pcp.produto_id).filter((id) => id != null);

    if (produtoIds.length === 0) {
      return [];
    }

    // Get full product data
    const produtos = await produtoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.marca', 'marca')
      .leftJoinAndSelect('p.categoria', 'categoria')
      .where('p.produto_id IN (:...ids)', { ids: produtoIds })
      .andWhere('p.flagexcluido = 0')
      .getMany();

    // Get prices and stock for each product
    const result: ProductSyncData[] = [];

    for (const produto of produtos) {
      let preco = 0;
      let estoque = 0;

      // Get price from ProdutoTabelaPreco
      if (loja.tabelapreco_id) {
        const precoData = await ptpRepo
          .createQueryBuilder('ptp')
          .where('ptp.produto_id = :produto_id', { produto_id: produto.produto_id })
          .andWhere('ptp.tabelapreco_id = :tabelapreco_id', { tabelapreco_id: loja.tabelapreco_id })
          .andWhere('(ptp.flagexcluido = 0 OR ptp.flagexcluido IS NULL)')
          .getOne();

        if (precoData) {
          // Usar precofinal se disponível, caso contrário usar precovenda
          preco = Number(precoData.precofinal || precoData.precovenda || 0);
        }
      }

      // Get stock from produtoestoque
      // Nota: produtoestoque tem chave primária composta (estoque_id, empresa_id, produto_id)
      if (loja.estoque_id && loja.empresa_id) {
        const estoqueData = await peRepo
          .createQueryBuilder('pe')
          .where('pe.produto_id = :produto_id', { produto_id: produto.produto_id })
          .andWhere('pe.estoque_id = :estoque_id', { estoque_id: loja.estoque_id })
          .andWhere('pe.empresa_id = :empresa_id', { empresa_id: loja.empresa_id })
          .getOne();

        if (estoqueData) {
          estoque = Number(estoqueData.quantidade || 0);
        }
      }

      result.push({
        produto,
        preco,
        estoque,
      });
    }

    return result;
  }

  /**
   * Get a single product by ID with price and stock
   * Returns null if product is not eligible for sync
   */
  async getProductById(lojavirtual_id: string, produto_id: string): Promise<ProductSyncData | null> {
    const loja = await this.getLojaVirtual(lojavirtual_id);

    if (!loja || !loja.caracteristicaproduto_id) {
      logger.warn(`Loja ${lojavirtual_id} has no caracteristicaproduto_id configured`);
      return null;
    }

    // Get ERP DataSource
    const erpDataSource = erpConnectionProvider.getDataSource();

    const produtoRepo = erpDataSource.getRepository(Produtos);
    const pcpRepo = erpDataSource.getRepository(ProdutoCaracteristicaProduto);
    const ptpRepo = erpDataSource.getRepository(ProdutoTabelaPreco);
    const peRepo = erpDataSource.getRepository(ProdutoEstoque);

    // Check if product has the required characteristic
    const produtoComCaracteristica = await pcpRepo
      .createQueryBuilder('pcp')
      .where('pcp.produto_id = :produto_id', { produto_id })
      .andWhere('pcp.caracteristicaproduto_id = :caracteristicaproduto_id', {
        caracteristicaproduto_id: loja.caracteristicaproduto_id,
      })
      .andWhere('pcp.flagexcluido = 0')
      .getOne();

    if (!produtoComCaracteristica) {
      logger.warn(`Product ${produto_id} does not have required characteristic`, {
        produto_id,
        caracteristicaproduto_id: loja.caracteristicaproduto_id,
      });
      return null;
    }

    // Get full product data
    const produto = await produtoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.marca', 'marca')
      .leftJoinAndSelect('p.categoria', 'categoria')
      .where('p.produto_id = :produto_id', { produto_id })
      .andWhere('p.flagexcluido = 0')
      .getOne();

    if (!produto) {
      logger.warn(`Product ${produto_id} not found or is deleted`);
      return null;
    }

    let preco = 0;
    let estoque = 0;

    // Get price from ProdutoTabelaPreco
    if (loja.tabelapreco_id) {
      const precoData = await ptpRepo
        .createQueryBuilder('ptp')
        .where('ptp.produto_id = :produto_id', { produto_id })
        .andWhere('ptp.tabelapreco_id = :tabelapreco_id', { tabelapreco_id: loja.tabelapreco_id })
        .andWhere('(ptp.flagexcluido = 0 OR ptp.flagexcluido IS NULL)')
        .getOne();

      if (precoData) {
        // Usar precofinal se disponível, caso contrário usar precovenda
        preco = Number(precoData.precofinal || precoData.precovenda || 0);
      }
    }

    // Get stock from produtoestoque
    if (loja.estoque_id && loja.empresa_id) {
      const estoqueData = await peRepo
        .createQueryBuilder('pe')
        .where('pe.produto_id = :produto_id', { produto_id })
        .andWhere('pe.estoque_id = :estoque_id', { estoque_id: loja.estoque_id })
        .andWhere('pe.empresa_id = :empresa_id', { empresa_id: loja.empresa_id })
        .getOne();

      if (estoqueData) {
        estoque = Number(estoqueData.quantidade || 0);
      }
    }

    return {
      produto,
      preco,
      estoque,
    };
  }

  /**
   * Get products that need sync (dataalterado changed)
   */
  async getProductsNeedingSync(lojavirtual_id: string, since?: Date): Promise<ProductSyncData[]> {
    const loja = await this.getLojaVirtual(lojavirtual_id);

    if (!loja) {
      return [];
    }

    const allProducts = await this.getEligibleProducts(lojavirtual_id);

    if (!since) {
      return allProducts;
    }

    // Filter by dataalterado
    return allProducts.filter((item) => {
      if (!item.produto.dataalterado) {
        return true; // Include if no dataalterado (needs initial sync)
      }
      return new Date(item.produto.dataalterado) >= since;
    });
  }
}

