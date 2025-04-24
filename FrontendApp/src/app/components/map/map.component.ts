import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
  private map: L.Map | undefined;
  private markers: L.Marker[] = [];

  // Granice Polski z 10% marginesem
  private readonly POLAND_BOUNDS = L.latLngBounds(
    L.latLng(48.1, 12.6), // Południowo-zachodni róg (49.0 - 10% = 48.1, 14.0 - 10% = 12.6)
    L.latLng(55.0, 25.4)  // Północno-wschodni róg (54.5 + 10% = 55.0, 24.0 + 10% = 25.4)
  );

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Inicjalizacja mapy
    this.map = L.map('map', {
      maxBounds: this.POLAND_BOUNDS,
      maxBoundsViscosity: 1.0, // Pełne ograniczenie poza granicami
      minZoom: 6, // Minimalny zoom dla Polski
      maxZoom: 18
    }).setView([51.9194, 19.1451], 6); // Centrum Polski

    // Dodanie warstwy OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Ograniczenie widoku do granic Polski
    this.map.setMaxBounds(this.POLAND_BOUNDS);
  }
}
