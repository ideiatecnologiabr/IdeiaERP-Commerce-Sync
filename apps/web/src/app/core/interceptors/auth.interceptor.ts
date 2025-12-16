import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Adicionar token ao header se disponível
    const token = this.authService.getToken();
    let authReq = req;

    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Não tentar refresh em endpoints de auth (login, logout, refresh)
        const isAuthEndpoint = req.url.includes('/auth/login') || 
                              req.url.includes('/auth/logout') || 
                              req.url.includes('/auth/refresh');
        
        if (isAuthEndpoint) {
          return throwError(() => error);
        }

        // Se for erro 401 (não autorizado)
        if (error.status === 401 && !this.isRefreshing) {
          // Tentar renovar token
          return this.handle401Error(authReq, next);
        }

        // Se estiver tentando refresh e ainda der 401, fazer logout
        if (error.status === 401 && this.isRefreshing) {
          this.authService.logout();
          return throwError(() => error);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          
          if (response.success && response.data?.token) {
            this.refreshTokenSubject.next(response.data.token);
            
            // Repetir requisição original com novo token
            const newToken = response.data.token;
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            
            return next.handle(clonedReq);
          }

          // Se refresh falhou, fazer logout
          this.authService.logout();
          return throwError(() => new Error('Token refresh failed'));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // Se já está tentando refresh, esperar o resultado
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          const clonedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next.handle(clonedReq);
        })
      );
    }
  }
}

