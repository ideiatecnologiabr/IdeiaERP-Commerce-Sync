import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSyncLogLojavirtualId1734129600000 implements MigrationInterface {
  name = 'FixSyncLogLojavirtualId1734129600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alterar coluna lojavirtual_id de INT para VARCHAR(36)
    await queryRunner.query(`
      ALTER TABLE \`sync_log\` 
      MODIFY COLUMN \`lojavirtual_id\` VARCHAR(36) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter para INT (cuidado: pode perder dados se houver UUIDs)
    await queryRunner.query(`
      ALTER TABLE \`sync_log\` 
      MODIFY COLUMN \`lojavirtual_id\` INT NOT NULL
    `);
  }
}