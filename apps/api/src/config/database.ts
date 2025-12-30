import { DataSource, DataSourceOptions } from 'typeorm';
import { getEnv } from './env';
import { logger } from './logger';

const env = getEnv();

// Import entities directly
import * as erpEntities from '../entities/erp';
import * as appEntities from '../entities/app';


// ERP Database Configuration
const erpDbConfig: DataSourceOptions = {
  type: 'mariadb',
  host: env.ERP_DB_HOST,
  port: env.ERP_DB_PORT,
  username: env.ERP_DB_USER,
  password: env.ERP_DB_PASSWORD,
  database: env.ERP_DB_NAME,
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  entities: Object.values(erpEntities),
  migrations: [],
  subscribers: [],
};

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
  migrations: [__dirname + '/../migrations/**/*.ts'],
  subscribers: [],
};

import { createConnection } from 'mysql2/promise';

export const erpDataSource = new DataSource(erpDbConfig);
export const appDataSource = new DataSource(appDbConfig);

async function ensureDatabaseExists(config: DataSourceOptions) {
  const { host, port, username, password, database } = config as any;
  
  try {
    const connection = await createConnection({
      host,
      port,
      user: username,
      password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    
    logger.debug(`Database ${database} verified/created successfully`);
  } catch (error) {
    logger.error(`Error checking/creating database ${database}:`, error);
    // Don't throw here, let TypeORM fail if it truly can't connect, 
    // or arguably we SHOULD throw if we can't even connect to the server.
    // However, if the error is just access denied to create DB, maybe the DB exists?
    // Let's log and proceed, TypeORM will be the final judge.
  }
}

export async function initializeDatabases(): Promise<void> {
  try {
    // Ensure ERP Database exists
    await ensureDatabaseExists(erpDbConfig);

    // Debug: Log loaded entities
    const erpEntityNames = Object.values(erpEntities).map((e: any) => e.name || 'Unknown');
    logger.debug('Loading ERP entities', { 
      count: erpEntityNames.length,
      entities: erpEntityNames 
    });
    
    await erpDataSource.initialize();
    
    // Debug: Verify entities are registered
    const registeredEntities = erpDataSource.entityMetadatas.map(m => m.name);
    logger.debug('Registered ERP entities in TypeORM', { 
      count: registeredEntities.length,
      entities: registeredEntities 
    });
    
    logger.info('ERP Database connected successfully', {
      host: env.ERP_DB_HOST,
      port: env.ERP_DB_PORT,
      database: env.ERP_DB_NAME,
    });
  } catch (error) {
    logger.error('Error connecting to ERP Database:', error);
    logger.error('ERP DB Config:', {
      host: env.ERP_DB_HOST,
      port: env.ERP_DB_PORT,
      database: env.ERP_DB_NAME,
      user: env.ERP_DB_USER,
    });
    throw error;
  }

  try {
    // Ensure App Database exists
    await ensureDatabaseExists(appDbConfig);

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
    
    logger.info('App Database connected successfully', {
      host: env.APP_DB_HOST,
      port: env.APP_DB_PORT,
      database: env.APP_DB_NAME,
    });
  } catch (error) {
    logger.error('Error connecting to App Database:', error);
    logger.error('App DB Config:', {
      host: env.APP_DB_HOST,
      port: env.APP_DB_PORT,
      database: env.APP_DB_NAME,
      user: env.APP_DB_USER,
    });
    logger.error('Make sure the Docker container is running: docker-compose up -d');
    throw error;
  }
}

export async function closeDatabases(): Promise<void> {
  try {
    if (erpDataSource.isInitialized) {
      await erpDataSource.destroy();
      logger.info('ERP Database connection closed');
    }

    if (appDataSource.isInitialized) {
      await appDataSource.destroy();
      logger.info('App Database connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
}

