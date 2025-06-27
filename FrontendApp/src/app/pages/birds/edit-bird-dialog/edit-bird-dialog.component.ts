import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BirdService } from '../../../services/bird.service';
import { Bird } from '../../../models/bird.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-bird-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './edit-bird-dialog.component.html',
  styleUrl: './edit-bird-dialog.component.scss'
})
export class EditBirdDialogComponent {
  birdForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  baseUrl = environment.api.baseUrl;

  conservationStatuses = [
    { value: 'EX', label: 'Wymarły (EX)' },
    { value: 'EW', label: 'Wymarły na wolności (EW)' },
    { value: 'CR', label: 'Krytycznie zagrożony (CR)' },
    { value: 'EN', label: 'Zagrożony (EN)' },
    { value: 'VU', label: 'Narażony (VU)' },
    { value: 'NT', label: 'Bliski zagrożenia (NT)' },
    { value: 'LC', label: 'Najmniejszej troski (LC)' },
    { value: 'DD', label: 'Brak danych (DD)' },
    { value: 'NE', label: 'Nieoceniony (NE)' }
  ];

  constructor(
    private fb: FormBuilder,
    private birdService: BirdService,
    private dialogRef: MatDialogRef<EditBirdDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { bird: Bird }
  ) {
    this.birdForm = this.fb.group({
      scientificName: [data.bird.scientificName, [Validators.required, Validators.maxLength(100)]],
      commonName: [data.bird.commonName, [Validators.required, Validators.maxLength(100)]],
      family: [data.bird.family, [Validators.required, Validators.maxLength(100)]],
      order: [data.bird.order, [Validators.maxLength(100)]],
      genus: [data.bird.genus, [Validators.maxLength(100)]],
      species: [data.bird.species, [Validators.maxLength(100)]],
      conservationStatus: [data.bird.conservationStatus, Validators.required],
      description: [data.bird.description, [Validators.required, Validators.maxLength(1000)]],
      habitat: [data.bird.habitat, [Validators.maxLength(200)]],
      diet: [data.bird.diet, [Validators.maxLength(200)]],
      size: [data.bird.size, [Validators.maxLength(100)]],
      weight: [data.bird.weight],
      wingspan: [data.bird.wingspan],
      lifespan: [data.bird.lifespan, [Validators.maxLength(100)]],
      breedingSeason: [data.bird.breedingSeason, [Validators.maxLength(100)]]
    });

    if (data.bird.imageUrl) {
      this.imagePreview = this.baseUrl + data.bird.imageUrl;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Sprawdź typ pliku
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Wybierz plik obrazu (jpg, png, gif)';
        return;
      }

      // Sprawdź rozmiar pliku (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Plik jest za duży. Maksymalny rozmiar to 5MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      // Wyświetl podgląd
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.birdForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();

    // Dodaj nowe zdjęcie jeśli zostało wybrane
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    // Dodaj pozostałe pola formularza
    Object.keys(this.birdForm.value).forEach(key => {
      if (this.birdForm.value[key] !== null && this.birdForm.value[key] !== undefined) {
        formData.append(key, this.birdForm.value[key]);
      }
    });

    this.birdService.updateBird(this.data.bird.id, formData).subscribe({
      next: (bird) => {
        this.dialogRef.close(bird);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Wystąpił błąd podczas aktualizacji ptaka';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
