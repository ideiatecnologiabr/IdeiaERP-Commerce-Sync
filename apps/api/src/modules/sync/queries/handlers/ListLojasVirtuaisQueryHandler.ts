import { ListLojasVirtuaisQuery } from '../ListLojasVirtuaisQuery';
import { erpConnectionProvider } from '../../../settings/services/ErpDbConnectionProvider';
import { LojaVirtual } from '../../../../entities/erp';
import { executeQueryWithErrorHandling, formatDatabaseQueryError } from '../../../../shared/utils/databaseErrorFormatter';
import { logger } from '../../../../config/logger';

export class ListLojasVirtuaisQueryHandler {
  async handle(query: ListLojasVirtuaisQuery) {
    // Ensure ERP-DB connection
    await erpConnectionProvider.ensureConnection();
    const erpDataSource = erpConnectionProvider.getDataSource();
    
    const repository = erpDataSource.getRepository(LojaVirtual);
    
    const qb = repository.createQueryBuilder('lv');

    // Filtrar por flagexcluido
    // Se ativas = true (padrão): apenas lojas não excluídas
    // Se ativas = false: todas as lojas (incluindo excluídas)
    if (query.ativas) {
      // Apenas lojas ativas: flagexcluido = 0 ou NULL (considera ambos como "não excluído")
      qb.where('(lv.flagexcluido = 0 OR lv.flagexcluido IS NULL )');
    } else {
      // Todas as lojas, sem filtro de exclusão
      // Não aplica nenhum filtro
    }

    try {
      const data = await qb.getMany();
      return { data };
    } catch (error: any) {
      // Formatar erro de forma amigável
      const friendlyMessage = formatDatabaseQueryError(
        error,
        'Listagem de Lojas Virtuais (ListLojasVirtuaisQueryHandler)'
      );
      
      logger.error('Error listing lojas virtuais', {
        error: error.message,
        code: error.code,
        sql: error.sql,
      });
      
      // Re-lançar o erro para que o chamador possa tratá-lo
      throw error;
    }
  }
}

