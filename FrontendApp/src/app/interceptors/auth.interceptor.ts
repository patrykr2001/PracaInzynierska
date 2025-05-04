import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    req = clonedReq;
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/refresh-token')) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            const newReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${response.accessToken}`)
            });
            return next(newReq);
          }),
          catchError(refreshError => {
            authService.logout().subscribe(() => {
              router.navigate(['/login'], {
                queryParams: { returnUrl: router.url }
              });
            });
            return throwError(() => refreshError);
          })
        );
      }
      
      if (error.status === 403) {
        router.navigate(['/login'], { 
          queryParams: { returnUrl: router.url }
        });
      }
      
      return throwError(() => error);
    })
  );
}; 