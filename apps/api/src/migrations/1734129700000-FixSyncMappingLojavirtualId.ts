import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSyncMappingLojavirtualId1734129700000 implements MigrationInterface {
  name = 'FixSyncMappingLojavirtualId1734129700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alterar coluna lojavirtual_id de INT para VARCHAR(36)
    await queryRunner.query(`
      ALTER TABLE \`sync_mapping\` 
      MODIFY COLUMN \`lojavirtual_id\` VARCHAR(36) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter para INT (cuidado: pode perder dados se houver UUIDs)
    await queryRunner.query(`
      ALTER TABLE \`sync_mapping\` 
      MODIFY COLUMN \`lojavirtual_id\` INT NOT NULL
    `);
  }
}

