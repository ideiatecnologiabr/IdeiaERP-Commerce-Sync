import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map, take, filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Aguardar verificação de autenticação terminar
    return this.authService.authCheckComplete$.pipe(
      filter((complete) => complete === true), // Esperar até verificação terminar
      take(1),
      switchMap(() => {
        // Agora verificar se usuário está autenticado
        return this.authService.currentUser$.pipe(
          take(1),
          map((user) => {
            if (user) {
              return true;
            } else {
              this.router.navigate(['/login'], {
                queryParams: { returnUrl: state.url },
              });
              return false;
            }
          })
        );
      })
    );
  }
}

