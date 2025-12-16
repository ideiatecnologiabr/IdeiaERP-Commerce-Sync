import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { getEnv } from './env';
import { logger } from './logger';

const env = getEnv();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IdeiaERP Commerce Sync API',
      version: '1.0.0',
      description: 'API REST para sincronização entre IdeiaERP e lojas virtuais',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'UUID',
          description: 'Token de autenticação obtido no endpoint /auth/login',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: { type: 'object', nullable: true },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string' },
            senha: { type: 'string' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            usuario: {
              type: 'object',
              properties: {
                usuario_id: { type: 'number' },
                nome: { type: 'string' },
                email: { type: 'string' },
              },
            },
            token: {
              type: 'string',
              description: 'Token de acesso (UUID)',
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token para renovar o token de acesso (UUID)',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de expiração do token',
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh token para renovar o token de acesso',
            },
          },
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Novo token de acesso (UUID)',
            },
            refreshToken: {
              type: 'string',
              description: 'Novo refresh token (UUID)',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de expiração do novo token',
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticação' },
      { name: 'Dashboard', description: 'Dashboard administrativo' },
      { name: 'LojaVirtual', description: 'Gestão de lojas virtuais' },
      { name: 'Produtos', description: 'Gestão de produtos' },
      { name: 'Pedidos', description: 'Gestão de pedidos' },
      { name: 'Sync', description: 'Sincronizações' },
      { name: 'Logs', description: 'Logs de sincronização' },
      { name: 'Webhooks', description: 'Webhooks públicos' },
    ],
  },
  apis: [
    path.join(__dirname, '../modules/**/*.ts'),
    path.join(__dirname, '../webhooks/**/*.ts'),
    path.join(__dirname, '../modules/**/*.js'),
    path.join(__dirname, '../webhooks/**/*.js'),
  ],
};

let swaggerSpec: any;

try {
  swaggerSpec = swaggerJsdoc(options);
  logger.info('Swagger documentation loaded successfully');
} catch (error) {
  logger.error('Error loading Swagger documentation:', error);
  // Create a minimal spec if loading fails
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'IdeiaERP Commerce Sync API',
      version: '1.0.0',
      description: 'API REST para sincronização entre IdeiaERP e lojas virtuais',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    paths: {},
  };
}

export { swaggerSpec };

export function setupSwagger(app: Express): void {
  try {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'IdeiaERP Commerce Sync API',
    }));
    
    app.get('/openapi.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    
    logger.info(`Swagger UI available at http://localhost:${env.PORT}/docs`);
  } catch (error) {
    logger.error('Error setting up Swagger:', error);
  }
}

