import { DataSource, DataSourceOptions } from 'typeorm';
import { SettingsService } from './SettingsService';
import { logger } from '../../../config/logger';
import { ErpDatabaseUnavailableError } from '../../../shared/errors/ErpDatabaseUnavailableError';
import * as erpEntities from '../../../entities/erp';

/**
 * Pool statistics interface
 */
export interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
}

/**
 * Singleton that manages lazy connection to ERP database
 */
export class ErpDbConnectionProvider {
  private static instance: ErpDbConnectionProvider;
  private dataSource: DataSource | null = null;
  private settingsService: SettingsService;
  private isConnecting: boolean = false;
  private lastConnectionAttempt: number = 0;
  private connectionRetryDelay: number = 5000; // 5 seconds

  private constructor() {
    this.settingsService = new SettingsService();
  }

  static getInstance(): ErpDbConnectionProvider {
    if (!ErpDbConnectionProvider.instance) {
      ErpDbConnectionProvider.instance = new ErpDbConnectionProvider();
    }
    return ErpDbConnectionProvider.instance;
  }

  /**
   * Ensures connection to ERP-DB is established
   * Throws ErpDatabaseUnavailableError if cannot connect
   */
  async ensureConnection(): Promise<void> {
    // If already connected and initialized, return
    if (this.dataSource && this.dataSource.isInitialized) {
      return;
    }

    // Prevent concurrent connection attempts
    if (this.isConnecting) {
      throw new ErpDatabaseUnavailableError('Connection attempt already in progress');
    }

    // Throttle connection attempts
    const now = Date.now();
    if (now - this.lastConnectionAttempt < this.connectionRetryDelay) {
      throw new ErpDatabaseUnavailableError('Too many connection attempts. Please wait.');
    }

    this.isConnecting = true;
    this.lastConnectionAttempt = now;

    try {
      const config = await this.settingsService.getErpDbConfig();

      logger.debug('Attempting to connect to ERP-DB', {
        host: config.host,
        port: config.port,
        database: config.database,
      });

      const dataSourceOptions: DataSourceOptions = {
        type: 'mariadb',
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.database,
        synchronize: false,
        logging: false,
        entities: Object.values(erpEntities),
        migrations: [],
        subscribers: [],
        connectTimeout: 10000, // 10 seconds timeout
        // Pool configuration (only valid MySQL2 options)
        extra: {
          connectionLimit: 10,        // Máximo 10 conexões simultâneas
          waitForConnections: true,   // Aguardar se todas as conexões estiverem em uso
          queueLimit: 0,              // Sem limite de fila (0 = ilimitado)
        },
      };

      this.dataSource = new DataSource(dataSourceOptions);
      await this.dataSource.initialize();

      logger.info('✅ ERP-DB connected successfully', {
        host: config.host,
        port: config.port,
        database: config.database,
      });
    } catch (error: any) {
      logger.error('Failed to connect to ERP-DB', {
        error: error.message,
        code: error.code,
      });

      this.dataSource = null;
      throw new ErpDatabaseUnavailableError(
        `Não foi possível conectar ao banco de dados do ERP: ${error.message}`
      );
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Returns the ERP-DB DataSource
   * Throws ErpDatabaseUnavailableError if not connected
   */
  getDataSource(): DataSource {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new ErpDatabaseUnavailableError('ERP Database is not connected');
    }
    return this.dataSource;
  }

  /**
   * Checks if ERP-DB is currently connected
   */
  isConnected(): boolean {
    return this.dataSource !== null && this.dataSource.isInitialized;
  }

  /**
   * Forces reconnection to ERP-DB (used when settings change)
   */
  async reconnect(): Promise<void> {
    logger.info('Reconnecting to ERP-DB...');

    // Close existing connection
    if (this.dataSource && this.dataSource.isInitialized) {
      try {
        await this.dataSource.destroy();
        logger.debug('Existing ERP-DB connection closed');
      } catch (error) {
        logger.warn('Error closing existing ERP-DB connection', error);
      }
    }

    this.dataSource = null;
    this.lastConnectionAttempt = 0; // Reset throttle

    // Attempt new connection
    await this.ensureConnection();
  }

  /**
   * Disconnects from ERP-DB
   */
  async disconnect(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = null;
      logger.info('ERP-DB disconnected');
    }
  }

  /**
   * Gets current pool statistics
   * Returns null if not connected
   */
  getPoolStats(): PoolStats | null {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      return null;
    }

    try {
      const driver = this.dataSource.driver as any;
      const pool = driver.pool;

      if (!pool) {
        return null;
      }

      return {
        total: pool._allConnections?.length || 0,
        active: pool._activeConnections?.length || 0,
        idle: pool._freeConnections?.length || 0,
        waiting: pool._connectionQueue?.length || 0,
      };
    } catch (error) {
      logger.warn('Failed to get pool stats', error);
      return null;
    }
  }
}

// Export singleton instance
export const erpConnectionProvider = ErpDbConnectionProvider.getInstance();

