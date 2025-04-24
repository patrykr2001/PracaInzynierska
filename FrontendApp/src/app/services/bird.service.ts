import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bird } from '../models/bird.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BirdService {
  private apiUrl = `${environment.apiUrl}/api/Birds`;

  constructor(private http: HttpClient) { }

  getBirds(): Observable<Bird[]> {
    return this.http.get<Bird[]>(this.apiUrl);
  }

  getBird(id: number): Observable<Bird> {
    return this.http.get<Bird>(`${this.apiUrl}/${id}`);
  }

  createBird(formData: FormData): Observable<Bird> {
    return this.http.post<Bird>(this.apiUrl, formData);
  }

  updateBird(id: number, formData: FormData): Observable<Bird> {
    return this.http.put<Bird>(`${this.apiUrl}/${id}`, formData);
  }

  deleteBird(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 