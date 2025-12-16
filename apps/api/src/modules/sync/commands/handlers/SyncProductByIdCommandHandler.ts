import { SyncProductByIdCommand } from '../SyncProductByIdCommand';
import { logger } from '../../../../config/logger';

export class SyncProductByIdCommandHandler {
  async handle(command: SyncProductByIdCommand): Promise<void> {
    logger.info(`Syncing product ${command.produto_id} for loja ${command.lojavirtual_id}`, {
      lojavirtual_id: command.lojavirtual_id,
      produto_id: command.produto_id,
    });

    // TODO: Implement single product sync logic

    logger.info(`Product sync completed`);
  }
}

