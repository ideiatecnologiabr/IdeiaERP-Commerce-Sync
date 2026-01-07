import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../config/logger';

/**
 * Interface para uma seção do arquivo INI
 */
export interface IniSection {
  [key: string]: string;
}

/**
 * Interface para o arquivo INI completo
 */
export interface IniConfig {
  [section: string]: IniSection;
}

/**
 * Interface para configuração de banco de dados
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/**
 * Parser simples para arquivos INI
 * @param filePath - Caminho do arquivo INI
 * @returns Objeto com as seções e valores
 */
export function parseIniFile(filePath: string): IniConfig {
  const config: IniConfig = {};
  
  if (!fs.existsSync(filePath)) {
    logger.warn(`INI file not found: ${filePath}`);
    return config;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  
  let currentSection = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Ignora linhas vazias e comentários
    if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine.startsWith('#')) {
      continue;
    }

    // Detecta seção [SECAO]
    const sectionMatch = trimmedLine.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      config[currentSection] = {};
      continue;
    }

    // Detecta chave=valor
    const keyValueMatch = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (keyValueMatch && currentSection) {
      const key = keyValueMatch[1].trim();
      const value = keyValueMatch[2].trim();
      config[currentSection][key] = value;
    }
  }

  return config;
}

/**
 * Obtém o caminho do arquivo config.ini
 * Se for executável pkg, usa o diretório do executável
 * Caso contrário, usa o diretório do projeto
 */
export function getConfigIniPath(): string {
  const isPkgExecutable = typeof (process as any).pkg !== 'undefined';
  
  if (isPkgExecutable) {
    // Em modo pkg, usa o diretório onde o executável está
    const executableDir = path.dirname(process.execPath);
    return path.join(executableDir, 'config.ini');
  } else {
    // Em modo desenvolvimento, usa o diretório raiz do projeto
    return path.join(process.cwd(), 'config.ini');
  }
}

/**
 * Lê configurações do banco de dados do config.ini
 * @returns Configurações do banco ou null se não encontrado
 */
export function readDatabaseConfigFromIni(): DatabaseConfig | null {
  const configPath = getConfigIniPath();
  
  logger.debug('Looking for config.ini at:', { path: configPath });
  
  if (!fs.existsSync(configPath)) {
    logger.debug('config.ini not found, using environment variables');
    return null;
  }

  try {
    const config = parseIniFile(configPath);
    
    if (!config.DADOS) {
      logger.warn('config.ini found but [DADOS] section is missing');
      return null;
    }

    const dados = config.DADOS;
    
    // Valida campos obrigatórios
    if (!dados.HOST || !dados.BANCO || !dados.USER || !dados.PORTA) {
      logger.warn('config.ini [DADOS] section is incomplete', {
        hasHost: !!dados.HOST,
        hasBanco: !!dados.BANCO,
        hasUser: !!dados.USER,
        hasPorta: !!dados.PORTA,
      });
      return null;
    }

    logger.info('Database configuration loaded from config.ini', {
      host: dados.HOST,
      database: dados.BANCO,
      user: dados.USER,
      port: dados.PORTA,
    });

    return {
      host: dados.HOST,
      port: parseInt(dados.PORTA, 10),
      database: dados.BANCO,
      user: dados.USER,
      password: dados.SENHA || '', // Senha criptografada, será descriptografada depois
    };
  } catch (error) {
    logger.error('Error reading config.ini', { error });
    return null;
  }
}


