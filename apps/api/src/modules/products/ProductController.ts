import { Request, Response } from 'express';
import { ListProductsQueryHandler } from '../sync/queries/handlers/ListProductsQueryHandler';
import { ListProductsQuery } from '../sync/queries/ListProductsQuery';
import { SyncProductByIdCommandHandler } from '../sync/commands/handlers/SyncProductByIdCommandHandler';
import { sendSuccess, sendError } from '../../shared/http/responseFormatter';
import { logger } from '../../config/logger';
import { SyncLogService } from '../sync/services/SyncLogService';

const logService = new SyncLogService();
/**
 * @swagger
 * /api/v1/admin/lojavirtual/{lojavirtual_id}/produtos:
 *   get:
 *     tags: [Produtos]
 *     summary: Listar produtos de uma loja virtual
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lojavirtual_id
 *         required: true
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
export class ProductController {
  async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = req.params.lojavirtual_id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string | undefined;

      // Validação e log para debug
      if (!lojavirtual_id || lojavirtual_id === 'undefined' || lojavirtual_id === 'NaN') {
        logger.error('Invalid lojavirtual_id', { lojavirtual_id, params: req.params });
        sendError(res, 'ID da loja virtual inválido', 400);
        return;
      }

      logger.debug('List products request', {
        lojavirtual_id,
        page,
        limit,
        search,
      });

      const handler = new ListProductsQueryHandler();
      const query = new ListProductsQuery(lojavirtual_id, page, limit, search);
      const result = await handler.handle(query);

      sendSuccess(res, result);
    } catch (error: any) {
      logger.error('List products error', error);
      sendError(res, 'Erro ao listar produtos', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/admin/lojavirtual/{lojavirtual_id}/produtos/{produto_id}/sync:
   *   post:
   *     tags: [Sync]
   *     summary: Sincronizar um produto específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: lojavirtual_id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: produto_id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Produto sincronizado com sucesso
   */
  async syncProduct(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = req.params.lojavirtual_id;
      const produto_id = req.params.produto_id;

      const handler = new SyncProductByIdCommandHandler();
      await handler.handle({ lojavirtual_id, produto_id } as any);

      // Log success
      await logService.log({
        lojavirtual_id: lojavirtual_id,
        tipo: 'product',
        acao: 'sync',
        entidade: 'catalog',
        entidade_id : produto_id,
        status: 'success',
        mensagem: 'Sync manual product completed successfully',
        detalhes: JSON.stringify({ lojavirtual_id, produto_id }),
      });


      sendSuccess(res, { message: 'Produto sincronizado com sucesso' });
    } catch (error: any) {
      logger.error('Sync product error', error);
      sendError(res, 'Erro ao sincronizar produto', 500);
    }
  }
}

