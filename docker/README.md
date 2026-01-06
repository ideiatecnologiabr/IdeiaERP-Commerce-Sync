# Docker Setup - Banco de Dados da Aplicação

Este diretório contém a configuração Docker para o banco de dados da aplicação.

## Configuração

O `docker-compose.yml` na raiz do projeto configura um container MariaDB para o banco de dados da aplicação.

### Configuração para Linhas Grandes

O MariaDB está configurado para suportar linhas grandes (resolve erro `ERROR 1118: Row size too large`):

- **Arquivo de configuração**: `docker/mariadb/my.cnf`
- **Row Format**: `DYNAMIC` (permite linhas maiores que 8KB)
- **Strict Mode**: `OFF` (mais flexibilidade durante importação)
- **Max Allowed Packet**: `1GB` (suporta dumps grandes)

As configurações são aplicadas automaticamente ao iniciar o container.

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

### 2.1. Verificar configurações do MariaDB

Para verificar se as configurações de linhas grandes estão ativas:

```bash
# Usando o script de verificação
./docker/mariadb/verify-config.sh

# Ou manualmente
docker exec ideiaerp-sync-db mysql -uroot -prootpassword -e "SHOW VARIABLES LIKE 'innodb_default_row_format';"
```

Valores esperados:
- `innodb_default_row_format` = `DYNAMIC`
- `innodb_strict_mode` = `OFF`
- `innodb_file_per_table` = `ON`
- `max_allowed_packet` = `1073741824` (1GB)

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

### Erro "Row size too large" ao importar dump

Se você encontrar o erro `ERROR 1118: Row size too large` ao importar um dump:

1. **Verifique se o container está usando a configuração correta:**
   ```bash
   ./docker/mariadb/verify-config.sh
   ```

2. **Se as configurações não estiverem corretas, reinicie o container:**
   ```bash
   docker-compose restart app-db
   ```

3. **Para aplicar configurações em um container existente, recrie-o:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

4. **Ao importar o dump, use estas opções para melhor performance:**
   ```bash
   mysql -h localhost -P 3307 -u root -pideia database_name < dump.sql
   ```
   
   Ou dentro do MySQL, desabilite verificações temporariamente:
   ```sql
   SET FOREIGN_KEY_CHECKS=0;
   SET UNIQUE_CHECKS=0;
   SOURCE /path/to/dump.sql;
   SET FOREIGN_KEY_CHECKS=1;
   SET UNIQUE_CHECKS=1;
   ```

**Nota**: O arquivo `my.cnf` já está configurado com `innodb_default_row_format=DYNAMIC` que resolve o problema de "Row size too large". As variáveis `foreign_key_checks` e `unique_checks` são variáveis de sessão e devem ser definidas via SQL, não no `my.cnf`.



