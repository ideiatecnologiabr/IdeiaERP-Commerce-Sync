# IdeiaERP Commerce Sync

Sistema de sincronização bidirecional entre **IdeiaERP (MariaDB)** e **lojas virtuais** (OpenCart/VTEX), usando NX monorepo com backend Node.js/Express e frontend Angular.

## 🏗️ Arquitetura

- **NX Monorepo** - Gerenciamento de workspace
- **Backend** - Node.js/Express/TypeScript (API + CRON)
- **Frontend** - Angular (Painel Admin)
- **Database** - MariaDB (ERP + App)
- **ORM** - TypeORM
- **Arquitetura** - CQRS + Ports & Adapters

## 📋 Requisitos

- Node.js 18+ (LTS)
- npm, yarn ou pnpm
- MariaDB
- NX CLI (opcional, mas recomendado)

## 🚀 Instalação

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar API em desenvolvimento
npm run serve:api
# ou
npx nx serve api

# Rodar API em modo debug
npm run serve:api:debug
# ou
npx nx serve api --configuration=debug

# Rodar Angular em desenvolvimento
npm run serve:web
# ou
npx nx serve web

# Rodar ambos
npm run serve
```

### Build

```bash
# Build de produção (tudo)
npm run build

# Build apenas API
npm run build:api

# Build apenas Angular
npm run build:web

# Build binários da API (Windows/Linux/macOS)
npm run build:api:win
npm run build:api:linux
npm run build:api:macos
```

## ⚙️ Configuração

Copie `.env.example` para `.env` e configure:

```env
# ERP Database
ERP_DB_HOST=localhost
ERP_DB_PORT=3306
ERP_DB_USER=root
ERP_DB_PASSWORD=
ERP_DB_NAME=ideiaerp

# App Database
APP_DB_HOST=localhost
APP_DB_PORT=3306
APP_DB_USER=root
APP_DB_PASSWORD=
APP_DB_NAME=ideiaerp_sync

# OpenCart
OPENCART_URL=https://example.com
OPENCART_API_KEY=

# Webhooks
WEBHOOK_TOKEN_OPENCART=

# CRON
CRON_SYNC_PRODUCTS=0 */6 * * *
CRON_SYNC_PRICES=0 */2 * * *
CRON_SYNC_STOCK=*/15 * * * *
CRON_SYNC_ORDERS=*/5 * * * *

# Security
SESSION_SECRET=change-this-secret-key-in-production
JWT_SECRET=change-this-jwt-secret-in-production

# Server
PORT=3000
NODE_ENV=development
```

## 🔧 Deploy

### Linux (systemd)

```bash
# Build do projeto
npm run build

# Executar script de instalação
sudo ./tools/scripts/linux/install.sh

# Gerenciar serviço
sudo systemctl start ideiaerp-sync
sudo systemctl status ideiaerp-sync
sudo systemctl stop ideiaerp-sync
```

### Windows (NSSM)

```powershell
# Build do projeto
npm run build

# Executar script de instalação (como Administrador)
.\tools\scripts\windows\install-service.ps1

# Gerenciar serviço
Start-Service -Name IdeiaERPSync
Get-Service -Name IdeiaERPSync
Stop-Service -Name IdeiaERPSync
```

### PM2

```bash
# Build do projeto
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.js

# Verificar status
pm2 status

# Ver logs
pm2 logs ideiaerp-sync-api
```

## 📚 API

### Endpoints Públicos

- `GET /health` - Health check
- `GET /docs` - Swagger UI
- `GET /openapi.json` - OpenAPI spec
- `POST /webhooks/:platform/orders` - Webhook de pedidos

### Endpoints Protegidos (requer login)

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Usuário atual
- `GET /api/v1/admin/dashboard` - Dashboard
- `GET /api/v1/admin/lojavirtual` - Listar lojas
- `GET /api/v1/admin/lojavirtual/:id/produtos` - Listar produtos
- `POST /api/v1/admin/lojavirtual/:id/sync/catalog` - Sincronizar catálogo
- `POST /api/v1/admin/lojavirtual/:id/sync/prices` - Sincronizar preços
- `POST /api/v1/admin/lojavirtual/:id/sync/stock` - Sincronizar estoques
- `POST /api/v1/admin/lojavirtual/:id/sync/orders` - Sincronizar pedidos
- `GET /api/v1/admin/logs` - Listar logs

Documentação completa disponível em `/docs` quando a API estiver rodando.

## 🔐 Autenticação

O sistema usa autenticação baseada em sessão (cookies). Apenas usuários com `privilegiado = true` na tabela `Usuario` podem acessar o painel administrativo.

## 🔄 Sincronização

### Regra Fundamental

> **Todo sincronismo SEMPRE começa pela tabela `lojavirtual`**

### Tipos de Sincronização

1. **Catálogo** - Produtos completos (nome, descrição, preço, estoque)
2. **Preços** - Apenas atualização de preços
3. **Estoques** - Apenas atualização de quantidades
4. **Pedidos** - Importação de pedidos da loja virtual para o ERP

### CRONs Automáticos

Os CRONs são configurados via variáveis de ambiente e executam automaticamente:

- Sync Produtos: `CRON_SYNC_PRODUCTS` (padrão: a cada 6 horas)
- Sync Preços: `CRON_SYNC_PRICES` (padrão: a cada 2 horas)
- Sync Estoques: `CRON_SYNC_STOCK` (padrão: a cada 15 minutos)
- Sync Pedidos: `CRON_SYNC_ORDERS` (padrão: a cada 5 minutos)

## 🌐 Webhooks

### OpenCart

```bash
POST /webhooks/opencart/orders
Headers:
  X-Webhook-Token: <WEBHOOK_TOKEN_OPENCART>
Body:
{
  "orderId": 123
}
```

## 📦 Estrutura do Projeto

```
IdeiaVirtualShop/
├── apps/
│   ├── api/          # Backend Express API
│   └── web/           # Frontend Angular
├── libs/
│   └── shared/        # Bibliotecas compartilhadas
├── tools/
│   └── scripts/       # Scripts de deploy
└── ecosystem.config.js
```

## 🧪 Testes

```bash
# Testar tudo
npm test

# Testar apenas API
npm run test:api

# Testar apenas Angular
npm run test:web
```

## 📝 Licença

[Adicionar licença]

## 🤝 Contribuindo

[Adicionar guia de contribuição]

## 📞 Suporte

[Adicionar informações de suporte]

