import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixIntegrationsLojavirtualId1734129900000 implements MigrationInterface {
  name = 'FixIntegrationsLojavirtualId1734129900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a tabela existe
    const tableExists = await queryRunner.hasTable('integrations');
    
    if (!tableExists) {
      // Criar a tabela se não existir
      await queryRunner.query(`
        CREATE TABLE \`integrations\` (
          \`integration_id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`lojavirtual_id\` VARCHAR(36) NOT NULL,
          \`platform\` VARCHAR(50) NOT NULL,
          \`config\` TEXT NOT NULL,
          \`ativo\` TINYINT NOT NULL DEFAULT 1,
          \`datacadastro\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`dataalterado\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } else {
      // Verificar se a coluna existe e qual é o tipo atual
      const table = await queryRunner.getTable('integrations');
      const lojavirtualIdColumn = table?.findColumnByName('lojavirtual_id');
      
      if (lojavirtualIdColumn) {
        // Se a coluna já é VARCHAR(36), não precisa fazer nada
        if (lojavirtualIdColumn.type !== 'varchar' || lojavirtualIdColumn.length !== '36') {
          // Alterar coluna lojavirtual_id de INT para VARCHAR(36)
          await queryRunner.query(`
            ALTER TABLE \`integrations\` 
            MODIFY COLUMN \`lojavirtual_id\` VARCHAR(36) NOT NULL
          `);
        }
      } else {
        // Se a coluna não existe, criar
        await queryRunner.query(`
          ALTER TABLE \`integrations\` 
          ADD COLUMN \`lojavirtual_id\` VARCHAR(36) NOT NULL
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a tabela existe
    const tableExists = await queryRunner.hasTable('integrations');
    
    if (tableExists) {
      const table = await queryRunner.getTable('integrations');
      const lojavirtualIdColumn = table?.findColumnByName('lojavirtual_id');
      
      if (lojavirtualIdColumn && lojavirtualIdColumn.type === 'varchar') {
        // Reverter para INT (cuidado: pode perder dados se houver UUIDs)
        await queryRunner.query(`
          ALTER TABLE \`integrations\` 
          MODIFY COLUMN \`lojavirtual_id\` INT NOT NULL
        `);
      }
    }
  }
}

