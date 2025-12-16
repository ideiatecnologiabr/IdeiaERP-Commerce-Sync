import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api/api.service';

@Component({
  selector: 'app-products',
  template: `
    <div class="products">
      <h2>Produtos</h2>
      <div *ngIf="loading" class="loading">Carregando...</div>
      <div *ngIf="products && products.length > 0" class="products-list">
        <div *ngFor="let product of products" class="product-card">
          <h3>{{ product.nome }}</h3>
          <p>Código: {{ product.codigo || 'N/A' }}</p>
          <button (click)="syncProduct(product.produto_id)">Sincronizar</button>
        </div>
      </div>
      <div *ngIf="products && products.length === 0 && !loading" class="empty">
        Nenhum produto encontrado
      </div>
    </div>
  `,
  styles: [
    `
      .products {
        padding: 2rem;
      }
      .loading {
        padding: 2rem;
        text-align: center;
      }
      .products-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }
      .product-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .product-card h3 {
        margin: 0 0 0.5rem 0;
      }
      .product-card button {
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
export class ProductsComponent implements OnInit {
  lojavirtual_id: string = '';
  products: any[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.lojavirtual_id = params['lojavirtual_id'];
      if (this.lojavirtual_id) {
        this.loadProducts();
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.api
      .get<{ data: any[] }>(`/admin/lojavirtual/${this.lojavirtual_id}/produtos`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.products = response.data.data || [];
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  syncProduct(produto_id: string): void {
    this.api
      .post(
        `/admin/lojavirtual/${this.lojavirtual_id}/produtos/${produto_id}/sync`,
        {}
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Produto sincronizado com sucesso!');
          }
        },
      });
  }
}

