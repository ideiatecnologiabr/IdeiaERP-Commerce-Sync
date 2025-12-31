import { Request, Response } from 'express';
import { SettingsService } from './services/SettingsService';
import { erpConnectionProvider } from './services/ErpDbConnectionProvider';
import { logger } from '../../config/logger';
import { formatResponse } from '../../shared/http/responseFormatter';
import { getHealthCheckInstance } from './services/ConnectionHealthCheck';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  /**
   * @swagger
   * /api/v1/admin/settings:
   *   get:
   *     tags: [Settings]
   *     summary: Lista todas as configurações
   *     description: Retorna todas as configurações do sistema. Senhas são mascaradas.
   *     responses:
   *       200:
   *         description: Lista de configurações
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Setting'
   *       401:
   *         description: Não autenticado
   *       500:
   *         description: Erro interno
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.settingsService.getAll();

      // Mask password values
      const maskedSettings = settings.map((setting) => ({
        ...setting,
        value: setting.key === 'ERP_DB_PASSWORD' ? '********' : setting.value,
      }));

      res.json(formatResponse(maskedSettings));
    } catch (error: any) {
      logger.error('Error fetching settings', error);
      res.status(500).json(
        formatResponse(null, {
          message: 'Erro ao buscar configurações',
          code: 'SETTINGS_FETCH_ERROR',
        })
      );
    }
  }

  /**
   * @swagger
   * /api/v1/admin/settings/{key}:
   *   get:
   *     tags: [Settings]
   *     summary: Busca uma configuração por chave
   *     description: Retorna uma configuração específica. Senha é mascarada.
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Chave da configuração
   *     responses:
   *       200:
   *         description: Configuração encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Setting'
   *       404:
   *         description: Configuração não encontrada
   *       500:
   *         description: Erro interno
   */
  async getByKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const setting = await this.settingsService.getByKey(key);

      if (!setting) {
        res.status(404).json(
          formatResponse(null, {
            message: 'Configuração não encontrada',
            code: 'SETTING_NOT_FOUND',
          })
        );
        return;
      }

      // Mask password
      const maskedSetting = {
        ...setting,
        value: setting.key === 'ERP_DB_PASSWORD' ? '********' : setting.value,
      };

      res.json(formatResponse(maskedSetting));
    } catch (error: any) {
      logger.error('Error fetching setting', error);
      res.status(500).json(
        formatResponse(null, {
          message: 'Erro ao buscar configuração',
          code: 'SETTING_FETCH_ERROR',
        })
      );
    }
  }

  /**
   * @swagger
   * /api/v1/admin/settings:
   *   post:
   *     tags: [Settings]
   *     summary: Cria uma nova configuração
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - key
   *               - value
   *             properties:
   *               key:
   *                 type: string
   *                 example: ERP_DB_HOST
   *               value:
   *                 type: string
   *                 example: localhost
   *     responses:
   *       200:
   *         description: Configuração criada
   *       400:
   *         description: Dados inválidos
   *       500:
   *         description: Erro interno
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { key, value } = req.body;

      if (!key || !value) {
        res.status(400).json(
          formatResponse(null, {
            message: 'key e value são obrigatórios',
            code: 'INVALID_INPUT',
          })
        );
        return;
      }

      const setting = await this.settingsService.set(key, value);

      // Reconnect ERP-DB if ERP settings changed
      if (key.startsWith('ERP_DB_')) {
        logger.info('ERP-DB setting changed, will reconnect on next request');
        // Don't await - let it reconnect on next request
        erpConnectionProvider.disconnect().catch((err) => {
          logger.warn('Error disconnecting ERP-DB after settings change', err);
        });
      }

      res.json(formatResponse(setting));
    } catch (error: any) {
      logger.error('Error creating setting', error);
      res.status(400).json(
        formatResponse(null, {
          message: error.message || 'Erro ao criar configuração',
          code: 'SETTING_CREATE_ERROR',
        })
      );
    }
  }

  /**
   * @swagger
   * /api/v1/admin/settings/{key}:
   *   put:
   *     tags: [Settings]
   *     summary: Atualiza uma configuração existente
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - value
   *             properties:
   *               value:
   *                 type: string
   *                 example: localhost
   *     responses:
   *       200:
   *         description: Configuração atualizada
   *       400:
   *         description: Dados inválidos
   *       404:
   *         description: Configuração não encontrada
   *       500:
   *         description: Erro interno
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (!value) {
        res.status(400).json(
          formatResponse(null, {
            message: 'value é obrigatório',
            code: 'INVALID_INPUT',
          })
        );
        return;
      }

      const setting = await this.settingsService.set(key, value);

      // Reconnect ERP-DB if ERP settings changed
      if (key.startsWith('ERP_DB_')) {
        logger.info('ERP-DB setting changed, will reconnect on next request');
        // Don't await - let it reconnect on next request
        erpConnectionProvider.disconnect().catch((err) => {
          logger.warn('Error disconnecting ERP-DB after settings change', err);
        });
      }

      res.json(formatResponse(setting));
    } catch (error: any) {
      logger.error('Error updating setting', error);
      res.status(400).json(
        formatResponse(null, {
          message: error.message || 'Erro ao atualizar configuração',
          code: 'SETTING_UPDATE_ERROR',
        })
      );
    }
  }

  /**
   * @swagger
   * /api/v1/admin/settings/{key}:
   *   delete:
   *     tags: [Settings]
   *     summary: Remove uma configuração
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Configuração removida
   *       404:
   *         description: Configuração não encontrada
   *       500:
   *         description: Erro interno
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const deleted = await this.settingsService.delete(key);

      if (!deleted) {
        res.status(404).json(
          formatResponse(null, {
            message: 'Configuração não encontrada',
            code: 'SETTING_NOT_FOUND',
          })
        );
        return;
      }

      res.json(formatResponse({ message: 'Configuração removida com sucesso' }));
    } catch (error: any) {
      logger.error('Error deleting setting', error);
      res.status(500).json(
        formatResponse(null, {
          message: 'Erro ao remover configuração',
          code: 'SETTING_DELETE_ERROR',
        })
      );
    }
  }

  /**
   * @swagger
   * /api/v1/admin/settings/erp/test-connection:
   *   post:
   *     tags: [Settings]
   *     summary: Testa a conexão com o ERP-DB
   *     responses:
   *       200:
   *         description: Conexão bem-sucedida
   *       503:
   *         description: Não foi possível conectar
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      await erpConnectionProvider.reconnect();
      res.json(
        formatResponse({
          message: 'Conexão com ERP-DB estabelecida com sucesso',
          connected: true,
        })
      );
    } catch (error: any) {
      logger.error('ERP-DB connection test failed', error);
      res.status(503).json(
        formatResponse(null, {
          message: 'Não foi possível conectar ao ERP-DB',
          code: 'ERP_DB_UNAVAILABLE',
          details: error.message,
        })
      );
    }
  }

  /**
   * @swagger
   * /api/v1/admin/settings/erp/connection-status:
   *   get:
   *     tags: [Settings]
   *     summary: Obtém o status da conexão com o ERP-DB
   *     description: Retorna informações sobre a conexão atual e estatísticas do pool
   *     responses:
   *       200:
   *         description: Status da conexão
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     connected:
   *                       type: boolean
   *                       description: Se está conectado ao ERP-DB
   *                     pool:
   *                       type: object
   *                       nullable: true
   *                       properties:
   *                         total:
   *                           type: number
   *                           description: Total de conexões no pool
   *                         active:
   *                           type: number
   *                           description: Conexões ativas (em uso)
   *                         idle:
   *                           type: number
   *                           description: Conexões ociosas
   *                         waiting:
   *                           type: number
   *                           description: Clientes aguardando conexão
   *                     health:
   *                       type: object
   *                       properties:
   *                         lastCheck:
   *                           type: string
   *                           format: date-time
   *                           description: Data da última verificação
   *                         warnings:
   *                           type: array
   *                           items:
   *                             type: string
   */
  async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const isConnected = erpConnectionProvider.isConnected();
      const poolStats = erpConnectionProvider.getPoolStats();
      const healthCheck = getHealthCheckInstance();
      const health = await healthCheck.checkHealth();

      res.json(
        formatResponse({
          connected: isConnected,
          pool: poolStats,
          health: {
            lastCheck: health.lastCheck,
            warnings: health.warnings,
          },
        })
      );
    } catch (error: any) {
      logger.error('Error getting connection status', error);
      res.status(500).json(
        formatResponse(null, {
          message: 'Erro ao obter status da conexão',
          code: 'CONNECTION_STATUS_ERROR',
        })
      );
    }
  }
}

