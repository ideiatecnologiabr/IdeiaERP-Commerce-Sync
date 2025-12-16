import { Request, Response } from 'express';
import { ListOrdersQueryHandler } from '../sync/queries/handlers/ListOrdersQueryHandler';
import { SyncOrderByIdCommandHandler } from '../sync/commands/handlers/SyncOrderByIdCommandHandler';
import { sendSuccess, sendError } from '../../shared/http/responseFormatter';
import { logger } from '../../config/logger';

/**
 * @swagger
 * /api/v1/admin/lojavirtual/{lojavirtual_id}/pedidos:
 *   get:
 *     tags: [Pedidos]
 *     summary: Listar pedidos de uma loja virtual
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lojavirtual_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
export class OrderController {
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = parseInt(req.params.lojavirtual_id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as string | undefined;

      const handler = new ListOrdersQueryHandler();
      const result = await handler.handle({
        lojavirtual_id,
        page,
        limit,
        status,
      } as any);

      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('List orders error', error);
      sendError(res, 'Erro ao listar pedidos', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/admin/lojavirtual/{lojavirtual_id}/pedidos/{pedido_id}/sync:
   *   post:
   *     tags: [Sync]
   *     summary: Sincronizar um pedido específico
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: lojavirtual_id
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: pedido_id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Pedido sincronizado com sucesso
   */
  async syncOrder(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = parseInt(req.params.lojavirtual_id);
      const pedido_id = req.params.pedido_id;

      const handler = new SyncOrderByIdCommandHandler();
      await handler.handle({ lojavirtual_id, order_id: pedido_id } as any);

      sendSuccess(res, { message: 'Pedido sincronizado com sucesso' });
    } catch (error: any) {
      logger.error('Sync order error', error);
      sendError(res, 'Erro ao sincronizar pedido', 500);
    }
  }
}

