import { Router } from 'express';
import { AuthController } from './auth/AuthController';
import { authMiddleware } from './auth/authMiddleware';
import { DashboardController } from './dashboard/DashboardController';
import { LojaVirtualController } from './lojavirtual/LojaVirtualController';
import { ProductController } from './products/ProductController';
import { OrderController } from './orders/OrderController';
import { SyncController } from './sync/SyncController';
import { LogController } from './sync/LogController';

const router = Router();

// Auth routes (public)
const authController = new AuthController();
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/refresh', (req, res) => authController.refresh(req, res));
router.post('/auth/logout', authMiddleware, (req, res) => authController.logout(req, res));
router.get('/auth/me', authMiddleware, (req, res) => authController.me(req, res));

// Admin routes (protected)
const dashboardController = new DashboardController();
router.get('/admin/dashboard', authMiddleware, (req, res) =>
  dashboardController.getDashboard(req, res)
);

const lojaController = new LojaVirtualController();
router.get('/admin/lojavirtual', authMiddleware, (req, res) =>
  lojaController.listLojas(req, res)
);
router.get('/admin/lojavirtual/:lojavirtual_id', authMiddleware, (req, res) =>
  lojaController.getLoja(req, res)
);

const productController = new ProductController();
router.get('/admin/lojavirtual/:lojavirtual_id/produtos', authMiddleware, (req, res) =>
  productController.listProducts(req, res)
);
router.post('/admin/lojavirtual/:lojavirtual_id/produtos/:produto_id/sync', authMiddleware, (req, res) =>
  productController.syncProduct(req, res)
);

const orderController = new OrderController();
router.get('/admin/lojavirtual/:lojavirtual_id/pedidos', authMiddleware, (req, res) =>
  orderController.listOrders(req, res)
);
router.post('/admin/lojavirtual/:lojavirtual_id/pedidos/:pedido_id/sync', authMiddleware, (req, res) =>
  orderController.syncOrder(req, res)
);

const syncController = new SyncController();
router.post('/admin/lojavirtual/:lojavirtual_id/sync/catalog', authMiddleware, (req, res) =>
  syncController.syncCatalog(req, res)
);
router.post('/admin/lojavirtual/:lojavirtual_id/sync/prices', authMiddleware, (req, res) =>
  syncController.syncPrices(req, res)
);
router.post('/admin/lojavirtual/:lojavirtual_id/sync/stock', authMiddleware, (req, res) =>
  syncController.syncStock(req, res)
);
router.post('/admin/lojavirtual/:lojavirtual_id/sync/orders', authMiddleware, (req, res) =>
  syncController.syncOrders(req, res)
);

const logController = new LogController();
router.get('/admin/logs', authMiddleware, (req, res) => logController.listLogs(req, res));

// CRON debug routes
router.get('/admin/cron/status', authMiddleware, (req, res) =>
  syncController.getCronStatus(req, res)
);
router.post('/admin/cron/execute/:tipo', authMiddleware, (req, res) =>
  syncController.executeCron(req, res)
);

export default router;

