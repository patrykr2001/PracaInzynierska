import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BirdService } from '../../../services/bird.service';

@Component({
  selector: 'app-add-bird-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-bird-dialog.component.html',
  styleUrl: './add-bird-dialog.component.scss'
})
export class AddBirdDialogComponent {
  birdForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private birdService: BirdService,
    private dialogRef: MatDialogRef<AddBirdDialogComponent>
  ) {
    this.birdForm = this.fb.group({
      scientificName: ['', [Validators.required, Validators.maxLength(100)]],
      commonName: ['', [Validators.required, Validators.maxLength(100)]],
      family: ['', Validators.maxLength(100)],
      order: ['', Validators.maxLength(100)],
      conservationStatus: ['', Validators.maxLength(50)],
      description: ['']
    });
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

    if (!this.selectedFile) {
      this.errorMessage = 'Wybierz zdjęcie ptaka';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    
    // Dodaj pozostałe pola formularza
    Object.keys(this.birdForm.value).forEach(key => {
      formData.append(key, this.birdForm.value[key]);
    });

    this.birdService.createBird(formData).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Wystąpił błąd podczas dodawania ptaka';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 