import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Produtos } from './Produtos';

@Entity({ name: 'categoria' })
export class Categoria {
  @PrimaryColumn({ name: 'categoria_id' })
  categoria_id: string;

  @Column({ name: 'nome', type: 'varchar', length: 255 })
  nome: string;

  @Column({ name: 'codigo', type: 'varchar', length: 10 })
  codigo: string;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'tinyint', default: 0 })
  flagexcluido: number;

  @OneToMany(() => Produtos, (p) => p.categoria)
  produtos: Produtos[];
}

