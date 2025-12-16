import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'sync_lock' })
export class SyncLock {
  @PrimaryGeneratedColumn({ name: 'sync_lock_id' })
  sync_lock_id: number;

  @Column({ name: 'lojavirtual_id', type: 'varchar', length: 36 })
  lojavirtual_id: string;

  @Column({ name: 'tipo', type: 'varchar', length: 50 })
  tipo: string; // 'catalog', 'prices', 'stock', 'orders'

  @Column({ name: 'process_id', type: 'varchar', length: 255 })
  process_id: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expires_at: Date;

  @CreateDateColumn({ name: 'datacadastro' })
  datacadastro: Date;
}

