import * as cron from 'node-cron';
import { getEnv } from '../../config/env';
import { logger } from '../../config/logger';
import { SyncLockService } from '../../modules/sync/services/SyncLockService';
import { SyncLogService } from '../../modules/sync/services/SyncLogService';
import { SyncCatalogCommandHandler } from '../../modules/sync/commands/handlers/SyncCatalogCommandHandler';
import { SyncPricesCommandHandler } from '../../modules/sync/commands/handlers/SyncPricesCommandHandler';
import { SyncStockCommandHandler } from '../../modules/sync/commands/handlers/SyncStockCommandHandler';
import { SyncOrdersCommandHandler } from '../../modules/sync/commands/handlers/SyncOrdersCommandHandler';
import { ListLojasVirtuaisQueryHandler } from '../../modules/sync/queries/handlers/ListLojasVirtuaisQueryHandler';

const env = getEnv();
const lockService = new SyncLockService();
const logService = new SyncLogService();

/**
 * Checks if error is a database connection error
 */
function isDatabaseConnectionError(error: any): boolean {
  const errorCode = error.code || error.errno;
  const errorMessage = error.message || '';
  
  return (
    errorCode === 'ETIMEDOUT' ||
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ENOTFOUND' ||
    errorCode === 'ER_ACCESS_DENIED_ERROR' ||
    errorMessage.includes('ETIMEDOUT') ||
    errorMessage.includes('Connection lost') ||
    errorMessage.includes('connect ECONNREFUSED')
  );
}

/**
 * Formats database error for logging
 */
function formatCronDatabaseError(error: any, tipo: string): string {
  const errorCode = error.code || error.errno;
  
  if (errorCode === 'ETIMEDOUT' || error.message?.includes('ETIMEDOUT')) {
    return `⚠️  [SYNC ${tipo.toUpperCase()}] Banco de dados não respondeu (timeout). Verifique se o servidor está rodando.`;
  }
  
  if (errorCode === 'ECONNREFUSED') {
    return `⚠️  [SYNC ${tipo.toUpperCase()}] Não foi possível conectar ao banco de dados. Servidor pode estar desligado.`;
  }
  
  return `⚠️  [SYNC ${tipo.toUpperCase()}] Erro de conexão com banco de dados: ${error.message}`;
}

// Store cron tasks for manual execution
const cronTasks: Map<string, cron.ScheduledTask> = new Map();

export function setupCronJobs(): void {
  logger.info('Setting up CRON jobs');

  // Sync Products CRON
  const productsTask = cron.schedule(env.CRON_SYNC_PRODUCTS, async () => {
    logger.debug('CRON triggered: Sync Products', { schedule: env.CRON_SYNC_PRODUCTS });
    await executeSyncForAllLojas('catalog', async (lojavirtual_id) => {
      const handler = new SyncCatalogCommandHandler();
      await handler.handle({ lojavirtual_id, force: false } as any);
    });
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo',
  });
  cronTasks.set('products', productsTask);

  // Sync Prices CRON
  const pricesTask = cron.schedule(env.CRON_SYNC_PRICES, async () => {
    logger.debug('CRON triggered: Sync Prices', { schedule: env.CRON_SYNC_PRICES });
    await executeSyncForAllLojas('prices', async (lojavirtual_id) => {
      const handler = new SyncPricesCommandHandler();
      await handler.handle({ lojavirtual_id, force: false } as any);
    });
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo',
  });
  cronTasks.set('prices', pricesTask);

  // Sync Stock CRON
  const stockTask = cron.schedule(env.CRON_SYNC_STOCK, async () => {
    logger.debug('CRON triggered: Sync Stock', { schedule: env.CRON_SYNC_STOCK });
    await executeSyncForAllLojas('stock', async (lojavirtual_id) => {
      const handler = new SyncStockCommandHandler();
      await handler.handle({ lojavirtual_id, force: false } as any);
    });
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo',
  });
  cronTasks.set('stock', stockTask);

  // Sync Orders CRON
  const ordersTask = cron.schedule(env.CRON_SYNC_ORDERS, async () => {
    logger.debug('CRON triggered: Sync Orders', { schedule: env.CRON_SYNC_ORDERS });
    await executeSyncForAllLojas('orders', async (lojavirtual_id) => {
      const handler = new SyncOrdersCommandHandler();
      await handler.handle({ lojavirtual_id } as any);
    });
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo',
  });
  cronTasks.set('orders', ordersTask);

  logger.info('CRON jobs configured', {
    products: env.CRON_SYNC_PRODUCTS,
    prices: env.CRON_SYNC_PRICES,
    stock: env.CRON_SYNC_STOCK,
    orders: env.CRON_SYNC_ORDERS,
  });
}

