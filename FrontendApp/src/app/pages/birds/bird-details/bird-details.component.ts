import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BirdService } from '../../../services/bird.service';
import { Bird } from '../../../models/bird.model';

@Component({
  selector: 'app-bird-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './bird-details.component.html',
  styleUrl: './bird-details.component.scss'
})
export default class BirdDetailsComponent implements OnInit {
  bird: Bird | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private birdService: BirdService
  ) {}

  ngOnInit(): void {
    this.loadBird();
  }

  loadBird(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/birds']);
      return;
    }

    this.isLoading = true;
    this.birdService.getBird(+id).subscribe({
      next: (bird) => {
        this.bird = bird;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Wystąpił błąd podczas ładowania danych ptaka';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/birds']);
  }
} 