import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Produtos } from './Produtos';
import { Empresa } from './Empresa';

@Entity({ name: 'ProdutoEmpresa' })
export class ProdutoEmpresa {
  @PrimaryColumn({ name: 'produtoempresa_id' })
  produtoempresa_id: number;

  @Column({ name: 'produto_id', type: 'char', length: 36 })
  produto_id: string;

  @ManyToOne(() => Produtos)
  @JoinColumn({ name: 'produto_id' })
  produto: Produtos;

  @Column({ name: 'empresa_id', type: 'char', length: 36 })
  empresa_id: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'tinyint', default: 0 })
  flagexcluido: number;
}

