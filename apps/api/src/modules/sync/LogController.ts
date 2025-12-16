import { Request, Response } from 'express';
import { ListLogsQueryHandler } from './queries/handlers/ListLogsQueryHandler';
import { sendSuccess, sendError } from '../../shared/http/responseFormatter';
import { logger } from '../../config/logger';

/**
 * @swagger
 * /api/v1/admin/logs:
 *   get:
 *     tags: [Logs]
 *     summary: Listar logs de sincronização
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lojavirtual_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Lista de logs
 */
export class LogController {
  async listLogs(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = req.query.lojavirtual_id
        ? req.query.lojavirtual_id as string
        : undefined;
      const tipo = req.query.tipo as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const handler = new ListLogsQueryHandler();
      const result = await handler.handle({
        lojavirtual_id,
        tipo,
        page,
        limit,
      } as any);

      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('List logs error', error);
      sendError(res, 'Erro ao listar logs', 500);
    }
  }
}

