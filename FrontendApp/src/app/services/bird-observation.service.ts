import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BirdObservation, CreateBirdObservation, UpdateBirdObservation } from '../models/bird-observation.model';
import { PaginatedResponse, PaginationParams } from '../models/pagination';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BirdObservationService {
  private apiUrl = `${environment.apiUrl}/api/birdobservations`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401 || error.status === 403) {
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: this.router.url 
        }
      });
    }
    return throwError(() => error);
  }

  getAllObservations(paginationParams: PaginationParams): Observable<PaginatedResponse<BirdObservation>> {
    const params = new HttpParams()
      .set('pageNumber', paginationParams.pageNumber.toString())
      .set('pageSize', paginationParams.pageSize.toString());
    return this.http.get<PaginatedResponse<BirdObservation>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getUserObservations(paginationParams: PaginationParams): Observable<PaginatedResponse<BirdObservation>> {
    const params = new HttpParams()
      .set('pageNumber', paginationParams.pageNumber.toString())
      .set('pageSize', paginationParams.pageSize.toString());
    return this.http.get<PaginatedResponse<BirdObservation>>(`${this.apiUrl}/user`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getObservationById(id: number): Observable<BirdObservation> {
    return this.http.get<BirdObservation>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  createObservation(observation: CreateBirdObservation): Observable<BirdObservation> {
    return this.http.post<BirdObservation>(this.apiUrl, observation)
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateObservation(id: number, observation: UpdateBirdObservation): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, observation)
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteObservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  verifyObservation(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/verify`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }
} 