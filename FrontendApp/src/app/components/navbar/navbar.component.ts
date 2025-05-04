import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnDestroy {
  navItems = [
    { path: '/', label: 'Mapa', icon: 'map' },
    { path: '/observations', label: 'Obserwacje', icon: 'location_on' },
    { path: '/birds', label: 'Ptaki', icon: 'pets' },
    { path: '/statistics', label: 'Statystyki', icon: 'bar_chart' }
  ];

  private userSubscription: Subscription;

  constructor(
    public userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.userSubscription = this.userService.currentUser$.subscribe();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        // W przypadku błędu i tak wylogowujemy użytkownika lokalnie
        this.router.navigate(['/']);
      }
    });
  }
}
