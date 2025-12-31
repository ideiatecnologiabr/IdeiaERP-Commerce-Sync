import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { getEnv } from './env';
import { logger } from './logger';

const env = getEnv();

// Detectar se está rodando como executável empacotado (pkg)
const isPkgExecutable = !!(process as any).pkg;

// Ajustar paths dependendo do ambiente
const getApiPaths = () => {
  if (isPkgExecutable) {
    // Quando empacotado, os arquivos .js estão em /snapshot/api/
    return [
      path.join(__dirname, '../modules/**/*.js'),
      path.join(__dirname, '../webhooks/**/*.js'),
    ];
  } else {
    // Em desenvolvimento, tentar ambos .ts e .js
    return [
      path.join(__dirname, '../modules/**/*.ts'),
      path.join(__dirname, '../webhooks/**/*.ts'),
      path.join(__dirname, '../modules/**/*.js'),
      path.join(__dirname, '../webhooks/**/*.js'),
    ];
  }
};

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
        Setting: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único da configuração',
            },
            key: {
              type: 'string',
              description: 'Chave da configuração',
              example: 'ERP_DB_HOST',
            },
            value: {
              type: 'string',
              description: 'Valor da configuração (senha mascarada em leituras)',
              example: 'localhost',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização',
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
      { name: 'Settings', description: 'Configurações do sistema' },
    ],
  },
  apis: getApiPaths(),
};

let swaggerSpec: any;

// Detectar se está rodando como executável empacotado (pkg)
const isPkg = !!(process as any).pkg;

// Tentar carregar spec pré-gerado (importado como módulo)
try {
  const { preGeneratedSwaggerSpec } = require('./swagger-spec-generated');
  swaggerSpec = preGeneratedSwaggerSpec;
  // Atualizar servidor com porta dinâmica
  if (swaggerSpec.servers && swaggerSpec.servers[0]) {
    swaggerSpec.servers[0].url = `http://localhost:${env.PORT}`;
  }
  const pathCount = Object.keys(swaggerSpec.paths || {}).length;
  logger.info('Swagger spec loaded from pre-generated module', { 
    paths: pathCount,
    source: 'swagger-spec-generated.ts',
  });
} catch (error) {
  logger.debug('Pre-generated swagger spec not found, generating dynamically', {
    error: error instanceof Error ? error.message : 'Unknown error'
  });
  
  // Fallback para geração dinâmica (desenvolvimento)
  try {
    swaggerSpec = swaggerJsdoc(options);
    const pathCount = Object.keys(swaggerSpec.paths || {}).length;
    logger.info('Swagger documentation loaded successfully', { 
      paths: pathCount,
      apiFiles: getApiPaths(),
      mode: 'dynamic',
    });
    
    if (pathCount === 0) {
      logger.warn('No API paths found in swagger spec. JSDoc comments may be missing.');
    }
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
}

export { swaggerSpec };

export function setupSwagger(app: Express): void {
  try {
    // Serve Swagger spec as JSON
    app.get('/openapi.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    
    // Detectar se está rodando como executável empacotado (pkg)
    const isPkgExecutable = !!(process as any).pkg;
    
    if (isPkgExecutable) {
      // Usar CDN para servir Swagger UI quando empacotado
      app.get('/docs', (req, res) => {
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IdeiaERP Commerce Sync API</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0/swagger-ui.css">
  <style>
    .swagger-ui .topbar { display: none }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
        `);
      });
    } else {
      // Usar swagger-ui-express normalmente em desenvolvimento
      app.use('/docs', swaggerUi.serve);
      app.get('/docs', swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'IdeiaERP Commerce Sync API',
      }));
    }
    
    logger.info(`Swagger UI available at http://localhost:${env.PORT}/docs`);
  } catch (error) {
    logger.error('Error setting up Swagger:', error);
  }
}

