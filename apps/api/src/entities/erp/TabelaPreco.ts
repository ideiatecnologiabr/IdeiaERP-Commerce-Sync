import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ProdutoTabelaPreco } from './ProdutoTabelaPreco';

@Entity({ name: 'tabelapreco' })
export class TabelaPreco {
  @PrimaryColumn({ name: 'tabelapreco_id', type: 'char', length: 36 })
  tabelapreco_id: string;

  @Column({ name: 'integracao_id', type: 'int', nullable: true })
  integracao_id: number | null;

  @Column({ name: 'codigo', type: 'varchar', length: 10 })
  codigo: string;

  @Column({ name: 'nome', type: 'varchar', length: 80, nullable: true })
  nome: string | null;

  @Column({ name: 'margem', type: 'decimal', precision: 15, scale: 4, nullable: true })
  margem: number | null;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'int', default: 0 })
  flagexcluido: number;

  @Column({ name: 'obs', type: 'varchar', length: 500, nullable: true })
  obs: string | null;

  @Column({ name: 'flagatualizapedido', type: 'int', nullable: true })
  flagatualizapedido: number | null;

  @Column({ name: 'flagpesquisa', type: 'int', nullable: true })
  flagpesquisa: number | null;

  @Column({ name: 'markuppadrao', type: 'decimal', precision: 15, scale: 4, nullable: true })
  markuppadrao: number | null;

  @Column({ name: 'flagdinheiro', type: 'int', default: 1 })
  flagdinheiro: number;

  @Column({ name: 'flagcartao', type: 'int', default: 1 })
  flagcartao: number;

  @Column({ name: 'flagboleto', type: 'int', default: 1 })
  flagboleto: number;

  @Column({ name: 'flagcheque', type: 'int', default: 1 })
  flagcheque: number;

  @Column({ name: 'flagvale', type: 'int', default: 1 })
  flagvale: number;

  @Column({ name: 'flagcarteira', type: 'int', default: 1 })
  flagcarteira: number;

  @Column({ name: 'flagtabelaespecial', type: 'int', nullable: true })
  flagtabelaespecial: number | null;

  @Column({ name: 'flagtabelavirtual', type: 'int', nullable: true })
  flagtabelavirtual: number | null;

  @Column({ name: 'estruturacusto_id', type: 'char', length: 36, nullable: true })
  estruturacusto_id: string | null;

  @Column({ name: 'base_tabelapreco_id', type: 'char', length: 36, nullable: true })
  base_tabelapreco_id: string | null;

  @Column({ name: 'percentuallucroliquido', type: 'decimal', precision: 15, scale: 4, nullable: true })
  percentuallucroliquido: number | null;

  @Column({ name: 'venda_estruturacusto_id', type: 'char', length: 36, nullable: true })
  venda_estruturacusto_id: string | null;

  @Column({ name: 'empresa_id', type: 'varchar', length: 36, nullable: true })
  empresa_id: string | null;

  @Column({ name: 'grupoconcorrente_id', type: 'char', length: 36, nullable: true })
  grupoconcorrente_id: string | null;

  @Column({ name: 'flagpagamentoavista', type: 'int', default: 0 })
  flagpagamentoavista: number;

  @OneToMany(() => ProdutoTabelaPreco, (ptp) => ptp.tabelaPreco)
  produtoTabelaPrecos: ProdutoTabelaPreco[];
}
