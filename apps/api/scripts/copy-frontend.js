const fs = require('fs');
const path = require('path');

const webDistPath = path.join(__dirname, '../../../dist/apps/web');
const apiDistPath = path.join(__dirname, '../../../dist/apps/api/src/web'); // Dentro de src/ para pkg empacotar

if (fs.existsSync(webDistPath)) {
  // Remove existing directory if it exists
  if (fs.existsSync(apiDistPath)) {
    fs.rmSync(apiDistPath, { recursive: true, force: true });
  }
  
  // Copy frontend build to API dist/src/web (para pkg empacotar)
  fs.cpSync(webDistPath, apiDistPath, { recursive: true });
  console.log('✅ Frontend copied to API dist/src/web');
} else {
  console.warn('⚠️  Frontend build not found. Run: pnpm run build:web');
}

