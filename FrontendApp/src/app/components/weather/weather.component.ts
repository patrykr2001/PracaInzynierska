import { Component, OnInit } from '@angular/core';
import { WeatherService, WeatherForecast } from '../../services/weather.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  imports: [
    NgForOf
  ],
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  weatherData: WeatherForecast[] = [];

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.weatherService.getWeather().subscribe(data => {
      this.weatherData = data;
    });
  }
}
