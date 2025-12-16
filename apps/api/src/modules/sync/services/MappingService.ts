import { appDataSource } from '../../../config/database';
import { SyncMapping } from '../../../entities/app';
import { logger } from '../../../config/logger';

export class MappingService {
  async getPlatformId(lojavirtual_id: string, entidade: string, erp_id: string): Promise<string | null> {
    const repository = appDataSource.getRepository(SyncMapping);

    const mapping = await repository.findOne({
      where: {
        lojavirtual_id,
        entidade,
        erp_id: erp_id.toString(),
      },
    });

    return mapping?.platform_id || null;
  }

  async setMapping(
    lojavirtual_id: string,
    entidade: string,
    erp_id: string,
    platform_id: string,
    platform: string
  ): Promise<SyncMapping> {
    const repository = appDataSource.getRepository(SyncMapping);

    // Check if mapping exists
    let mapping = await repository.findOne({
      where: {
        lojavirtual_id,
        entidade,
        erp_id: erp_id.toString(),
      },
    });

    if (mapping) {
      mapping.platform_id = platform_id;
      mapping.platform = platform;
      mapping.dataalterado = new Date();
    } else {
      mapping = repository.create({
        lojavirtual_id,
        entidade,
        erp_id: erp_id.toString(),
        platform_id,
        platform,
      });
    }

    return repository.save(mapping);
  }

  async removeMapping(lojavirtual_id: string, entidade: string, erp_id: string): Promise<void> {
    const repository = appDataSource.getRepository(SyncMapping);

    await repository.delete({
      lojavirtual_id,
      entidade,
      erp_id: erp_id.toString(),
    });

    logger.info(`Mapping removed`, { lojavirtual_id, entidade, erp_id });
  }
}

