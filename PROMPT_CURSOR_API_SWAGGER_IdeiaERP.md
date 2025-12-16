# PROMPT COMPLEMENTAR – API + SWAGGER (OpenAPI 3.0)
## IdeiaERP Commerce Sync

Este documento é um **PROMPT COMPLEMENTAR** para ser usado no **Cursor** após o prompt principal do projeto.
Ele adiciona **API HTTP documentada com Swagger/OpenAPI 3.0**, mantendo a arquitetura **CQRS + TypeORM + Express**.

👉 **Modo de uso**
1. Gere o projeto base usando o prompt principal
2. Abra o Chat do Cursor
3. Cole **TODO este conteúdo**
4. Solicite a implementação incremental, criando arquivos reais

---

## 🎯 CONTEXTO

Atualize o projeto **IdeiaERP Commerce Sync** para expor uma **API REST versionada**, documentada via **Swagger/OpenAPI 3.0**, sem violar:

- CQRS
- Separação Controller × Domínio
- Execução contínua de CRON
- Segurança por sessão
- Webhooks públicos protegidos

---

## 🔒 REGRAS OBRIGATÓRIAS

1. Controllers **NÃO** possuem regra de negócio
2. Controllers apenas disparam **Commands** ou **Queries**
3. Swagger deve ser **gerado automaticamente**
4. API versionada em `/api/v1`
5. Rotas públicas e protegidas claramente separadas
6. Resposta JSON padronizada:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

---

## 🧱 STACK (ADICIONAL)

Adicionar dependências:

- swagger-ui-express
- swagger-jsdoc
- cors
- helmet
- express-rate-limit
- compression (opcional)

---

## ⚙️ SETUP DE SWAGGER

Criar arquivos:

- `src/config/swagger.ts`
- Registrar:
  - `GET /docs`
  - `GET /openapi.json`

Tags obrigatórias:
- Auth
- Dashboard
- LojaVirtual
- Produtos
- Pedidos
- Sync
- Webhooks
- Logs

---

## 🌐 ROTAS PÚBLICAS

### Health
- `GET /health`

### Swagger
- `GET /docs`
- `GET /openapi.json`

### Webhook
- `POST /webhooks/opencart/orders`
  - Header: `X-Webhook-Token`
  - Body:
```json
{ "orderId": 123 }
```

---

## 🔐 ROTAS PROTEGIDAS (ADMIN)

Middleware obrigatório:
- `authMiddleware` (Usuario.privilegiado = true)

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Dashboard
- `GET /api/v1/admin/dashboard`

### LojaVirtual
- `GET /api/v1/admin/lojavirtual`
- `GET /api/v1/admin/lojavirtual/:lojavirtual_id`

### Produtos
- `GET /api/v1/admin/lojavirtual/:lojavirtual_id/produtos`
- `POST /api/v1/admin/lojavirtual/:lojavirtual_id/produtos/:produto_id/sync`

### Pedidos
- `GET /api/v1/admin/lojavirtual/:lojavirtual_id/pedidos`
- `POST /api/v1/admin/lojavirtual/:lojavirtual_id/pedidos/:pedido_id/sync`

### Sincronizações Manuais
- `POST /api/v1/admin/lojavirtual/:lojavirtual_id/sync/catalog`
- `POST /api/v1/admin/lojavirtual/:lojavirtual_id/sync/prices`
- `POST /api/v1/admin/lojavirtual/:lojavirtual_id/sync/stock`
- `POST /api/v1/admin/lojavirtual/:lojavirtual_id/sync/orders`

### Logs
- `GET /api/v1/admin/logs`
- `GET /api/v1/admin/logs/:sync_log_id`

---

## 🧠 INTEGRAÇÃO COM CQRS

Controllers devem chamar:

### Queries
- ListProductsQuery
- ListOrdersQuery
- DashboardQuery
- ListLojasVirtuaisQuery
- ListLogsQuery

### Commands
- SyncCatalogCommand
- SyncPricesCommand
- SyncStockCommand
- SyncOrdersCommand
- SyncProductByIdCommand
- SyncOrderByIdCommand

---

## 📘 DOCUMENTAÇÃO OPENAPI

Swagger deve documentar:

- Schemas:
  - ApiResponse
  - ApiError
  - LoginRequest
  - LoginResponse
  - ProductListItem
  - OrderListItem
  - DashboardResponse
  - SyncTriggerResponse
- Segurança:
  - Cookie-based session
- Examples reais nos endpoints principais

---

## 🛡️ SEGURANÇA

- helmet habilitado
- rate-limit em:
  - `/auth/login`
  - `/webhooks/*`
- CORS configurável por ENV
- Token de webhook por ENV:
  - `WEBHOOK_TOKEN_OPENCART`

---

## 📦 ENTREGÁVEIS

Ao concluir este prompt, o projeto deve conter:

1. API REST funcional
2. Swagger UI em `/docs`
3. OpenAPI JSON em `/openapi.json`
4. Controllers finos
5. CQRS preservado
6. README atualizado com exemplos curl

---

## ⚠️ REGRA FINAL

- Não quebrar código existente
- Não mover regras de domínio para controllers
- Não remover CRON
- Marcar TODOs onde necessário

---

**FIM DO PROMPT COMPLEMENTAR – API + SWAGGER**
