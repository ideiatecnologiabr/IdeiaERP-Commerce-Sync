import { Request, Response } from 'express';
import { DashboardQueryHandler } from '../sync/queries/handlers/DashboardQueryHandler';
import { sendSuccess, sendError } from '../../shared/http/responseFormatter';
import { logger } from '../../config/logger';

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Obter dados do dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lojavirtual_id
 *         schema:
 *           type: integer
 *         description: ID da loja virtual (opcional)
 *     responses:
 *       200:
 *         description: Dados do dashboard
 */
export class DashboardController {
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = req.query.lojavirtual_id
        ? parseInt(req.query.lojavirtual_id as string)
        : undefined;

      const handler = new DashboardQueryHandler();
      const result = await handler.handle({ lojavirtual_id } as any);

      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('Dashboard error', error);
      sendError(res, 'Erro ao obter dados do dashboard', 500);
    }
  }
}

