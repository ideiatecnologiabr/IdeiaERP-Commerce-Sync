import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TabelaPreco } from './TabelaPreco';
import { Estoque } from './Estoque';
import { CaracteristicaProduto } from './CaracteristicaProduto';
import { LojaVirtualExportacao } from './LojaVirtualExportacao';

@Entity({ name: 'lojavirtual' })
export class LojaVirtual {
  @PrimaryColumn({ name: 'lojavirtual_id', type: 'char', length: 36 })
  lojavirtual_id: string;

  @Column({ name: 'empresa_id', type: 'char', length: 36, nullable: true })
  empresa_id: string | null;

  @Column({ name: 'estoque_id', type: 'char', length: 36, nullable: true })
  estoque_id: string | null;

  @ManyToOne(() => Estoque, { nullable: true })
  @JoinColumn({ name: 'estoque_id' })
  estoque: Estoque | null;

  @Column({ name: 'tabelapreco_id', type: 'char', length: 36, nullable: true })
  tabelapreco_id: string | null;

  @ManyToOne(() => TabelaPreco, { nullable: true })
  @JoinColumn({ name: 'tabelapreco_id' })
  tabelaPreco: TabelaPreco | null;

  @Column({ name: 'caracteristicaproduto_id', type: 'char', length: 36, nullable: true })
  caracteristicaproduto_id: string | null;

  @ManyToOne(() => CaracteristicaProduto, { nullable: true })
  @JoinColumn({ name: 'caracteristicaproduto_id' })
  caracteristicaProduto: CaracteristicaProduto | null;

  @Column({ name: 'caracteristicapessoa_id', type: 'char', length: 36, nullable: true })
  caracteristicapessoa_id: string | null;

  @Column({ name: 'urlbase', type: 'varchar', length: 500, nullable: true })
  urlbase: string | null;

  @Column({ name: 'apikey', type: 'varchar', length: 60, nullable: true })
  apikey: string | null;

  @Column({ name: 'apiuser', type: 'varchar', length: 60, nullable: true })
  apiuser: string | null;

  @Column({ name: 'nome', type: 'varchar', length: 60, nullable: true })
  nome: string | null;

  @Column({ name: 'flagexcluido', type: 'int', nullable: true })
  flagexcluido: number | null;

  @Column({ name: 'vendedor_pessoa_id', type: 'varchar', length: 36, nullable: true })
  vendedor_pessoa_id: string | null;

  @Column({ name: 'codigo', type: 'varchar', length: 20, nullable: true })
  codigo: string | null;

  @Column({ name: 'flagssl', type: 'int', nullable: true })
  flagssl: number | null;

  @Column({ name: 'idioma', type: 'int', nullable: true })
  idioma: number | null;

  @Column({ name: 'flagestoquecompartilhado', type: 'int', default: 0 })
  flagestoquecompartilhado: number;

  @Column({ name: 'especial_tabelapreco_id', type: 'char', length: 36, nullable: true })
  especial_tabelapreco_id: string | null;

  @Column({ name: 'dataultimaconsulta', type: 'datetime', nullable: true })
  dataultimaconsulta: Date | null;

  @Column({ name: 'idultimaconsulta', type: 'int', nullable: true })
  idultimaconsulta: number | null;

  @Column({ name: 'atributo_ncm', type: 'int', nullable: true })
  atributo_ncm: number | null;

  @Column({ name: 'atributo_conteudo', type: 'int', nullable: true })
  atributo_conteudo: number | null;

  @Column({ name: 'atributo_garantia', type: 'int', nullable: true })
  atributo_garantia: number | null;

  @Column({ name: 'atributo_composicao', type: 'int', nullable: true })
  atributo_composicao: number | null;

  @Column({ name: 'idultimopedido', type: 'int', default: 0 })
  idultimopedido: number;

  @Column({ name: 'tempo_sincronizacao', type: 'int', default: 1 })
  tempo_sincronizacao: number;

  @Column({ name: 'flaginativarprodutozerado', type: 'int', nullable: true })
  flaginativarprodutozerado: number | null;

  @Column({ name: 'indisponivel_status_id', type: 'int', nullable: true })
  indisponivel_status_id: number | null;

  @Column({ name: 'pagamento_empresa_id', type: 'char', length: 36, nullable: true })
  pagamento_empresa_id: string | null;

  @Column({ name: 'integracao_id', type: 'int', nullable: true })
  integracao_id: number | null;

  @Column({ name: 'plataforma_nome', type: 'varchar', length: 60, nullable: true })
  plataforma_nome: string | null;

  @OneToMany(() => LojaVirtualExportacao, (lve) => lve.lojaVirtual)
  exportacoes: LojaVirtualExportacao[];
}

