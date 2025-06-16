import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { BirdObservation } from '../../models/bird-observation.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() initialLocation?: { lat: number; lng: number };
  @Input() initialZoom: number = 6;
  @Input() allowSelection: boolean = false;
  @Input() observations: BirdObservation[] = [];
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private observationMarkers: L.Marker[] = [];

  // Granice Polski z 10% marginesem
  private readonly POLAND_BOUNDS = L.latLngBounds(
    L.latLng(48.1, 12.6), // Południowo-zachodni róg
    L.latLng(55.0, 25.4)  // Północno-wschodni róg
  );

  // Domyślna ikona markera bez cienia
  private readonly defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: undefined,
    shadowSize: undefined,
    shadowAnchor: undefined
  });

  ngAfterViewInit(): void {
    // Opóźniamy inicjalizację mapy, aby upewnić się, że kontener jest widoczny
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['observations'] && this.map) {
      this.updateObservationMarkers();
    }
  }

  private updateObservationMarkers(): void {
    // Usuń stare markery
    this.observationMarkers.forEach(marker => this.map?.removeLayer(marker));
    this.observationMarkers = [];
    // Dodaj nowe markery
    if (this.observations && this.observations.length > 0) {
      this.observations.forEach(obs => {
        const marker = L.marker([obs.latitude, obs.longitude], { icon: this.defaultIcon })
          .bindPopup(`<b>${obs.birdCommonName}</b><br>${new Date(obs.observationDate).toLocaleDateString()}`);
        marker.addTo(this.map!);
        this.observationMarkers.push(marker);
      });
    }
  }

  private initMap(): void {
    // Sprawdzamy, czy mapa już istnieje
    if (this.map) {
      this.map.remove();
    }

    // Domyślna lokalizacja (centrum Polski)
    const defaultLocation = { lat: 51.9194, lng: 19.1451 };
    const initialLocation = this.initialLocation || defaultLocation;

    // Inicjalizacja mapy
    this.map = L.map('map', {
      maxBounds: this.POLAND_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 6,
      maxZoom: 18
    }).setView([initialLocation.lat, initialLocation.lng], this.initialZoom);

    // Dodanie warstwy OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Ograniczenie widoku do granic Polski
    this.map.setMaxBounds(this.POLAND_BOUNDS);

    // Dodanie początkowego markera tylko jeśli przekazano initialLocation
    if (this.initialLocation) {
      this.marker = L.marker([this.initialLocation.lat, this.initialLocation.lng], { icon: this.defaultIcon }).addTo(this.map);
    }

    // Dodanie obsługi kliknięcia na mapę tylko jeśli allowSelection jest true
    if (this.allowSelection) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Usunięcie poprzedniego markera
        if (this.marker) {
          this.map?.removeLayer(this.marker);
        }

        // Dodanie nowego markera
        this.marker = L.marker([lat, lng], { icon: this.defaultIcon }).addTo(this.map!);

        // Emisja wybranej lokalizacji
        this.locationSelected.emit({ lat, lng });
      });
    }

    // Dodanie markerów obserwacji po inicjalizacji mapy
    this.updateObservationMarkers();

    // Odświeżenie mapy po załadowaniu
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }
}
