import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <h2>Dashboard</h2>
      <p>Bem-vindo, {{ currentUser?.nome }}!</p>
      
      <div *ngIf="loading" class="loading">Carregando...</div>
      
      <div *ngIf="stats" class="stats">
        <div class="stat-card">
          <h3>Total de Sincronizações</h3>
          <p class="stat-value">{{ stats.totalSyncs }}</p>
        </div>
        <div class="stat-card">
          <h3>Sucessos</h3>
          <p class="stat-value success">{{ stats.successSyncs }}</p>
        </div>
        <div class="stat-card">
          <h3>Erros</h3>
          <p class="stat-value error">{{ stats.errorSyncs }}</p>
        </div>
        <div class="stat-card">
          <h3>Taxa de Sucesso</h3>
          <p class="stat-value">{{ stats.successRate | number: '1.2-2' }}%</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 2rem;
      }
      h2 {
        margin-bottom: 1rem;
      }
      .loading {
        padding: 2rem;
        text-align: center;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
      }
      .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .stat-card h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        color: #666;
      }
      .stat-value {
        margin: 0;
        font-size: 2rem;
        font-weight: bold;
      }
      .stat-value.success {
        color: #4caf50;
      }
      .stat-value.error {
        color: #f44336;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  loading = false;
  stats: any = null;

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.api.get<{ stats: any }>('/admin/dashboard').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data.stats;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}

