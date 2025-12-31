import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { join } from 'path';
import { existsSync } from 'fs';
import { getEnv } from './config/env';
import { logger } from './config/logger';
import { setupSwagger } from './config/swagger';
import { SettingsService } from './modules/settings/services/SettingsService';

const env = getEnv();

export async function createApp(): Promise<Express> {
  const app = express();

  // Detectar se está rodando localmente
  const isLocalhost = env.APP_DB_HOST === 'localhost' || env.APP_DB_HOST === '127.0.0.1';

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' && !isLocalhost ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    } : false,
    hsts: env.NODE_ENV === 'production' && !isLocalhost ? {
      maxAge: 31536000,
      includeSubDomains: true,
    } : false,
  }));
  app.use(cors({
    origin: env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Compression
  app.use(compression());

  // Get SESSION_SECRET from database
  const settingsService = new SettingsService();
  const sessionSecret = await settingsService.getSessionSecret();

  // Session
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

  // Request logging (deve vir antes das rotas)
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Swagger (deve vir antes das rotas para evitar conflitos)
  setupSwagger(app);

  // Webhooks (public, but token-protected)
  const webhookRoutes = require('./webhooks/webhook.routes').default;
  app.use('/webhooks', webhookRoutes);

  // API Routes (versioned)
  const apiRoutes = require('./modules/api.routes').default;
  app.use('/api/v1', apiRoutes);

  // Serve Angular SPA (apenas em produção)
  if (env.NODE_ENV === 'production') {
    // Detectar se está rodando como executável empacotado (pkg)
    const isPkgExecutable = !!(process as any).pkg;
    
    // Ajustar path dependendo do ambiente
    const angularDistPath = isPkgExecutable
      ? '/snapshot/api/src/web' // No pkg: assets ficam em /snapshot/api/src/web
      : join(__dirname, '../web');   // No dist normal: dist/apps/api/src -> dist/apps/api/src/web
    
    if (existsSync(angularDistPath)) {
      // Serve arquivos estáticos do Angular
      app.use('/app', express.static(angularDistPath));
      
      // Fallback para index.html (para rotas do Angular)
      app.get('/app/*', (req: Request, res: Response) => {
        res.sendFile(join(angularDistPath, 'index.html'));
      });
      
      logger.info('Angular frontend available at /app');
    } else {
      logger.warn('Angular dist not found. Build frontend with: pnpm run build:web');
    }
  } else {
    logger.info('Development mode: Angular should be served by Angular CLI on port 4200');
  }

  // Import error handlers
  const { erpErrorHandler } = require('./shared/http/erpErrorHandler');

  // ERP Database error handler (must come first)
  app.use(erpErrorHandler);

  // General error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
      },
    });
  });

  return app;
}

