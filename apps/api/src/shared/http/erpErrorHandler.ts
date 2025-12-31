import { Request, Response, NextFunction } from 'express';
import { ErpDatabaseUnavailableError } from '../errors/ErpDatabaseUnavailableError';
import { logger } from '../../config/logger';

/**
 * Middleware to handle ERP Database connection errors
 */
export function erpErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ErpDatabaseUnavailableError) {
    logger.warn('ERP-DB unavailable for request', {
      path: req.path,
      method: req.method,
      error: err.message,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: 'Não foi possível conectar ao banco de dados do ERP. Verifique as configurações em /admin/settings.',
        details: err.message,
      },
    });
    return;
  }

  // Pass to next error handler
  next(err);
}

