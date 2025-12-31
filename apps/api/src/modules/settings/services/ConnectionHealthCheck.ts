import { ErpDbConnectionProvider } from './ErpDbConnectionProvider';
import { logger } from '../../../config/logger';

export interface HealthStatus {
  isConnected: boolean;
  poolStats: {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  } | null;
  lastCheck: Date;
  warnings: string[];
}

/**
 * Service to monitor ERP-DB connection health
 * Runs periodic checks and cleanup of idle connections
 */
export class ConnectionHealthCheck {
  private interval: NodeJS.Timeout | null = null;
  private erpConnectionProvider: ErpDbConnectionProvider;
  private checkIntervalMs: number = 5 * 60 * 1000; // 5 minutes
  private idleTimeoutMs: number = 10 * 60 * 1000; // 10 minutes
  private lastCheckTime: Date = new Date();

  constructor() {
    this.erpConnectionProvider = ErpDbConnectionProvider.getInstance();
  }

  /**
   * Starts the health check interval
   */
  start(): void {
    if (this.interval) {
      logger.warn('Health check is already running');
      return;
    }

    logger.info('Starting ERP-DB connection health check', {
      intervalMinutes: this.checkIntervalMs / 60000,
      idleTimeoutMinutes: this.idleTimeoutMs / 60000,
    });

    // Run immediately
    this.checkHealth().catch((error) => {
      logger.error('Initial health check failed', error);
    });

    // Then run periodically
    this.interval = setInterval(() => {
      this.checkHealth().catch((error) => {
        logger.error('Health check failed', error);
      });
    }, this.checkIntervalMs);
  }

  /**
   * Stops the health check interval
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.info('Stopped ERP-DB connection health check');
    }
  }

  /**
   * Performs a health check on the ERP-DB connection
   * Returns health status and logs warnings if needed
   */
  async checkHealth(): Promise<HealthStatus> {
    this.lastCheckTime = new Date();
    const warnings: string[] = [];

    const isConnected = this.erpConnectionProvider.isConnected();
    const poolStats = this.erpConnectionProvider.getPoolStats();

    if (!isConnected) {
      logger.debug('Health check: ERP-DB is not connected');
      return {
        isConnected: false,
        poolStats: null,
        lastCheck: this.lastCheckTime,
        warnings: ['ERP-DB is not connected'],
      };
    }

    if (poolStats) {
      logger.debug('Health check: ERP-DB pool stats', poolStats);

      // Check if pool is nearing capacity
      const usagePercent = poolStats.total > 0 ? (poolStats.active / poolStats.total) * 100 : 0;
      if (usagePercent > 80) {
        const warning = `Pool usage is high: ${usagePercent.toFixed(0)}% (${poolStats.active}/${poolStats.total})`;
        warnings.push(warning);
        logger.warn(warning);
      }

      // Check if there are waiting clients
      if (poolStats.waiting > 0) {
        const warning = `${poolStats.waiting} client(s) waiting for connection`;
        warnings.push(warning);
        logger.warn(warning);
      }

      // Log idle connections
      if (poolStats.idle > 0) {
        logger.debug(`${poolStats.idle} idle connection(s) in pool`);
      }
    }

    return {
      isConnected: true,
      poolStats,
      lastCheck: this.lastCheckTime,
      warnings,
    };
  }

  /**
   * Cleanup idle connections (TypeORM handles this automatically with pool config)
   * This method is here for future manual cleanup if needed
   */
  async cleanupIdleConnections(): Promise<number> {
    const poolStats = this.erpConnectionProvider.getPoolStats();
    
    if (!poolStats || poolStats.idle === 0) {
      return 0;
    }

    // TypeORM's pool automatically handles idle cleanup based on idleTimeout
    // Log the current state for monitoring
    logger.debug('Idle connections being managed by pool', {
      idle: poolStats.idle,
      total: poolStats.total,
    });

    return poolStats.idle;
  }

  /**
   * Gets the last health status
   */
  getLastCheckTime(): Date {
    return this.lastCheckTime;
  }
}

// Export singleton instance
let healthCheckInstance: ConnectionHealthCheck | null = null;

export function getHealthCheckInstance(): ConnectionHealthCheck {
  if (!healthCheckInstance) {
    healthCheckInstance = new ConnectionHealthCheck();
  }
  return healthCheckInstance;
}

