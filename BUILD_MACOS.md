# Como Compilar para macOS

Este guia explica como compilar a aplicação API para macOS, gerando um executável standalone.

## 📋 Pré-requisitos

1. **Node.js 18+** instalado
2. **npm** ou **pnpm** instalado
3. **pkg** já está nas dependências do projeto
4. **macOS** como sistema operacional (para compilar nativamente)

## 🚀 Compilação

### Método 1: Usando o script npm com pkg

```bash
# Compilar para macOS (x64) usando pkg
npm run build:api:macos
```

**Nota:** Se você encontrar erros com dependências transitivas (como `ansis`), use o Método 1b com `nexe`.

### Método 1b: Usando nexe (Alternativa recomendada se pkg falhar)

```bash
# Instalar nexe globalmente (se necessário)
npm install -g nexe

# Compilar para macOS usando nexe
npm run build:api:macos:nexe
```

O `nexe` é mais confiável para incluir dependências transitivas.

Este comando irá:
1. Compilar o código TypeScript da API
2. Gerar o executável `ideiaerp-sync-macos` na raiz do projeto

### Método 2: Passo a passo manual

```bash
# 1. Compilar o projeto
npx nx build api

# 2. Navegar para o diretório compilado
cd dist/apps/api

# 3. Gerar o executável macOS (usando o arquivo main.js diretamente)
npx pkg src/main.js --targets node18-macos-x64 --output ../../ideiaerp-sync-macos

# 4. Voltar para a raiz
cd ../../..
```

### Método 3: Compilar para Apple Silicon (ARM64)

Se você quiser compilar para Macs com chip M1/M2/M3 (Apple Silicon):

```bash
npx nx build api && cd dist/apps/api && npx pkg src/main.js --targets node18-macos-arm64 --output ../../ideiaerp-sync-macos-arm64
```

Ou para ambos (universal binary):

```bash
npx nx build api && cd dist/apps/api && npx pkg src/main.js --targets node18-macos-x64,node18-macos-arm64 --output ../../ideiaerp-sync-macos
```

## 📦 Estrutura do Executável

O executável gerado (`ideiaerp-sync-macos`) contém:
- ✅ Runtime Node.js embutido
- ✅ Todas as dependências compiladas
- ✅ Código JavaScript compilado
- ✅ Assets necessários

## ⚙️ Configuração

O executável precisa de um arquivo `.env` no **mesmo diretório onde você executa o binário** (não onde ele foi compilado). 

**Importante:** 
- O arquivo `.env` deve estar no diretório de trabalho atual (`process.cwd()`), que é o diretório de onde você executa o comando
- O executável precisa ser **recompilado** após qualquer mudança no código (como a correção do carregamento do .env)

**Variáveis Obrigatórias:**
- `ERP_DB_NAME` - Nome do banco de dados ERP
- `APP_DB_NAME` - Nome do banco de dados da aplicação
- `SESSION_SECRET` - Chave secreta (mínimo 32 caracteres)

Crie um arquivo `.env` no diretório onde você vai executar o binário:

```env
# ERP Database
ERP_DB_HOST=localhost
ERP_DB_PORT=3306
ERP_DB_USER=root
ERP_DB_PASSWORD=
ERP_DB_NAME=ideiaerp

# App Database
APP_DB_HOST=localhost
APP_DB_PORT=3307
APP_DB_USER=ideiaerp_user
APP_DB_PASSWORD=ideiaerp_password
APP_DB_NAME=ideiaerp_sync

# Security
SESSION_SECRET=change-this-secret-key-in-production
JWT_SECRET=change-this-jwt-secret-in-production
TOKEN_EXPIRATION_MINUTES=15
REFRESH_TOKEN_EXPIRATION_DAYS=7

# Server
PORT=3000
NODE_ENV=production
```

## 🏃 Executando o Binário

### Execução direta

```bash
# No macOS
./ideiaerp-sync-macos
```

### Dar permissão de execução

Se necessário:

```bash
chmod +x ideiaerp-sync-macos
```

### Como serviço macOS (LaunchDaemon)

1. **Criar arquivo plist** em `~/Library/LaunchAgents/com.ideiaerp.sync.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ideiaerp.sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/caminho/para/ideiaerp-sync-macos</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/ideiaerp-sync.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/ideiaerp-sync-error.log</string>
    <key>WorkingDirectory</key>
    <string>/caminho/para/diretorio</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
</dict>
</plist>
```

2. **Carregar o serviço**:

```bash
launchctl load ~/Library/LaunchAgents/com.ideiaerp.sync.plist
```

3. **Gerenciar o serviço**:

```bash
# Iniciar
launchctl start com.ideiaerp.sync

# Parar
launchctl stop com.ideiaerp.sync

# Recarregar
launchctl unload ~/Library/LaunchAgents/com.ideiaerp.sync.plist
launchctl load ~/Library/LaunchAgents/com.ideiaerp.sync.plist
```

## ✅ Warnings Comuns (Podem ser Ignorados)

### Warning: "Failed to make bytecode"

