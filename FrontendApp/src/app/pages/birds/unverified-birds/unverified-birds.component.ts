import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSpinner } from '@angular/material/progress-spinner';
import { BirdService } from '../../../services/bird.service';
import { Bird } from '../../../models/bird.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-unverified-birds',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSpinner
  ],
  templateUrl: './unverified-birds.component.html',
  styleUrl: './unverified-birds.component.scss'
})
export default class UnverifiedBirdsComponent implements OnInit {
  apiUrl = environment.apiUrl;
  birds: Bird[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private birdService: BirdService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBirds();
  }

  loadBirds(): void {
    this.isLoading = true;
    this.birdService.getUnverifiedBirds().subscribe({
      next: (birds) => {
        this.birds = birds;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Wystąpił błąd podczas ładowania listy ptaków';
        this.isLoading = false;
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
} 