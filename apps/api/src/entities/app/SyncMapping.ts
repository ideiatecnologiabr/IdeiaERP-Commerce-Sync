import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'sync_mapping' })
export class SyncMapping {
  @PrimaryGeneratedColumn({ name: 'sync_mapping_id' })
  sync_mapping_id: number;

  @Column({ name: 'lojavirtual_id', type: 'varchar', length: 36 })
  lojavirtual_id: string;

  @Column({ name: 'entidade', type: 'varchar', length: 100 })
  entidade: string; // 'product', 'order', etc.

  @Column({ name: 'erp_id', type: 'varchar', length: 255 })
  erp_id: string;

  @Column({ name: 'platform_id', type: 'varchar', length: 255 })
  platform_id: string;

  @Column({ name: 'platform', type: 'varchar', length: 50 })
  platform: string; // 'opencart', 'vtex', etc.

  @CreateDateColumn({ name: 'datacadastro' })
  datacadastro: Date;

  @UpdateDateColumn({ name: 'dataalterado' })
  dataalterado: Date;
}


