#!/bin/bash
# Script para verificar as configurações do MariaDB após aplicar my.cnf

echo "=========================================="
echo "Verificando configurações do MariaDB"
echo "=========================================="
echo ""

# Verificar se o container está rodando
if ! docker ps | grep -q ideiaerp-sync-db; then
    echo "❌ Container ideiaerp-sync-db não está rodando"
    echo "Execute: docker-compose up -d"
    exit 1
fi

echo "✅ Container está rodando"
echo ""

# Verificar configurações críticas
echo "Configurações críticas para linhas grandes:"
echo "-------------------------------------------"

docker exec ideiaerp-sync-db mysql -uroot -prootpassword -e "
SHOW VARIABLES WHERE 
  Variable_name IN (
    'innodb_default_row_format',
    'innodb_strict_mode',
    'innodb_file_per_table',
    'max_allowed_packet',
    'innodb_page_size',
    'innodb_buffer_pool_size'
  );
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configurações verificadas com sucesso"
    echo ""
    echo "Valores esperados:"
    echo "  - innodb_default_row_format = DYNAMIC"
    echo "  - innodb_strict_mode = OFF"
    echo "  - innodb_file_per_table = ON"
    echo "  - max_allowed_packet = 1073741824 (1GB)"
else
    echo "❌ Erro ao verificar configurações"
    exit 1
fi


