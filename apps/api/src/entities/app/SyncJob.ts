import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'sync_job' })
export class SyncJob {
  @PrimaryGeneratedColumn({ name: 'sync_job_id' })
  sync_job_id: number;

  @Column({ name: 'lojavirtual_id', type: 'varchar', length: 36 })
  lojavirtual_id: string;

  @Column({ name: 'tipo', type: 'varchar', length: 50 })
  tipo: string; // 'catalog', 'prices', 'stock', 'orders'

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'pending' })
  status: string; // 'pending', 'running', 'completed', 'failed'

  @Column({ name: 'payload', type: 'text', nullable: true })
  payload: string | null;

  @Column({ name: 'resultado', type: 'text', nullable: true })
  resultado: string | null;

  @Column({ name: 'erro', type: 'text', nullable: true })
  erro: string | null;

  @CreateDateColumn({ name: 'datacadastro' })
  datacadastro: Date;

  @UpdateDateColumn({ name: 'dataalterado' })
  dataalterado: Date;
}


