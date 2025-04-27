import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { BirdService } from '../../services/bird.service';
import { Bird } from '../../models/bird.model';
import { AddBirdDialogComponent } from './add-bird-dialog/add-bird-dialog.component';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-birds',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './birds.component.html',
  styleUrl: './birds.component.scss'
})
export default class BirdsComponent implements OnInit {
  apiUrl = environment.apiUrl;
  birds: Bird[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor(
    private birdService: BirdService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchBirds(term);
    });
  }

  ngOnInit(): void {
    this.loadBirds();
  }

  loadBirds(): void {
    this.isLoading = true;
    this.birdService.getBirds().subscribe({
      next: (birds) => {
        this.birds = birds;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Wystąpił błąd podczas ładowania listy ptaków';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if(this.searchTerm.length > 2) {
      this.searchSubject.next(this.searchTerm);
    }
    else if(this.searchTerm.length == 0) {
      this.loadBirds();
    }
  }

  searchBirds(term: string): void {
    this.isLoading = true;
    this.birdService.searchBirds(term).subscribe({
      next: (birds) => {
        this.birds = birds;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Wystąpił błąd podczas wyszukiwania ptaków';
        this.isLoading = false;
      }
    });
  }

  openAddBirdDialog(): void {
    const dialogRef = this.dialog.open(AddBirdDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBirds();
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
