import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { BirdService } from '../../../services/bird.service';
import { Bird } from '../../../models/bird.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { EditBirdDialogComponent } from '../edit-bird-dialog/edit-bird-dialog.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-bird-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './bird-details.component.html',
  styleUrl: './bird-details.component.scss'
})
export default class BirdDetailsComponent implements OnInit {
  apiUrl = environment.apiUrl;
  bird: Bird | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private birdService: BirdService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadBird();
  }

  private loadBird(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Nie znaleziono ptaka';
      return;
    }

    this.isLoading = true;
    this.birdService.getBirdById(Number(id)).subscribe({
      next: (bird) => {
        this.bird = bird;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Wystąpił błąd podczas ładowania danych ptaka';
        this.isLoading = false;
        console.error('Error loading bird:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/birds']);
  }

  onEdit(): void {
    if (!this.bird) return;

    const dialogRef = this.dialog.open(EditBirdDialogComponent, {
      width: '800px',
      data: { bird: this.bird }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBird();
      }
    });
  }

  onVerify(): void {
    if (!this.bird) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Weryfikacja ptaka',
        message: `Czy na pewno chcesz zweryfikować ptaka "${this.bird.commonName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.errorMessage = null;

        this.birdService.verifyBird(this.bird!.id).subscribe({
          next: () => {
            this.snackBar.open('Ptak został zweryfikowany', 'Zamknij', { duration: 3000 });
            this.loadBird();
          },
          error: (error) => {
            this.errorMessage = 'Wystąpił błąd podczas weryfikacji ptaka';
            this.isLoading = false;
            console.error('Error verifying bird:', error);
          }
        });
      }
    });
  }

  onDelete(): void {
    if (!this.bird) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Usuwanie ptaka',
        message: `Czy na pewno chcesz usunąć ptaka "${this.bird.commonName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.errorMessage = null;

        this.birdService.deleteBird(this.bird!.id).subscribe({
          next: () => {
            this.snackBar.open('Ptak został usunięty', 'Zamknij', { duration: 3000 });
            this.router.navigate(['/birds']);
          },
          error: (error) => {
            this.errorMessage = 'Wystąpił błąd podczas usuwania ptaka';
            this.isLoading = false;
            console.error('Error deleting bird:', error);
          }
        });
      }
    });
  }
} 