/**
 * Execute a CRON job manually for debugging
 */
export async function executeCronManually(tipo: 'products' | 'prices' | 'stock' | 'orders'): Promise<void> {
  logger.info(`Manual CRON execution triggered: ${tipo}`);
  
  try {
    switch (tipo) {
      case 'products':
        await executeSyncForAllLojas('catalog', async (lojavirtual_id) => {
          const handler = new SyncCatalogCommandHandler();
          await handler.handle({ lojavirtual_id, force: false } as any);
        });
        break;
      case 'prices':
        await executeSyncForAllLojas('prices', async (lojavirtual_id) => {
          const handler = new SyncPricesCommandHandler();
          await handler.handle({ lojavirtual_id, force: false } as any);
        });
        break;
      case 'stock':
        await executeSyncForAllLojas('stock', async (lojavirtual_id) => {
          const handler = new SyncStockCommandHandler();
          await handler.handle({ lojavirtual_id, force: false } as any);
        });
        break;
      case 'orders':
        await executeSyncForAllLojas('orders', async (lojavirtual_id) => {
          const handler = new SyncOrdersCommandHandler();
          await handler.handle({ lojavirtual_id } as any);
        });
        break;
    }
    logger.info(`Manual CRON execution completed: ${tipo}`);
  } catch (error: any) {
    logger.error(`Manual CRON execution failed: ${tipo}`, error);
    throw error;
  }
}

/**
 * Get status of all CRON jobs
 */
export function getCronStatus(): Record<string, { scheduled: boolean; schedule: string; running: boolean }> {
  const status: Record<string, { scheduled: boolean; schedule: string; running: boolean }> = {};
  
  const productsTask = cronTasks.get('products');
  status.products = {
    scheduled: productsTask !== undefined,
    schedule: env.CRON_SYNC_PRODUCTS,
    running: false, // node-cron doesn't expose running status
  };
  
  const pricesTask = cronTasks.get('prices');
  status.prices = {
    scheduled: pricesTask !== undefined,
    schedule: env.CRON_SYNC_PRICES,
    running: false,
  };
  
  const stockTask = cronTasks.get('stock');
  status.stock = {
    scheduled: stockTask !== undefined,
    schedule: env.CRON_SYNC_STOCK,
    running: false,
  };
  
  const ordersTask = cronTasks.get('orders');
  status.orders = {
    scheduled: ordersTask !== undefined,
    schedule: env.CRON_SYNC_ORDERS,
    running: false,
  };
  
  return status;
}

