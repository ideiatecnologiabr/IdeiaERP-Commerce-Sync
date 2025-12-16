import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

export interface Usuario {
  usuario_id: number;
  nome: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  usuario: Usuario;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private authCheckComplete = new BehaviorSubject<boolean>(false);
  public authCheckComplete$ = this.authCheckComplete.asObservable();
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.checkAuth();
  }

  /**
   * Realiza login e salva tokens
   */
  login(credentials: LoginRequest): Observable<any> {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      map((response) => {
        if (response.success && response.data) {
          // Salvar tokens
          this.setToken(response.data.token);
          this.setRefreshToken(response.data.refreshToken);
          
          // Atualizar usuário atual
          if (response.data.usuario) {
            this.currentUserSubject.next(response.data.usuario);
          }
        }
        return response;
      })
    );
  }

  /**
   * Realiza logout e remove tokens
   */
  logout(): void {
    // O token será enviado automaticamente pelo interceptor
    this.api.post('/auth/logout', {}).subscribe({
      next: () => {
        this.clearTokens();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      },
      error: () => {
        // Mesmo se falhar, limpar tokens localmente
        this.clearTokens();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      },
    });
  }

  /**
   * Obtém informações do usuário atual
   */
  getCurrentUser(): Observable<any> {
    return this.api.get<{ usuario: Usuario }>('/auth/me');
  }

  /**
   * Renova o token usando refresh token
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token não encontrado'));
    }

    return this.api.post<LoginResponse>('/auth/refresh', { refreshToken }).pipe(
      map((response) => {
        if (response.success && response.data) {
          // Atualizar tokens
          this.setToken(response.data.token);
          this.setRefreshToken(response.data.refreshToken);
          
          return response;
        }
        throw new Error('Falha ao renovar token');
      }),
      catchError((error) => {
        // Se refresh falhar, fazer logout
        this.clearTokens();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null && this.currentUserSubject.value !== null;
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtém o refresh token atual
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Salva o token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Salva o refresh token
   */
  private setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Remove todos os tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Verifica autenticação ao inicializar
   */
  private checkAuth(): void {
    const token = this.getToken();
    
    if (!token) {
      this.currentUserSubject.next(null);
      this.authCheckComplete.next(true);
      return;
    }

    // Tentar obter informações do usuário
    this.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success && response.data?.usuario) {
          this.currentUserSubject.next(response.data.usuario);
        } else {
          // Token inválido, limpar
          this.clearTokens();
          this.currentUserSubject.next(null);
        }
        this.authCheckComplete.next(true);
      },
      error: () => {
        // Erro ao validar token, tentar refresh
        this.refreshToken().subscribe({
          next: () => {
            // Token renovado, tentar novamente
            this.getCurrentUser().subscribe({
              next: (response) => {
                if (response.success && response.data?.usuario) {
                  this.currentUserSubject.next(response.data.usuario);
                } else {
                  this.clearTokens();
                  this.currentUserSubject.next(null);
                }
                this.authCheckComplete.next(true);
              },
              error: () => {
                this.clearTokens();
                this.currentUserSubject.next(null);
                this.authCheckComplete.next(true);
              },
            });
          },
          error: () => {
            // Refresh falhou, limpar tudo
            this.clearTokens();
            this.currentUserSubject.next(null);
            this.authCheckComplete.next(true);
          },
        });
      },
    });
  }
}

