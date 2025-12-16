import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api/api.service';

@Component({
  selector: 'app-orders',
  template: `
    <div class="orders">
      <h2>Pedidos</h2>
      <div *ngIf="loading" class="loading">Carregando...</div>
      <div *ngIf="orders && orders.length > 0" class="orders-list">
        <div *ngFor="let order of orders" class="order-card">
          <h3>Pedido #{{ order.order_id }}</h3>
          <p>Status: {{ order.status }}</p>
          <p>Total: R$ {{ order.total }}</p>
          <button (click)="syncOrder(order.order_id)">Sincronizar</button>
        </div>
      </div>
      <div *ngIf="orders && orders.length === 0 && !loading" class="empty">
        Nenhum pedido encontrado
      </div>
    </div>
  `,
  styles: [
    `
      .orders {
        padding: 2rem;
      }
      .loading {
        padding: 2rem;
        text-align: center;
      }
      .orders-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }
      .order-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .order-card button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .empty {
        padding: 2rem;
        text-align: center;
        color: #666;
      }
    `,
  ],
})
export class OrdersComponent implements OnInit {
  lojavirtual_id: number = 0;
  orders: any[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.lojavirtual_id = +params['lojavirtual_id'];
      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.api.get<{ data: any[] }>(`/admin/lojavirtual/${this.lojavirtual_id}/pedidos`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data.data || [];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  syncOrder(pedido_id: string): void {
    this.api
      .post(
        `/admin/lojavirtual/${this.lojavirtual_id}/pedidos/${pedido_id}/sync`,
        {}
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Pedido sincronizado com sucesso!');
          }
        },
      });
  }
}

