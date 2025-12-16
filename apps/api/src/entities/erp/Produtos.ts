import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Marca } from './Marca';
import { Categoria } from './Categoria';
import { ProdutoEstoque } from './ProdutoEstoque';
import { ProdutoTabelaPreco } from './ProdutoTabelaPreco';
import { ProdutoCaracteristicaProduto } from './ProdutoCaracteristicaProduto';

@Entity({ name: 'produto' })
export class Produtos {
  @PrimaryColumn({ name: 'produto_id', type: 'char', length: 36 })
  produto_id: string;

  @Column({ name: 'codigo', type: 'varchar', length: 20 })
  codigo: string;

  @Column({ name: 'eancomercial', type: 'varchar', length: 14, nullable: true })
  eancomercial: string | null;

  @Column({ name: 'eantributavel', type: 'varchar', length: 14, nullable: true })
  eantributavel: string | null;

  @Column({ name: 'observacao', type: 'varchar', length: 20000, nullable: true })
  observacao: string | null;

  @Column({ name: 'nome', type: 'varchar', length: 120, nullable: true })
  nome: string | null;

  @Column({ name: 'integracao_id', type: 'int', nullable: true })
  integracao_id: number | null;

  @Column({ name: 'pesoliquido', type: 'decimal', precision: 15, scale: 4, nullable: true })
  pesoliquido: number | null;

  @Column({ name: 'pesobruto', type: 'decimal', precision: 15, scale: 4, nullable: true })
  pesobruto: number | null;

  @Column({ name: 'flagservico', type: 'int', nullable: true })
  flagservico: number | null;

