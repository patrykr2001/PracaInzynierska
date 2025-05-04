import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';

export const routes: Routes = [
  { path: '', component: MapComponent },
  { 
    path: 'birds', 
    loadComponent: () => import('./pages/birds/birds.component').then(m => m.default)
  },
  { 
    path: 'observations', 
    loadComponent: () => import('./pages/observations/observations.component').then(m => m.default)
  },
  { 
    path: 'observations/add', 
    loadComponent: () => import('./pages/add-observation/add-observation.component').then(m => m.default)
  },
  { 
    path: 'observations/:id', 
    loadComponent: () => import('./pages/observation-details/observation-details.component').then(m => m.default)
  },
  { 
    path: 'observations/:id/edit',
    loadComponent: () => import('./pages/edit-observation/edit-observation.component').then(m => m.default)
  },
  { 
    path: 'birds/unverified', 
    loadComponent: () => import('./pages/birds/unverified-birds/unverified-birds.component').then(m => m.default)
  },
  { 
    path: 'birds/:id', 
    loadComponent: () => import('./pages/birds/bird-details/bird-details.component').then(m => m.default)
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
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.default)
  },
  { path: '**', redirectTo: '/birds' }
];
