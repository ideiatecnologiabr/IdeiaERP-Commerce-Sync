import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';

// Detectar se está rodando como executável empacotado (pkg)
// e forçar NODE_ENV=production se não estiver definido
if ((process as any).pkg && !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Carregar .env do diretório de execução (não do diretório de compilação)
// Quando executado como binário pkg, process.cwd() aponta para o diretório de execução
// Mas se chamado de outra pasta, precisamos olhar onde o executável está
const envPathCwd = resolve(process.cwd(), '.env');
const envPathExec = resolve(dirname(process.execPath), '.env');

if (existsSync(envPathCwd)) {
  config({ path: envPathCwd });
} else if (existsSync(envPathExec)) {
  config({ path: envPathExec });
} else {
  // Fallback: tentar carregar do diretório padrão
  config();
}
import { createApp } from './app';
import { initializeDatabases, closeDatabases } from './config/database';
import { getEnv } from './config/env';
import { logger } from './config/logger';
import { setupCronJobs } from './shared/cron/cronJobs';
import { SettingsService } from './modules/settings/services/SettingsService';
import { getHealthCheckInstance } from './modules/settings/services/ConnectionHealthCheck';
import { erpConnectionProvider } from './modules/settings/services/ErpDbConnectionProvider';

async function bootstrap() {
  try {
    // Validate environment (only APP_DB variables are required now)
    getEnv();
    logger.info('Environment validated');

    // Initialize APP database only (ERP-DB is connected on-demand)
    await initializeDatabases();

    // Ensure settings defaults exist
    const settingsService = new SettingsService();
    await settingsService.ensureDefaults();
    logger.info('Settings initialized');

    // Create Express app (now async)
    const app = await createApp();

    // Setup CRON jobs (they will handle ERP-DB unavailability gracefully)
    setupCronJobs();

    // Start connection health check
    const healthCheck = getHealthCheckInstance();
    healthCheck.start();

    // Start server
    const port = getEnv().PORT;
    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Health check available at http://localhost:${port}/health`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: starting graceful shutdown`);

      // Stop accepting new requests
      server.close(async () => {
        logger.info('HTTP server closed');

        // Stop health check
        healthCheck.stop();
        logger.info('Health check stopped');

        // Close ERP-DB connections
        try {
          await erpConnectionProvider.disconnect();
          logger.info('ERP-DB connections closed');
        } catch (error) {
          logger.error('Error closing ERP-DB connections', error);
        }

        // Close APP-DB connections
        await closeDatabases();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force exit after timeout if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Forced shutdown after timeout (30s)');
        process.exit(1);
      }, 30000); // 30 seconds
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error: any) {
    // Don't log stack trace here - friendly error message was already shown
    console.error('\n❌ Falha ao iniciar o servidor. Corrija os erros acima e tente novamente.\n');
    process.exit(1);
  }
}

bootstrap();

