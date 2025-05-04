import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { BirdService } from '../../services/bird.service';
import { Bird } from '../../models/bird.model';
import { AddBirdDialogComponent } from './add-bird-dialog/add-bird-dialog.component';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { PaginatedResponse, PaginationParams } from '../../models/pagination';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LocaleService } from '../../services/locale.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-birds',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSelectModule,
    MatToolbarModule,
    MatChipsModule,
    FormsModule
  ],
  templateUrl: './birds.component.html',
  styleUrl: './birds.component.scss'
})
export default class BirdsComponent implements OnInit {
  apiUrl = environment.apiUrl;
  birds: Bird[] = [];
  paginationParams: PaginationParams = {
    pageNumber: 1,
    pageSize: 10
  };
  totalPages = 0;
  totalItems = 0;
  searchTerm = '';
  loading = false;
  error = '';
  showUnverifiedOnly = false;
  hasPreviousPage = false;
  hasNextPage = false;
  private searchSubject = new Subject<string>();
  readonly MIN_SEARCH_LENGTH = 3;
  isLoading = true;
  errorMessage = '';
  pageSize = 12;
  pageIndex = 0;
  dateFormat: string;

  constructor(
    private birdService: BirdService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private localeService: LocaleService,
    private userService: UserService
  ) {
    this.dateFormat = this.localeService.getDateTimeFormat();
    // Konfiguracja debounce dla wyszukiwania
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      if (term.length >= this.MIN_SEARCH_LENGTH || term.length === 0) {
        this.onSearch();
      }
    });
  }

  ngOnInit(): void {
    this.loadBirds();
  }

  loadBirds(): void {
    this.loading = true;
    this.error = '';

    let observable: Observable<PaginatedResponse<Bird>>;

    if (this.searchTerm.trim().length >= this.MIN_SEARCH_LENGTH) {
      // Wyszukiwanie dla wszystkich użytkowników
      observable = this.birdService.searchBirds(this.searchTerm, this.paginationParams);
    } else if (this.showUnverifiedOnly && this.isAdmin()) {
      observable = this.birdService.getUnverifiedBirds(this.paginationParams);
    } else if (this.isAdmin()) {
      observable = this.birdService.getAllBirdsForAdmin(this.paginationParams);
    } else {
      observable = this.birdService.getAllBirds(this.paginationParams);
    }

    observable.subscribe({
      next: (response: PaginatedResponse<Bird>) => {
        // Sortowanie wyników po nazwie ptaka
        this.birds = response.items.sort((a, b) => a.commonName.localeCompare(b.commonName));
        this.totalPages = response.totalPages;
        this.totalItems = response.totalCount;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Wystąpił błąd podczas ładowania ptaków.';
        this.loading = false;
        console.error('Error loading birds:', err);
      }
    });
  }

  onSearchInput(term: string): void {
    this.searchSubject.next(term);
  }

  onSearch(): void {
    this.paginationParams.pageNumber = 1;
    this.loadBirds();
  }

  onPageChange(event: PageEvent): void {
    this.paginationParams.pageNumber = event.pageIndex + 1;
    this.paginationParams.pageSize = event.pageSize;
    this.loadBirds();
  }

  toggleUnverifiedOnly(): void {
    this.showUnverifiedOnly = !this.showUnverifiedOnly;
    this.paginationParams.pageNumber = 1;
    this.loadBirds();
  }

  viewBirdDetails(id: number): void {
    this.router.navigate(['/birds', id]);
  }

  openAddBirdDialog(): void {
    const dialogRef = this.dialog.open(AddBirdDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBirds();
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }
}
