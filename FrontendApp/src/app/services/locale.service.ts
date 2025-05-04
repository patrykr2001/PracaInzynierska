import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private readonly defaultLocale = 'pl-PL';

  constructor() { }

  getLocale(): string {
    return this.defaultLocale;
  }

  getDateFormat(): string {
    return 'longDate';
  }

  getDateTimeFormat(): string {
    return 'long';
  }

  getTimeFormat(): string {
    return 'shortTime';
  }
} 