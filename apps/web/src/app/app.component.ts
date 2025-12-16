import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header>
        <h1>IdeiaERP Commerce Sync</h1>
        <nav *ngIf="isAuthenticated">
          <a routerLink="/dashboard">Dashboard</a>
          <a routerLink="/lojas-virtuais">Lojas</a>
          <a routerLink="/logs">Logs</a>
          <button (click)="logout()">Sair</button>
        </nav>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      header {
        background-color: #1976d2;
        color: white;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      header h1 {
        margin: 0;
        font-size: 1.5rem;
      }
      nav {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      nav a {
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
      }
      nav a:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      nav button {
        padding: 0.5rem 1rem;
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      main {
        flex: 1;
        padding: 2rem;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = 'IdeiaERP Commerce Sync';
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isAuthenticated = user !== null;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

