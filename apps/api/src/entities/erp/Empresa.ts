import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ProdutoEmpresa } from './ProdutoEmpresa';
import { TabelaPreco } from './TabelaPreco';
import { Estoque } from './Estoque';

@Entity({ name: 'empresa' })
export class Empresa {
  @PrimaryColumn({ name: 'empresa_id', type: 'char', length: 36 })
  empresa_id: string;

  @Column({ name: 'integracao_id', type: 'int', nullable: true })
  integracao_id: number | null;

  @Column({ name: 'pessoa_id', type: 'char', length: 36 })
  pessoa_id: string;

  @Column({ name: 'tabelapreco_id', type: 'char', length: 36, nullable: true })
  tabelapreco_id: string | null;

  @ManyToOne(() => TabelaPreco, { nullable: true })
  @JoinColumn({ name: 'tabelapreco_id' })
  tabelaPreco: TabelaPreco | null;

  @Column({ name: 'nfe_contaemail_id', type: 'char', length: 36, nullable: true })
  nfe_contaemail_id: string | null;

  @Column({ name: 'estoque_id', type: 'char', length: 36, nullable: true })
  estoque_id: string | null;

  @ManyToOne(() => Estoque, { nullable: true })
  @JoinColumn({ name: 'estoque_id' })
  estoque: Estoque | null;

