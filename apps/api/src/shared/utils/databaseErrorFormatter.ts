import { QueryFailedError } from 'typeorm';
import { logger } from '../../config/logger';

/**
 * Extrai o nome da coluna do erro SQL
 */
function extractColumnName(error: any): string | null {
  const sqlMessage = error.sqlMessage || error.message || '';
  const match = sqlMessage.match(/Unknown column ['`]?(\w+)\.(\w+)['`]?/i);
  if (match) {
    return `${match[1]}.${match[2]}`;
  }
  
  // Tentar outro padrão
  const match2 = sqlMessage.match(/column ['`]?(\w+)['`]?/i);
  if (match2) {
    return match2[1];
  }
  
  return null;
}

/**
 * Extrai o nome da tabela do erro SQL
 */
function extractTableName(error: any): string | null {
  const sqlMessage = error.sqlMessage || error.message || '';
  const match = sqlMessage.match(/Unknown column ['`]?(\w+)\.(\w+)['`]?/i);
  if (match) {
    return match[1];
  }
  
  return null;
}

/**
 * Formata erros de banco de dados de forma amigável
 */
export function formatDatabaseQueryError(error: any, context?: string): string {
  const errorCode = error.code || error.errno;
  const sqlMessage = error.sqlMessage || error.message || '';
  
  // Erro de coluna não encontrada (ER_BAD_FIELD_ERROR)
  if (errorCode === 'ER_BAD_FIELD_ERROR' || errorCode === 1054) {
    const columnName = extractColumnName(error);
    const tableName = extractTableName(error);
    
    let message = `
╔════════════════════════════════════════════════════════════════════════════╗
║  ⚠️  ERRO: Coluna Não Encontrada no Banco de Dados                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  A aplicação está tentando acessar uma coluna que não existe na tabela.   ║
║                                                                            ║`;
    
    if (tableName && columnName) {
      message += `
║                                                                            ║
║  Tabela: ${tableName}                                                      ║
║  Coluna: ${columnName}                                                    ║`;
    } else if (columnName) {
      message += `
║                                                                            ║
║  Coluna: ${columnName}                                                    ║`;
    }
    
    message += `
║                                                                            ║
║  Causa Provável:                                                           ║
║  • O banco de dados está em uma versão mais antiga do IdeiaERP            ║
║  • A estrutura da tabela não foi atualizada                                ║
║  • As colunas foram adicionadas na entidade mas não existem no banco       ║
║                                                                            ║
║  Soluções:                                                                 ║
║  1. Atualize o banco de dados do IdeiaERP para a versão mais recente       ║
║  2. Execute as migrations/atualizações do banco de dados                   ║
║  3. Adicione as colunas manualmente no banco (se necessário):              ║
║     ALTER TABLE ${tableName || 'tabela'} ADD COLUMN ${columnName || 'coluna'} ... ║
║                                                                            ║`;
    
    if (context) {
      message += `
║  Contexto: ${context}                                                      ║`;
    }
    
    message += `
╚════════════════════════════════════════════════════════════════════════════╝
`;
    
    return message;
  }
  
  // Erro de tabela não encontrada
  if (errorCode === 'ER_NO_SUCH_TABLE' || errorCode === 1146) {
    const tableMatch = sqlMessage.match(/Table ['`]?(\w+)['`]?/i);
    const tableName = tableMatch ? tableMatch[1] : 'desconhecida';
    
    return `
╔════════════════════════════════════════════════════════════════════════════╗
║  ⚠️  ERRO: Tabela Não Encontrada no Banco de Dados                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  A aplicação está tentando acessar uma tabela que não existe.             ║
║                                                                            ║
║  Tabela: ${tableName}                                                      ║
║                                                                            ║
║  Causa Provável:                                                           ║
║  • O banco de dados está em uma versão muito antiga do IdeiaERP           ║
║  • A estrutura do banco não foi criada/atualizada                          ║
║                                                                            ║
║  Soluções:                                                                 ║
║  1. Verifique se está conectado ao banco de dados correto                  ║
║  2. Atualize o banco de dados do IdeiaERP                                  ║
║  3. Execute as migrations necessárias                                      ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;
  }
  
  // Erro genérico de query
  return `
╔════════════════════════════════════════════════════════════════════════════╗
║  ⚠️  ERRO DE CONSULTA AO BANCO DE DADOS                                   ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ${sqlMessage}                                                             ║
║                                                                            ║
║  Código do Erro: ${errorCode}                                             ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;
}

/**
 * Wrapper para executar queries com tratamento de erro amigável
 */
export async function executeQueryWithErrorHandling<T>(
  queryFn: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await queryFn();
  } catch (error: any) {
    // Verificar se é um erro de query do TypeORM
    if (error instanceof QueryFailedError || error.code === 'ER_BAD_FIELD_ERROR' || error.code === 1054) {
      const friendlyMessage = formatDatabaseQueryError(error, context);
      console.error(friendlyMessage);
      logger.error('Database query error', {
        error: error.message,
        code: error.code,
        sql: error.sql,
        context,
      });
    }
    
    // Re-lançar o erro para que o chamador possa tratá-lo
    throw error;
  }
}

