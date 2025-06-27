import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MapComponent } from '../../components/map/map.component';
import { BirdObservationService } from '../../services/bird-observation.service';
import { BirdObservation } from '../../models/bird-observation.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ObservationWeek {
  start: string;
  end: string;
  count: number;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSliderModule, MatButtonToggleModule, MatSelectModule, MatIconModule, MatButtonModule, MapComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  weeks: ObservationWeek[] = [];
  selectedWeekIndex: number = 0;
  filteredObservations: BirdObservation[] = [];
  years: number[] = [];
  selectedYear: number | null = null;
  isDatePickerExpanded: boolean = false;

  constructor(private http: HttpClient, private observationService: BirdObservationService) {}

  ngOnInit(): void {
    this.fetchAvailableYears();
  }

  toggleDatePicker(): void {
    this.isDatePickerExpanded = !this.isDatePickerExpanded;
  }

  fetchAvailableYears() {
    this.observationService.getAllObservations({ pageNumber: 1, pageSize: 1000 }).subscribe({
      next: (response) => {
        const allYears = response.items.map(o => new Date(o.observationDate).getFullYear());
        this.years = Array.from(new Set(allYears)).sort((a, b) => a - b);
        this.selectedYear = this.years[this.years.length - 1];
        this.fetchWeeks();
      }
    });
  }

  fetchWeeks() {
    if (!this.selectedYear) return;
    this.http.get<ObservationWeek[]>(`${environment.api.baseUrl}/api/birdobservations/weeks?year=${this.selectedYear}`).subscribe(weeks => {
      this.weeks = weeks;
      this.selectedWeekIndex = this.weeks.length - 1;
      this.loadObservationsForWeek();
    });
  }

  onYearChange(year: number) {
    this.selectedYear = year;
    this.fetchWeeks();
  }

  onWeekChange(index: number) {
    this.selectedWeekIndex = index;
    this.loadObservationsForWeek();
  }

  loadObservationsForWeek() {
    const week = this.weeks[this.selectedWeekIndex];
    if (!week) {
      this.filteredObservations = [];
      return;
    }
    this.observationService.getAllObservations({
      pageNumber: 1,
      pageSize: 1000,
    }).subscribe({
      next: (response) => {
        this.filteredObservations = response.items.filter(o => {
          const date = new Date(o.observationDate);
          return date >= new Date(week.start) && date <= new Date(week.end);
        });
      }
    });
  }
}
