# Web - IdeiaERP Commerce Sync

Frontend Angular para painel administrativo do sistema de sincronização.

## Estrutura

```
apps/web/src/app/
├── core/              # Services core
│   ├── auth/         # Autenticação
│   ├── api/          # Cliente HTTP
│   └── interceptors/ # Interceptors HTTP
├── features/          # Feature modules
│   ├── auth/         # Login
│   ├── dashboard/    # Dashboard
│   ├── products/     # Produtos
│   ├── orders/       # Pedidos
│   ├── lojas-virtuais/# Lojas virtuais
│   └── logs/         # Logs
└── shared/            # Componentes compartilhados
```

## Funcionalidades

- **Login/Logout** - Autenticação via sessão
- **Dashboard** - Visão geral com métricas
- **Lojas Virtuais** - Gestão de lojas
- **Produtos** - Listagem e sincronização de produtos
- **Pedidos** - Listagem e sincronização de pedidos
- **Logs** - Visualização de logs de sincronização

## Desenvolvimento

```bash
# Rodar em desenvolvimento
nx serve web
# ou
npm run serve:web

# Build de produção
nx build web
# ou
npm run build:web
```

## Configuração

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
};
```

## Rotas

- `/login` - Página de login
- `/dashboard` - Dashboard (protegida)
- `/lojas-virtuais` - Lista de lojas (protegida)
- `/lojas-virtuais/:id/produtos` - Produtos da loja (protegida)
- `/lojas-virtuais/:id/pedidos` - Pedidos da loja (protegida)
- `/logs` - Logs de sincronização (protegida)

## Autenticação

O frontend usa `AuthGuard` para proteger rotas. O `AuthService` gerencia o estado de autenticação e integra com a API backend.

## Interceptors

- **AuthInterceptor** - Adiciona credenciais (cookies)
- **ErrorInterceptor** - Tratamento global de erros HTTP

