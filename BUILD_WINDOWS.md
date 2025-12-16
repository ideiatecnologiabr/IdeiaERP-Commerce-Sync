# Como Compilar para Windows

Este guia explica como compilar a aplicação API para Windows, gerando um executável standalone.

## 📋 Pré-requisitos

1. **Node.js 18+** instalado
2. **npm** ou **pnpm** instalado
3. **pkg** já está nas dependências do projeto

## 🚀 Compilação

### ⚠️ Importante: Compilação Cross-Platform

O `pkg` **não pode compilar binários para Windows no macOS**. Ele precisa baixar binários pré-compilados do Node.js. Se o download falhar, você precisa:

1. **Compilar no Windows diretamente** (recomendado)
2. **Usar Docker** para compilar
3. **Usar CI/CD** (GitHub Actions, etc.)

### Método 1: Compilar no Windows (Recomendado)

No Windows, execute:

```bash
# Compilar para Windows (x64)
npm run build:api:win
```

Este comando irá:
1. Compilar o código TypeScript da API
2. Gerar o executável `ideiaerp-sync-win.exe` na raiz do projeto

### Método 2: Passo a passo manual

```bash
# 1. Compilar o projeto
npx nx build api

# 2. Navegar para o diretório compilado
cd dist/apps/api

# 3. Gerar o executável Windows (usando o arquivo main.js diretamente)
npx pkg src/main.js --targets node18-win-x64 --output ../../ideiaerp-sync-win.exe

# 4. Voltar para a raiz
cd ../../..
```

## 📦 Estrutura do Executável

O executável gerado (`ideiaerp-sync-win.exe`) contém:
- ✅ Runtime Node.js embutido
- ✅ Todas as dependências compiladas
- ✅ Código JavaScript compilado
- ✅ Assets necessários

## ⚙️ Configuração

O executável precisa de um arquivo `.env` no mesmo diretório para funcionar. Crie um arquivo `.env` com:

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

```cmd
# No Windows
ideiaerp-sync-win.exe
```

### Como serviço Windows (NSSM)

1. **Instalar NSSM** (se ainda não tiver):
   ```powershell
   # Via Chocolatey
   choco install nssm
   
   # Ou baixar de: https://nssm.cc/download
   ```

2. **Instalar como serviço**:
   ```powershell
   # Executar como Administrador
   .\tools\scripts\windows\install-service.ps1
   ```

   Ou manualmente:
   ```cmd
   nssm install IdeiaERPSync "C:\caminho\para\ideiaerp-sync-win.exe"
   nssm set IdeiaERPSync AppDirectory "C:\caminho\para\diretorio"
   nssm set IdeiaERPSync AppEnvironmentExtra "NODE_ENV=production"
   nssm start IdeiaERPSync
   ```

### Método 2: Usar Docker para Compilar (Cross-Platform)

Se você está no macOS/Linux e precisa compilar para Windows:

```bash
# Criar um Dockerfile para compilação
docker run --rm -v "$(pwd):/app" -w /app node:20 bash -c "npm install && npm run build:api:win"
```

### Método 3: Usar GitHub Actions (CI/CD)

Um arquivo de workflow já está configurado em `.github/workflows/build-windows.yml`.

Para usar:
1. Faça push do código para o GitHub
2. O workflow será executado automaticamente
3. Baixe o executável na aba "Actions" do repositório

Ou execute manualmente:
- Vá em "Actions" → "Build Windows Executable" → "Run workflow"

## 🔧 Troubleshooting

### Erro: "Not able to build for 'win' here, only for 'macos'"

**Causa:** Você está tentando compilar para Windows no macOS. O `pkg` não pode compilar cross-platform do source.

**Soluções:**
1. ✅ Compile no Windows diretamente
2. ✅ Use Docker com imagem Windows
3. ✅ Use CI/CD (GitHub Actions com `windows-latest`)
4. ⚠️ Tente novamente (pode ser problema temporário de rede ao baixar binários)

### Erro: "504: Gateway Time-out" ao baixar binários

**Causa:** O `pkg` não conseguiu baixar os binários pré-compilados do Node.js.

**Soluções:**
1. Tente novamente (pode ser problema temporário)
2. Compile no Windows diretamente
3. Use GitHub Actions (CI/CD)

### Erro: "No available node version satisfies 'node20'"

**Causa:** O `pkg` versão 5.8.1 não suporta Node.js 20. Use Node.js 18.

**Solução:** O script já está configurado para usar `node18-win-x64`. Se você modificou, volte para `node18`.

### Erro: "pkg não encontrado"

```bash
# Instalar pkg globalmente (se necessário)
npm install -g pkg
```

### Erro: "Cannot find module"

Verifique se o `package.json` em `dist/apps/api` contém todas as dependências necessárias. O NX deve gerar automaticamente com `generatePackageJson: true`.

### Executável muito grande

O executável pode ter ~50-100MB porque inclui o runtime Node.js. Isso é normal.

### Erro ao executar: "Missing dependencies"

Algumas dependências nativas podem não ser incluídas. Nesse caso, você pode:
1. Usar `pkg` com opções adicionais
2. Ou distribuir o executável junto com `node_modules` (menos recomendado)

## 📝 Notas Importantes

- ⚠️ O executável é específico para Windows x64. Para outras arquiteturas, use os targets apropriados do `pkg`
- ⚠️ O executável precisa ter permissões de escrita para logs e arquivos temporários
- ⚠️ Certifique-se de que o arquivo `.env` está no mesmo diretório do executável
- ⚠️ Para produção, considere usar PM2 ou NSSM para gerenciar o processo

## 🎯 Outros Targets

Para compilar para outras plataformas:

```bash
# Linux x64
npm run build:api:linux

# Ou manualmente com outros targets:
npx pkg . --targets node18-macos-x64    # macOS
npx pkg . --targets node18-win-arm64    # Windows ARM64
npx pkg . --targets node18-linux-arm64  # Linux ARM64
```

## 📚 Referências

- [pkg Documentation](https://github.com/vercel/pkg)
- [NSSM Documentation](https://nssm.cc/)

