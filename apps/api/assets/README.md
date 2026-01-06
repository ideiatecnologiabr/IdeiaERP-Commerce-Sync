# Assets - Ícones e Recursos

Este diretório contém recursos visuais para os executáveis compilados.

## Ícone do Windows (.ico)

Para adicionar um ícone ao executável Windows, coloque um arquivo `icon.ico` neste diretório.

### Como criar um arquivo .ico

#### Opção 1: Converter PNG para ICO online
1. Use um conversor online como:
   - https://convertio.co/png-ico/
   - https://www.icoconverter.com/
   - https://cloudconvert.com/png-to-ico
2. Use uma imagem PNG de alta qualidade (recomendado: 256x256 ou 512x512 pixels)
3. Baixe o arquivo `.ico` gerado
4. Renomeie para `icon.ico` e coloque neste diretório

#### Opção 2: Usar ferramentas de design
- **GIMP** (gratuito): Exportar como .ico
- **Photoshop**: Salvar como .ico
- **ImageMagick** (linha de comando):
  ```bash
  convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
  ```

#### Opção 3: Usar ferramentas específicas para Windows
- **IcoFX** (Windows)
- **Greenfish Icon Editor Pro** (Windows)
- **IconWorkshop** (Windows)

### Tamanhos recomendados

Um arquivo `.ico` pode conter múltiplos tamanhos. Recomendado incluir:
- 16x16 (para ícones pequenos)
- 32x32 (para ícones médios)
- 48x48 (para ícones grandes)
- 256x256 (para ícones de alta resolução)

### Estrutura esperada

```
apps/api/assets/
├── README.md
└── icon.ico  ← Coloque seu ícone aqui
```

### Nota

Se o arquivo `icon.ico` não existir, o script de build continuará normalmente, mas o executável não terá ícone personalizado.

