import { appDataSource } from '../../../config/database';
import { SyncLock } from '../../../entities/app';
import { logger } from '../../../config/logger';

export class SyncLockService {
  private readonly LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  async acquireLock(lojavirtual_id: string, tipo: string): Promise<boolean> {
    const repository = appDataSource.getRepository(SyncLock);
    const processId = `${process.pid}-${Date.now()}`;

    // Clean expired locks
    await this.cleanExpiredLocks(lojavirtual_id, tipo);

    // Check if lock exists
    const existingLock = await repository.findOne({
      where: {
        lojavirtual_id,
        tipo,
      },
    });

    if (existingLock && new Date(existingLock.expires_at) > new Date()) {
      logger.warn(`Lock already exists for loja ${lojavirtual_id}, tipo ${tipo}`);
      return false;
    }

    // Create new lock
    const lock = repository.create({
      lojavirtual_id,
      tipo,
      process_id: processId,
      expires_at: new Date(Date.now() + this.LOCK_DURATION_MS),
    });

    await repository.save(lock);
    logger.info(`Lock acquired for loja ${lojavirtual_id}, tipo ${tipo}`, { processId });

    return true;
  }

  async releaseLock(lojavirtual_id: string, tipo: string): Promise<void> {
    const repository = appDataSource.getRepository(SyncLock);
    
    await repository.delete({
      lojavirtual_id,
      tipo,
    });

    logger.info(`Lock released for loja ${lojavirtual_id}, tipo ${tipo}`);
  }

  private async cleanExpiredLocks(lojavirtual_id: string, tipo: string): Promise<void> {
    const repository = appDataSource.getRepository(SyncLock);
    
    await repository
      .createQueryBuilder()
      .delete()
      .where('lojavirtual_id = :lojavirtual_id', { lojavirtual_id })
      .andWhere('tipo = :tipo', { tipo })
      .andWhere('expires_at < :now', { now: new Date() })
      .execute();
  }
}

