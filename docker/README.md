# Docker Setup - Banco de Dados da Aplicação

Este diretório contém a configuração Docker para o banco de dados da aplicação.

## Configuração

O `docker-compose.yml` na raiz do projeto configura um container MariaDB para o banco de dados da aplicação.

### Credenciais Padrão

- **Host:** `localhost`
- **Porta:** `3307` (mapeada para 3306 no container)
- **Database:** `ideiaerp_sync`
- **User:** `ideiaerp_user`
- **Password:** `ideiaerp_password`
- **Root Password:** `rootpassword`

## Como Usar

### 1. Iniciar o banco de dados

```bash
docker-compose up -d
```

### 2. Verificar se está rodando

```bash
docker-compose ps
docker-compose logs -f app-db
```

### 3. Configurar o .env

Adicione estas configurações ao seu arquivo `.env`:

```env
APP_DB_HOST=localhost
APP_DB_PORT=3307
APP_DB_USER=ideiaerp_user
APP_DB_PASSWORD=ideiaerp_password
APP_DB_NAME=ideiaerp_sync
```

### 4. Conectar ao banco (opcional)

```bash
docker exec -it ideiaerp-sync-db mariadb -u ideiaerp_user -pideiaerp_password ideiaerp_sync
```

## Comandos Úteis

```bash
# Iniciar o banco
docker-compose up -d

# Parar o banco
docker-compose down

# Parar e remover volumes (apaga todos os dados!)
docker-compose down -v

# Ver logs em tempo real
docker-compose logs -f app-db

# Reiniciar o banco
docker-compose restart app-db

# Ver status
docker-compose ps
```

## Scripts de Inicialização

Scripts SQL em `docker/mariadb/init/` são executados automaticamente quando o container é criado pela primeira vez.

## Volumes

Os dados são persistidos no volume `app-db-data`. Para remover completamente:

```bash
docker-compose down -v
```

## Troubleshooting

### Porta já em uso

Se a porta 3307 estiver em uso, altere no `docker-compose.yml`:

```yaml
ports:
  - "3308:3306"  # Use outra porta
```

E atualize o `.env`:

```env
APP_DB_PORT=3308
```

### Resetar o banco

Para resetar completamente o banco de dados:

```bash
docker-compose down -v
docker-compose up -d
```



