import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, finalize, switchMap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { LoginDto, RegisterDto, AuthResponse, RefreshTokenDto } from '../models/auth.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/api/Auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private tokenRefreshTimeout: any;
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
      this.setupTokenRefresh();
    }
  }

  private setupTokenRefresh(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.tokenRefreshTimeout = setTimeout(() => {
        this.refreshToken().subscribe({
          error: () => {
            this.handleAuthError();
          }
        });
      }, 14 * 60 * 1000);
    }
  }

  refreshToken(): Observable<AuthResponse> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken: token });
          } else {
            return throwError(() => new Error('Brak refresh token'));
          }
        })
      );
    }

    this.isRefreshing = true;
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      this.handleAuthError();
      return throwError(() => new Error('Brak refresh token'));
    }

    const refreshTokenDto: RefreshTokenDto = { refreshToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, refreshTokenDto).pipe(
      tap(response => {
        this.setTokens(response);
        this.setupTokenRefresh();
        this.refreshTokenSubject.next(response.refreshToken);
        this.isRefreshing = false;
      }),
      catchError((error: HttpErrorResponse) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        this.handleAuthError();
        return throwError(() => error);
      })
    );
  }

  private handleAuthError(): void {
    this.logout();
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  private setTokens(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  login(loginDto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginDto)
      .pipe(
        tap(response => {
          this.setTokens(response);
          this.setupTokenRefresh();
        })
      );
  }

  register(registerDto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerDto)
      .pipe(
        tap(response => {
          this.setTokens(response);
          this.setupTokenRefresh();
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      finalize(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.refreshTokenSubject.next(null);
        if (this.tokenRefreshTimeout) {
          clearTimeout(this.tokenRefreshTimeout);
        }
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === UserRole.Admin;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
} 