// Auto-generated file - DO NOT EDIT
// Generated at: 2026-01-07T20:31:32.321Z

export const preGeneratedSwaggerSpec = {
  "openapi": "3.0.0",
  "info": {
    "title": "IdeiaERP Commerce Sync API",
    "version": "1.0.0",
    "description": "API REST para sincronização entre IdeiaERP e lojas virtuais"
  },
  "servers": [
    {
      "url": "http://localhost:3000",
      "description": "Development server"
    }
  ],
  "components": {
    "securitySchemes": {
      "cookieAuth": {
        "type": "apiKey",
        "in": "cookie",
        "name": "connect.sid"
      },
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "UUID",
        "description": "Token de autenticação obtido no endpoint /auth/login"
      }
    },
    "schemas": {
      "ApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean"
          },
          "data": {
            "type": "object"
          },
          "error": {
            "type": "object",
            "nullable": true
          }
        }
      },
      "ApiError": {
        "type": "object",
        "properties": {
          "message": {
            "type": "string"
          },
          "code": {
            "type": "string"
          }
        }
      },
      "LoginRequest": {
        "type": "object",
        "required": [
          "email",
          "senha"
        ],
        "properties": {
          "email": {
            "type": "string"
          },
          "senha": {
            "type": "string"
          }
        }
      },
      "LoginResponse": {
        "type": "object",
        "properties": {
          "usuario": {
            "type": "object",
            "properties": {
              "usuario_id": {
                "type": "number"
              },
              "nome": {
                "type": "string"
              },
              "email": {
                "type": "string"
              }
            }
          },
          "token": {
            "type": "string",
            "description": "Token de acesso (UUID)"
          },
          "refreshToken": {
            "type": "string",
            "description": "Refresh token para renovar o token de acesso (UUID)"
          },
          "expiresAt": {
            "type": "string",
            "format": "date-time",
            "description": "Data de expiração do token"
          }
        }
      },
      "RefreshTokenRequest": {
        "type": "object",
        "required": [
          "refreshToken"
        ],
        "properties": {
          "refreshToken": {
            "type": "string",
            "description": "Refresh token para renovar o token de acesso"
          }
        }
      },
      "RefreshTokenResponse": {
        "type": "object",
        "properties": {
          "token": {
            "type": "string",
            "description": "Novo token de acesso (UUID)"
          },
          "refreshToken": {
            "type": "string",
            "description": "Novo refresh token (UUID)"
          },
          "expiresAt": {
            "type": "string",
            "format": "date-time",
            "description": "Data de expiração do novo token"
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Auth",
      "description": "Autenticação"
    },
    {
      "name": "Dashboard",
      "description": "Dashboard administrativo"
    },
    {
      "name": "LojaVirtual",
      "description": "Gestão de lojas virtuais"
    },
    {
      "name": "Produtos",
      "description": "Gestão de produtos"
    },
    {
      "name": "Pedidos",
      "description": "Gestão de pedidos"
    },
    {
      "name": "Sync",
      "description": "Sincronizações"
    },
    {
      "name": "Logs",
      "description": "Logs de sincronização"
    },
    {
      "name": "Webhooks",
      "description": "Webhooks públicos"
    }
  ],
  "paths": {
    "/api/v1/auth/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Login de usuário",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login realizado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              }
            }
          },
          "401": {
            "description": "Credenciais inválidas"
          }
        }
      }
    },
    "/api/v1/auth/logout": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Logout de usuário",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Logout realizado com sucesso"
          },
          "401": {
            "description": "Não autenticado"
          }
        }
      }
    },
    "/api/v1/auth/me": {
      "get": {
        "tags": [
          "Auth"
        ],
        "summary": "Obter informações do usuário logado",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Informações do usuário"
          },
          "401": {
            "description": "Não autenticado"
          }
        }
      }
    },
    "/api/v1/auth/refresh": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Renovar token de acesso",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "refreshToken"
                ],
                "properties": {
                  "refreshToken": {
                    "type": "string",
                    "description": "Refresh token para renovar o token de acesso"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Token renovado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "token": {
                          "type": "string"
                        },
                        "refreshToken": {
                          "type": "string"
                        },
                        "expiresAt": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Refresh token inválido ou expirado"
          }
        }
      }
    },
    "/api/v1/admin/dashboard": {
      "get": {
        "tags": [
          "Dashboard"
        ],
        "summary": "Obter dados do dashboard",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "lojavirtual_id",
            "schema": {
              "type": "integer"
            },
            "description": "ID da loja virtual (opcional)"
          }
        ],
        "responses": {
          "200": {
            "description": "Dados do dashboard"
          }
        }
      }
    },
    "/api/v1/admin/lojavirtual": {
      "get": {
        "tags": [
          "LojaVirtual"
        ],
        "summary": "Listar lojas virtuais",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "ativas",
            "schema": {
              "type": "boolean",
              "default": true
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de lojas virtuais"
          }
        }
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}": {
      "get": {
        "tags": [
          "LojaVirtual"
        ],
        "summary": "Obter detalhes de uma loja virtual",
        "security": [
          {
            "cookieAuth": []
          }
        ]
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}/health": {
      "get": {
        "tags": [
          "LojaVirtual"
        ],
        "summary": "Verificar saúde/conexão da loja virtual",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "lojavirtual_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Status de saúde da loja virtual"
          },
          "404": {
            "description": "Loja virtual não encontrada"
          },
          "500": {
            "description": "Erro ao verificar saúde"
          }
        }
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}/pedidos": {
      "get": {
        "tags": [
          "Pedidos"
        ],
        "summary": "Listar pedidos de uma loja virtual",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "lojavirtual_id",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "in": "query",
            "name": "limit",
            "schema": {
              "type": "integer",
              "default": 50
            }
          },
          {
            "in": "query",
            "name": "status",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de pedidos"
          }
        }
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}/pedidos/{pedido_id}/sync": {
      "post": {
        "tags": [
          "Sync"
        ],
        "summary": "Sincronizar um pedido específico",
        "security": [
          {
            "cookieAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "lojavirtual_id",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "path",
            "name": "pedido_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Pedido sincronizado com sucesso"
          }
        }
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}/produtos": {
      "get": {
        "tags": [
          "Produtos"
        ],
        "summary": "Listar produtos de uma loja virtual",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "lojavirtual_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "in": "query",
            "name": "limit",
            "schema": {
              "type": "integer",
              "default": 50
            }
          },
          {
            "in": "query",
            "name": "search",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de produtos"
          }
        }
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}/produtos/{produto_id}/sync": {
      "post": {
        "tags": [
          "Sync"
        ],
        "summary": "Sincronizar um produto específico",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "lojavirtual_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "path",
            "name": "produto_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Produto sincronizado com sucesso"
          }
        }
      }
    },
    "/api/v1/admin/settings": {
      "get": {
        "tags": [
          "Settings"
        ],
        "summary": "Lista todas as configurações",
        "description": "Retorna todas as configurações do sistema. Senhas são mascaradas.",
        "responses": {
          "200": {
            "description": "Lista de configurações",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Setting"
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Não autenticado"
          },
          "500": {
            "description": "Erro interno"
          }
        }
      },
      "post": {
        "tags": [
          "Settings"
        ],
        "summary": "Cria uma nova configuração",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "key",
                  "value"
                ],
                "properties": {
                  "key": {
                    "type": "string",
                    "example": "ERP_DB_HOST"
                  },
                  "value": {
                    "type": "string",
                    "example": "localhost"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Configuração criada"
          },
          "400": {
            "description": "Dados inválidos"
          },
          "500": {
            "description": "Erro interno"
          }
        }
      }
    },
    "/api/v1/admin/settings/{key}": {
      "get": {
        "tags": [
          "Settings"
        ],
        "summary": "Busca uma configuração por chave",
        "description": "Retorna uma configuração específica. Senha é mascarada.",
        "parameters": [
          {
            "in": "path",
            "name": "key",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Chave da configuração"
          }
        ],
        "responses": {
          "200": {
            "description": "Configuração encontrada",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "$ref": "#/components/schemas/Setting"
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Configuração não encontrada"
          },
          "500": {
            "description": "Erro interno"
          }
        }
      },
      "put": {
        "tags": [
          "Settings"
        ],
        "summary": "Atualiza uma configuração existente",
        "parameters": [
          {
            "in": "path",
            "name": "key",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "value"
                ],
                "properties": {
                  "value": {
                    "type": "string",
                    "example": "localhost"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Configuração atualizada"
          },
          "400": {
            "description": "Dados inválidos"
          },
          "404": {
            "description": "Configuração não encontrada"
          },
          "500": {
            "description": "Erro interno"
          }
        }
      },
      "delete": {
        "tags": [
          "Settings"
        ],
        "summary": "Remove uma configuração",
        "parameters": [
          {
            "in": "path",
            "name": "key",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Configuração removida"
          },
          "404": {
            "description": "Configuração não encontrada"
          },
          "500": {
            "description": "Erro interno"
          }
        }
      }
    },
    "/api/v1/admin/settings/erp/test-connection": {
      "post": {
        "tags": [
          "Settings"
        ],
        "summary": "Testa a conexão com o ERP-DB",
        "responses": {
          "200": {
            "description": "Conexão bem-sucedida"
          },
          "503": {
            "description": "Não foi possível conectar"
          }
        }
      }
    },
    "/api/v1/admin/settings/erp/connection-status": {
      "get": {
        "tags": [
          "Settings"
        ],
        "summary": "Obtém o status da conexão com o ERP-DB",
        "description": "Retorna informações sobre a conexão atual e estatísticas do pool",
        "responses": {
          "200": {
            "description": "Status da conexão",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "connected": {
                          "type": "boolean",
                          "description": "Se está conectado ao ERP-DB"
                        },
                        "pool": {
                          "type": "object",
                          "nullable": true,
                          "properties": {
                            "total": {
                              "type": "number",
                              "description": "Total de conexões no pool"
                            },
                            "active": {
                              "type": "number",
                              "description": "Conexões ativas (em uso)"
                            },
                            "idle": {
                              "type": "number",
                              "description": "Conexões ociosas"
                            },
                            "waiting": {
                              "type": "number",
                              "description": "Clientes aguardando conexão"
                            }
                          }
                        },
                        "health": {
                          "type": "object",
                          "properties": {
                            "lastCheck": {
                              "type": "string",
                              "format": "date-time",
                              "description": "Data da última verificação"
                            },
                            "warnings": {
                              "type": "array",
                              "items": {
                                "type": "string"
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/admin/logs": {
      "get": {
        "tags": [
          "Logs"
        ],
        "summary": "Listar logs de sincronização",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "lojavirtual_id",
            "schema": {
              "type": "integer"
            }
          },
          {
            "in": "query",
            "name": "tipo",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "in": "query",
            "name": "limit",
            "schema": {
              "type": "integer",
              "default": 50
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de logs"
          }
        }
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}/sync/catalog": {
      "post": {
        "tags": [
          "Sync"
        ],
        "summary": "Sincronizar catálogo completo",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "lojavirtual_id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Sincronização iniciada"
          }
        }
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}/sync/prices": {
      "post": {
        "tags": [
          "Sync"
        ],
        "summary": "Sincronizar preços",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}/sync/stock": {
      "post": {
        "tags": [
          "Sync"
        ],
        "summary": "Sincronizar estoques",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/admin/lojavirtual/{lojavirtual_id}/sync/orders": {
      "post": {
        "tags": [
          "Sync"
        ],
        "summary": "Sincronizar pedidos",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/admin/cron/status": {
      "get": {
        "tags": [
          "Sync"
        ],
        "summary": "Obter status dos CRONs",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Status dos CRONs"
          }
        }
      }
    },
    "/api/v1/admin/cron/execute/{tipo}": {
      "post": {
        "tags": [
          "Sync"
        ],
        "summary": "Executar CRON manualmente (debug)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "tipo",
            "required": true,
            "schema": {
              "type": "string",
              "enum": [
                "products",
                "prices",
                "stock",
                "orders"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "CRON executado com sucesso"
          },
          "400": {
            "description": "Tipo inválido"
          }
        }
      }
    }
  }
};
