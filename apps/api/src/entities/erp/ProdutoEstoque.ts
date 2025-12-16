import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Produtos } from './Produtos';
import { Estoque } from './Estoque';
import { Empresa } from './Empresa';

@Entity({ name: 'produtoestoque' })
export class ProdutoEstoque {
  @PrimaryColumn({ name: 'estoque_id', type: 'char', length: 36 })
  estoque_id: string;

  @ManyToOne(() => Estoque)
  @JoinColumn({ name: 'estoque_id' })
  estoque: Estoque;

  @PrimaryColumn({ name: 'empresa_id', type: 'char', length: 36 })
  empresa_id: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @PrimaryColumn({ name: 'produto_id', type: 'char', length: 36 })
  produto_id: string;

  @ManyToOne(() => Produtos)
  @JoinColumn({ name: 'produto_id' })
  produto: Produtos;

  @Column({ name: 'quantidade', type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantidade: number | null;

  @Column({ name: 'estoqueinicial', type: 'decimal', precision: 15, scale: 4, nullable: true })
  estoqueinicial: number | null;

  @Column({ name: 'dataalterado', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  dataalterado: Date | null;
}
