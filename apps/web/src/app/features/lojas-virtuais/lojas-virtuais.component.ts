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
    `,
  ],
})
export class LojasVirtuaisComponent implements OnInit {
  lojas: any[] = [];
  loading = false;

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
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  viewProducts(lojavirtual_id: number): void {
    this.router.navigate(['/lojas-virtuais', lojavirtual_id, 'produtos']);
  }

  viewOrders(lojavirtual_id: number): void {
    this.router.navigate(['/lojas-virtuais', lojavirtual_id, 'pedidos']);
  }

  syncCatalog(lojavirtual_id: number): void {
    this.api.post(`/admin/lojavirtual/${lojavirtual_id}/sync/catalog`, {}).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Sincronização de catálogo iniciada!');
        }
      },
    });
  }
}

