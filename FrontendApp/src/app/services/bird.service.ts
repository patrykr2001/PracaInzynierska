import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Bird } from '../models/bird.model';
import { PaginatedResponse, PaginationParams } from '../models/pagination';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BirdService {
  private apiUrl = `${environment.apiUrl}/api/birds`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401 || error.status === 403) {
      // Przekieruj do strony logowania
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: this.router.url 
        }
      });
    }
    return throwError(() => error);
  }

  getAllBirds(paginationParams: PaginationParams): Observable<PaginatedResponse<Bird>> {
    const params = new HttpParams()
      .set('pageNumber', paginationParams.pageNumber.toString())
      .set('pageSize', paginationParams.pageSize.toString());
    return this.http.get<PaginatedResponse<Bird>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getAllBirdsForAdmin(paginationParams: PaginationParams): Observable<PaginatedResponse<Bird>> {
    const params = new HttpParams()
      .set('pageNumber', paginationParams.pageNumber.toString())
      .set('pageSize', paginationParams.pageSize.toString());
    return this.http.get<PaginatedResponse<Bird>>(`${this.apiUrl}/all`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getUnverifiedBirds(paginationParams: PaginationParams): Observable<PaginatedResponse<Bird>> {
    const params = new HttpParams()
      .set('pageNumber', paginationParams.pageNumber.toString())
      .set('pageSize', paginationParams.pageSize.toString());
    return this.http.get<PaginatedResponse<Bird>>(`${this.apiUrl}/unverified`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getBirdById(id: number): Observable<Bird> {
    return this.http.get<Bird>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  createBird(bird: FormData): Observable<Bird> {
    return this.http.post<Bird>(this.apiUrl, bird)
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateBird(id: number, bird: FormData): Observable<Bird> {
    return this.http.put<Bird>(`${this.apiUrl}/${id}`, bird)
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteBird(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  verifyBird(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/verify`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }

  searchBirds(searchTerm: string, paginationParams: PaginationParams): Observable<PaginatedResponse<Bird>> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('pageNumber', paginationParams.pageNumber.toString())
      .set('pageSize', paginationParams.pageSize.toString());
    return this.http.get<PaginatedResponse<Bird>>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }
} 