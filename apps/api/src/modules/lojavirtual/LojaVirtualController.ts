import { Request, Response } from 'express';
import { ListLojasVirtuaisQueryHandler } from '../sync/queries/handlers/ListLojasVirtuaisQueryHandler';
import { sendSuccess, sendError } from '../../shared/http/responseFormatter';
import { logger } from '../../config/logger';

/**
 * @swagger
 * /api/v1/admin/lojavirtual:
 *   get:
 *     tags: [LojaVirtual]
 *     summary: Listar lojas virtuais
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ativas
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Lista de lojas virtuais
 */
export class LojaVirtualController {
  async listLojas(req: Request, res: Response): Promise<void> {
    try {
      // Parse query parameter 'ativas' (string da query string)
      // Comportamento: true por padrão, false apenas se explicitamente 'false'
      // Exemplos:
      //   ?ativas=true  → true
      //   ?ativas=false → false
      //   (sem parâmetro) → true (padrão)
      const ativas = req.query.ativas !== 'false';

      const handler = new ListLojasVirtuaisQueryHandler();
      const result = await handler.handle({ ativas } as any);

      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('List lojas error', error);
      sendError(res, 'Erro ao listar lojas virtuais', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/admin/lojavirtual/{lojavirtual_id}:
   *   get:
   *     tags: [LojaVirtual]
   *     summary: Obter detalhes de uma loja virtual
   *     security:
   *       - cookieAuth: []
   */
  async getLoja(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = parseInt(req.params.lojavirtual_id);

      // TODO: Implement get single loja
      sendSuccess(res, { lojavirtual_id });
    } catch (error: any) {
      logger.error('Get loja error', error);
      sendError(res, 'Erro ao obter loja virtual', 500);
    }
  }
}

