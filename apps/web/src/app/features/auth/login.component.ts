import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="credentials.email"
              required
              #email="ngModel"
            />
            <div *ngIf="email.invalid && email.touched" class="error">
              Email é obrigatório
            </div>
          </div>

          <div class="form-group">
            <label for="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              [(ngModel)]="credentials.senha"
              required
              #senha="ngModel"
            />
            <div *ngIf="senha.invalid && senha.touched" class="error">
              Senha é obrigatória
            </div>
          </div>

          <div *ngIf="error" class="error-message">{{ error }}</div>

          <button type="submit" [disabled]="loading || loginForm.invalid">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
      }
      .login-card {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }
      h2 {
        margin-bottom: 1.5rem;
        text-align: center;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }
      .error {
        color: red;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
      .error-message {
        color: red;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background-color: #ffe6e6;
        border-radius: 4px;
      }
      button {
        width: 100%;
        padding: 0.75rem;
        background-color: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
      }
      button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
      button:hover:not(:disabled) {
        background-color: #1565c0;
      }
    `,
  ],
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    senha: '',
  };
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.error = response.error?.message || 'Erro ao fazer login';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.error?.message || 'Erro ao fazer login';
        this.loading = false;
      },
    });
  }
}

