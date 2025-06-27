import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BirdService } from '../../services/bird.service';
import { BirdObservationService } from '../../services/bird-observation.service';
import { Bird } from '../../models/bird.model';
import { BirdObservation, UpdateBirdObservation } from '../../models/bird-observation.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MapComponent } from '../../components/map/map.component';
import { LocaleService } from '../../services/locale.service';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-edit-observation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MapComponent
  ],
  templateUrl: './edit-observation.component.html',
  styleUrl: './edit-observation.component.scss'
})
export default class EditObservationComponent implements OnInit {
  observationForm: FormGroup;
  birds: Bird[] = [];
  isLoading = true;
  isSubmitting = false;
  selectedLocation: { lat: number; lng: number } | undefined = undefined;
  dateFormat: string;
  today = new Date();
  selectedImages: File[] = [];
  previewUrls: string[] = [];
  existingImageUrls: string[] = [];
  canEdit = false;
  baseUrl = environment.api.baseUrl;

  constructor(
    private fb: FormBuilder,
    private birdService: BirdService,
    private observationService: BirdObservationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private localeService: LocaleService,
    private userService: UserService
  ) {
    this.dateFormat = this.localeService.getDateTimeFormat();
    this.observationForm = this.fb.group({
      birdId: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      observationDate: ['', Validators.required],
      description: ['', Validators.required],
      numberOfBirds: [1, [Validators.required, Validators.min(1)]],
      weatherConditions: [''],
      habitat: ['']
    });
  }

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
        this.checkPermissions(observation);
        if (!this.canEdit) {
          this.snackBar.open('Nie masz uprawnień do edycji tej obserwacji', 'Zamknij', {
            duration: 5000
          });
          this.router.navigate(['/observations']);
          return;
        }

        this.loadBirds();
        this.initializeForm(observation);
        this.existingImageUrls = observation.imageUrls || [];
        this.previewUrls = observation.imageUrls?.map(url => this.baseUrl + url) || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania obserwacji:', error);
        if (error.status === 403) {
          this.snackBar.open('Nie masz uprawnień do edycji tej obserwacji', 'Zamknij', {
            duration: 5000
          });
        } else {
          this.snackBar.open('Wystąpił błąd podczas ładowania obserwacji', 'Zamknij', {
            duration: 5000
          });
        }
        this.isLoading = false;
        this.router.navigate(['/observations']);
      }
    });
  }

  checkPermissions(observation: BirdObservation): void {
    const currentUser = this.userService.getCurrentUser();
    const isAdmin = this.userService.isAdmin();

    if (isAdmin) {
      this.canEdit = true;
      return;
    }

    if (currentUser && currentUser.id === observation.userId) {
      this.canEdit = true;
      return;
    }

    this.canEdit = false;
  }

  loadBirds(): void {
    this.birdService.getAllBirds({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.birds = response.items;
      },
      error: (error) => {
        console.error('Błąd podczas ładowania ptaków:', error);
        this.snackBar.open('Wystąpił błąd podczas ładowania listy ptaków', 'Zamknij', {
          duration: 5000
        });
      }
    });
  }

  initializeForm(observation: BirdObservation): void {
    this.observationForm.patchValue({
      birdId: observation.birdId,
      latitude: observation.latitude,
      longitude: observation.longitude,
      observationDate: new Date(observation.observationDate),
      description: observation.description,
      numberOfBirds: observation.numberOfBirds,
      weatherConditions: observation.weatherConditions,
      habitat: observation.habitat
    });

    this.selectedLocation = {
      lat: observation.latitude,
      lng: observation.longitude
    };
  }

  onLocationSelected(location: { lat: number; lng: number }): void {
    const lat = location.lat.toFixed(4);
    const lng = location.lng.toFixed(4);

    this.selectedLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };

    this.observationForm.patchValue({
      latitude: lat,
      longitude: lng
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedImages = [...this.selectedImages, ...files];

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.previewUrls.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    if (index < this.existingImageUrls.length) {
      // Usuwanie istniejącego zdjęcia
      const imageUrl = this.existingImageUrls[index];
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;

      this.observationService.deleteObservationImage(parseInt(id), imageUrl).subscribe({
        next: () => {
          this.existingImageUrls.splice(index, 1);
          this.previewUrls.splice(index, 1);
          this.snackBar.open('Zdjęcie zostało usunięte', 'Zamknij', {
            duration: 5000
          });
        },
        error: (error) => {
          console.error('Błąd podczas usuwania zdjęcia:', error);
          if (error.status === 403) {
            this.snackBar.open('Nie masz uprawnień do usunięcia tego zdjęcia', 'Zamknij', {
              duration: 5000
            });
          } else {
            this.snackBar.open('Wystąpił błąd podczas usuwania zdjęcia', 'Zamknij', {
              duration: 5000
            });
          }
        }
      });
    } else {
      // Usuwanie nowego zdjęcia
      const newIndex = index - this.existingImageUrls.length;
      this.selectedImages.splice(newIndex, 1);
      this.previewUrls.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.observationForm.valid && this.selectedLocation) {
      this.isSubmitting = true;

      const updateData: UpdateBirdObservation = {
        latitude: parseFloat(this.selectedLocation.lat.toFixed(4)),
        longitude: parseFloat(this.selectedLocation.lng.toFixed(4)),
        observationDate: this.observationForm.get('observationDate')?.value,
        description: this.observationForm.get('description')?.value,
        numberOfBirds: parseInt(this.observationForm.get('numberOfBirds')?.value),
        weatherConditions: this.observationForm.get('weatherConditions')?.value,
        habitat: this.observationForm.get('habitat')?.value,
        images: this.selectedImages
      };

      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        this.router.navigate(['/observations']);
        return;
      }

      const observationId = parseInt(id);
      if (isNaN(observationId)) {
        this.snackBar.open('Nieprawidłowy identyfikator obserwacji', 'Zamknij', {
          duration: 5000
        });
        this.router.navigate(['/observations']);
        return;
      }

      this.observationService.updateObservation(observationId, updateData).subscribe({
        next: () => {
          this.snackBar.open('Obserwacja została zaktualizowana', 'Zamknij', {
            duration: 5000
          });
          this.router.navigate(['/observations', id]);
        },
        error: (error) => {
          console.error('Błąd podczas aktualizacji obserwacji:', error);
          if (error.status === 403) {
            this.snackBar.open('Nie masz uprawnień do edycji tej obserwacji', 'Zamknij', {
              duration: 5000
            });
          } else {
            this.snackBar.open('Wystąpił błąd podczas aktualizacji obserwacji', 'Zamknij', {
              duration: 5000
            });
          }
          this.isSubmitting = false;
        }
      });
    } else {
      this.snackBar.open('Proszę wypełnić wszystkie wymagane pola i wybrać lokalizację', 'Zamknij', {
        duration: 5000
      });
    }
  }

  onCancel(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/observations', id]);
  }
}
