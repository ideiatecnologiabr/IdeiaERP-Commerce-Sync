import { Router } from 'express';
import { WebhookController } from './WebhookController';

const router = Router();
const controller = new WebhookController();

router.post('/:platform/orders', (req, res) => controller.handleOrderWebhook(req, res));

export default router;



