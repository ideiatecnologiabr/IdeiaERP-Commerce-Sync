import { SyncOrderByIdCommand } from '../SyncOrderByIdCommand';
import { logger } from '../../../../config/logger';

export class SyncOrderByIdCommandHandler {
  async handle(command: SyncOrderByIdCommand): Promise<void> {
    logger.info(`Syncing order ${command.order_id} for loja ${command.lojavirtual_id}`, {
      lojavirtual_id: command.lojavirtual_id,
      order_id: command.order_id,
    });

    // TODO: Implement single order sync logic

    logger.info(`Order sync completed`);
  }
}

