import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api/api.service';

@Component({
  selector: 'app-lojas-virtuais',
  template: `
    <div class="lojas">
      <h2>Lojas Virtuais</h2>
      <div *ngIf="loading" class="loading">Carregando...</div>
      <div *ngIf="lojas && lojas.length > 0" class="lojas-list">
        <div *ngFor="let loja of lojas" class="loja-card">
          <h3>{{ loja.nome }}</h3>
          <p>URL: {{ loja.urlbase || 'N/A' }}</p>
          <div class="health-status">
            <div *ngIf="getHealthStatus(loja.lojavirtual_id).checking" class="status checking">
              <span class="status-indicator checking"></span>
              Verificando...
            </div>
            <div *ngIf="!getHealthStatus(loja.lojavirtual_id).checking && getHealthStatus(loja.lojavirtual_id).online" class="status online">
              <span class="status-indicator online"></span>
              Online
            </div>
            <div *ngIf="!getHealthStatus(loja.lojavirtual_id).checking && !getHealthStatus(loja.lojavirtual_id).online" class="status offline">
              <span class="status-indicator offline"></span>
              Offline
              <span *ngIf="getHealthStatus(loja.lojavirtual_id).error" class="error-message">
                {{ getHealthStatus(loja.lojavirtual_id).error }}
              </span>
            </div>
          </div>
          <div class="actions">
            <button (click)="viewProducts(loja.lojavirtual_id)">Produtos</button>
            <button (click)="viewOrders(loja.lojavirtual_id)">Pedidos</button>
            <button (click)="syncCatalog(loja.lojavirtual_id)">Sync Catálogo</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .lojas {
        padding: 2rem;
      }
      .lojas-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }
      .loja-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .health-status {
        margin: 1rem 0;
        padding: 0.75rem;
        border-radius: 4px;
        background-color: #f5f5f5;
      }
      .status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }
      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
      }
      .status-indicator.online {
        background-color: #4caf50;
        box-shadow: 0 0 4px rgba(76, 175, 80, 0.5);
      }
      .status-indicator.offline {
        background-color: #f44336;
        box-shadow: 0 0 4px rgba(244, 67, 54, 0.5);
      }
      .status-indicator.checking {
        background-color: #ff9800;
        animation: pulse 1.5s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      .status.online {
        color: #4caf50;
      }
      .status.offline {
        color: #f44336;
      }
      .status.checking {
        color: #ff9800;
      }
      .error-message {
        font-size: 0.875rem;
        color: #666;
        margin-left: 0.5rem;
        font-style: italic;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
      }
      .actions button {
        padding: 0.5rem 1rem;
        background-color: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        flex: 1;
      }
      .actions button:hover {
        background-color: #1565c0;
      }
    `,
  ],
})
export class LojasVirtuaisComponent implements OnInit {
  lojas: any[] = [];
  loading = false;
  healthStatus: Map<string, { online: boolean; checking: boolean; error?: string }> = new Map();

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadLojas();
  }

  loadLojas(): void {
    this.loading = true;
    this.api.get<{ data: any[] }>('/admin/lojavirtual').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lojas = response.data.data || [];
          // Check health for each loja after loading
          this.lojas.forEach((loja) => {
            this.checkHealth(loja.lojavirtual_id);
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  checkHealth(lojavirtual_id: string): void {
    // Set checking status
    this.healthStatus.set(lojavirtual_id, { online: false, checking: true });

    this.api.get<{ online: boolean; error?: string; timestamp: string }>(
      `/admin/lojavirtual/${lojavirtual_id}/health`
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.healthStatus.set(lojavirtual_id, {
            online: response.data.online,
            checking: false,
            error: response.data.error,
          });
        } else {
          this.healthStatus.set(lojavirtual_id, {
            online: false,
            checking: false,
            error: 'Erro ao verificar status',
          });
        }
      },
      error: (err) => {
        this.healthStatus.set(lojavirtual_id, {
          online: false,
          checking: false,
          error: err.error?.error?.message || 'Erro de conexão',
        });
      },
    });
  }

  getHealthStatus(lojavirtual_id: string): { online: boolean; checking: boolean; error?: string } {
    return this.healthStatus.get(lojavirtual_id) || { online: false, checking: false };
  }

  viewProducts(lojavirtual_id: string): void {
    this.router.navigate(['/lojas-virtuais', lojavirtual_id, 'produtos']);
  }

  viewOrders(lojavirtual_id: string): void {
    this.router.navigate(['/lojas-virtuais', lojavirtual_id, 'pedidos']);
  }

  syncCatalog(lojavirtual_id: string): void {
    this.api.post(`/admin/lojavirtual/${lojavirtual_id}/sync/catalog`, {}).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Sincronização de catálogo iniciada!');
        }
      },
    });
  }
}

