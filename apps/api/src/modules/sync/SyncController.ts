import { Request, Response } from 'express';
import { SyncCatalogCommandHandler } from './commands/handlers/SyncCatalogCommandHandler';
import { SyncCatalogCommand } from './commands/SyncCatalogCommand';
import { SyncPricesCommandHandler } from './commands/handlers/SyncPricesCommandHandler';
import { SyncStockCommandHandler } from './commands/handlers/SyncStockCommandHandler';
import { SyncOrdersCommandHandler } from './commands/handlers/SyncOrdersCommandHandler';
import { sendSuccess, sendError } from '../../shared/http/responseFormatter';
import { logger } from '../../config/logger';
import { executeCronManually, getCronStatus } from '../../shared/cron/cronJobs';

/**
 * @swagger
 * /api/v1/admin/lojavirtual/{lojavirtual_id}/sync/catalog:
 *   post:
 *     tags: [Sync]
 *     summary: Sincronizar catálogo completo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lojavirtual_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sincronização iniciada
 */
export class SyncController {
  async syncCatalog(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = req.params.lojavirtual_id;
      const force = req.query.force === 'true';

      const handler = new SyncCatalogCommandHandler();
      const command = new SyncCatalogCommand(lojavirtual_id, force);
      // Execute asynchronously
      handler.handle(command).catch((err) => {
        logger.error('Sync catalog error', err);
      });

      sendSuccess(res, { message: 'Sincronização de catálogo iniciada' });
    } catch (error: any) {
      logger.error('Sync catalog error', error);
      sendError(res, 'Erro ao iniciar sincronização', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/admin/lojavirtual/{lojavirtual_id}/sync/prices:
   *   post:
   *     tags: [Sync]
   *     summary: Sincronizar preços
   *     security:
   *       - bearerAuth: []
   */
  async syncPrices(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = parseInt(req.params.lojavirtual_id);
      const force = req.query.force === 'true';

      const handler = new SyncPricesCommandHandler();
      handler.handle({ lojavirtual_id, force } as any).catch((err) => {
        logger.error('Sync prices error', err);
      });

      sendSuccess(res, { message: 'Sincronização de preços iniciada' });
    } catch (error: any) {
      logger.error('Sync prices error', error);
      sendError(res, 'Erro ao iniciar sincronização', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/admin/lojavirtual/{lojavirtual_id}/sync/stock:
   *   post:
   *     tags: [Sync]
   *     summary: Sincronizar estoques
   *     security:
   *       - bearerAuth: []
   */
  async syncStock(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = parseInt(req.params.lojavirtual_id);
      const force = req.query.force === 'true';

      const handler = new SyncStockCommandHandler();
      handler.handle({ lojavirtual_id, force } as any).catch((err) => {
        logger.error('Sync stock error', err);
      });

      sendSuccess(res, { message: 'Sincronização de estoques iniciada' });
    } catch (error: any) {
      logger.error('Sync stock error', error);
      sendError(res, 'Erro ao iniciar sincronização', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/admin/lojavirtual/{lojavirtual_id}/sync/orders:
   *   post:
   *     tags: [Sync]
   *     summary: Sincronizar pedidos
   *     security:
   *       - bearerAuth: []
   */
  async syncOrders(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = parseInt(req.params.lojavirtual_id);

      const handler = new SyncOrdersCommandHandler();
      handler.handle({ lojavirtual_id } as any).catch((err) => {
        logger.error('Sync orders error', err);
      });

      sendSuccess(res, { message: 'Sincronização de pedidos iniciada' });
    } catch (error: any) {
      logger.error('Sync orders error', error);
      sendError(res, 'Erro ao iniciar sincronização', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/admin/cron/status:
   *   get:
   *     tags: [Sync]
   *     summary: Obter status dos CRONs
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Status dos CRONs
   */
  async getCronStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = getCronStatus();
      sendSuccess(res, status);
    } catch (error: any) {
      logger.error('Error getting CRON status', error);
      sendError(res, 'Erro ao obter status dos CRONs', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/admin/cron/execute/{tipo}:
   *   post:
   *     tags: [Sync]
   *     summary: Executar CRON manualmente (debug)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tipo
   *         required: true
   *         schema:
   *           type: string
   *           enum: [products, prices, stock, orders]
   *     responses:
   *       200:
   *         description: CRON executado com sucesso
   *       400:
   *         description: Tipo inválido
   */
  async executeCron(req: Request, res: Response): Promise<void> {
    try {
      const tipo = req.params.tipo as 'products' | 'prices' | 'stock' | 'orders';
      
      if (!['products', 'prices', 'stock', 'orders'].includes(tipo)) {
        sendError(res, 'Tipo inválido. Use: products, prices, stock ou orders', 400);
        return;
      }

      logger.info(`Manual CRON execution requested: ${tipo}`);
      
      // Execute asynchronously to avoid blocking the response
      executeCronManually(tipo).catch((err) => {
        logger.error(`Manual CRON execution error: ${tipo}`, err);
      });

      sendSuccess(res, { 
        message: `CRON ${tipo} executado manualmente`,
        tipo,
        note: 'A execução está rodando em background. Verifique os logs para acompanhar o progresso.',
      });
    } catch (error: any) {
      logger.error('Error executing CRON manually', error);
      sendError(res, 'Erro ao executar CRON', 500);
    }
  }
}