  @Column({ name: 'emailnfe', type: 'text', nullable: true })
  emailnfe: string | null;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'int', default: 0 })
  flagexcluido: number;

  @Column({ name: 'sequencialnfe', type: 'int', nullable: true })
  sequencialnfe: number | null;

  @Column({ name: 'serienfe', type: 'int', nullable: true })
  serienfe: number | null;

  @Column({ name: 'sequencialnfecontingencia', type: 'int', nullable: true })
  sequencialnfecontingencia: number | null;

  @Column({ name: 'serienfecontingencia', type: 'int', nullable: true })
  serienfecontingencia: number | null;

  @Column({ name: 'grupotributariopessoa_id', type: 'char', length: 36, nullable: true })
  grupotributariopessoa_id: string | null;

  @Column({ name: 'flagarmazem', type: 'char', length: 36, nullable: true })
  flagarmazem: string | null;

  @Column({ name: 'mensagemfiscal_id', type: 'char', length: 36, nullable: true })
  mensagemfiscal_id: string | null;

  @Column({ name: 'boleto_contaemail_id', type: 'char', length: 36, nullable: true })
  boleto_contaemail_id: string | null;

  @Column({ name: 'emailboleto', type: 'text', nullable: true })
  emailboleto: string | null;

  @Column({ name: 'sequencialpedido', type: 'int', nullable: true })
  sequencialpedido: number | null;

  @Column({ name: 'prefixopedido', type: 'varchar', length: 10, nullable: true })
  prefixopedido: string | null;

  @Column({ name: 'danfe_layout_id', type: 'char', length: 36, nullable: true })
  danfe_layout_id: string | null;

  @Column({ name: 'pedido_layout_id', type: 'char', length: 36, nullable: true })
  pedido_layout_id: string | null;

  @Column({ name: 'email_pedido_layout_id', type: 'char', length: 36, nullable: true })
  email_pedido_layout_id: string | null;

  @Column({ name: 'nfe_sequencial_id', type: 'char', length: 36, nullable: true })
  nfe_sequencial_id: string | null;

  @Column({ name: 'nfecont_sequencial_id', type: 'char', length: 36, nullable: true })
  nfecont_sequencial_id: string | null;

  @Column({ name: 'pedido_sequencial_id', type: 'char', length: 36, nullable: true })
  pedido_sequencial_id: string | null;

  @Column({ name: 'contaemail_id', type: 'char', length: 36, nullable: true })
  contaemail_id: string | null;

  @Column({ name: 'venda_layout_id', type: 'char', length: 36, nullable: true })
  venda_layout_id: string | null;

  @Column({ name: 'saida_layout_id', type: 'char', length: 36, nullable: true })
  saida_layout_id: string | null;

  @Column({ name: 'entrada_layout_id', type: 'char', length: 36, nullable: true })
  entrada_layout_id: string | null;

  @Column({ name: 'pedidocompra_layout_id', type: 'char', length: 36, nullable: true })
  pedidocompra_layout_id: string | null;

  @Column({ name: 'picklist_layout_id', type: 'char', length: 36, nullable: true })
  picklist_layout_id: string | null;

  @Column({ name: 'cce_layout_id', type: 'char', length: 36, nullable: true })
  cce_layout_id: string | null;

  @Column({ name: 'email_pedidocompra_layout_id', type: 'char', length: 36, nullable: true })
  email_pedidocompra_layout_id: string | null;

  @Column({ name: 'codigo', type: 'varchar', length: 20, nullable: true })
  codigo: string | null;

  @Column({ name: 'nome', type: 'varchar', length: 200, nullable: true })
  nome: string | null;

  @Column({ name: 'minimo_tabelapreco_id', type: 'char', length: 36, nullable: true })
  minimo_tabelapreco_id: string | null;

  @Column({ name: 'imagem_icone', type: 'mediumblob', nullable: true })
  imagem_icone: Buffer | null;

  @Column({ name: 'datamovimentofidelidade', type: 'date', nullable: true })
  datamovimentofidelidade: Date | null;

  @Column({ name: 'validademovimentofidelidade', type: 'int', nullable: true })
  validademovimentofidelidade: number | null;

  @Column({ name: 'dacte_layout_id', type: 'char', length: 36, nullable: true })
  dacte_layout_id: string | null;

  @Column({ name: 'estruturacusto_id', type: 'char', length: 36, nullable: true })
  estruturacusto_id: string | null;

  @Column({ name: 'pesomovimentofidelidade', type: 'decimal', precision: 15, scale: 4, nullable: true })
  pesomovimentofidelidade: number | null;

  @Column({ name: 'planodeconta_id', type: 'char', length: 36, nullable: true })
  planodeconta_id: string | null;

  @Column({ name: 'centrodecusto_id', type: 'char', length: 36, nullable: true })
  centrodecusto_id: string | null;

  @Column({ name: 'flagleitransparencia', type: 'int', nullable: true })
  flagleitransparencia: number | null;

  @Column({ name: 'flagdestacadesconto', type: 'int', nullable: true })
  flagdestacadesconto: number | null;

  @Column({ name: 'contador_pessoa_id', type: 'char', length: 36, nullable: true })
  contador_pessoa_id: string | null;

  @Column({ name: 'flagvalidaestoque', type: 'int', default: 1 })
  flagvalidaestoque: number;

  @Column({ name: 'flagcontrolaserial', type: 'int', nullable: true })
  flagcontrolaserial: number | null;

  @Column({ name: 'flagcontrolalote', type: 'int', nullable: true })
  flagcontrolalote: number | null;

  @Column({ name: 'nsudocumentonferecebido', type: 'varchar', length: 20, default: '' })
  nsudocumentonferecebido: string;

  @Column({ name: 'cte_rntrc', type: 'varchar', length: 20, nullable: true })
  cte_rntrc: string | null;

  @Column({ name: 'cte_seg_pessoa_id', type: 'char', length: 36, nullable: true })
  cte_seg_pessoa_id: string | null;

  @Column({ name: 'cte_seg_apolice', type: 'varchar', length: 20, nullable: true })
  cte_seg_apolice: string | null;

  @Column({ name: 'cte_naturezaoperacao_id', type: 'char', length: 36, nullable: true })
  cte_naturezaoperacao_id: string | null;

  @Column({ name: 'cte_lotacao', type: 'int', nullable: true })
  cte_lotacao: number | null;

  @Column({ name: 'cte_aliquotacreditosn', type: 'decimal', precision: 15, scale: 4, nullable: true })
  cte_aliquotacreditosn: number | null;

  @Column({ name: 'cte_produtopredominante', type: 'varchar', length: 50, nullable: true })
  cte_produtopredominante: string | null;

  @Column({ name: 'crt', type: 'int', default: 2 })
  crt: number;

  @Column({ name: 'flagpoliticalimitecredito', type: 'int', nullable: true })
  flagpoliticalimitecredito: number | null;

  @Column({ name: 'pedidocoleta_layout_id', type: 'char', length: 36, nullable: true })
  pedidocoleta_layout_id: string | null;

  @Column({ name: 'seriecte', type: 'varchar', length: 3, nullable: true })
  seriecte: string | null;

  @Column({ name: 'sequencialcte', type: 'int', nullable: true })
  sequencialcte: number | null;

  @Column({ name: 'cte_mensagemfiscal_id', type: 'char', length: 36, nullable: true })
  cte_mensagemfiscal_id: string | null;

  @Column({ name: 'cte_grupotributarioproduto_id', type: 'char', length: 36, nullable: true })
  cte_grupotributarioproduto_id: string | null;

  @Column({ name: 'flagregimetributario', type: 'int', nullable: true })
  flagregimetributario: number | null;

  @Column({ name: 'diasinadimplencia', type: 'int', nullable: true })
  diasinadimplencia: number | null;

  @Column({ name: 'flagexibirrestricaocliente', type: 'int', nullable: true })
  flagexibirrestricaocliente: number | null;

  @Column({ name: 'vale_layout_id', type: 'char', length: 36, nullable: true })
  vale_layout_id: string | null;

  @Column({ name: 'prazo_revalidacadastro', type: 'int', nullable: true })
  prazo_revalidacadastro: number | null;

  @Column({ name: 'nfce_token', type: 'varchar', length: 100, nullable: true })
  nfce_token: string | null;

  @Column({ name: 'nfce_idtoken', type: 'varchar', length: 100, nullable: true })
  nfce_idtoken: string | null;

  @Column({ name: 'flagsugerirquantidade', type: 'int', default: 1 })
  flagsugerirquantidade: number;

  @Column({ name: 'flagobrigarvendedor', type: 'int', nullable: true })
  flagobrigarvendedor: number | null;

  @Column({ name: 'flagobrigarcliente', type: 'int', default: 0 })
  flagobrigarcliente: number;

  @Column({ name: 'picklist_entrada_layout_id', type: 'char', length: 36, nullable: true })
  picklist_entrada_layout_id: string | null;

  @Column({ name: 'pedidodevolucao_layout_id', type: 'char', length: 36, nullable: true })
  pedidodevolucao_layout_id: string | null;

  @Column({ name: 'rma_estoque_id', type: 'char', length: 36, nullable: true })
  rma_estoque_id: string | null;

  @Column({ name: 'compras_tipoatendimento_id', type: 'char', length: 36, nullable: true })
  compras_tipoatendimento_id: string | null;

  @Column({ name: 'nfce_mensagemfiscal_id', type: 'char', length: 36, nullable: true })
  nfce_mensagemfiscal_id: string | null;

  @Column({ name: 'danfe_nfce_layout_id', type: 'char', length: 36, nullable: true })
  danfe_nfce_layout_id: string | null;

  @Column({ name: 'serienfce', type: 'int', nullable: true })
  serienfce: number | null;

  @Column({ name: 'sequencialnfce', type: 'int', nullable: true })
  sequencialnfce: number | null;

  @Column({ name: 'orcamento_layout_id', type: 'char', length: 36, nullable: true })
  orcamento_layout_id: string | null;

  @Column({ name: 'compras_workflow_id', type: 'char', length: 36, nullable: true })
  compras_workflow_id: string | null;

  @Column({ name: 'pedido_atendimento_id', type: 'char', length: 36, nullable: true })
  pedido_atendimento_id: string | null;

  @Column({ name: 'pedido_workflow_id', type: 'char', length: 36, nullable: true })
  pedido_workflow_id: string | null;

  @Column({ name: 'flagreservaestoque', type: 'int', default: 1 })
  flagreservaestoque: number;

  @Column({ name: 'diasreservaestoque', type: 'int', default: 2 })
  diasreservaestoque: number;

  @Column({ name: 'flagvalidaocorrenciaentrada', type: 'int', nullable: true })
  flagvalidaocorrenciaentrada: number | null;

  @Column({ name: 'flagvalidaconciliacaoentrada', type: 'int', nullable: true })
  flagvalidaconciliacaoentrada: number | null;

  @Column({ name: 'limiteconciliacaoentrada', type: 'decimal', precision: 15, scale: 4, nullable: true })
  limiteconciliacaoentrada: number | null;

  @Column({ name: 'tipotaxaentrega', type: 'int', nullable: true })
  tipotaxaentrega: number | null;

  @Column({ name: 'taxaentrega', type: 'decimal', precision: 15, scale: 4, nullable: true })
  taxaentrega: number | null;

  @Column({ name: 'tipotaxaservico', type: 'int', nullable: true })
  tipotaxaservico: number | null;

  @Column({ name: 'taxaservico', type: 'decimal', precision: 15, scale: 4, nullable: true })
  taxaservico: number | null;

  @Column({ name: 'restaurantemesas', type: 'int', nullable: true })
  restaurantemesas: number | null;

  @Column({ name: 'restaurantetipocontrole', type: 'int', nullable: true })
  restaurantetipocontrole: number | null;

  @Column({ name: 'pdv_flagsangriaautomatica', type: 'int', nullable: true })
  pdv_flagsangriaautomatica: number | null;

  @Column({ name: 'pdv_valormaximocaixa', type: 'decimal', precision: 15, scale: 4, nullable: true })
  pdv_valormaximocaixa: number | null;

  @Column({ name: 'pdv_valorsaque', type: 'decimal', precision: 15, scale: 4, nullable: true })
  pdv_valorsaque: number | null;

  @Column({ name: 'pdv_quantidadevendassangria', type: 'int', nullable: true })
  pdv_quantidadevendassangria: number | null;

  @Column({ name: 'flaglocaloperacao', type: 'int', nullable: true })
  flaglocaloperacao: number | null;

  @Column({ name: 'flagobrigarexpedicao', type: 'int', nullable: true })
  flagobrigarexpedicao: number | null;

  @Column({ name: 'unidadenegocio_id', type: 'char', length: 36, nullable: true })
  unidadenegocio_id: string | null;

  @Column({ name: 'grupotributarioproduto_id', type: 'char', length: 36, nullable: true })
  grupotributarioproduto_id: string | null;

  @Column({ name: 'ncm_id', type: 'int', nullable: true })
  ncm_id: number | null;

  @Column({ name: 'diferenca_entrada_layout_id', type: 'varchar', length: 36, nullable: true })
  diferenca_entrada_layout_id: string | null;

  @Column({ name: 'mensagempromocionalpdv', type: 'text', nullable: true })
  mensagempromocionalpdv: string | null;

  @Column({ name: 'abertura_layout_id', type: 'char', length: 36, nullable: true })
  abertura_layout_id: string | null;

  @Column({ name: 'suprimento_layout_id', type: 'char', length: 36, nullable: true })
  suprimento_layout_id: string | null;

  @Column({ name: 'sangria_layout_id', type: 'char', length: 36, nullable: true })
  sangria_layout_id: string | null;

  @Column({ name: 'fechamento_layout_id', type: 'char', length: 36, nullable: true })
  fechamento_layout_id: string | null;

  @Column({ name: 'flagalteracustoentrada', type: 'int', default: 2 })
  flagalteracustoentrada: number;

  @Column({ name: 'flagalteravendaentrada', type: 'int', default: 2 })
  flagalteravendaentrada: number;

  @Column({ name: 'tamanhoenvelope', type: 'int', nullable: true })
  tamanhoenvelope: number | null;

  @Column({ name: 'msgdesconto', type: 'varchar', length: 100, nullable: true })
  msgdesconto: string | null;

  @Column({ name: 'msgcancelamento', type: 'varchar', length: 100, nullable: true })
  msgcancelamento: string | null;

  @Column({ name: 'flagdetalharpos', type: 'int', nullable: true })
  flagdetalharpos: number | null;

  @Column({ name: 'tefvalorparcelaminima', type: 'decimal', precision: 15, scale: 2, nullable: true })
  tefvalorparcelaminima: number | null;

  @Column({ name: 'tefvalorparcelamentoespecial', type: 'decimal', precision: 15, scale: 2, nullable: true })
  tefvalorparcelamentoespecial: number | null;

  @Column({ name: 'tefqtdeparcelaminima', type: 'int', nullable: true })
  tefqtdeparcelaminima: number | null;

  @Column({ name: 'tefqtdeparcelamentoespecial', type: 'int', nullable: true })
  tefqtdeparcelamentoespecial: number | null;

  @Column({ name: 'variacaomaximacustoentrada', type: 'decimal', precision: 15, scale: 4, nullable: true })
  variacaomaximacustoentrada: number | null;

  @Column({ name: 'serienfse', type: 'varchar', length: 10, default: '1' })
  serienfse: string;

  @Column({ name: 'sequencialnfse', type: 'int', nullable: true })
  sequencialnfse: number | null;

  @Column({ name: 'codigobarrascalculado', type: 'varchar', length: 100, nullable: true })
  codigobarrascalculado: string | null;

  @Column({ name: 'flaglimitecreditocompartilhado', type: 'int', default: 0 })
  flaglimitecreditocompartilhado: number;

  @Column({ name: 'percentualdescontocondicional', type: 'decimal', precision: 15, scale: 4, nullable: true })
  percentualdescontocondicional: number | null;

  @Column({ name: 'dataprimeiravenda', type: 'datetime', nullable: true })
  dataprimeiravenda: Date | null;

  @Column({ name: 'nfce_largurabobina', type: 'int', nullable: true })
  nfce_largurabobina: number | null;

  @Column({ name: 'nfce_danfeumalinha', type: 'int', nullable: true })
  nfce_danfeumalinha: number | null;

  @Column({ name: 'empresa_codigo', type: 'varchar', length: 10, nullable: true })
  empresa_codigo: string | null;

  @Column({ name: 'empresa_nome', type: 'varchar', length: 100, nullable: true })
  empresa_nome: string | null;

  @Column({ name: 'nfce_tipolayout', type: 'int', default: 0 })
  nfce_tipolayout: number;

  @Column({ name: 'perfil_tamanho', type: 'int', default: 0 })
  perfil_tamanho: number;

  @Column({ name: 'perfil_qualidade', type: 'int', default: 0 })
  perfil_qualidade: number;

  @Column({ name: 'perfil_complemento_jardinagem', type: 'int', default: 0 })
  perfil_complemento_jardinagem: number;

  @Column({ name: 'perfil_complemento_aquarismo', type: 'int', default: 0 })
  perfil_complemento_aquarismo: number;

  @Column({ name: 'perfil_tipo_lojafisica', type: 'int', default: 0 })
  perfil_tipo_lojafisica: number;

  @Column({ name: 'perfil_tipo_cd', type: 'int', default: 0 })
  perfil_tipo_cd: number;

  @Column({ name: 'perfil_tipo_ecommerce', type: 'int', default: 0 })
  perfil_tipo_ecommerce: number;

  @Column({ name: 'abastecimentoregiao_id', type: 'char', length: 36, nullable: true })
  abastecimentoregiao_id: string | null;

  @Column({ name: 'perfil_complemento_conveniencia', type: 'int', default: 0 })
  perfil_complemento_conveniencia: number;

  @Column({ name: 'horarioabertura', type: 'char', length: 5, nullable: true })
  horarioabertura: string | null;

  @Column({ name: 'horariofechamento', type: 'char', length: 5, nullable: true })
  horariofechamento: string | null;

  @Column({ name: 'horarioabertura_sab', type: 'char', length: 5, nullable: true })
  horarioabertura_sab: string | null;

  @Column({ name: 'horariofechamento_sab', type: 'char', length: 5, nullable: true })
  horariofechamento_sab: string | null;

  @Column({ name: 'horarioabertura_dom', type: 'char', length: 5, nullable: true })
  horarioabertura_dom: string | null;

  @Column({ name: 'horariofechamento_dom', type: 'char', length: 5, nullable: true })
  horariofechamento_dom: string | null;

  @Column({ name: 'entregagratuita_bairros', type: 'varchar', length: 256, nullable: true })
  entregagratuita_bairros: string | null;

  @Column({ name: 'flaginativa', type: 'int', default: 0 })
  flaginativa: number;

  @Column({ name: 'flagdeduziricmspiscofins', type: 'int', default: 0 })
  flagdeduziricmspiscofins: number;

  @Column({ name: 'flagdeduzirfcppiscofins', type: 'int', default: 0 })
  flagdeduzirfcppiscofins: number;

  @Column({ name: 'perfil_regiao', type: 'int', default: 0 })
  perfil_regiao: number;

  @Column({ name: 'datahoransudocumentonferecebido', type: 'datetime', nullable: true })
  datahoransudocumentonferecebido: Date | null;

  @Column({ name: 'flagobrigarcheckout', type: 'int', default: 0 })
  flagobrigarcheckout: number;

  @Column({ name: 'diasvencimentovalecredito', type: 'int', default: 1 })
  diasvencimentovalecredito: number;

  @Column({ name: 'espacoareavenda', type: 'decimal', precision: 15, scale: 4, nullable: true })
  espacoareavenda: number | null;

  @Column({ name: 'flagcustosemimpostos_descartaricmsst', type: 'int', default: 1 })
  flagcustosemimpostos_descartaricmsst: number;

  @Column({ name: 'flagcustosemimpostos_adicionaripi', type: 'int', default: 1 })
  flagcustosemimpostos_adicionaripi: number;

  @Column({ name: 'aliquotapisrecuperavel', type: 'decimal', precision: 15, scale: 4, nullable: true })
  aliquotapisrecuperavel: number | null;

  @Column({ name: 'aliquotacofinsrecuperavel', type: 'decimal', precision: 15, scale: 4, nullable: true })
  aliquotacofinsrecuperavel: number | null;

  @Column({ name: 'flagicmsefetivost', type: 'int', default: 0 })
  flagicmsefetivost: number;

  @Column({ name: 'flagpermitiralterartabela', type: 'int', default: 1 })
  flagpermitiralterartabela: number;

  @Column({ name: 'flagobrigartransportadorpdv', type: 'int', default: 0 })
  flagobrigartransportadorpdv: number;

  @Column({ name: 'flaggerarpedidocomsobra', type: 'int', nullable: true })
  flaggerarpedidocomsobra: number | null;

  @Column({ name: 'flaggerardevolucaocomexpedicaopendente', type: 'int', nullable: true })
  flaggerardevolucaocomexpedicaopendente: number | null;

  @Column({ name: 'tipoemissaonfe', type: 'int', default: 1 })
  tipoemissaonfe: number;

  @Column({ name: 'rma_empresa_id', type: 'char', length: 36, nullable: true })
  rma_empresa_id: string | null;

  @Column({ name: 'flagvalidaestoquefaturamento', type: 'int', default: 0 })
  flagvalidaestoquefaturamento: number;

  @Column({ name: 'flagestacionamentopdv', type: 'int', default: 0 })
  flagestacionamentopdv: number;

  @Column({ name: 'estacionamentopolitica_id', type: 'char', length: 36, nullable: true })
  estacionamentopolitica_id: string | null;

  @Column({ name: 'perfil_complemento_garden', type: 'int', default: 0 })
  perfil_complemento_garden: number;

  @Column({ name: 'tabelafrete_id', type: 'char', length: 36, nullable: true })
  tabelafrete_id: string | null;

  @Column({ name: 'flagacessartelanegociacao', type: 'int', default: 0 })
  flagacessartelanegociacao: number;

  @Column({ name: 'entrada_empresa_id', type: 'char', length: 36, nullable: true })
  entrada_empresa_id: string | null;

  @Column({ name: 'sobra_estoque_id', type: 'char', length: 36, nullable: true })
  sobra_estoque_id: string | null;

  @OneToMany(() => ProdutoEmpresa, (pe) => pe.empresa)
  produtoEmpresas: ProdutoEmpresa[];
}
