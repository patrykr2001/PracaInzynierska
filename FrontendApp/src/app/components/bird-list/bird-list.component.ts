import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BirdService } from '../../services/bird.service';
import { Bird } from '../../models/bird.model';
import { PaginatedResponse, PaginationParams } from '../../models/pagination';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bird-list',
  templateUrl: 'bird-list.component.html',
  styleUrls: ['bird-list.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class BirdListComponent implements OnInit {
  birds: Bird[] = [];
  paginationParams: PaginationParams = {
    pageNumber: 1,
    pageSize: 10
  };
  totalPages = 0;
  totalItems = 0;
  hasPreviousPage = false;
  hasNextPage = false;
  searchTerm = '';
  loading = false;
  error = '';

  constructor(
    private birdService: BirdService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadBirds();
  }

  loadBirds(): void {
    this.loading = true;
    this.error = '';

    const observable = this.searchTerm
      ? this.birdService.searchBirds(this.searchTerm, this.paginationParams)
      : this.birdService.getAllBirds(this.paginationParams);

    observable.subscribe({
      next: (response: PaginatedResponse<Bird>) => {
        this.birds = response.items;
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

  onSearch(): void {
    this.paginationParams.pageNumber = 1;
    this.loadBirds();
  }

  onPageChange(pageNumber: number): void {
    this.paginationParams.pageNumber = pageNumber;
    this.loadBirds();
  }

  onPageSizeChange(pageSize: number): void {
    this.paginationParams.pageSize = pageSize;
    this.paginationParams.pageNumber = 1;
    this.loadBirds();
  }

  viewBirdDetails(id: number): void {
    this.router.navigate(['/birds', id]);
  }
} 