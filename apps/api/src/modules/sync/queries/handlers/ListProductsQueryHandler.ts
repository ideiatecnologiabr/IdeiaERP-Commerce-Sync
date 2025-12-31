import { ListProductsQuery } from '../ListProductsQuery';
import { erpConnectionProvider } from '../../../settings/services/ErpDbConnectionProvider';
import { Produtos, LojaVirtual, ProdutoCaracteristicaProduto } from '../../../../entities/erp';
import { logger } from '../../../../config/logger';

export class ListProductsQueryHandler {
  async handle(query: ListProductsQuery) {
    logger.debug('ListProductsQueryHandler.handle called', {
      lojavirtual_id: query.lojavirtual_id,
      page: query.page,
      limit: query.limit,
      search: query.search,
    });

    // Ensure ERP-DB connection
    await erpConnectionProvider.ensureConnection();
    const erpDataSource = erpConnectionProvider.getDataSource();

    // Primeiro, buscar a loja virtual para obter a caracteristicaproduto_id
    const lojaRepo = erpDataSource.getRepository(LojaVirtual);
    const loja = await lojaRepo.findOne({
      where: {
        lojavirtual_id: query.lojavirtual_id,
        flagexcluido: 0,
      },
    });

    if (!loja) {
      logger.warn(`Loja virtual ${query.lojavirtual_id} not found or inactive`);
      return {
        data: [],
        total: 0,
        page: query.page,
        limit: query.limit,
        totalPages: 0,
      };
    }

    if (!loja.caracteristicaproduto_id) {
      logger.warn(`Loja virtual ${query.lojavirtual_id} has no caracteristicaproduto_id configured`);
      return {
        data: [],
        total: 0,
        page: query.page,
        limit: query.limit,
        totalPages: 0,
      };
    }

    // Buscar produtos através da tabela produtocaracteristicaproduto
    const produtoRepo = erpDataSource.getRepository(Produtos);
    const pcpRepo = erpDataSource.getRepository(ProdutoCaracteristicaProduto);

    const skip = (query.page - 1) * query.limit;

    // Query builder para buscar produtos com a característica da loja virtual
    const qb = produtoRepo
      .createQueryBuilder('p')
      .innerJoin(
        ProdutoCaracteristicaProduto,
        'pcp',
        'pcp.produto_id = p.produto_id'
      )
      .where('p.flagexcluido = 0')
      .andWhere('pcp.caracteristicaproduto_id = :caracteristicaproduto_id', {
        caracteristicaproduto_id: loja.caracteristicaproduto_id,
      })
      .andWhere('pcp.flagexcluido = 0')
      .skip(skip)
      .take(query.limit);

    if (query.search) {
      qb.andWhere('(p.nome LIKE :search OR p.codigo LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}

