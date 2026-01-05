import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSyncLogLojavirtualId1734129600000 implements MigrationInterface {
  name = 'FixSyncLogLojavirtualId1734129600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a tabela existe
    const tableExists = await queryRunner.hasTable('sync_log');
    
    if (!tableExists) {
      // Criar a tabela se não existir
      await queryRunner.query(`
        CREATE TABLE \`sync_log\` (
          \`sync_log_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`lojavirtual_id\` VARCHAR(36) NOT NULL,
          \`tipo\` VARCHAR(50) NOT NULL,
          \`acao\` VARCHAR(50) NOT NULL,
          \`entidade\` VARCHAR(100) NOT NULL,
          \`entidade_id\` VARCHAR(255) NULL,
          \`status\` VARCHAR(50) NOT NULL,
          \`mensagem\` TEXT NULL,
          \`detalhes\` TEXT NULL,
          \`datacadastro\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } else {
      // Verificar se a coluna existe e qual é o tipo atual
      const table = await queryRunner.getTable('sync_log');
      const lojavirtualIdColumn = table?.findColumnByName('lojavirtual_id');
      
      if (lojavirtualIdColumn) {
        // Se a coluna já é VARCHAR(36), não precisa fazer nada
        if (lojavirtualIdColumn.type !== 'varchar' || lojavirtualIdColumn.length !== '36') {
          // Alterar coluna lojavirtual_id de INT para VARCHAR(36)
          await queryRunner.query(`
            ALTER TABLE \`sync_log\` 
            MODIFY COLUMN \`lojavirtual_id\` VARCHAR(36) NOT NULL
          `);
        }
      } else {
        // Se a coluna não existe, criar
        await queryRunner.query(`
          ALTER TABLE \`sync_log\` 
          ADD COLUMN \`lojavirtual_id\` VARCHAR(36) NOT NULL
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a tabela existe
    const tableExists = await queryRunner.hasTable('sync_log');
    
    if (tableExists) {
      const table = await queryRunner.getTable('sync_log');
      const lojavirtualIdColumn = table?.findColumnByName('lojavirtual_id');
      
      if (lojavirtualIdColumn && lojavirtualIdColumn.type === 'varchar') {
        // Reverter para INT (cuidado: pode perder dados se houver UUIDs)
        await queryRunner.query(`
          ALTER TABLE \`sync_log\` 
          MODIFY COLUMN \`lojavirtual_id\` INT NOT NULL
        `);
      }
    }
  }
}