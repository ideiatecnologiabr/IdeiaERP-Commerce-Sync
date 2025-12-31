import { appDataSource } from '../../../config/database';
import { Setting } from '../../../entities/app/Setting';
import { logger } from '../../../config/logger';
import { createHash } from 'crypto';

export interface ErpDbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class SettingsService {
  private settingsRepo = appDataSource.getRepository(Setting);

  /**
   * Ensures that the default ERP-DB settings exist in the database
   */
  async ensureDefaults(): Promise<void> {
    const defaults = [
      { key: 'ERP_DB_HOST', value: 'localhost' },
      { key: 'ERP_DB_PORT', value: '3306' },
      { key: 'ERP_DB_USER', value: 'root' },
      { key: 'ERP_DB_PASSWORD', value: 'ideia' },
      { key: 'ERP_DB_NAME', value: 'ideiaerp' },
      {
        key: 'SESSION_SECRET',
        value: createHash('md5').update(Date.now().toString()).digest('hex'),
      },
    ];

    for (const defaultSetting of defaults) {
      const existing = await this.settingsRepo.findOne({
        where: { key: defaultSetting.key },
      });

      if (!existing) {
        const setting = this.settingsRepo.create(defaultSetting);
        await this.settingsRepo.save(setting);
        logger.debug(`Created default setting: ${defaultSetting.key}`);
      }
    }

    logger.info('Settings defaults ensured');
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<Setting[]> {
    return this.settingsRepo.find({
      order: { key: 'ASC' },
    });
  }

  /**
   * Get setting by key
   */
  async getByKey(key: string): Promise<Setting | null> {
    return this.settingsRepo.findOne({ where: { key } });
  }

  /**
   * Create or update a setting
   */
  async set(key: string, value: string): Promise<Setting> {
    // Validate the value based on key
    this.validateSetting(key, value);

    let setting = await this.settingsRepo.findOne({ where: { key } });

    if (setting) {
      setting.value = value;
    } else {
      setting = this.settingsRepo.create({ key, value });
    }

    // Never log the password value
    if (key !== 'ERP_DB_PASSWORD') {
      logger.info(`Setting updated: ${key} = ${value}`);
    } else {
      logger.info(`Setting updated: ${key} = ********`);
    }

    return this.settingsRepo.save(setting);
  }

  /**
   * Delete a setting
   */
  async delete(key: string): Promise<boolean> {
    const result = await this.settingsRepo.delete({ key });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Get ERP-DB configuration from settings
   */
  async getErpDbConfig(): Promise<ErpDbConfig> {
    const settings = await this.getAll();
    const config: any = {};

    for (const setting of settings) {
      if (setting.key.startsWith('ERP_DB_')) {
        const configKey = setting.key.replace('ERP_DB_', '').toLowerCase();
        config[configKey] = setting.value;
      }
    }

    // Validate required fields
    if (!config.host || !config.port || !config.user || !config.password || !config.name) {
      throw new Error('ERP-DB configuration incomplete. Missing required settings.');
    }

    return {
      host: config.host,
      port: parseInt(config.port, 10),
      user: config.user,
      password: config.password,
      database: config.name,
    };
  }

  /**
   * Validate setting value based on key
   */
  private validateSetting(key: string, value: string): void {
    if (!value || value.trim() === '') {
      throw new Error(`Setting value cannot be empty`);
    }

    // Validate specific keys
    if (key === 'ERP_DB_PORT') {
      const port = parseInt(value, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('ERP_DB_PORT must be a number between 1 and 65535');
      }
    }

    if (key === 'ERP_DB_HOST' && value.trim() === '') {
      throw new Error('ERP_DB_HOST cannot be empty');
    }

    if (key === 'ERP_DB_NAME' && value.trim() === '') {
      throw new Error('ERP_DB_NAME cannot be empty');
    }

    if (key === 'ERP_DB_USER' && value.trim() === '') {
      throw new Error('ERP_DB_USER cannot be empty');
    }
  }

  /**
   * Get SESSION_SECRET from settings
   * Throws error if not found (should never happen after ensureDefaults)
   */
  async getSessionSecret(): Promise<string> {
    const setting = await this.getByKey('SESSION_SECRET');
    if (!setting || !setting.value) {
      throw new Error('SESSION_SECRET not found in settings database');
    }
    return setting.value;
  }
}

