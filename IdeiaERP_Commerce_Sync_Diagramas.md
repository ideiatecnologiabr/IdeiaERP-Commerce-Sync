# Diagramas – IdeiaERP Commerce Sync
Este documento contém **todos os diagramas Mermaid e C4** do projeto **IdeiaERP Commerce Sync**.
Pode ser usado diretamente no GitHub, Cursor, Obsidian ou qualquer viewer compatível com Mermaid.

---

## 1. Visão Geral – Arquitetura de Alto Nível

```mermaid
flowchart LR
  subgraph ERP[IdeiaERP (MariaDB)]
    LV[lojavirtual]
    P[Produtos]
    C[Categoria]
    M[Marca]
    TP[TabelaPreco]
    PTP[ProdutoTabelaPreco]
    E[Estoque]
    PE[produtoestoque]
    CP[caracteristicaproduto]
    PCP[produtocaracteristicaproduto]
    U[Usuario]
    LVE[LojaVirtualExportacao]
  end

  subgraph APP[IdeiaERP Commerce Sync (Node.js/Express)]
    API[HTTP API / Admin]
    CRON[CRON Scheduler]
    SYNC[Sync Engine (CQRS)]
    LOGS[(app_db)]
    ADP[Adapters]
  end

  subgraph ECOM[Plataforma E-commerce]
    OC[OpenCart API]
    VT[VTEX API]
    WH[Webhook Orders]
  end

  LV --> SYNC
  P --> SYNC
  C --> SYNC
  M --> SYNC
  TP --> SYNC
  PTP --> SYNC
  E --> SYNC
  PE --> SYNC
  CP --> SYNC
  PCP --> SYNC

  CRON --> SYNC
  API --> SYNC
  SYNC --> LOGS

  SYNC --> ADP
  ADP --> OC
  ADP --> VT

  WH --> API
  U --> API
```

---

## 2. Sequência – Sincronização de Produtos (ERP → Loja)

```mermaid
sequenceDiagram
  autonumber
  participant Cron
  participant Sync
  participant ERP
  participant Adapter
  participant OC
  participant Log

  Cron->>Sync: SyncCatalogCommand
  Sync->>ERP: Buscar lojavirtual ativa
  ERP-->>Sync: lojas[]

  loop por loja
    Sync->>ERP: Query produtos + preço + estoque
    ERP-->>Sync: dados consolidados
    alt integracao_id vazio
      Sync->>Adapter: createProduct
      Adapter->>OC: POST product
      OC-->>Adapter: product_id
      Adapter-->>Sync: product_id
      Sync->>ERP: update integracao_id
    else integracao_id existente
      Sync->>Adapter: updateProduct
      Adapter->>OC: PUT product
      OC-->>Adapter: OK
    end
    Sync->>Log: gravar sync_log
  end
```

---

## 3. Sequência – Webhook de Pedido (Loja → ERP)

```mermaid
sequenceDiagram
  autonumber
  participant Shop
  participant API
  participant Sync
  participant Adapter
  participant ERP
  participant Log

  Shop->>API: POST /webhooks/opencart/orders
  API->>API: validar token
  API->>Sync: SyncOrderByIdCommand
  Sync->>Adapter: getOrderById
  Adapter->>Shop: GET order
  Shop-->>Adapter: payload pedido
  Adapter-->>Sync: OrderDTO
  Sync->>ERP: gravar pedido (staging)
  Sync->>Log: sync_log
  API-->>Shop: 200 OK
```

---

## 4. Fluxo de Decisão – Produto

```mermaid
flowchart TB
  A[Início SyncProduto] --> B[Carregar lojavirtual]
  B --> C[Resolver produtos elegíveis]
  C --> D[Carregar preço]
  D --> E[Carregar estoque]
  E --> F{integracao_id existe?}
  F -- Não --> G[createProduct]
  G --> H[Salvar integracao_id]
  F -- Sim --> I[updateProduct]
  H --> J[Registrar log]
  I --> J
  J --> K[Fim]
```

---

## 5. C4 – Context (Nível 1)

```mermaid
C4Context
title IdeiaERP Commerce Sync - Context

Person(admin, "Usuário Admin")
System(sync, "IdeiaERP Commerce Sync")
System_Ext(erp, "IdeiaERP (MariaDB)")
System_Ext(opencart, "OpenCart")
System_Ext(vtex, "VTEX")

Rel(admin, sync, "Usa painel")
Rel(sync, erp, "Lê/escreve dados")
Rel(sync, opencart, "Sincroniza dados")
Rel(sync, vtex, "Extensão futura")
```

---

## 6. C4 – Container (Nível 2)

```mermaid
C4Container
title IdeiaERP Commerce Sync - Container

Person(admin, "Usuário Admin")

System_Boundary(sync, "IdeiaERP Commerce Sync") {
  Container(web, "Web Admin", "Express")
  Container(api, "HTTP API", "Express")
  Container(cron, "CRON", "node-cron")
  Container(cqrs, "CQRS Engine", "TypeScript")
  Container(adapters, "Commerce Adapters", "TypeScript")
  ContainerDb(appdb, "App DB", "MariaDB")
}

System_Ext(erp, "IdeiaERP DB", "MariaDB")
System_Ext(opencart, "OpenCart API", "REST")

Rel(admin, web, "Acessa")
Rel(web, api, "Usa")
Rel(api, cqrs, "Commands/Queries")
Rel(cron, cqrs, "Dispara")
Rel(cqrs, adapters, "Chama")
Rel(cqrs, erp, "TypeORM")
Rel(cqrs, appdb, "Logs/Locks")
Rel(adapters, opencart, "HTTP")
```

---

## 7. C4 – Component (Nível 3)

```mermaid
C4Component
title IdeiaERP Commerce Sync - Componentes

System_Boundary(sync, "IdeiaERP Commerce Sync") {
  Component(cmd, "Command Handlers")
  Component(qry, "Query Handlers")
  Component(lock, "SyncLockService")
  Component(log, "SyncLogService")
  Component(map, "MappingService")
  Component(prodQ, "ProductQueryService")
  Component(adapter, "OpenCartAdapter")

  Rel(cmd, prodQ, "consulta")
  Rel(cmd, adapter, "sincroniza")
  Rel(cmd, lock, "lock")
  Rel(cmd, log, "audita")
  Rel(cmd, map, "integracao_id")
}
```

---

**Fim dos diagramas.**
