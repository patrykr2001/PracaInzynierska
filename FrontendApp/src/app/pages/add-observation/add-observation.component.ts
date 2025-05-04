import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { CreateBirdObservation } from '../../models/bird-observation.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MapComponent } from '../../components/map/map.component';
import { LocaleService } from '../../services/locale.service';

@Component({
  selector: 'app-add-observation',
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
  templateUrl: './add-observation.component.html',
  styleUrl: './add-observation.component.scss'
})
export default class AddObservationComponent implements OnInit {
  observationForm: FormGroup;
  birds: Bird[] = [];
  isLoading = true;
  isSubmitting = false;
  selectedLocation: { lat: number; lng: number } | null = null;
  dateFormat: string;
  today = new Date();
  selectedImages: File[] = [];
  previewUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private birdService: BirdService,
    private observationService: BirdObservationService,
    private router: Router,
    private snackBar: MatSnackBar,
    private localeService: LocaleService
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
    this.loadBirds();
    console.log('Stan formularza po inicjalizacji:', {
      valid: this.observationForm.valid,
      values: this.observationForm.value,
      errors: this.observationForm.errors
    });
  }

  loadBirds(): void {
    this.isLoading = true;
    this.birdService.getAllBirds({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.birds = response.items;
        this.isLoading = false;
        console.log('Stan formularza po załadowaniu ptaków:', {
          valid: this.observationForm.valid,
          values: this.observationForm.value,
          errors: this.observationForm.errors,
          birdsLoaded: this.birds.length
        });
      },
      error: (error) => {
        console.error('Błąd podczas ładowania ptaków:', error);
        this.snackBar.open('Wystąpił błąd podczas ładowania listy ptaków', 'Zamknij', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  onLocationSelected(location: { lat: number; lng: number }): void {
    // Formatowanie do 4 miejsc po przecinku
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
      
      // Generuj podglądy dla nowych obrazów
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
    this.selectedImages.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.observationForm.valid && this.selectedLocation) {
      this.isSubmitting = true;
      
      const formData = new FormData();
      formData.append('birdId', this.observationForm.get('birdId')?.value);
      
      // Formatowanie współrzędnych do 4 miejsc po przecinku
      const lat = this.selectedLocation.lat.toFixed(4);
      const lng = this.selectedLocation.lng.toFixed(4);
      
      formData.append('latitude', lat);
      formData.append('longitude', lng);
      
      formData.append('observationDate', this.observationForm.get('observationDate')?.value.toISOString());
      formData.append('description', this.observationForm.get('description')?.value);
      formData.append('numberOfBirds', this.observationForm.get('numberOfBirds')?.value);
      
      if (this.observationForm.get('weatherConditions')?.value) {
        formData.append('weatherConditions', this.observationForm.get('weatherConditions')?.value);
      }
      
      if (this.observationForm.get('habitat')?.value) {
        formData.append('habitat', this.observationForm.get('habitat')?.value);
      }

      if (this.selectedImages.length > 0) {
        this.selectedImages.forEach(image => {
          formData.append('images', image);
        });
      }

      this.observationService.createObservation(formData).subscribe({
        next: () => {
          this.snackBar.open('Obserwacja została dodana pomyślnie', 'Zamknij', {
            duration: 5000
          });
          this.router.navigate(['/observations']);
        },
        error: (error) => {
          console.error('Błąd podczas dodawania obserwacji:', error);
          this.snackBar.open('Wystąpił błąd podczas dodawania obserwacji', 'Zamknij', {
            duration: 5000
          });
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
    this.router.navigate(['/observations']);
  }
}
