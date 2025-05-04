import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BirdObservationService } from '../../services/bird-observation.service';
import { BirdObservation } from '../../models/bird-observation.model';
import { environment } from '../../../environments/environment';
import { ImageGalleryDialogComponent } from '../../components/image-gallery-dialog/image-gallery-dialog.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-observation-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './observation-details.component.html',
  styleUrl: './observation-details.component.scss'
})
export default class ObservationDetailsComponent implements OnInit {
  observation: BirdObservation | null = null;
  isLoading = true;
  apiUrl = environment.apiUrl;
  currentImageIndex = 0;
  canEdit = false;
  canDelete = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private observationService: BirdObservationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadObservation(parseInt(id));
    } else {
      this.router.navigate(['/observations']);
    }
  }

  loadObservation(id: number): void {
    this.isLoading = true;
    this.observationService.getObservationById(id).subscribe({
      next: (observation) => {
        this.observation = observation;
        this.checkPermissions();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania obserwacji:', error);
        this.snackBar.open('Wystąpił błąd podczas ładowania obserwacji', 'Zamknij', {
          duration: 5000
        });
        this.isLoading = false;
        this.router.navigate(['/observations']);
      }
    });
  }

  checkPermissions(): void {
    if (!this.observation) return;

    const currentUser = this.userService.getCurrentUser();
    const isAdmin = this.userService.isAdmin();
    
    // Admin może edytować i usuwać wszystkie obserwacje
    if (isAdmin) {
      this.canEdit = true;
      this.canDelete = true;
      return;
    }

    // Użytkownik może edytować i usuwać tylko swoje niezweryfikowane obserwacje
    if (currentUser && currentUser.id === this.observation.userId && !this.observation.isVerified) {
      this.canEdit = true;
      this.canDelete = true;
      return;
    }

    this.canEdit = false;
    this.canDelete = false;
  }

  openImageGallery(index: number): void {
    if (this.observation?.imageUrls) {
      this.dialog.open(ImageGalleryDialogComponent, {
        data: {
          images: this.observation.imageUrls.map(url => this.apiUrl + url),
          startIndex: index
        },
        maxWidth: '90vw',
        maxHeight: '90vh'
      });
    }
  }

  onDelete(): void {
    if (!this.canDelete) {
      this.snackBar.open('Nie masz uprawnień do usunięcia tej obserwacji', 'Zamknij', {
        duration: 5000
      });
      return;
    }

    if (this.observation && confirm('Czy na pewno chcesz usunąć tę obserwację?')) {
      this.observationService.deleteObservation(this.observation.id).subscribe({
        next: () => {
          this.snackBar.open('Obserwacja została usunięta', 'Zamknij', {
            duration: 5000
          });
          this.router.navigate(['/observations']);
        },
        error: (error) => {
          console.error('Błąd podczas usuwania obserwacji:', error);
          this.snackBar.open('Wystąpił błąd podczas usuwania obserwacji', 'Zamknij', {
            duration: 5000
          });
        }
      });
    }
  }

  onEdit(): void {
    if (this.canEdit) {
      this.router.navigate(['/observations', this.observation?.id, 'edit']);
    } else {
      this.snackBar.open('Nie masz uprawnień do edycji tej obserwacji', 'Zamknij', {
        duration: 5000
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/observations']);
  }
}
