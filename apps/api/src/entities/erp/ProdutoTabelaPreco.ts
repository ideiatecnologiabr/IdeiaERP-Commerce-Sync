import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Produtos } from './Produtos';
import { TabelaPreco } from './TabelaPreco';

@Entity({ name: 'produtotabelapreco' })
export class ProdutoTabelaPreco {
  @PrimaryColumn({ name: 'produtotabelapreco_id', type: 'char', length: 36 })
  produtotabelapreco_id: string;

  @Column({ name: 'integracao_id', type: 'int', nullable: true })
  integracao_id: number | null;

  @Column({ name: 'produto_id', type: 'char', length: 36 })
  produto_id: string;

  @ManyToOne(() => Produtos)
  @JoinColumn({ name: 'produto_id' })
  produto: Produtos;

  @Column({ name: 'precovenda', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precovenda: number | null;

  @Column({ name: 'precofinal', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precofinal: number | null;

  @Column({ name: 'markupcustoatual', type: 'decimal', precision: 15, scale: 4, nullable: true })
  markupcustoatual: number | null;

  @Column({ name: 'markupcustomedio', type: 'decimal', precision: 15, scale: 4, nullable: true })
  markupcustomedio: number | null;

  @Column({ name: 'markupcustosimulado', type: 'decimal', precision: 15, scale: 4, nullable: true })
  markupcustosimulado: number | null;

  @Column({ name: 'margemcustoatual', type: 'decimal', precision: 15, scale: 4, nullable: true })
  margemcustoatual: number | null;

  @Column({ name: 'margemcustomedio', type: 'decimal', precision: 15, scale: 4, nullable: true })
  margemcustomedio: number | null;

  @Column({ name: 'margemcustosimulado', type: 'decimal', precision: 15, scale: 4, nullable: true })
  margemcustosimulado: number | null;

  @Column({ name: 'variacaoprecovendasimulado', type: 'decimal', precision: 15, scale: 4, nullable: true })
  variacaoprecovendasimulado: number | null;

  @Column({ name: 'tabelapreco_id', type: 'char', length: 36, nullable: true })
  tabelapreco_id: string | null;

  @ManyToOne(() => TabelaPreco, { nullable: true })
  @JoinColumn({ name: 'tabelapreco_id' })
  tabelaPreco: TabelaPreco | null;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'int', default: 0 })
  flagexcluido: number;

  @Column({ name: 'precosugerido', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precosugerido: number | null;

  @Column({ name: 'valortotalminimo', type: 'decimal', precision: 15, scale: 4, nullable: true })
  valortotalminimo: number | null;

  @Column({ name: 'percentuallucroliquido', type: 'decimal', precision: 15, scale: 4, nullable: true })
  percentuallucroliquido: number | null;

  @Column({ name: 'markupminimo', type: 'decimal', precision: 15, scale: 4, nullable: true })
  markupminimo: number | null;

  @Column({ name: 'markupideal', type: 'decimal', precision: 15, scale: 4, nullable: true })
  markupideal: number | null;

  @Column({ name: 'markupmaximo', type: 'decimal', precision: 15, scale: 4, nullable: true })
  markupmaximo: number | null;

  @Column({ name: 'markupobjetivo', type: 'decimal', precision: 15, scale: 4, nullable: true })
  markupobjetivo: number | null;
}
