import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ProdutoEstoque } from './ProdutoEstoque';

@Entity({ name: 'Estoque' })
export class Estoque {
  @PrimaryColumn({ name: 'estoque_id', type: 'char', length: 36 })
  estoque_id: string;

  @Column({ name: 'nome', type: 'varchar', length: 255 })
  nome: string;

  @Column({ name: 'codigo', type: 'varchar', length: 10 })
  descricao: string;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'tinyint', default: 0 })
  flagexcluido: number;

  @OneToMany(() => ProdutoEstoque, (pe) => pe.estoque)
  produtoEstoques: ProdutoEstoque[];
}

