import { Request, Response } from 'express';
import { getEnv } from '../config/env';
import { logger } from '../config/logger';
import { SyncOrderByIdCommandHandler } from '../modules/sync/commands/handlers/SyncOrderByIdCommandHandler';

const env = getEnv();

export class WebhookController {
  async handleOrderWebhook(req: Request, res: Response): Promise<void> {
    const platform = req.params.platform;
    const token = req.headers['x-webhook-token'] as string;

    // Validate token
    const expectedToken = env.WEBHOOK_TOKEN_OPENCART;
    if (!token || token !== expectedToken) {
      logger.warn('Invalid webhook token', { platform, ip: req.ip });
      res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
      return;
    }

    // Validate platform
    if (platform !== 'opencart') {
      logger.warn('Unsupported platform', { platform });
      res.status(400).json({
        success: false,
        error: { message: `Platform ${platform} not supported` },
      });
      return;
    }

    try {
      const { orderId } = req.body;

      if (!orderId) {
        res.status(400).json({
          success: false,
          error: { message: 'orderId is required' },
        });
        return;
      }

      // Respond quickly
      res.status(200).json({
        success: true,
        data: { message: 'Webhook received, processing...' },
      });

      // Process asynchronously
      setImmediate(async () => {
        try {
          // TODO: Get lojavirtual_id from platform config or request
          // For now, we'll need to determine this from the platform
          const lojavirtual_id = 1; // TODO: Get from integration config

          const handler = new SyncOrderByIdCommandHandler();
          await handler.handle({
            lojavirtual_id,
            order_id: orderId.toString(),
          } as any);

          logger.info('Webhook order processed successfully', {
            platform,
            orderId,
            lojavirtual_id,
          });
        } catch (error: any) {
          logger.error('Error processing webhook order', {
            platform,
            orderId,
            error: error.message,
          });
        }
      });
    } catch (error: any) {
      logger.error('Error handling webhook', { platform, error: error.message });
      // Already responded, so just log
    }
  }
}



