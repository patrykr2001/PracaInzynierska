import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BirdService } from '../../services/bird.service';
import { Bird } from '../../models/bird.model';
import { AddBirdDialogComponent } from './add-bird-dialog/add-bird-dialog.component';

@Component({
  selector: 'app-birds',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './birds.component.html',
  styleUrl: './birds.component.scss'
})
export default class BirdsComponent implements OnInit {
  birds: Bird[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private birdService: BirdService,
    private dialog: MatDialog
  ) {}

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
}
