import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

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
        url: 'http://localhost:3000',
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
    './apps/api/src/modules/**/*.ts',
    './apps/api/src/webhooks/**/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options) as any;

// Gerar arquivo .ts com o spec embutido
const tsOutputPath = resolve(__dirname, '../config/swagger-spec-generated.ts');
const tsContent = `// Auto-generated file - DO NOT EDIT
// Generated at: ${new Date().toISOString()}

export const preGeneratedSwaggerSpec = ${JSON.stringify(swaggerSpec, null, 2)};
`;

writeFileSync(tsOutputPath, tsContent);

// Também gerar JSON para referência
const jsonOutputPath = resolve(__dirname, '../swagger-spec.json');
writeFileSync(jsonOutputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ Swagger spec generated successfully`);
console.log(`   TypeScript: ${tsOutputPath}`);
console.log(`   JSON: ${jsonOutputPath}`);
console.log(`   Paths found: ${Object.keys(swaggerSpec.paths || {}).length}`);

