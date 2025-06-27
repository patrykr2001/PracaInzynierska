import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BirdObservation, CreateBirdObservation, UpdateBirdObservation } from '../models/bird-observation.model';
import { PaginatedResponse, PaginationParams } from '../models/pagination';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class BirdObservationService {
  private baseUrl = `${environment.api.baseUrl}${environment.api.endpoints.birdObservations}`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
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
    return this.http.get<PaginatedResponse<BirdObservation>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getUserObservations(paginationParams: PaginationParams): Observable<PaginatedResponse<BirdObservation>> {
    const params = new HttpParams()
      .set('pageNumber', paginationParams.pageNumber.toString())
      .set('pageSize', paginationParams.pageSize.toString());
    return this.http.get<PaginatedResponse<BirdObservation>>(`${this.baseUrl}${environment.api.endpoints.observationsEndpoints.user}`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getObservationById(id: number): Observable<BirdObservation> {
    return this.http.get<BirdObservation>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  createObservation(observation: FormData): Observable<BirdObservation> {
    return this.http.post<BirdObservation>(this.baseUrl, observation);
  }

  updateObservation(id: number, observation: UpdateBirdObservation): Observable<void> {
    const formData = new FormData();

    // Dodaj podstawowe dane obserwacji
    Object.entries(observation).forEach(([key, value]) => {
      if (key === 'images' && value) {
        (value as File[]).forEach((image) => {
          formData.append('Images', image);
        });
      } else if (key === 'observationDate' && value) {
        formData.append(key, (value as Date).toISOString());
      } else if (key !== 'images') {
        formData.append(key, String(value));
      }
    });

    return this.http.put<void>(`${this.baseUrl}/${id}`, formData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteObservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  verifyObservation(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}${environment.api.endpoints.observationsEndpoints.verify(id)}`, {})
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteObservationImage(observationId: number, imageUrl: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${environment.api.endpoints.observationsEndpoints.images(observationId)}`, {
      body: { imageUrl }
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        this.snackBar.open('Nie masz uprawnień do usunięcia tego zdjęcia', 'Zamknij', {
          duration: 5000
        });
      }
      return this.handleError(error);
    }));
  }
}
