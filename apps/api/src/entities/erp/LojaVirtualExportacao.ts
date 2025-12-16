import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LojaVirtual } from './LojaVirtual';

@Entity({ name: 'LojaVirtualExportacao' })
export class LojaVirtualExportacao {
  @PrimaryColumn({ name: 'lojavirtualexportacao_id' })
  lojavirtualexportacao_id: number;

  @Column({ name: 'lojavirtual_id', type: 'int' })
  lojavirtual_id: number;

  @ManyToOne(() => LojaVirtual)
  @JoinColumn({ name: 'lojavirtual_id' })
  lojaVirtual: LojaVirtual;

  @Column({ name: 'tipo', type: 'varchar', length: 50 })
  tipo: string;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'tinyint', default: 0 })
  flagexcluido: number;
}



