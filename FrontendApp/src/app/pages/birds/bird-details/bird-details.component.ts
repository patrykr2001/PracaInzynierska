import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BirdService } from '../../../services/bird.service';
import { Bird } from '../../../models/bird.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { EditBirdDialogComponent } from '../edit-bird-dialog/edit-bird-dialog.component';

@Component({
  selector: 'app-bird-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule
  ],
  templateUrl: './bird-details.component.html',
  styleUrl: './bird-details.component.scss'
})
export default class BirdDetailsComponent implements OnInit {
  apiUrl = environment.apiUrl;
  bird: Bird | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private birdService: BirdService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  canEdit(): boolean {
    return this.isAdmin() || !!(this.bird && !this.bird.isVerified);
  }

  openEditDialog(): void {
    if (!this.bird) return;

    const dialogRef = this.dialog.open(EditBirdDialogComponent, {
      width: '500px',
      data: { bird: this.bird }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bird = result;
        this.snackBar.open('Ptak został zaktualizowany', 'Zamknij', {
          duration: 3000
        });
      }
    });
  }

  verifyBird(): void {
    if (!this.bird) return;

    this.isLoading = true;
    this.birdService.verifyBird(this.bird.id).subscribe({
      next: (bird) => {
        this.bird = bird;
        this.isLoading = false;
        this.snackBar.open('Ptak został zweryfikowany', 'Zamknij', {
          duration: 3000
        });
      },
      error: (error) => {
        this.errorMessage = 'Wystąpił błąd podczas weryfikacji ptaka';
        this.isLoading = false;
      }
    });
  }

  deleteBird(): void {
    if (!this.bird) return;

    if (confirm('Czy na pewno chcesz usunąć tego ptaka?')) {
      this.isLoading = true;
      this.birdService.deleteBird(this.bird.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Ptak został usunięty', 'Zamknij', {
            duration: 3000
          });
          this.router.navigate(['/birds']);
        },
        error: (error) => {
          this.errorMessage = 'Wystąpił błąd podczas usuwania ptaka';
          this.isLoading = false;
        }
      });
    }
  }
} 