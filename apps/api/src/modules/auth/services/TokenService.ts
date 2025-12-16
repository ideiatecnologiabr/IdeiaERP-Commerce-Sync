import { Request } from 'express';
import { erpDataSource } from '../../../config/database';
import { UsuarioSessaoToken } from '../../../entities/erp';
import { Usuario } from '../../../entities/erp';
import { logger } from '../../../config/logger';
import { getEnv } from '../../../config/env';
import { randomUUID } from 'crypto';

export interface TokenInfo {
  token: string;
  refreshToken: string;
  usuario_id: number;
  usuario: Usuario;
  expiresAt: Date;
}

export interface TokenValidationResult {
  valid: boolean;
  token?: UsuarioSessaoToken;
  usuario?: Usuario;
  error?: string;
}

export class TokenService {
  private readonly TOKEN_EXPIRATION_MINUTES: number;
  private readonly REFRESH_TOKEN_EXPIRATION_DAYS: number;
  private readonly APLICATIVO = 'IdeiaERP Commerce Sync';
  private readonly VERSAO = '1.0.0';

  constructor() {
    const env = getEnv();
    this.TOKEN_EXPIRATION_MINUTES = env.TOKEN_EXPIRATION_MINUTES;
    this.REFRESH_TOKEN_EXPIRATION_DAYS = env.REFRESH_TOKEN_EXPIRATION_DAYS;
  }

  /**
   * Cria um novo token de acesso e refresh token
   */
  async createToken(usuario_id: number, usuario: Usuario, req: Request): Promise<TokenInfo> {
    const repository = erpDataSource.getRepository(UsuarioSessaoToken);
    
    // Gerar UUIDs para os tokens
    const tokenId = randomUUID();
    const refreshTokenId = randomUUID();
    
    // Capturar informações da requisição
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    // Limitar tamanho total para 100 caracteres (tamanho da coluna)
    const maquinaFull = `${ip} - ${userAgent}`;
    const maquina = maquinaFull.length > 100 ? maquinaFull.substring(0, 100) : maquinaFull;
    
    // Criar token principal (flagpersistente = 0)
    const token = repository.create({
      usuariosessaotoken_id: tokenId,
      usuario_id: usuario_id.toString(), // Converter number para string
      aplicativo: this.APLICATIVO,
      versao: this.VERSAO,
      login: usuario.email || null,
      maquina: maquina,
      conn_id: null,
      datahoralogin: new Date(),
      flagwebservice: 1,
      flagpersistente: 0, // Token principal (não persistente)
    });
    
    // Criar refresh token (flagpersistente = 1)
    const refreshToken = repository.create({
      usuariosessaotoken_id: refreshTokenId,
      usuario_id: usuario_id.toString(),
      aplicativo: this.APLICATIVO,
      versao: this.VERSAO,
      login: usuario.email || null,
      maquina: maquina,
      conn_id: null,
      datahoralogin: new Date(),
      flagwebservice: 1,
      flagpersistente: 1, // Refresh token (persistente)
    });
    
    // Salvar ambos os tokens
    await repository.save([token, refreshToken]);
    
    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.TOKEN_EXPIRATION_MINUTES);
    
    logger.info('Token created', {
      usuario_id,
      token_id: tokenId,
      refresh_token_id: refreshTokenId,
    });
    
