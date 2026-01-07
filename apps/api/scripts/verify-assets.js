#!/usr/bin/env node
/**
 * Script para verificar se os assets necessários existem antes da compilação
 */

const fs = require('fs');
const path = require('path');

const apiDistPath = path.join(__dirname, '../../../dist/apps/api');
const webPath = path.join(apiDistPath, 'src/web');
const swaggerPath = path.join(apiDistPath, 'src/swagger-spec.json');

let hasErrors = false;

console.log('🔍 Verificando assets antes da compilação...\n');

// Verificar se o diretório web existe
if (!fs.existsSync(webPath)) {
  console.error('❌ ERRO: Diretório src/web não encontrado!');
  console.error(`   Caminho esperado: ${webPath}`);
  console.error('   Execute: pnpm run build:web && node apps/api/scripts/copy-frontend.js');
  hasErrors = true;
} else {
  const webFiles = fs.readdirSync(webPath);
  if (webFiles.length === 0) {
    console.error('❌ ERRO: Diretório src/web está vazio!');
    hasErrors = true;
  } else {
    console.log(`✅ Diretório src/web encontrado (${webFiles.length} arquivos)`);
    // Listar alguns arquivos importantes
    const importantFiles = ['index.html', 'main.', 'polyfills.', 'runtime.', 'styles.'];
    const foundImportant = webFiles.filter(f => 
      importantFiles.some(imp => f.includes(imp))
    );
    if (foundImportant.length > 0) {
      console.log(`   Arquivos importantes encontrados: ${foundImportant.slice(0, 5).join(', ')}`);
    }
  }
}

// Verificar se o swagger-spec.json existe
if (!fs.existsSync(swaggerPath)) {
  console.error('❌ ERRO: swagger-spec.json não encontrado!');
  console.error(`   Caminho esperado: ${swaggerPath}`);
  console.error('   Execute: npm run swagger:generate');
  hasErrors = true;
} else {
  const swaggerSize = fs.statSync(swaggerPath).size;
  console.log(`✅ swagger-spec.json encontrado (${(swaggerSize / 1024).toFixed(2)} KB)`);
}

console.log('');

if (hasErrors) {
  console.error('❌ Verificação falhou! Corrija os erros acima antes de compilar.');
  process.exit(1);
} else {
  console.log('✅ Todos os assets estão presentes. Pronto para compilar!');
  process.exit(0);
}

