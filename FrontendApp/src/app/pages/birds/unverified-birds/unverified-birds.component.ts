import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BirdService } from '../../../services/bird.service';
import { AuthService } from '../../../services/auth.service';
import { Bird } from '../../../models/bird.model';
import { PaginatedResponse, PaginationParams } from '../../../models/pagination';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unverified-birds',
  templateUrl: './unverified-birds.component.html',
  styleUrls: ['./unverified-birds.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export default class UnverifiedBirdsComponent implements OnInit {
  birds: Bird[] = [];
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  Math = Math;

  constructor(
    private birdService: BirdService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('Is admin:', this.authService.isAdmin());
    
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    
    this.loadBirds();
  }

  loadBirds(): void {
    this.loading = true;
    this.error = '';

    const paginationParams: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.birdService.getUnverifiedBirds(paginationParams).subscribe({
      next: (response: PaginatedResponse<Bird>) => {
        this.birds = response.items;
        this.totalItems = response.totalCount;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Wystąpił błąd podczas ładowania ptaków.';
        this.loading = false;
        console.error('Error loading birds:', err);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBirds();
  }

  verifyBird(id: number): void {
    this.birdService.verifyBird(id).subscribe({
      next: () => {
        this.loadBirds();
      },
      error: (error) => {
        console.error('Error verifying bird:', error);
        this.error = 'Wystąpił błąd podczas weryfikacji ptaka.';
      }
    });
  }

  deleteBird(id: number): void {
    if (confirm('Czy na pewno chcesz usunąć tego ptaka?')) {
      this.birdService.deleteBird(id).subscribe({
        next: () => {
          this.loadBirds();
        },
        error: (error) => {
          console.error('Error deleting bird:', error);
          this.error = 'Wystąpił błąd podczas usuwania ptaka.';
        }
      });
    }
  }

  viewBirdDetails(id: number): void {
    this.router.navigate(['/birds', id]);
  }
} 