    return {
      token: tokenId,
      refreshToken: refreshTokenId,
      usuario_id,
      usuario,
      expiresAt,
    };
  }

  /**
   * Valida um token e retorna informações do usuário
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const repository = erpDataSource.getRepository(UsuarioSessaoToken);
      
      // Buscar token (apenas tokens principais, não refresh tokens)
      const tokenRecord = await repository.findOne({
        where: {
          usuariosessaotoken_id: token,
          flagpersistente: 0, // Apenas tokens principais
        },
      });
      
      if (!tokenRecord) {
        return {
          valid: false,
          error: 'Token não encontrado',
        };
      }
      
      // Verificar se o token não expirou
      if (tokenRecord.datahoralogin) {
        const expirationTime = new Date(tokenRecord.datahoralogin);
        expirationTime.setMinutes(expirationTime.getMinutes() + this.TOKEN_EXPIRATION_MINUTES);
        
        if (new Date() > expirationTime) {
          // Token expirado - remover do banco
          await repository.remove(tokenRecord);
          return {
            valid: false,
            error: 'Token expirado',
          };
        }
      }
      
      // Buscar informações do usuário
      const usuarioId = parseInt(tokenRecord.usuario_id || '0', 10);
      if (!usuarioId) {
        return {
          valid: false,
          error: 'Token inválido: usuario_id não encontrado',
        };
      }
      
      const usuarioRepository = erpDataSource.getRepository(Usuario);
      const usuario = await usuarioRepository.findOne({
        where: {
          usuario_id: usuarioId,
          flagexcluido: 0,
        },
      });
      
      if (!usuario) {
        return {
          valid: false,
          error: 'Usuário não encontrado',
        };
      }
      
      return {
        valid: true,
        token: tokenRecord,
        usuario,
      };
    } catch (error: any) {
      logger.error('Error validating token', error);
      return {
        valid: false,
        error: error.message || 'Erro ao validar token',
      };
    }
  }

  /**
   * Renova um token usando um refresh token
   */
  async refreshToken(refreshToken: string, req: Request): Promise<TokenInfo | null> {
    try {
      const repository = erpDataSource.getRepository(UsuarioSessaoToken);
      
      // Buscar refresh token (flagpersistente = 1)
      const refreshTokenRecord = await repository.findOne({
        where: {
          usuariosessaotoken_id: refreshToken,
          flagpersistente: 1, // Apenas refresh tokens
        },
      });
      
      if (!refreshTokenRecord) {
        logger.warn('Refresh token not found', { refreshToken });
        return null;
      }
      
      // Verificar se o refresh token não expirou
      if (refreshTokenRecord.datahoralogin) {
        const expirationTime = new Date(refreshTokenRecord.datahoralogin);
        expirationTime.setDate(expirationTime.getDate() + this.REFRESH_TOKEN_EXPIRATION_DAYS);
        
        if (new Date() > expirationTime) {
          // Refresh token expirado - remover
          await repository.remove(refreshTokenRecord);
          logger.warn('Refresh token expired', { refreshToken });
          return null;
        }
      }
      
      // Buscar informações do usuário
      const usuarioId = parseInt(refreshTokenRecord.usuario_id || '0', 10);
      if (!usuarioId) {
        logger.error('Invalid refresh token: usuario_id not found', { refreshToken });
        return null;
      }
      
      const usuarioRepository = erpDataSource.getRepository(Usuario);
      const usuario = await usuarioRepository.findOne({
        where: {
          usuario_id: usuarioId,
          flagexcluido: 0,
        },
      });
      
      if (!usuario) {
        logger.error('User not found for refresh token', { usuarioId });
        return null;
      }
      
      // Revogar token antigo (se existir) e refresh token atual
      if (!refreshTokenRecord.usuario_id) {
        logger.error('Refresh token without usuario_id', { refreshToken });
        return null;
      }
      
      const oldToken = await repository.findOne({
        where: {
          usuario_id: refreshTokenRecord.usuario_id,
          flagpersistente: 0,
        },
      });
      
      if (oldToken) {
        await repository.remove(oldToken);
      }
      await repository.remove(refreshTokenRecord);
      
      // Criar novos tokens
      const newTokens = await this.createToken(usuarioId, usuario, req);
      
      logger.info('Token refreshed', {
        usuario_id: usuarioId,
        old_refresh_token: refreshToken,
        new_token: newTokens.token,
      });
      
      return newTokens;
    } catch (error: any) {
      logger.error('Error refreshing token', error);
      return null;
    }
  }

  /**
   * Revoga um token (remove do banco)
   */
  async revokeToken(token: string): Promise<boolean> {
    try {
      const repository = erpDataSource.getRepository(UsuarioSessaoToken);
      
      const tokenRecord = await repository.findOne({
        where: {
          usuariosessaotoken_id: token,
        },
      });
      
      if (!tokenRecord) {
        return false;
      }
      
      // Se for um token principal, também remover o refresh token associado
      if (tokenRecord.flagpersistente === 0 && tokenRecord.usuario_id) {
        const refreshToken = await repository.findOne({
          where: {
            usuario_id: tokenRecord.usuario_id,
            flagpersistente: 1,
          },
        });
        
        if (refreshToken) {
          await repository.remove(refreshToken);
        }
      }
      
      await repository.remove(tokenRecord);
      
      logger.info('Token revoked', { token });
      return true;
    } catch (error: any) {
      logger.error('Error revoking token', error);
      return false;
    }
  }

  /**
   * Obtém informações de um token
   */
  async getTokenInfo(token: string): Promise<UsuarioSessaoToken | null> {
    try {
      const repository = erpDataSource.getRepository(UsuarioSessaoToken);
      
      const tokenRecord = await repository.findOne({
        where: {
          usuariosessaotoken_id: token,
        },
      });
      
      return tokenRecord || null;
    } catch (error: any) {
      logger.error('Error getting token info', error);
      return null;
    }
  }
}

