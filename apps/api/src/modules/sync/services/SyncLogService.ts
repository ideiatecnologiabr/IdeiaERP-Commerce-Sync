import { appDataSource } from '../../../config/database';
import { SyncLog } from '../../../entities/app';
import { logger } from '../../../config/logger';

export interface LogEntry {
  lojavirtual_id: string;
  tipo: string;
  acao: string;
  entidade: string;
  entidade_id?: string;
  status: 'success' | 'error' | 'warning';
  mensagem?: string;
  detalhes?: any;
}

export class SyncLogService {
  async log(entry: LogEntry): Promise<SyncLog> {
    const repository = appDataSource.getRepository(SyncLog);

    const log = repository.create({
      lojavirtual_id: entry.lojavirtual_id,
      tipo: entry.tipo,
      acao: entry.acao,
      entidade: entry.entidade,
      entidade_id: entry.entidade_id || null,
      status: entry.status,
      mensagem: entry.mensagem || null,
      detalhes: entry.detalhes ? JSON.stringify(entry.detalhes) : null,
    });

    const saved = await repository.save(log);

    // Also log to winston
    const logLevel = entry.status === 'error' ? 'error' : entry.status === 'warning' ? 'warn' : 'info';
    logger[logLevel](entry.mensagem || `${entry.acao} ${entry.entidade}`, {
      lojavirtual_id: entry.lojavirtual_id,
      tipo: entry.tipo,
      entidade_id: entry.entidade_id,
    });

    return saved;
  }

  async getLogs(lojavirtual_id?: number, tipo?: string, limit: number = 100): Promise<SyncLog[]> {
    const repository = appDataSource.getRepository(SyncLog);
    
    const qb = repository.createQueryBuilder('log')
      .orderBy('log.datacadastro', 'DESC')
      .take(limit);

    if (lojavirtual_id) {
      qb.where('log.lojavirtual_id = :lojavirtual_id', { lojavirtual_id });
    }

    if (tipo) {
      qb.andWhere('log.tipo = :tipo', { tipo });
    }

    return qb.getMany();
  }
}