  @Column({ name: 'precocustoatual', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precocustoatual: number | null;

  @Column({ name: 'precocustomedio', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precocustomedio: number | null;

  @Column({ name: 'precocustosimulado', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precocustosimulado: number | null;

  @Column({ name: 'precovendasimulado', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precovendasimulado: number | null;

  @Column({ name: 'imagem_id', type: 'char', length: 36, nullable: true })
  imagem_id: string | null;

  @Column({ name: 'fabricante_pessoa_id', type: 'char', length: 36, nullable: true })
  fabricante_pessoa_id: string | null;

  @Column({ name: 'marca_id', type: 'char', length: 36, nullable: true })
  marca_id: string | null;

  @ManyToOne(() => Marca, { nullable: true })
  @JoinColumn({ name: 'marca_id' })
  marca: Marca | null;

  @Column({ name: 'fornecedor_pessoa_id', type: 'char', length: 36, nullable: true })
  fornecedor_pessoa_id: string | null;

  @Column({ name: 'unidademedida_id', type: 'char', length: 36, nullable: true })
  unidademedida_id: string | null;

  @Column({ name: 'categoria_id', type: 'char', length: 36, nullable: true })
  categoria_id: string | null;

  @ManyToOne(() => Categoria, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria | null;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'ncm_id', type: 'int', nullable: true })
  ncm_id: number | null;

  @Column({ name: 'flagembalagem', type: 'int', nullable: true })
  flagembalagem: number | null;

  @Column({ name: 'aplicacao', type: 'text', nullable: true })
  aplicacao: string | null;

  @Column({ name: 'flagativo', type: 'int', default: 1 })
  flagativo: number;

  @Column({ name: 'altura', type: 'decimal', precision: 15, scale: 4, nullable: true })
  altura: number | null;

  @Column({ name: 'largura', type: 'decimal', precision: 15, scale: 4, nullable: true })
  largura: number | null;

  @Column({ name: 'comprimento', type: 'decimal', precision: 15, scale: 4, nullable: true })
  comprimento: number | null;

  @Column({ name: 'grupotributarioproduto_id', type: 'char', length: 36, nullable: true })
  grupotributarioproduto_id: string | null;

  @Column({ name: 'grupotributarioprodutoipi_id', type: 'char', length: 36, nullable: true })
  grupotributarioprodutoipi_id: string | null;

  @Column({ name: 'grupoprodutopiscofins_id', type: 'char', length: 36, nullable: true })
  grupoprodutopiscofins_id: string | null;

  @Column({ name: 'codigoreferencia', type: 'varchar', length: 200, nullable: true })
  codigoreferencia: string | null;

  @Column({ name: 'flagexcluido', type: 'int', default: 0 })
  flagexcluido: number;

  @Column({ name: 'validade', type: 'int', nullable: true })
  validade: number | null;

  @Column({ name: 'qrcodetext', type: 'text', nullable: true })
  qrcodetext: string | null;

  @Column({ name: 'qrcodeblob', type: 'mediumblob', nullable: true })
  qrcodeblob: Buffer | null;

  @Column({ name: 'receita', type: 'varchar', length: 1000, nullable: true })
  receita: string | null;

  @Column({ name: 'flagprodutokit', type: 'int', nullable: true })
  flagprodutokit: number | null;

  @Column({ name: 'flagcomplementardescricao', type: 'int', default: 0 })
  flagcomplementardescricao: number;

  @Column({ name: 'flagnaopermitirmovimentar', type: 'int', default: 0 })
  flagnaopermitirmovimentar: number;

  @Column({ name: 'produtokit_id', type: 'char', length: 36, nullable: true })
  produtokit_id: string | null;

  @Column({ name: 'volumeunidade', type: 'decimal', precision: 15, scale: 4, nullable: true })
  volumeunidade: number | null;

  @Column({ name: 'unidadeafericao_id', type: 'int', nullable: true })
  unidadeafericao_id: number | null;

  @Column({ name: 'unidadenegocio_id', type: 'char', length: 36, nullable: true })
  unidadenegocio_id: string | null;

  @Column({ name: 'flagservicofrete', type: 'int', default: 0 })
  flagservicofrete: number;

  @Column({ name: 'flagservicofretetipo', type: 'int', default: 0 })
  flagservicofretetipo: number;

  @Column({ name: 'identificador', type: 'varchar', length: 100, nullable: true })
  identificador: string | null;

  @Column({ name: 'garantia', type: 'int', nullable: true })
  garantia: number | null;

  @Column({ name: 'imagem_thumbnail_id', type: 'char', length: 36, nullable: true })
  imagem_thumbnail_id: string | null;

  @Column({ name: 'descricaoresumida_web', type: 'longtext', nullable: true })
  descricaoresumida_web: string | null;

  @Column({ name: 'descricaodetalhada_web', type: 'longtext', nullable: true })
  descricaodetalhada_web: string | null;

  @Column({ name: 'tag', type: 'varchar', length: 255, nullable: true })
  tag: string | null;

  @Column({ name: 'parent_id', type: 'char', length: 36, nullable: true })
  parent_id: string | null;

  @Column({ name: 'flagtipoproduto', type: 'char', length: 2, nullable: true })
  flagtipoproduto: string | null;

  @Column({ name: 'flagvalidaestoque', type: 'int', default: 1 })
  flagvalidaestoque: number;

  @Column({ name: 'origem', type: 'int', default: 0 })
  origem: number;

  @Column({ name: 'localizacao_id', type: 'char', length: 36, nullable: true })
  localizacao_id: string | null;

  @Column({ name: 'origemproduto', type: 'int', nullable: true })
  origemproduto: number | null;

  @Column({ name: 'codigoipi', type: 'varchar', length: 10, nullable: true })
  codigoipi: string | null;

  @Column({ name: 'tpreco01', type: 'decimal', precision: 15, scale: 4, nullable: true })
  tpreco01: number | null;

  @Column({ name: 'tpreco02', type: 'decimal', precision: 15, scale: 4, nullable: true })
  tpreco02: number | null;

  @Column({ name: 'tpreco03', type: 'decimal', precision: 15, scale: 4, nullable: true })
  tpreco03: number | null;

  @Column({ name: 'testoque01', type: 'decimal', precision: 15, scale: 4, nullable: true })
  testoque01: number | null;

  @Column({ name: 'testoque99', type: 'decimal', precision: 15, scale: 4, nullable: true })
  testoque99: number | null;

  @Column({ name: 'tcusto01', type: 'decimal', precision: 15, scale: 4, nullable: true })
  tcusto01: number | null;

  @Column({ name: 'tcusto02', type: 'decimal', precision: 15, scale: 4, nullable: true })
  tcusto02: number | null;

  @Column({ name: 'importacao_id', type: 'int', nullable: true })
  importacao_id: number | null;

  @Column({ name: 'quantidadeembalagem', type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantidadeembalagem: number | null;

  @Column({ name: 'quantidadeembalagemcompra', type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantidadeembalagemcompra: number | null;

  @Column({ name: 'flagdescontinuado', type: 'int', default: 0 })
  flagdescontinuado: number;

  @Column({ name: 'codigoregistroms', type: 'varchar', length: 50, nullable: true })
  codigoregistroms: string | null;

  @Column({ name: 'flagtipocontrolesngpc', type: 'int', default: 0 })
  flagtipocontrolesngpc: number;

  @Column({ name: 'ultimo_fornecedor_pessoa_id', type: 'char', length: 36, nullable: true })
  ultimo_fornecedor_pessoa_id: string | null;

  @Column({ name: 'cesticms_id', type: 'char', length: 36, nullable: true })
  cesticms_id: string | null;

  @Column({ name: 'valorenergetico', type: 'decimal', precision: 15, scale: 4, nullable: true })
  valorenergetico: number | null;

  @Column({ name: 'carboidrato', type: 'decimal', precision: 15, scale: 4, nullable: true })
  carboidrato: number | null;

  @Column({ name: 'proteina', type: 'decimal', precision: 15, scale: 4, nullable: true })
  proteina: number | null;

  @Column({ name: 'gorduratotal', type: 'decimal', precision: 15, scale: 4, nullable: true })
  gorduratotal: number | null;

  @Column({ name: 'gorduratrans', type: 'decimal', precision: 15, scale: 4, nullable: true })
  gorduratrans: number | null;

  @Column({ name: 'gordurasaturada', type: 'decimal', precision: 15, scale: 4, nullable: true })
  gordurasaturada: number | null;

  @Column({ name: 'fibraalimentar', type: 'decimal', precision: 15, scale: 4, nullable: true })
  fibraalimentar: number | null;

  @Column({ name: 'sodio', type: 'decimal', precision: 15, scale: 4, nullable: true })
  sodio: number | null;

  @Column({ name: 'vd_valorenergetico', type: 'decimal', precision: 15, scale: 4, nullable: true })
  vd_valorenergetico: number | null;

  @Column({ name: 'vd_carboidrato', type: 'decimal', precision: 15, scale: 4, nullable: true })
  vd_carboidrato: number | null;

  @Column({ name: 'vd_proteina', type: 'decimal', precision: 15, scale: 4, nullable: true })
  vd_proteina: number | null;

  @Column({ name: 'vd_gorduratotal', type: 'decimal', precision: 15, scale: 4, nullable: true })
  vd_gorduratotal: number | null;

  @Column({ name: 'vd_gorduratrans', type: 'decimal', precision: 15, scale: 4, nullable: true })
  vd_gorduratrans: number | null;

  @Column({ name: 'vd_gordurasaturada', type: 'decimal', precision: 15, scale: 4, nullable: true })
  vd_gordurasaturada: number | null;

  @Column({ name: 'vd_fibraalimentar', type: 'decimal', precision: 15, scale: 4, nullable: true })
  vd_fibraalimentar: number | null;

  @Column({ name: 'vd_sodio', type: 'decimal', precision: 15, scale: 4, nullable: true })
  vd_sodio: number | null;

  @Column({ name: 'comb_descricaoanp', type: 'varchar', length: 200, nullable: true })
  comb_descricaoanp: string | null;

  @Column({ name: 'comb_codigoanp', type: 'int', nullable: true })
  comb_codigoanp: number | null;

  @Column({ name: 'datahoradescontinuado', type: 'datetime', nullable: true })
  datahoradescontinuado: Date | null;

  @Column({ name: 'descontinuado_usuario_id', type: 'char', length: 36, nullable: true })
  descontinuado_usuario_id: string | null;

  @Column({ name: 'video', type: 'varchar', length: 200, nullable: true })
  video: string | null;

  @Column({ name: 'conteudo', type: 'varchar', length: 2000, nullable: true })
  conteudo: string | null;

  @Column({ name: 'perfil_tamanho', type: 'int', default: 0 })
  perfil_tamanho: number;

  @Column({ name: 'perfil_qualidade', type: 'int', default: 0 })
  perfil_qualidade: number;

  @Column({ name: 'perfil_complemento_jardinagem', type: 'int', default: 0 })
  perfil_complemento_jardinagem: number;

  @Column({ name: 'perfil_complemento_aquarismo', type: 'int', default: 0 })
  perfil_complemento_aquarismo: number;

  @Column({ name: 'flagvalepresente', type: 'int', default: 0 })
  flagvalepresente: number;

  @Column({ name: 'dataprecoalterado', type: 'datetime', nullable: true })
  dataprecoalterado: Date | null;

  @Column({ name: 'flagescalarelevante', type: 'char', length: 1, default: 'S' })
  flagescalarelevante: string;

  @Column({ name: 'codigoprodutoanvisa', type: 'varchar', length: 20, nullable: true })
  codigoprodutoanvisa: string | null;

  @Column({ name: 'cor_id', type: 'char', length: 36, nullable: true })
  cor_id: string | null;

  @Column({ name: 'tamanho_id', type: 'char', length: 36, nullable: true })
  tamanho_id: string | null;

  @Column({ name: 'flagprodutovirtual', type: 'int', default: 0 })
  flagprodutovirtual: number;

  @Column({ name: 'classificacaoabc', type: 'varchar', length: 1, nullable: true })
  classificacaoabc: string | null;

  @Column({ name: 'perfil_tipo_lojafisica', type: 'int', default: 0 })
  perfil_tipo_lojafisica: number;

  @Column({ name: 'perfil_tipo_cd', type: 'int', default: 0 })
  perfil_tipo_cd: number;

  @Column({ name: 'perfil_tipo_ecommerce', type: 'int', default: 0 })
  perfil_tipo_ecommerce: number;

  @Column({ name: 'embalagem_produto_id', type: 'char', length: 36, nullable: true })
  embalagem_produto_id: string | null;

  @Column({ name: 'perfil_complemento_conveniencia', type: 'int', default: 0 })
  perfil_complemento_conveniencia: number;

  @Column({ name: 'flagprodutoperecivel', type: 'int', default: 0 })
  flagprodutoperecivel: number;

  @Column({ name: 'percentualbonus', type: 'decimal', precision: 10, scale: 2, nullable: true })
  percentualbonus: number | null;

  @Column({ name: 'fabrica_id', type: 'char', length: 36, nullable: true })
  fabrica_id: string | null;

  @Column({ name: 'motivoisencaoans', type: 'varchar', length: 200, nullable: true })
  motivoisencaoans: string | null;

  @Column({ name: 'datadescontinuado', type: 'date', nullable: true })
  datadescontinuado: Date | null;

  @Column({ name: 'flagdescontinuadotmp', type: 'int', default: 0 })
  flagdescontinuadotmp: number;

  @Column({ name: 'datadescontinuadotmp', type: 'date', nullable: true })
  datadescontinuadotmp: Date | null;

  @Column({ name: 'motivodescontinuado_id', type: 'char', length: 36, nullable: true })
  motivodescontinuado_id: string | null;

  @Column({ name: 'temp_motivodescontinuado_id', type: 'char', length: 36, nullable: true })
  temp_motivodescontinuado_id: string | null;

  @Column({ name: 'perfil_regiao', type: 'int', default: 0 })
  perfil_regiao: number;

  @Column({ name: 'datadescontinuadofinal', type: 'date', nullable: true })
  datadescontinuadofinal: Date | null;

  @Column({ name: 'imagem_url', type: 'varchar', length: 512, nullable: true })
  imagem_url: string | null;

  @Column({ name: 'nome_amigavel', type: 'varchar', length: 255, nullable: true })
  nome_amigavel: string | null;

  @Column({ name: 'flagprodutoaltogiro', type: 'int', default: 1 })
  flagprodutoaltogiro: number;

  @Column({ name: 'tintometrico_id', type: 'char', length: 36, nullable: true })
  tintometrico_id: string | null;

  @Column({ name: 'perfil_complemento_garden', type: 'int', default: 0 })
  perfil_complemento_garden: number;

  // Relacionamentos
  @OneToMany(() => ProdutoEstoque, (pe) => pe.produto)
  produtoEstoques: ProdutoEstoque[];

  @OneToMany(() => ProdutoTabelaPreco, (ptp) => ptp.produto)
  produtoTabelaPrecos: ProdutoTabelaPreco[];

  @OneToMany(() => ProdutoCaracteristicaProduto, (pcp) => pcp.produto)
  produtoCaracteristicas: ProdutoCaracteristicaProduto[];
}
