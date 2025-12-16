import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Carregar .env do diretório de execução (não do diretório de compilação)
// Quando executado como binário pkg, process.cwd() aponta para o diretório de execução
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  // Fallback: tentar carregar do diretório padrão
  config();
}
import { createApp } from './app';
import { initializeDatabases, closeDatabases } from './config/database';
import { getEnv } from './config/env';
import { logger } from './config/logger';
import { setupCronJobs } from './shared/cron/cronJobs';

async function bootstrap() {
  try {
    // Validate environment
    getEnv();
    logger.info('Environment validated');

    // Initialize databases
    await initializeDatabases();

    // Create Express app
    const app = createApp();

    // Setup CRON jobs
    setupCronJobs();

    // Start server
    const port = getEnv().PORT;
    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Health check available at http://localhost:${port}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await closeDatabases();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await closeDatabases();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

