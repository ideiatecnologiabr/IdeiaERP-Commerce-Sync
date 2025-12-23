import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'platform_token' })
@Index(['lojavirtual_id', 'platform'], { unique: true })
export class PlatformToken {
  @PrimaryGeneratedColumn({ name: 'platform_token_id' })
  platform_token_id: number;

  @Column({ name: 'lojavirtual_id', type: 'varchar', length: 36 })
  lojavirtual_id: string;

  @Column({ name: 'platform', type: 'varchar', length: 50 })
  platform: string; // 'opencart', 'vtex', etc.

  @Column({ name: 'access_token', type: 'text' })
  access_token: string;

  @Column({ name: 'refresh_token', type: 'text' })
  refresh_token: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expires_at: Date;

  @Column({ name: 'refresh_expires_at', type: 'datetime' })
  refresh_expires_at: Date;

  @Column({ name: 'token_type', type: 'varchar', length: 20, default: 'Bearer' })
  token_type: string;

  @CreateDateColumn({ name: 'datacadastro' })
  datacadastro: Date;

  @UpdateDateColumn({ name: 'dataalterado' })
  dataalterado: Date;
}

