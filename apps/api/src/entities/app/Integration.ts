import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'integrations' })
export class Integration {
  @PrimaryGeneratedColumn({ name: 'integration_id' })
  integration_id: number;

  @Column({ name: 'lojavirtual_id', type: 'varchar', length: 36 })
  lojavirtual_id: string;

  @Column({ name: 'platform', type: 'varchar', length: 50 })
  platform: string; // 'opencart', 'vtex', etc.

  @Column({ name: 'config', type: 'text' })
  config: string; // JSON string with API keys, URLs, etc.

  @Column({ name: 'ativo', type: 'tinyint', default: 1 })
  ativo: number;

  @CreateDateColumn({ name: 'datacadastro' })
  datacadastro: Date;

  @UpdateDateColumn({ name: 'dataalterado' })
  dataalterado: Date;
}