async function executeSyncForAllLojas(
  tipo: string,
  syncFn: (lojavirtual_id: string) => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  logger.info(`[CRON DEBUG] Starting sync for tipo: ${tipo}`);
  
  try {
    const queryHandler = new ListLojasVirtuaisQueryHandler();
    logger.debug(`[CRON DEBUG] Fetching active lojas for tipo: ${tipo}`);
    const { data: lojas } = await queryHandler.handle({ ativas: true } as any);
    
    logger.info(`[CRON DEBUG] Found ${lojas.length} active lojas for tipo: ${tipo}`, {
      lojas: lojas.map(l => ({ id: l.lojavirtual_id, nome: l.nome })),
    });

    if (lojas.length === 0) {
      logger.warn(`[CRON DEBUG] No active lojas found for tipo: ${tipo}`);
      return;
    }

    for (const loja of lojas) {
      const lojaStartTime = Date.now();
      logger.debug(`[CRON DEBUG] Processing loja ${loja.lojavirtual_id} (${loja.nome}) for tipo: ${tipo}`);
      
      try {
        // Try to acquire lock
        logger.debug(`[CRON DEBUG] Attempting to acquire lock for loja ${loja.lojavirtual_id}, tipo ${tipo}`);
        const lockAcquired = await lockService.acquireLock(loja.lojavirtual_id, tipo);

        if (!lockAcquired) {
          logger.warn(`[CRON DEBUG] Could not acquire lock for loja ${loja.lojavirtual_id}, tipo ${tipo} - skipping`);
          continue;
        }

        logger.debug(`[CRON DEBUG] Lock acquired for loja ${loja.lojavirtual_id}, tipo ${tipo}`);

        try {
          // Execute sync
          logger.debug(`[CRON DEBUG] Executing sync function for loja ${loja.lojavirtual_id}, tipo ${tipo}`);
          await syncFn(loja.lojavirtual_id);
          
          const lojaDuration = Date.now() - lojaStartTime;
          logger.info(`[CRON DEBUG] Sync completed for loja ${loja.lojavirtual_id}, tipo ${tipo} in ${lojaDuration}ms`);

          // Log success
          await logService.log({
            lojavirtual_id: loja.lojavirtual_id,
            tipo,
            acao: 'sync',
            entidade: tipo,
            status: 'success',
            mensagem: `Sync ${tipo} completed successfully`,
          });
        } catch (error: any) {
          const lojaDuration = Date.now() - lojaStartTime;
          
          // Check if it's a database connection error
          if (isDatabaseConnectionError(error)) {
            const friendlyMessage = formatCronDatabaseError(error, tipo);
            console.error(friendlyMessage);
            logger.error(friendlyMessage);
          } else {
            logger.error(`[CRON DEBUG] Sync failed for loja ${loja.lojavirtual_id}, tipo ${tipo} after ${lojaDuration}ms`, error);
          }
          
          // Try to log error (might fail if DB is down)
          try {
            await logService.log({
              lojavirtual_id: loja.lojavirtual_id,
              tipo,
              acao: 'sync',
              entidade: tipo,
              status: 'error',
              mensagem: error.message,
              detalhes: { stack: error.stack },
            });
          } catch (logError) {
            // If we can't log, just skip it
            logger.debug('Could not save error log to database');
          }
        } finally {
          // Always release lock (might fail if DB is down)
          try {
            logger.debug(`[CRON DEBUG] Releasing lock for loja ${loja.lojavirtual_id}, tipo ${tipo}`);
            await lockService.releaseLock(loja.lojavirtual_id, tipo);
          } catch (lockError) {
            logger.debug('Could not release lock (database might be down)');
          }
        }
      } catch (error: any) {
        if (isDatabaseConnectionError(error)) {
          const friendlyMessage = formatCronDatabaseError(error, tipo);
          console.error(friendlyMessage);
          logger.error(friendlyMessage);
        } else {
          logger.error(`[CRON DEBUG] Error processing loja ${loja.lojavirtual_id}`, error);
        }
      }
    }
    
    const totalDuration = Date.now() - startTime;
    logger.info(`[CRON DEBUG] Completed sync for tipo: ${tipo} in ${totalDuration}ms`);
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    
    // Check if it's a database connection error
    if (isDatabaseConnectionError(error)) {
      const friendlyMessage = formatCronDatabaseError(error, tipo);
      console.error(friendlyMessage);
      logger.error(friendlyMessage);
    } else {
      logger.error(`[CRON DEBUG] Error in CRON job for ${tipo} after ${totalDuration}ms`, error);
    }
    
    // Don't throw - let other cron jobs continue
  }
}

