import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ImageGalleryData {
  images: string[];
  startIndex: number;
}

@Component({
  selector: 'app-image-gallery-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './image-gallery-dialog.component.html',
  styleUrl: './image-gallery-dialog.component.scss'
})
export class ImageGalleryDialogComponent {
  currentIndex: number;

  constructor(
    public dialogRef: MatDialogRef<ImageGalleryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageGalleryData
  ) {
    this.currentIndex = data.startIndex;
  }

  nextImage(): void {
    if (this.currentIndex < this.data.images.length - 1) {
      this.currentIndex++;
    }
  }

  previousImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
