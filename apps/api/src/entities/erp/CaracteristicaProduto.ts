import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ProdutoCaracteristicaProduto } from './ProdutoCaracteristicaProduto';

@Entity({ name: 'caracteristicaproduto' })
export class CaracteristicaProduto {
  @PrimaryColumn({ name: 'caracteristicaproduto_id' })
  caracteristicaproduto_id: string;

  @Column({ name: 'nome', type: 'varchar', length: 255 })
  nome: string;

  @Column({ name: 'codigo', type: 'varchar', length: 10 })
  descricao: string ;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'tinyint', default: 0 })
  flagexcluido: number;

  @OneToMany(() => ProdutoCaracteristicaProduto, (pcp) => pcp.caracteristicaProduto)
  produtoCaracteristicas: ProdutoCaracteristicaProduto[];
}

