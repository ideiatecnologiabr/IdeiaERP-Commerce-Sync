import { DashboardQuery } from '../DashboardQuery';
import { appDataSource } from '../../../../config/database';
import { SyncLog } from '../../../../entities/app';

export class DashboardQueryHandler {    
  async handle(query: DashboardQuery) {
    const logRepository = appDataSource.getRepository(SyncLog);

    const qb = logRepository.createQueryBuilder('log');
    
    if (query.lojavirtual_id) {
      qb.where('log.lojavirtual_id = :lojavirtual_id', {
        lojavirtual_id: query.lojavirtual_id,
      });
    }

    const totalSyncs = await qb.getCount();
    const successSyncs = await qb.clone()
      .andWhere('log.status = :status', { status: 'success' })
      .getCount();
    const errorSyncs = await qb.clone()
      .andWhere('log.status = :status', { status: 'error' })
      .getCount();

    const recentLogs = await logRepository.find({
      take: 10,
      order: { datacadastro: 'DESC' },
    });

    return {
      stats: {
        totalSyncs,
        successSyncs,
        errorSyncs,
        successRate: totalSyncs > 0 ? (successSyncs / totalSyncs) * 100 : 0,
      },
      recentLogs,
    };
  }
}

