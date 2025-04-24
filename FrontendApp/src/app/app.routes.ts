import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';

export const routes: Routes = [
  { path: '', component: MapComponent },
  { 
    path: 'birds', 
    loadComponent: () => import('./pages/birds/birds.component').then(m => m.default)
  },
  { 
    path: 'statistics', 
    loadComponent: () => import('./pages/statistics/statistics.component').then(m => m.default)
  },
  { 
    path: 'add-observation', 
    loadComponent: () => import('./pages/add-observation/add-observation.component').then(m => m.default)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.default)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/register/register.component').then(m => m.default)
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
  },
  { path: '**', redirectTo: '' }
];
