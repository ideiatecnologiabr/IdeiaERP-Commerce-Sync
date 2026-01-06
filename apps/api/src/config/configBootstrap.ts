import { readDatabaseConfigFromIni } from '../shared/utils/iniParser';
import { decryptIdeiaPassword } from '../shared/utils/crypto';
import { logger } from './logger';

/**
 * Interface para o resultado do bootstrap de configuração
 */
export interface ConfigBootstrapResult {
  shouldSaveErpConfig: boolean;
  erpConfig?: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
}

/**
 * Realiza o bootstrap da configuração a partir do arquivo config.ini
 * 
 * Este método:
 * 1. Verifica se existe o arquivo config.ini
 * 2. Se existir, lê as configurações da seção [DADOS]
 * 3. Descriptografa a senha usando o algoritmo do IdeiaERP
 * 4. Atualiza as variáveis de ambiente para APP-DB
 * 5. Retorna as configurações do ERP para serem salvas no banco
 * 
 * @returns ConfigBootstrapResult indicando se deve salvar configs do ERP e os valores
 */
export async function bootstrapConfigFromIni(): Promise<ConfigBootstrapResult> {
  try {
    // Tenta ler config.ini
    const iniConfig = readDatabaseConfigFromIni();
    
    if (!iniConfig) {
      logger.info('config.ini not found, using environment variables');
      return {
        shouldSaveErpConfig: false,
      };
    }

    logger.info('config.ini found, using database configuration from file');

    // Descriptografa a senha
    const decryptedPassword = decryptIdeiaPassword(iniConfig.password);

    // Atualiza as variáveis de ambiente para APP-DB
    // APP-DB sempre usa o banco 'ideiaerp_sync', mas as credenciais vêm do config.ini
    process.env.APP_DB_HOST = iniConfig.host;
    process.env.APP_DB_PORT = iniConfig.port.toString();
    process.env.APP_DB_USER = iniConfig.user;
    process.env.APP_DB_PASSWORD = decryptedPassword;
    // APP_DB_NAME não é alterado - mantém 'ideiaerp_sync'

    logger.info('Environment variables updated from config.ini', {
      APP_DB_HOST: iniConfig.host,
      APP_DB_PORT: iniConfig.port,
      APP_DB_USER: iniConfig.user,
      APP_DB_NAME: process.env.APP_DB_NAME || 'ideiaerp_sync',
    });

    // Retorna as configurações do ERP para serem salvas no banco
    return {
      shouldSaveErpConfig: true,
      erpConfig: {
        host: iniConfig.host,
        port: iniConfig.port,
        database: iniConfig.database,
        user: iniConfig.user,
        password: decryptedPassword,
      },
    };
  } catch (error) {
    logger.error('Error bootstrapping config from INI', { error });
    logger.info('Falling back to environment variables');
    return {
      shouldSaveErpConfig: false,
    };
  }
}

