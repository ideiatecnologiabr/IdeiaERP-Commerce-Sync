import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { DataSource } from 'typeorm';

// Load .env before importing anything that uses getEnv()
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
}

// Simple logger for migrations (to avoid loading full env validation)
const simpleLogger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

async function runMigrations() {
  // Create DataSource directly for migrations
  // NOTE: We don't need entities for migrations, only the migration files path
  const appDataSource = new DataSource({
    type: 'mariadb',
    host: process.env.APP_DB_HOST || 'localhost',
    port: parseInt(process.env.APP_DB_PORT || '3307', 10),
    username: process.env.APP_DB_USER || 'root',
    password: process.env.APP_DB_PASSWORD || '',
    database: process.env.APP_DB_NAME || 'ideiaerp_sync',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [], // Not needed for migrations
    migrations: [resolve(__dirname, '../migrations/**/*.ts')],
    subscribers: [],
  });
  try {
    simpleLogger.info('Initializing database connection...');
    await appDataSource.initialize();

    simpleLogger.info('Running migrations...');
    const migrations = await appDataSource.runMigrations();
    
    if (migrations.length === 0) {
      simpleLogger.info('No migrations to run');
    } else {
      simpleLogger.info(`Executed ${migrations.length} migration(s):`);
      migrations.forEach(migration => {
        simpleLogger.info(`  - ${migration.name}`);
      });
    }

    await appDataSource.destroy();
    simpleLogger.info('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    simpleLogger.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();