import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'sync_log' })
export class SyncLog {
  @PrimaryGeneratedColumn({ name: 'sync_log_id' })
  sync_log_id: number;

  @Column({ name: 'lojavirtual_id', type: 'int' })
  lojavirtual_id: string;

  // Note: LojaVirtual is in ERP database, so we can't use TypeORM relations
  // Use erpDataSource.getRepository(LojaVirtual) if you need to access LojaVirtual data

  @Column({ name: 'tipo', type: 'varchar', length: 50 })
  tipo: string; // 'catalog', 'prices', 'stock', 'orders'

  @Column({ name: 'acao', type: 'varchar', length: 50 })
  acao: string; // 'create', 'update', 'delete', 'sync'

  @Column({ name: 'entidade', type: 'varchar', length: 100 })
  entidade: string; // 'product', 'order', etc.

  @Column({ name: 'entidade_id', type: 'varchar', length: 255, nullable: true })
  entidade_id: string | null;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: string; // 'success', 'error', 'warning'

  @Column({ name: 'mensagem', type: 'text', nullable: true })
  mensagem: string | null;

  @Column({ name: 'detalhes', type: 'text', nullable: true })
  detalhes: string | null;

  @CreateDateColumn({ name: 'datacadastro' })
  datacadastro: Date;
}

