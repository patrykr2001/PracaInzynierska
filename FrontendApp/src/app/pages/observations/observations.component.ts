import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BirdObservationService } from '../../services/bird-observation.service';
import { BirdObservation } from '../../models/bird-observation.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { PaginatedResponse, PaginationParams } from '../../models/pagination';
import { LocaleService } from '../../services/locale.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-observations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatTooltipModule
  ],
  templateUrl: './observations.component.html',
  styleUrl: './observations.component.scss'
})
export default class ObservationsComponent implements OnInit {
  baseUrl = environment.api.baseUrl;
  observations: BirdObservation[] = [];
  paginationParams: PaginationParams = {
    pageNumber: 1,
    pageSize: 10
  };
  totalPages = 0;
  totalItems = 0;
  loading = false;
  error = '';
  showUserOnly = false;
  showUnverifiedOnly = false;
  hasPreviousPage = false;
  hasNextPage = false;
  dateFormat: string;

  constructor(
    private observationService: BirdObservationService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private localeService: LocaleService,
    private userService: UserService
  ) {
    this.dateFormat = this.localeService.getDateTimeFormat();
  }

  ngOnInit(): void {
    this.loadObservations();
  }

  loadObservations(): void {
    this.loading = true;
    this.error = '';

    let observable = this.showUserOnly && this.isLoggedIn()
      ? this.observationService.getUserObservations(this.paginationParams)
      : this.observationService.getAllObservations(this.paginationParams);

    observable.subscribe({
      next: (response: PaginatedResponse<BirdObservation>) => {
        this.observations = this.showUnverifiedOnly 
          ? response.items.filter(o => !o.isVerified)
          : response.items.filter(o => o.isVerified);
        this.totalPages = response.totalPages;
        this.totalItems = response.totalCount;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Wystąpił błąd podczas ładowania obserwacji.';
        this.loading = false;
        console.error('Error loading observations:', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.paginationParams.pageNumber = event.pageIndex + 1;
    this.paginationParams.pageSize = event.pageSize;
    this.loadObservations();
  }

  toggleUserOnly(): void {
    this.showUserOnly = !this.showUserOnly;
    this.paginationParams.pageNumber = 1;
    this.loadObservations();
  }

  toggleUnverifiedOnly(): void {
    this.showUnverifiedOnly = !this.showUnverifiedOnly;
    this.paginationParams.pageNumber = 1;
    this.loadObservations();
  }

  viewObservationDetails(id: number): void {
    this.router.navigate(['/observations', id]);
  }

  addNewObservation(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: '/add-observation' 
        }
      });
      return;
    }
    this.router.navigate(['/add-observation']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }
} 