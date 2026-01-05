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
import * as readline from 'readline';

// Função para aguardar entrada do usuário antes de fechar (Windows)
function waitForUserInput(message: string = 'Pressione Enter para sair...'): Promise<void> {
  return new Promise((resolve) => {
    const isPkgExecutable = !!(process as any).pkg;
    const isWindows = process.platform === 'win32';
    
    // Se for executável pkg no Windows, manter a janela aberta
    if (isPkgExecutable && isWindows) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      
      console.log('\n' + message);
      rl.question('', () => {
        rl.close();
        resolve();
      });
    } else {
      // Em outros casos, não aguardar
      resolve();
    }
  });
}

async function bootstrap() {
  try {
    // Validate environment (only APP_DB variables are required now)
    try {
      getEnv();
      logger.info('Environment validated');
    } catch (envError: any) {
      console.error('\n❌ Erro ao validar variáveis de ambiente:');
      console.error(envError.message || envError);
      const isPkgExecutable = !!(process as any).pkg;
      if (isPkgExecutable && process.platform === 'win32') {
        await waitForUserInput('Pressione Enter para fechar...');
      }
      process.exit(1);
    }

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
    const isPkgExecutable = !!(process as any).pkg;
    
    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Health check available at http://localhost:${port}/health`);
      
      // Se for executável pkg, abrir navegador automaticamente
      if (isPkgExecutable) {
        const url = `http://localhost:${port}/app/`;
        logger.info(`Opening browser at ${url}`);
        
        // Aguardar 1 segundo para garantir que o servidor está pronto
        setTimeout(() => {
          try {
            const open = require('open');
            open(url);
            logger.info('Browser opened successfully');
          } catch (error) {
            logger.warn('Failed to open browser automatically. Please open manually:', { url, error });
          }
        }, 1000);
        
        // Mensagem para manter a janela aberta no Windows
        if (process.platform === 'win32') {
          console.log('\n═══════════════════════════════════════════════════════════');
          console.log('  Servidor rodando! A janela permanecerá aberta.');
          console.log(`  Acesse: http://localhost:${port}/app/`);
          console.log('  Pressione Ctrl+C para parar o servidor.');
          console.log('═══════════════════════════════════════════════════════════\n');
        }
      }
    });

    // Tratamento de erro ao iniciar o servidor (ex: porta ocupada)
    server.on('error', async (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Erro: A porta ${port} já está em uso.`);
        console.error('   Feche o aplicativo que está usando esta porta ou altere a variável PORT no arquivo .env\n');
      } else {
        console.error('\n❌ Erro ao iniciar o servidor:');
        console.error(error.message || error);
        logger.error('Server error:', error);
      }
      
      const isPkgExecutable = !!(process as any).pkg;
      if (isPkgExecutable && process.platform === 'win32') {
        await waitForUserInput('Pressione Enter para fechar...');
      }
      process.exit(1);
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
        
        // Se for executável pkg no Windows, aguardar antes de fechar
        const isPkgExecutable = !!(process as any).pkg;
        if (isPkgExecutable && process.platform === 'win32') {
          await waitForUserInput('Servidor encerrado. Pressione Enter para fechar...');
        }
        
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
    // Log do erro completo para debug
    logger.error('Error during bootstrap:', error);
    console.error('\n❌ Falha ao iniciar o servidor. Corrija os erros acima e tente novamente.\n');
    
    // Se for executável pkg no Windows, aguardar antes de fechar
    const isPkgExecutable = !!(process as any).pkg;
    if (isPkgExecutable && process.platform === 'win32') {
      await waitForUserInput('Pressione Enter para fechar...');
    }
    
    process.exit(1);
  }
}

bootstrap();

