# IdeiaERP Commerce Sync  
**Sincronizador ERP ↔ Loja Virtual (OpenCart / VTEX-ready)**

Este documento é um **PROMPT ÚNICO E COMPLETO** para ser usado em uma IA (Cursor, Claude, ChatGPT, etc.) com o objetivo de **gerar toda a aplicação** descrita abaixo, incluindo código, arquitetura, scripts, build e documentação.

Use este README como **fonte única da verdade** para gerar o projeto.

---

## 1. Objetivo do Projeto

Criar um **serviço Node.js** que sincroniza dados entre o **IdeiaERP (MariaDB)** e **lojas virtuais**, iniciando com **OpenCart**, mas com arquitetura **flexível e extensível** para incluir novas plataformas (ex.: VTEX).

O sistema deve:
- Rodar **24/7 como serviço**
- Executar **CRONs automaticamente**
- Oferecer um **painel web (admin)** para monitoramento e ações manuais
- Possuir **login**, mas **não depender do login para executar sincronizações**
- Ser compilável para **Windows e Linux**
- Utilizar **PM2**
- Seguir **CQRS + TypeORM**
- Ser **orientado a adapters (ports & adapters)**

---

## 2. Stack Obrigatória

- Node.js (LTS)
- TypeScript
- Express
- TypeORM
- MariaDB
- CQRS (Command / Query / Handler)
- node-cron (ou agenda)
- PM2
- pkg ou nexe (para gerar binários)
- (Opcional recomendado) Redis + BullMQ para filas

---

## 3. Execução como Serviço

### Linux
- Gerar unit file `systemd`
- Serviço deve iniciar automaticamente
- Scripts em `/scripts/linux/`

### Windows
- Instalação como serviço via **NSSM**
- Scripts em `/scripts/windows/`

### PM2
- `ecosystem.config.js` com:
  - modo único (API + CRON)
  - modo cluster (API em cluster, CRON em 1 instância)

---

## 4. Conceitos-Chave de Negócio

### 4.1 Tabela Central: `lojavirtual`

Todo sincronismo **sempre começa por `lojavirtual`**.

Essa tabela define:
- Qual é a loja
- Qual estoque usar
- Qual tabela de preço usar
- Quais produtos pertencem à loja
- Qual URL base da plataforma

Campos importantes:
- `lojavirtual_id`
- `tabelapreco_id`
- `caracteristicaproduto_id`
- `estoque_id`
- `urlbase`
- `flagexcluido`

---

## 5. Padrões do Banco IdeiaERP (OBRIGATÓRIOS)

### 5.1 Convenções Gerais
- **Primary Key:** `<tabela>_id`
- **Datas:** `datacadastro`, `dataalterado`
- **Soft delete:** `flagexcluido`
- **Integração:** `integracao_id` (id do registro na loja virtual)
- **Nomes:** tabelas e campos em português

### 5.2 Tabelas Envolvidas

- `Produtos`
- `Categoria`
- `Marca`
- `Usuario`
- `Empresa`
- `Estoque`
- `produtoestoque`
- `ProdutoEmpresa`
- `TabelaPreco`
- `ProdutoTabelaPreco`
- `lojavirtual`
- `LojaVirtualExportacao`
- `caracteristicaproduto`
- `produtocaracteristicaproduto`

> OBS: manter exatamente o nome `caracteristicaproduto` conforme o banco.

---

## 6. Regras de Sincronização

### 6.1 Produtos (ERP → Loja Virtual)

Um produto pertence à loja se:
- Está vinculado à `lojavirtual.caracteristicaproduto_id`
  via `produtocaracteristicaproduto`

Preço:
- Vem da `ProdutoTabelaPreco`
- Filtrando por `lojavirtual.tabelapreco_id`

Estoque:
- Vem da `produtoestoque`
- Filtrando por `lojavirtual.estoque_id`

Integração:
- `integracao_id` = ID do produto na loja virtual
- Se `null` → criar
- Se preenchido → atualizar

---

### 6.2 Pedidos (Loja Virtual → ERP)

- Sincronizados via:
  - CRON
  - Webhook
- Pedidos devem:
  - Ser idempotentes
  - Não duplicar
  - Ser gravados em staging ou integração sem quebrar o ERP

---

## 7. Webhook

Endpoint público:
```
POST /webhooks/:platform/orders
```

Inicial:
```
POST /webhooks/opencart/orders
```

Regras:
- Validar token/assinatura
- Enfileirar job
- Responder rápido (200 OK)

---

## 8. Login e Segurança

- Login usando tabela `Usuario`
- Campo `privilegiado = true` autoriza acesso ao painel
- Login **NÃO controla CRON**
- Painel protegido
- Webhook público (com validação)

---

## 9. Painel Web (Admin)

### Funcionalidades:
- Dashboard geral
- Listagem de:
  - Pedidos
  - Produtos
  - Clientes
- Botões:
  - “Sincronizar agora”
- Logs de execução
- Status do serviço

---

## 10. CRONs Obrigatórios

Executar automaticamente:
- Sync Produtos
- Sync Preços
- Sync Estoques
- Sync Pedidos

Regras:
- Lock por loja + tipo
- Log de execução
- Retry com backoff

---

## 11. Arquitetura (CQRS + Adapters)

### Estrutura Sugerida

```
src/
  main.ts
  app.ts
  config/
  modules/
    auth/
    dashboard/
    products/
    orders/
    customers/
    sync/
    integrations/
      ports/
        CommercePlatformAdapter.ts
      opencart/
      vtex/
  shared/
    db/
    logger/
    http/
    cron/
    queue/
```

---

## 12. Adapters de Plataforma

### Interface (Port)
`CommercePlatformAdapter` deve expor:
- createProduct
- updateProduct
- syncStock
- syncPrice
- getOrders
- getOrderById

### Implementações:
- `OpenCartAdapter` (real)
- `VtexAdapter` (stub)

---

## 13. ORM – Exemplos de Query (Obrigatório suportar)

- Buscar lojas ativas
- Buscar produtos por característica
- Buscar preço por tabela
- Buscar estoque por estoque_id
- Detectar pendências por `dataalterado`
- Upsert usando `integracao_id`

---

## 14. Banco da Aplicação (Recomendado)

Criar schema próprio para controle:
- `sync_job`
- `sync_log`
- `sync_lock`
- `sync_mapping`
- `tenants`
- `integrations`

---

## 15. Observabilidade

- Logs estruturados
- `/health`
  - ERP DB
  - App DB
  - Redis (se houver)
- Tratamento global de erros

---

## 16. Build e Distribuição

- `npm run build`
- Gerar binários:
  - Windows
  - Linux
- Incluir:
  - scripts de serviço
  - pm2 config
  - README de deploy

---

## 17. Configuração

- `.env.example`
- Validação de env
- Separar:
  - ERP DB
  - APP DB
  - Plataforma
  - CRON
  - Segurança

---

## 18. Regras Importantes

- Não acoplar OpenCart ao domínio
- Todo sync gera log
- CRON nunca depende de login
- Painel é apenas administrativo
- Código deve ser limpo, modular e extensível

---

## 19. Entregáveis da IA

A IA deve gerar:
1. Código completo
2. README de uso e deploy
3. Scripts Windows/Linux
4. ecosystem.config.js
5. Webhooks documentados
6. Seed de usuário admin privilegiado

---

## 20. Nota Final

Se algum campo exato do ERP não for conhecido:
- Assumir nome lógico
- Marcar como TODO
- Documentar claramente

---

**Este README é o PROMPT OFICIAL do projeto.  
Nada deve ser gerado fora do que está aqui descrito.**
