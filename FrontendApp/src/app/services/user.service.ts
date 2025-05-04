import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { User, UpdateUserDto, UserRole } from '../models/user.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/api/UserSettings';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    // Synchronizacja stanu użytkownika z AuthService
    this.authService.currentUser$.subscribe(user => {
      this.currentUserSubject.next(user);
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      this.authService.updateCurrentUser(updatedUser);
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(UserRole.Admin) ?? false;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Wystąpił błąd podczas operacji';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Błąd: ${error.error.message}`;
    } else {
      errorMessage = `Kod błędu: ${error.status}, wiadomość: ${error.error.message || errorMessage}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  updateUserSettings(updateDto: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}`, updateDto)
      .pipe(
        tap(user => this.setCurrentUser(user)),
        catchError(this.handleError.bind(this))
      );
  }

  getUserSettings(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}`)
      .pipe(catchError(this.handleError.bind(this)));
  }
} 