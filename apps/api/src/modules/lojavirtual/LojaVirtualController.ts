import { Request, Response } from 'express';
import { ListLojasVirtuaisQueryHandler } from '../sync/queries/handlers/ListLojasVirtuaisQueryHandler';
import { sendSuccess, sendError } from '../../shared/http/responseFormatter';
import { logger } from '../../config/logger';
import { ProductQueryService } from '../sync/services/ProductQueryService';
import { AdapterFactory, PlatformType } from '../integrations/AdapterFactory';
import { PlatformConfig } from '../integrations/ports/PlatformConfig';
import { TokenManager } from '../integrations/services/TokenManager';
import { OpenCartAuthAdapter } from '../integrations/opencart/OpenCartAuthAdapter';

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

  /**
   * @swagger
   * /api/v1/admin/lojavirtual/{lojavirtual_id}/health:
   *   get:
   *     tags: [LojaVirtual]
   *     summary: Verificar saúde/conexão da loja virtual
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
   *         description: Status de saúde da loja virtual
   *       404:
   *         description: Loja virtual não encontrada
   *       500:
   *         description: Erro ao verificar saúde
   */
  async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      const lojavirtual_id = req.params.lojavirtual_id;

      const productQueryService = new ProductQueryService();
      const loja = await productQueryService.getLojaVirtual(lojavirtual_id);

      if (!loja) {
        sendError(res, 'Loja virtual não encontrada ou inativa', 404);
        return;
      }

      // Validate platform configuration
      if (!loja.plataforma_nome) {
        sendError(res, 'Loja virtual não possui plataforma configurada', 400);
        return;
      }

      if (!loja.urlbase) {
        sendError(res, 'Loja virtual não possui URL base configurada', 400);
        return;
      }

      // Get platform type
      const platform = this.getPlatformType(loja.plataforma_nome);

      // For OpenCart, we need username and password for login
      // These should be stored in apiuser (username) and apikey (password) fields
      // or in a separate configuration. For now, we'll use apiuser as username and apikey as password
      const username = loja.apiuser || '';
      const password = loja.apikey || '';

      if (!username || !password) {
        sendError(res, 'Loja virtual não possui credenciais de autenticação configuradas (username/password)', 400);
        return;
      }

      // Create platform config
      const platformConfig: PlatformConfig = {
        baseUrl: loja.urlbase,
        apiKey: loja.apikey || undefined, // Legacy, may be used as password
        apiUser: loja.apiuser || undefined, // Legacy, may be used as username
        username: username,
        password: password,
        loginEndpoint: 'api_ocft/admin/auth/login', // Default OpenCart OCFT endpoint
      };

      // Create token manager and auth adapter
      const tokenManager = new TokenManager();
      const authAdapter = platform === 'opencart' 
        ? new OpenCartAuthAdapter(platformConfig)
        : null;

      // Create adapter and check health
      const adapter = AdapterFactory.create(platform, platformConfig, tokenManager, lojavirtual_id);
      const healthResult = await adapter.checkHealth();

      sendSuccess(res, {
        online: healthResult.online,
        error: healthResult.error,
        timestamp: new Date(),
      });
    } catch (error: any) {
      logger.error('Check health error', error);
      sendError(res, 'Erro ao verificar saúde da loja virtual', 500);
    }
  }

  /**
   * Get normalized platform type from plataforma_nome
   */
  private getPlatformType(plataforma_nome: string): PlatformType {
    const normalized = plataforma_nome.toLowerCase().trim();
    
    if (normalized.includes('opencart') || normalized.includes('open-cart')) {
      return 'opencart';
    }
    
    if (normalized.includes('vtex')) {
      return 'vtex';
    }

    // Default to opencart
    logger.warn(`Platform name "${plataforma_nome}" not recognized, defaulting to opencart`);
    return 'opencart';
  }
}

