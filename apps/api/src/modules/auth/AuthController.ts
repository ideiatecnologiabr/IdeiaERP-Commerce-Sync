import { Request, Response } from 'express';
import { erpConnectionProvider } from '../settings/services/ErpDbConnectionProvider';
import { Usuario } from '../../entities/erp';
import { sendSuccess, sendError } from '../../shared/http/responseFormatter';
import { logger } from '../../config/logger';
import { TokenService } from './services/TokenService';

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login de usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 */
export class AuthController {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        sendError(res, 'Email e senha são obrigatórios', 400);
        return;
      }

      // Ensure ERP-DB connection
      await erpConnectionProvider.ensureConnection();
      const erpDataSource = erpConnectionProvider.getDataSource();

      const repository = erpDataSource.getRepository(Usuario);
      const usuario = await repository.findOne({
        where: {
          email,
          flagexcluido: 0,
        },
      });

      if (!usuario || usuario.senha !== senha) {
        // TODO: Implement proper password hashing (bcrypt)
        sendError(res, 'Credenciais inválidas', 401);
        return;
      }

      if (usuario.flagprivilegiado !== 1) {
        sendError(res, 'Usuário não possui privilégios de acesso', 403);
        return;
      }

      // Criar tokens
      const tokenInfo = await this.tokenService.createToken(
        usuario.usuario_id,
        usuario,
        req
      );

      logger.info('User logged in', { usuario_id: usuario.usuario_id, email });

      // Retornar token no header e no body
      res.setHeader('Authorization', `Bearer ${tokenInfo.token}`);

      sendSuccess(res, {
        usuario: {
          usuario_id: usuario.usuario_id,
          nome: usuario.nome,
          email: usuario.email,
        },
        token: tokenInfo.token,
        refreshToken: tokenInfo.refreshToken,
        expiresAt: tokenInfo.expiresAt,
      });
    } catch (error: any) {
      logger.error('Login error', error);
      sendError(res, 'Erro ao realizar login', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Logout de usuário
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout realizado com sucesso
   *       401:
   *         description: Não autenticado
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Extrair token do header Authorization ou do body
      const token = this.extractToken(req);

      if (!token) {
        sendError(res, 'Token não fornecido', 401);
        return;
      }

      // Revogar token
      const revoked = await this.tokenService.revokeToken(token);

      if (!revoked) {
        sendError(res, 'Token não encontrado ou já revogado', 404);
        return;
      }

      logger.info('User logged out', { token: token.substring(0, 8) + '...' });

      sendSuccess(res, { message: 'Logout realizado com sucesso' });
    } catch (error: any) {
      logger.error('Logout error', error);
      sendError(res, 'Erro ao realizar logout', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/me:
   *   get:
   *     tags: [Auth]
   *     summary: Obter informações do usuário logado
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Informações do usuário
   *       401:
   *         description: Não autenticado
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      // O token já foi validado pelo middleware, usar req.user
      const usuario = (req as any).user;

      if (!usuario) {
        sendError(res, 'Não autenticado', 401);
        return;
      }

      sendSuccess(res, {
        usuario: {
          usuario_id: usuario.usuario_id,
          nome: usuario.nome,
          email: usuario.email,
        },
      });
    } catch (error: any) {
      logger.error('Get user error', error);
      sendError(res, 'Erro ao obter informações do usuário', 500);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     tags: [Auth]
   *     summary: Renovar token de acesso
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [refreshToken]
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: Refresh token para renovar o token de acesso
   *     responses:
   *       200:
   *         description: Token renovado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean }
   *                 data:
   *                   type: object
   *                   properties:
   *                     token: { type: string }
   *                     refreshToken: { type: string }
   *                     expiresAt: { type: string }
   *       401:
   *         description: Refresh token inválido ou expirado
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        sendError(res, 'Refresh token é obrigatório', 400);
        return;
      }

      // Renovar token
      const tokenInfo = await this.tokenService.refreshToken(refreshToken, req);

      if (!tokenInfo) {
        sendError(res, 'Refresh token inválido ou expirado', 401);
        return;
      }

      // Retornar novo token no header
      res.setHeader('Authorization', `Bearer ${tokenInfo.token}`);

      sendSuccess(res, {
        token: tokenInfo.token,
        refreshToken: tokenInfo.refreshToken,
        expiresAt: tokenInfo.expiresAt,
      });
    } catch (error: any) {
      logger.error('Refresh token error', error);
      sendError(res, 'Erro ao renovar token', 500);
    }
  }

  /**
   * Extrai o token do header Authorization ou do body
   */
  private extractToken(req: Request): string | null {
    // Tentar extrair do header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Tentar extrair do body
    if ((req.body as any)?.token) {
      return (req.body as any).token;
    }

    return null;
  }
}

