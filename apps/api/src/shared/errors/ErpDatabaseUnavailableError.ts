export class ErpDatabaseUnavailableError extends Error {
  code: string;
  statusCode: number;

  constructor(message?: string) {
    super(message || 'Não foi possível conectar ao banco de dados do ERP. Verifique as configurações.');
    this.name = 'ErpDatabaseUnavailableError';
    this.code = 'ERP_DB_UNAVAILABLE';
    this.statusCode = 503;
    Error.captureStackTrace(this, this.constructor);
  }
}

