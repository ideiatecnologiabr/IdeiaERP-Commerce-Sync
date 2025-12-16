import { ListLogsQuery } from '../ListLogsQuery';
import { appDataSource } from '../../../../config/database';
import { SyncLog } from '../../../../entities/app';

export class ListLogsQueryHandler {
  async handle(query: ListLogsQuery) {
    const repository = appDataSource.getRepository(SyncLog);
    
    const skip = (query.page - 1) * query.limit;
    const qb = repository.createQueryBuilder('log')
      .skip(skip)
      .take(query.limit)
      .orderBy('log.datacadastro', 'DESC');

    if (query.lojavirtual_id) {
      qb.where('log.lojavirtual_id = :lojavirtual_id', {
        lojavirtual_id: query.lojavirtual_id,
      });
    }

    if (query.tipo) {
      qb.andWhere('log.tipo = :tipo', { tipo: query.tipo });
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

