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
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      observationDate: ['', Validators.required],
      description: ['', Validators.required],
      numberOfBirds: [1, [Validators.required, Validators.min(1)]],
      weatherConditions: [''],
      habitat: ['']
    });
  }

  ngOnInit(): void {
    this.loadBirds();
  }

  loadBirds(): void {
    this.isLoading = true;
    this.birdService.getAllBirds({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.birds = response.items;
        this.isLoading = false;
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
    this.selectedLocation = location;
  }

  onSubmit(): void {
    if (this.observationForm.valid && this.selectedLocation) {
      this.isSubmitting = true;
      const observation: CreateBirdObservation = {
        ...this.observationForm.value,
        latitude: this.selectedLocation.lat,
        longitude: this.selectedLocation.lng
      };

      this.observationService.createObservation(observation).subscribe({
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
