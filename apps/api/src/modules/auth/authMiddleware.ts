import { Request, Response, NextFunction } from 'express';
import { sendError } from '../../shared/http/responseFormatter';
import { TokenService } from './services/TokenService';
import { logger } from '../../config/logger';

const tokenService = new TokenService();

/**
 * Extrai o token do header Authorization, cookie ou body
 */
function extractToken(req: Request): string | null {
  // 1. Tentar extrair do header Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Tentar extrair do cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // 3. Tentar extrair do body (fallback)
  if ((req.body as any)?.token) {
    return (req.body as any).token;
  }

  return null;
}

/**
 * Middleware de autenticação baseado em tokens
 * Valida o token e adiciona req.user e req.token à requisição
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extrair token
    const token = extractToken(req);

    if (!token) {
      sendError(res, 'Token não fornecido. Login necessário.', 401);
      return;
    }

    // Validar token
    const validation = await tokenService.validateToken(token);

    if (!validation.valid || !validation.usuario) {
      const errorMessage = validation.error || 'Token inválido ou expirado';
      logger.warn('Token validation failed', {
        token: token.substring(0, 8) + '...',
        error: errorMessage,
      });
      sendError(res, errorMessage, 401);
      return;
    }

    // Verificar se o usuário tem privilégios
    if (validation.usuario.flagprivilegiado !== 1) {
      logger.warn('User without privileges attempted access', {
        usuario_id: validation.usuario.usuario_id,
      });
      sendError(res, 'Usuário não possui privilégios de acesso', 403);
      return;
    }

    // Adicionar informações do usuário e token à requisição
    (req as any).user = validation.usuario;
    (req as any).token = token;

    // Continuar para o próximo middleware
    next();
  } catch (error: any) {
    logger.error('Auth middleware error', error);
    sendError(res, 'Erro ao validar autenticação', 500);
  }
}

