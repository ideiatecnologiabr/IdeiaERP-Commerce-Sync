import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSettingsTable1735574400000 implements MigrationInterface {
  name = 'CreateSettingsTable1735574400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create settings table
    await queryRunner.createTable(
      new Table({
        name: 'settings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'value',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create unique index on key
    await queryRunner.createIndex(
      'settings',
      new TableIndex({
        name: 'IDX_settings_key',
        columnNames: ['key'],
        isUnique: true,
      })
    );

    // Insert default ERP-DB settings (IGNORE if already exist)
    await queryRunner.query(`
      INSERT IGNORE INTO settings (\`key\`, \`value\`) VALUES
        ('ERP_DB_HOST', 'localhost'),
        ('ERP_DB_PORT', '3306'),
        ('ERP_DB_USER', 'root'),
        ('ERP_DB_PASSWORD', 'ideia'),
        ('ERP_DB_NAME', 'ideiaerp'),
        ('SESSION_SECRET', MD5(NOW()))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('settings', 'IDX_settings_key');
    await queryRunner.dropTable('settings');
  }
}

