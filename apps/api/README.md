# API - IdeiaERP Commerce Sync

Backend Node.js/Express com TypeScript para sincronização entre IdeiaERP e lojas virtuais.

## Estrutura

```
apps/api/src/
├── config/           # Configurações (database, logger, swagger, env)
├── entities/         # Entidades TypeORM (ERP e App)
├── modules/          # Módulos da aplicação
│   ├── auth/        # Autenticação
│   ├── dashboard/   # Dashboard
│   ├── products/    # Produtos
│   ├── orders/      # Pedidos
│   ├── sync/        # Sincronização (CQRS)
│   └── integrations/# Adapters de plataforma
├── shared/           # Código compartilhado
├── webhooks/         # Webhooks públicos
├── app.ts            # Setup Express
└── main.ts           # Entry point
```

## Entidades

### ERP (IdeiaERP Database)

- `Produtos` - Produtos do ERP
- `Categoria` - Categorias
- `Marca` - Marcas
- `Usuario` - Usuários
- `LojaVirtual` - Configuração de lojas virtuais
- `TabelaPreco` - Tabelas de preço
- `Estoque` - Estoques
- E outras...

### App (Application Database)

- `SyncJob` - Jobs de sincronização
- `SyncLog` - Logs de sincronização
- `SyncLock` - Locks de sincronização
- `SyncMapping` - Mapeamento ERP ↔ Plataforma
- `Tenant` - Tenants (multi-tenancy)
- `Integration` - Configurações de integração

## CQRS

### Commands

- `SyncCatalogCommand` - Sincronizar catálogo completo
- `SyncPricesCommand` - Sincronizar preços
- `SyncStockCommand` - Sincronizar estoques
- `SyncOrdersCommand` - Sincronizar pedidos
- `SyncProductByIdCommand` - Sincronizar produto específico
- `SyncOrderByIdCommand` - Sincronizar pedido específico

### Queries

- `ListProductsQuery` - Listar produtos
- `ListOrdersQuery` - Listar pedidos
- `DashboardQuery` - Dados do dashboard
- `ListLojasVirtuaisQuery` - Listar lojas
- `ListLogsQuery` - Listar logs

## Adapters

### OpenCartAdapter

Implementação real para OpenCart usando REST API.

### VtexAdapter

Stub para futura implementação VTEX.

## Como Adicionar Nova Plataforma

1. Criar novo adapter em `modules/integrations/<platform>/`
2. Implementar interface `CommercePlatformAdapter`
3. Adicionar ao `AdapterFactory`
4. Configurar variáveis de ambiente
5. Adicionar webhook se necessário

Exemplo:

```typescript
// modules/integrations/novaplataforma/NovaPlataformaAdapter.ts
import { CommercePlatformAdapter } from '../ports/CommercePlatformAdapter';

export class NovaPlataformaAdapter implements CommercePlatformAdapter {
  // Implementar métodos...
}
```

## Variáveis de Ambiente

Ver `.env.example` na raiz do projeto.

## Logs

Logs são salvos em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros
- Console (em desenvolvimento)

## Health Check

```bash
curl http://localhost:3000/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```



