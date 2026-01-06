#!/usr/bin/env node
/**
 * Script para adicionar metadados e ícone ao executável Windows
 * Requer: npm install --save-dev rcedit
 */

const path = require('path');
const fs = require('fs');

const executablePath = process.argv[2];
const iconPath = process.argv[3] || path.join(__dirname, '../assets/icon.ico');

if (!executablePath) {
  console.error('❌ Erro: Caminho do executável não fornecido');
  console.log('Uso: node set-windows-metadata.js <caminho-do-executável> [caminho-do-icone.ico]');
  process.exit(1);
}

if (!fs.existsSync(executablePath)) {
  console.error(`❌ Erro: Executável não encontrado: ${executablePath}`);
  process.exit(1);
}

// Verificar se rcedit está disponível
let rcedit;
try {
  rcedit = require('rcedit');
} catch (error) {
  console.warn('⚠️  Aviso: rcedit não está instalado');
  console.log('   Instale com: npm install --save-dev rcedit');
  console.log('   Continuando sem metadados...');
  process.exit(0);
}

// Ler versão do package.json raiz
let version = '1.0.0';
let description = 'IdeiaERP Commerce Sync - Sistema de sincronização entre IdeiaERP e lojas virtuais';
try {
  // Tentar diferentes caminhos relativos
  const possiblePaths = [
    path.join(__dirname, '../../../../package.json'),
    path.join(process.cwd(), 'package.json'),
  ];
  
  let rootPkg = null;
  for (const pkgPath of possiblePaths) {
    if (fs.existsSync(pkgPath)) {
      rootPkg = require(pkgPath);
      break;
    }
  }
  
  if (rootPkg) {
    version = rootPkg.version || '1.0.0';
    description = rootPkg.description || description;
  }
} catch (error) {
  console.warn('⚠️  Não foi possível ler package.json, usando valores padrão');
}

// Converter versão semântica (1.0.0) para versão Windows (1.0.0.0)
const windowsVersion = version.split('.').slice(0, 4).join('.') + '.0'.repeat(Math.max(0, 4 - version.split('.').length));

// Metadados do executável
const metadata = {
  'version-string': {
    CompanyName: 'IdeiaERP',
    FileDescription: description,
    FileVersion: windowsVersion,
    InternalName: 'IdeiaERPSync',
    LegalCopyright: `Copyright © ${new Date().getFullYear()} IdeiaERP`,
    OriginalFilename: path.basename(executablePath),
    ProductName: 'IdeiaERP Commerce Sync',
    ProductVersion: windowsVersion,
  },
  'file-version': windowsVersion,
  'product-version': windowsVersion,
};

// Adicionar ícone se fornecido e existir
if (iconPath && fs.existsSync(iconPath)) {
  metadata.icon = iconPath;
  console.log(`✅ Ícone encontrado: ${iconPath}`);
} else if (iconPath) {
  console.warn(`⚠️  Aviso: Ícone não encontrado: ${iconPath}`);
  console.warn('   Continuando sem ícone...');
}

console.log(`📝 Adicionando metadados ao executável: ${executablePath}`);

rcedit(executablePath, metadata)
  .then(() => {
    console.log('✅ Metadados adicionados com sucesso!');
    console.log('');
    console.log('Metadados configurados:');
    console.log(`  - Nome do Produto: ${metadata['version-string'].ProductName}`);
    console.log(`  - Descrição: ${metadata['version-string'].FileDescription}`);
    console.log(`  - Versão: ${metadata['version-string'].ProductVersion}`);
    console.log(`  - Empresa: ${metadata['version-string'].CompanyName}`);
    if (metadata.icon) {
      console.log(`  - Ícone: ${metadata.icon}`);
    }
  })
  .catch((error) => {
    console.error('❌ Erro ao adicionar metadados:', error.message);
    process.exit(1);
  });

