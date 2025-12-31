import { DataSource, DataSourceOptions } from 'typeorm';
import { getEnv } from './env';
import { logger } from './logger';

const env = getEnv();

// Import entities directly
import * as erpEntities from '../entities/erp';
import * as appEntities from '../entities/app';

/**
 * Formats a database connection error into a user-friendly message
 */
function formatDatabaseError(error: any, dbName: string, config: any): string {
  const errorCode = error.code || error.errno;
  const host = config.host || 'localhost';
  const port = config.port || 3306;

  // Connection timeout
  if (errorCode === 'ETIMEDOUT') {
    return `
╔════════════════════════════════════════════════════════════════════════════╗
║  ❌ ERRO DE CONEXÃO: Tempo Limite Excedido                                 ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Não foi possível conectar ao banco de dados "${dbName}".                 ║
║  O servidor não respondeu no tempo esperado.                               ║
║                                                                            ║
║  Servidor: ${host}:${port}                                                ║
║                                                                            ║
║  Possíveis causas:                                                         ║
║  • O servidor de banco de dados está desligado                             ║
║  • Firewall bloqueando a conexão                                           ║
║  • Configuração incorreta de host/porta                                    ║
║  • Problemas de rede                                                       ║
║                                                                            ║
║  Soluções:                                                                 ║
║  1. Verifique se o servidor MariaDB/MySQL está rodando                     ║
║  2. Confirme o host e porta no arquivo .env                                ║
║  3. Teste a conexão: telnet ${host} ${port}                                ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;
  }

  // Connection refused
  if (errorCode === 'ECONNREFUSED') {
    return `
╔════════════════════════════════════════════════════════════════════════════╗
║  ❌ ERRO DE CONEXÃO: Conexão Recusada                                      ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  O servidor de banco de dados "${dbName}" recusou a conexão.              ║
║                                                                            ║
║  Servidor: ${host}:${port}                                                ║
║                                                                            ║
║  Causa provável:                                                           ║
║  • O servidor MariaDB/MySQL não está rodando                               ║
║                                                                            ║
║  Soluções:                                                                 ║
║  1. Inicie o servidor de banco de dados                                    ║
║  2. Verifique se a porta ${port} está correta                              ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;
  }

  // Host not found
  if (errorCode === 'ENOTFOUND') {
    return `
╔════════════════════════════════════════════════════════════════════════════╗
║  ❌ ERRO DE CONEXÃO: Servidor Não Encontrado                               ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  O servidor "${host}" não foi encontrado.                                 ║
║                                                                            ║
║  Banco: ${dbName}                                                          ║
║                                                                            ║
║  Causa provável:                                                           ║
║  • Endereço de host incorreto no arquivo .env                              ║
║                                                                            ║
║  Soluções:                                                                 ║
║  1. Verifique o valor de ${dbName === 'ERP' ? 'ERP_DB_HOST' : 'APP_DB_HOST'} no arquivo .env  ║
║  2. Use 'localhost' para servidor local                                    ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;
  }

  // Access denied
  if (errorCode === 'ER_ACCESS_DENIED_ERROR' || error.message?.includes('Access denied')) {
    return `
╔════════════════════════════════════════════════════════════════════════════╗
║  ❌ ERRO DE AUTENTICAÇÃO: Acesso Negado                                    ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Usuário ou senha incorretos para o banco "${dbName}".                    ║
║                                                                            ║
║  Servidor: ${host}:${port}                                                ║
║  Usuário: ${config.username}                                               ║
║                                                                            ║
║  Soluções:                                                                 ║
║  1. Verifique as credenciais no arquivo .env:                              ║
║     - ${dbName === 'ERP' ? 'ERP_DB_USER' : 'APP_DB_USER'}                 ║
║     - ${dbName === 'ERP' ? 'ERP_DB_PASSWORD' : 'APP_DB_PASSWORD'}         ║
║  2. Confirme que o usuário tem permissões no banco de dados                ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;
  }

  // Database not found
  if (errorCode === 'ER_BAD_DB_ERROR' || error.message?.includes('Unknown database')) {
    return `
╔════════════════════════════════════════════════════════════════════════════╗
║  ❌ ERRO: Banco de Dados Não Encontrado                                    ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  O banco de dados "${config.database}" não existe.                        ║
║                                                                            ║
║  Servidor: ${host}:${port}                                                ║
║                                                                            ║
║  Soluções:                                                                 ║
║  1. Crie o banco de dados manualmente                                      ║
║  2. Verifique o nome do banco no arquivo .env                              ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;
  }

  // Generic error
  return `
╔════════════════════════════════════════════════════════════════════════════╗
║  ❌ ERRO DE CONEXÃO: ${dbName}                                             ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Não foi possível conectar ao banco de dados.                              ║
║                                                                            ║
║  Servidor: ${host}:${port}                                                ║
║  Banco: ${config.database}                                                 ║
║  Erro: ${error.message || 'Erro desconhecido'}                            ║
║                                                                            ║
║  Verifique as configurações no arquivo .env                                ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;
}

// App Database Configuration
const appDbConfig: DataSourceOptions = {
  type: 'mariadb',
  host: env.APP_DB_HOST,
  port: env.APP_DB_PORT,
  username: env.APP_DB_USER,
  password: env.APP_DB_PASSWORD,
  database: env.APP_DB_NAME,
  synchronize: env.NODE_ENV === 'development',
  logging: env.NODE_ENV === 'development',
  entities: Object.values(appEntities),
  migrations: [__dirname + '/../migrations/**/*.{ts,js}'], // Support both .ts and .js
  subscribers: [],
  connectTimeout: 10000, // 10 seconds timeout
};

import { createConnection } from 'mysql2/promise';

// Note: ERP database connection is now managed dynamically by ErpDbConnectionProvider
// which reads configuration from the settings table
export const appDataSource = new DataSource(appDbConfig);

async function ensureDatabaseExists(config: DataSourceOptions, dbName: string) {
  const { host, port, username, password, database } = config as any;
  
  try {
    const connection = await createConnection({
      host,
      port,
      user: username,
      password,
      connectTimeout: 10000,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    
    logger.debug(`Database ${database} verified/created successfully`);
  } catch (error: any) {
    // Se o erro for de conexão (timeout, refused, etc), apenas re-lançar
    // A mensagem amigável será mostrada em initializeDatabases
    const errorCode = error.code || error.errno;
    if (['ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'].includes(errorCode)) {
      throw error;
    }
    
    // Para outros erros (ex: sem permissão para criar DB), só logar
    logger.warn(`Could not verify/create database ${database}. Database might already exist.`, error.message);
    // Don't throw here - the database might exist, TypeORM will verify
  }
}

export async function initializeDatabases(): Promise<void> {
  // NOTE: This function now only connects to APP_DB
  // ERP-DB connection is handled by ErpDbConnectionProvider on-demand
  
  try {
    // Ensure App Database exists
    await ensureDatabaseExists(appDbConfig, 'APP');

    // Debug: Log loaded entities
    const appEntityNames = Object.values(appEntities).map((e: any) => e.name || 'Unknown');
    logger.debug('Loading App entities', { 
      count: appEntityNames.length,
      entities: appEntityNames 
    });
    
    await appDataSource.initialize();
    
    // Debug: Verify entities are registered
    const registeredAppEntities = appDataSource.entityMetadatas.map(m => m.name);
    logger.debug('Registered App entities in TypeORM', { 
      count: registeredAppEntities.length,
      entities: registeredAppEntities 
    });
    
    // Run pending migrations automatically
    logger.info('Running pending migrations...');
    const migrations = await appDataSource.runMigrations({ transaction: 'all' });
    if (migrations.length > 0) {
      logger.info(`✅ ${migrations.length} migration(s) executed successfully`, {
        migrations: migrations.map(m => m.name),
      });
    } else {
      logger.info('No pending migrations to run');
    }
    
    logger.info('✅ App Database connected successfully', {
      host: env.APP_DB_HOST,
      port: env.APP_DB_PORT,
      database: env.APP_DB_NAME,
    });
  } catch (error: any) {
    const friendlyMessage = formatDatabaseError(error, 'APP', appDbConfig);
    console.error(friendlyMessage);
    // logger.error('Error connecting to App Database', { error: error.message });
    throw error;
  }
}

export async function closeDatabases(): Promise<void> {
  try {
    // Note: ERP-DB connection is managed by ErpDbConnectionProvider
    // Only close APP_DB here
    if (appDataSource.isInitialized) {
      await appDataSource.destroy();
      logger.info('App Database connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
}



