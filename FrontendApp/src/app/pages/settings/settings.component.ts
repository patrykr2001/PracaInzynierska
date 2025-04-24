import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  submitted = false;
  passwordSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.settingsForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.loadUserSettings();
  }

  loadUserSettings(): void {
    this.isLoading = true;
    this.userService.getUserSettings()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (user) => {
          this.settingsForm.patchValue({
            username: user.username,
            email: user.email
          });
        },
        error: (error) => {
          this.snackBar.open('Nie udało się załadować ustawień użytkownika', 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.settingsForm.valid) {
      const result = confirm('Czy na pewno chcesz zapisać zmiany?');
      
      if (result) {
        this.isLoading = true;
        this.userService.updateUserSettings(this.settingsForm.value)
          .pipe(finalize(() => {
            this.isLoading = false;
            this.submitted = false;
          }))
          .subscribe({
            next: (user) => {
              this.snackBar.open('Ustawienia zostały zapisane', 'OK', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.userService.setCurrentUser(user);
            },
            error: (error) => {
              this.snackBar.open('Nie udało się zapisać ustawień', 'OK', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    }
  }

  onChangePassword(): void {
    this.passwordSubmitted = true;
    
    if (this.passwordForm.valid) {
      const result = confirm('Czy na pewno chcesz zmienić hasło?');
      
      if (result) {
        this.isLoading = true;
        this.userService.updateUserSettings({
          ...this.settingsForm.value,
          ...this.passwordForm.value
        })
          .pipe(finalize(() => {
            this.isLoading = false;
            this.passwordSubmitted = false;
            this.passwordForm.reset();
          }))
          .subscribe({
            next: (user) => {
              this.snackBar.open('Hasło zostało zmienione', 'OK', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.userService.setCurrentUser(user);
            },
            error: (error) => {
              this.snackBar.open('Nie udało się zmienić hasła', 'OK', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    }
  }

  resetForm(): void {
    const result = confirm('Czy na pewno chcesz zresetować formularz? Wszystkie niezapisane zmiany zostaną utracone.');
    if (result) {
      this.loadUserSettings();
      this.submitted = false;
      this.passwordForm.reset();
      this.passwordSubmitted = false;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.settingsForm.get(controlName);
    if (control?.hasError('required')) {
      return 'To pole jest wymagane';
    }
    if (control?.hasError('email')) {
      return 'Nieprawidłowy format adresu email';
    }
    if (control?.hasError('minlength')) {
      return `Minimalna długość to ${control.errors?.['minlength'].requiredLength} znaki`;
    }
    if (control?.hasError('maxlength')) {
      return `Maksymalna długość to ${control.errors?.['maxlength'].requiredLength} znaków`;
    }
    return '';
  }

  getPasswordErrorMessage(controlName: string): string {
    const control = this.passwordForm.get(controlName);
    if (control?.hasError('required')) {
      return 'To pole jest wymagane';
    }
    if (control?.hasError('minlength')) {
      return `Minimalna długość to ${control.errors?.['minlength'].requiredLength} znaki`;
    }
    if (controlName === 'confirmPassword' && this.passwordForm.hasError('mismatch')) {
      return 'Hasła nie są identyczne';
    }
    return '';
  }
}

export default SettingsComponent;
