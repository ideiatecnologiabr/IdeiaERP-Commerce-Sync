import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePlatformToken1734972000000 implements MigrationInterface {
  name = 'CreatePlatformToken1734972000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'platform_token',
        columns: [
          {
            name: 'platform_token_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'lojavirtual_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'platform',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'access_token',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'refresh_token',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'refresh_expires_at',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'token_type',
            type: 'varchar',
            length: '20',
            default: "'Bearer'",
          },
          {
            name: 'datacadastro',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'dataalterado',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create unique index on (lojavirtual_id, platform)
    await queryRunner.createIndex(
      'platform_token',
      new TableIndex({
        name: 'IDX_platform_token_lojavirtual_platform',
        columnNames: ['lojavirtual_id', 'platform'],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('platform_token', 'IDX_platform_token_lojavirtual_platform');
    await queryRunner.dropTable('platform_token');
  }
}