Você pode ver warnings como:
```
> Warning Failed to make bytecode node18-x64 for file /snapshot/.../color/index.js
```

**Isso é normal!** Esses warnings indicam que o `pkg` não conseguiu otimizar alguns módulos para bytecode, mas eles ainda são incluídos no executável e funcionam normalmente. Você pode ignorar esses warnings.

### Warning: "tslib is needed but it is not installed"

Este warning também é normal e não impede a compilação. O TypeScript compila corretamente mesmo sem o tslib instalado explicitamente.

## 🔧 Troubleshooting

### Erro: "pkg não encontrado"

```bash
# Instalar pkg globalmente (se necessário)
npm install -g pkg
```

### Erro: "No available node version satisfies 'node18'"

**Causa:** O `pkg` pode não ter os binários do Node.js 18 disponíveis.

**Solução:** Tente novamente ou use uma versão diferente do Node.js suportada pelo `pkg`.

### Erro: "Cannot find module"

Verifique se o `package.json` em `dist/apps/api` contém todas as dependências necessárias. O NX deve gerar automaticamente com `generatePackageJson: true`.

### Executável muito grande

O executável pode ter ~50-100MB porque inclui o runtime Node.js. Isso é normal.

### Erro: "Permission denied"

```bash
# Dar permissão de execução
chmod +x ideiaerp-sync-macos
```

### Erro ao executar: "Missing dependencies" ou "Cannot find module"

**Causa:** O `pkg` não está incluindo todas as dependências, especialmente com `pnpm` que usa uma estrutura de node_modules diferente.

**Soluções:**
1. ✅ O script de build agora instala as dependências antes de compilar
2. ✅ Se ainda falhar, tente usar `npm` em vez de `pnpm` para instalar dependências:
   ```bash
   npm install
   npm run build:api:macos
   ```
3. ⚠️ Alternativa: Distribuir o executável junto com `node_modules` (menos recomendado)

### Erro: "Cannot find module 'ansis'" ou outras dependências do TypeORM

**Causa:** Dependências transitivas não estão sendo incluídas pelo `pkg`. Isso é uma **limitação conhecida do `pkg`** com dependências transitivas, especialmente com estruturas complexas de `node_modules` (como `pnpm`).

**Solução Recomendada: Usar `nexe` em vez de `pkg`**

O `nexe` é mais confiável para incluir todas as dependências:

```bash
# Instalar nexe (uma vez)
npm install -g nexe

# Compilar com nexe
npm run build:api:macos:nexe
```

Ou manualmente:
```bash
cd dist/apps/api
npx nexe src/main.js -t macos-x64-18.5.0 -o ../../../ideiaerp-sync-macos
```

**Por que `nexe` é melhor:**
- ✅ Inclui automaticamente todas as dependências transitivas
- ✅ Mais confiável com estruturas complexas de `node_modules`
- ✅ Melhor suporte para módulos nativos

3. ⚠️ **Alternativa: Distribuir com `node_modules`:**
   - Compile normalmente sem `pkg`
   - Distribua o diretório `dist/apps/api` completo com `node_modules`
   - Execute com `node dist/apps/api/src/main.js`

4. ⚠️ **Alternativa: Usar Docker para distribuição:**
   - Crie uma imagem Docker com Node.js e o código
   - Execute como container

### Erro: "ZodError: Required" (ERP_DB_NAME, APP_DB_NAME, SESSION_SECRET)

**Causa:** O executável não está encontrando o arquivo `.env`.

**Soluções:**
1. ✅ Certifique-se de que o arquivo `.env` está no **mesmo diretório** de onde você executa o binário
2. ✅ Execute o binário do diretório onde está o `.env`:
   ```bash
   cd /caminho/onde/esta/o/.env
   ./ideiaerp-sync-macos
   ```
3. ✅ Ou especifique o caminho completo:
   ```bash
   /caminho/completo/para/ideiaerp-sync-macos
   ```
   (O `.env` deve estar no diretório atual de trabalho)

**Exemplo:**
```bash
# Estrutura de diretórios
appTEST/
  ├── .env          # ← Arquivo de configuração
  └── ideiaerp-sync-macos  # ← Executável

# Executar de dentro do diretório appTEST
cd appTEST
./ideiaerp-sync-macos
```

### Aviso de segurança do macOS

O macOS pode bloquear a execução de binários não assinados. Para permitir:

1. Vá em **Preferências do Sistema** → **Segurança e Privacidade**
2. Clique em **Abrir mesmo assim** quando aparecer o aviso
3. Ou execute: `xattr -d com.apple.quarantine ideiaerp-sync-macos`

## 🎯 Outros Targets

Para compilar para outras plataformas:

```bash
# Windows x64
npm run build:api:win

# Linux x64
npm run build:api:linux

# macOS ARM64 (Apple Silicon)
npx nx build api && cd dist/apps/api && npx pkg src/main.js --targets node18-macos-arm64 --output ../../ideiaerp-sync-macos-arm64
```

## 📚 Referências

- [pkg Documentation](https://github.com/vercel/pkg)
- [macOS LaunchDaemon Guide](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html)

