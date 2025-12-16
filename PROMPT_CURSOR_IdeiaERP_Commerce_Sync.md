# PROMPT OFICIAL PARA CURSOR  
## IdeiaERP Commerce Sync (ERP ↔ Loja Virtual)

Este arquivo contém um **PROMPT ÚNICO E EXECUTÁVEL** para ser utilizado diretamente no **Cursor** (Chat interno com Claude / GPT).  
Ele foi projetado para gerar **TODO o projeto**, com código real, arquivos, scripts e documentação.

👉 **Modo de uso**
1. Abra um repositório vazio no Cursor  
2. Crie um arquivo `README.md` (opcional)  
3. Abra o Chat do Cursor  
4. Cole **TODO este conteúdo de uma vez**  
5. Execute e acompanhe a geração dos arquivos  

---

## 🎯 CONTEXTO GERAL

Você é um **arquiteto e desenvolvedor sênior**, especialista em:

- Node.js + TypeScript
- Express
- TypeORM
- CQRS
- MariaDB
- Integrações ERP ↔ E-commerce
- Serviços Linux/Windows
- PM2

Você deve gerar um **serviço de sincronização** entre o **IdeiaERP (MariaDB)** e **lojas virtuais**, iniciando com **OpenCart**, mas com arquitetura **flexível para VTEX e outras plataformas**.

O projeto deve rodar **24/7**, executar **CRONs**, possuir **painel web administrativo**, **login**, **webhooks** e **build multiplataforma**.

---

## 🔒 REGRA DE OURO

> **TODO sincronismo começa pela tabela `lojavirtual`.**

Nenhuma rotina, query, CRON ou comando pode ignorar isso.

---

## 🧱 STACK FIXA (NÃO NEGOCIÁVEL)

- Node.js LTS
- TypeScript
- Express
- TypeORM
- MariaDB
- CQRS (Commands / Queries / Handlers)
- PM2
- node-cron
- pkg ou nexe
- Arquitetura Ports & Adapters

---

## 📁 ETAPA 1 — BOOTSTRAP DO PROJETO

Gere os arquivos reais:

- `package.json`
- `tsconfig.json`
- `.env.example`

Estrutura inicial:

```
src/
  main.ts
  app.ts
  config/
  shared/
  modules/
scripts/
```

Use **Express** como servidor HTTP.

---

## ⚙️ ETAPA 2 — CONFIGURAÇÃO E INFRA

Implemente:

- Loader de config com validação (zod ou joi)
- Logger estruturado
- Handler global de erros
- Endpoint `/health`

Crie **DOIS DataSources TypeORM**:
- `erpDataSource`
- `appDataSource`

---

## 🗄️ ETAPA 3 — ENTIDADES TYPEORM (IdeiaERP)

Todas as entidades devem respeitar:

- PK: `<tabela>_id`
- Datas: `datacadastro`, `dataalterado`
- Soft delete: `flagexcluido`
- Integração: `integracao_id`
- Tabelas e campos em português

Entidades obrigatórias:

- Produtos
- Categoria
- Marca
- Usuario
- Empresa
- Estoque
- produtoestoque
- ProdutoEmpresa
- TabelaPreco
- ProdutoTabelaPreco
- lojavirtual
- LojaVirtualExportacao
- caracteristicaproduto
- produtocaracteristicaproduto

Use sempre:
```
@Entity({ name: 'nome_exato_da_tabela' })
```

---

## 🔁 ETAPA 4 — BANCO DA APLICAÇÃO (SYNC)

No `appDataSource`, crie:

- sync_job
- sync_log
- sync_lock
- sync_mapping
- tenants
- integrations

Usos:
- Lock de CRON
- Auditoria
- Retry
- Rastreabilidade

---

## 🧠 ETAPA 5 — CQRS (OBRIGATÓRIO)

### Commands
- SyncLojaVirtualCommand
- SyncCatalogCommand
- SyncStockCommand
- SyncPricesCommand
- SyncOrdersCommand
- SyncProductByIdCommand

### Queries
- ListProductsQuery
- ListOrdersQuery
- DashboardQuery

Cada Command/Query deve ter:
- Handler
- Service de domínio
- Logs

---

## 🔌 ETAPA 6 — ADAPTERS DE PLATAFORMA

### Interface
`CommercePlatformAdapter`

Métodos obrigatórios:
- createProduct
- updateProduct
- syncStock
- syncPrice
- getOrders
- getOrderById

### Implementações
- OpenCartAdapter (real)
- VtexAdapter (stub)

Adapters **NÃO acessam TypeORM**.

---

## 🔍 ETAPA 7 — QUERIES CRÍTICAS

Usar `QueryBuilder` para:

- Produtos por `caracteristicaproduto_id`
- Preço por `tabelapreco_id`
- Estoque por `estoque_id`
- Pendências por `dataalterado`
- Upsert por `integracao_id`

---

## ⏱️ ETAPA 8 — CRON

CRONs configuráveis por ENV:

- Produtos
- Preços
- Estoque
- Pedidos

Regras:
- Lock por loja
- Logs
- Retry
- CRON independe de login

---

## 🌐 ETAPA 9 — WEBHOOK

Endpoint:
```
POST /webhooks/opencart/orders
```

- Validar token
- Enfileirar job
- Responder 200 rapidamente

---

## 🔐 ETAPA 10 — AUTH E PAINEL WEB

- Login via tabela `Usuario`
- Apenas `privilegiado = true`
- Sessão por cookie
- Painel simples (EJS ou Handlebars)

Páginas:
- Login
- Dashboard
- Produtos
- Pedidos
- Logs

---

## 🚀 ETAPA 11 — PM2 E SERVIÇOS

Gerar:

- `ecosystem.config.js`
- `scripts/linux/ideiaerp-sync.service`
- `scripts/windows/install-service.ps1` (NSSM)

---

## 📦 ETAPA 12 — BUILD

- `npm run build`
- Gerar binários:
  - Windows
  - Linux

---

## 📘 ETAPA 13 — DOCUMENTAÇÃO

Atualizar README com:
- Setup dev
- Setup prod
- Configuração
- Webhooks
- Como adicionar nova plataforma

---

## ✅ RESULTADO FINAL ESPERADO

O projeto final deve:

- Rodar localmente
- Rodar como serviço
- Sincronizar IdeiaERP ↔ OpenCart
- Estar preparado para VTEX
- Ter código limpo, modular e auditável

---

### ⚠️ REGRA FINAL
- Não simplifique
- Não mockar integrações
- Marcar TODO onde o schema real exigir ajuste
- Criar arquivos reais no repositório

---

**FIM DO PROMPT — EXECUTE NO CURSOR**  
