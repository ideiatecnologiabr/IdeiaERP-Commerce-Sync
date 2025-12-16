import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Produtos } from './Produtos';
import { CaracteristicaProduto } from './CaracteristicaProduto';

@Entity({ name: 'produtocaracteristicaproduto' })
export class ProdutoCaracteristicaProduto {
  @PrimaryColumn({ name: 'produtocaracteristicaproduto_id', type: 'char', length: 36 })
  produtocaracteristicaproduto_id: string;

  @Column({ name: 'produto_id', type: 'char', length: 36 })
  produto_id: string;

  @ManyToOne(() => Produtos)
  @JoinColumn({ name: 'produto_id' })
  produto: Produtos;

  @Column({ name: 'caracteristicaproduto_id', type: 'char', length: 36, nullable: true })
  caracteristicaproduto_id: string | null;

  @ManyToOne(() => CaracteristicaProduto, { nullable: true })
  @JoinColumn({ name: 'caracteristicaproduto_id' })
  caracteristicaProduto: CaracteristicaProduto | null;

  @Column({ name: 'flag', type: 'int', nullable: true })
  flag: number | null;

  @Column({ name: 'integracao_id', type: 'int', nullable: true })
  integracao_id: number | null;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'int', default: 0 })
  flagexcluido: number;
}

