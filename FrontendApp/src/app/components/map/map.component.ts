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

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Inicjalizacja mapy
    this.map = L.map('map').setView([52.2297, 21.0122], 6); // Warszawa jako punkt startowy

    // Dodanie warstwy OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Obsługa kliknięcia na mapę
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.addMarker(e.latlng);
    });
  }

  private addMarker(latlng: L.LatLng): void {
    if (!this.map) return;

    const marker = L.marker(latlng).addTo(this.map);
    this.markers.push(marker);

    // Dodanie popupu do markera
    marker.bindPopup('Nowa obserwacja ptaka').openPopup();
  }
}
