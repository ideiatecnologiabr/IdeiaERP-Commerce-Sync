import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixIntegrationsLojavirtualId1734129900000 implements MigrationInterface {
  name = 'FixIntegrationsLojavirtualId1734129900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alterar coluna lojavirtual_id de INT para VARCHAR(36)
    await queryRunner.query(`
      ALTER TABLE \`integrations\` 
      MODIFY COLUMN \`lojavirtual_id\` VARCHAR(36) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter para INT (cuidado: pode perder dados se houver UUIDs)
    await queryRunner.query(`
      ALTER TABLE \`integrations\` 
      MODIFY COLUMN \`lojavirtual_id\` INT NOT NULL
    `);
  }
}

