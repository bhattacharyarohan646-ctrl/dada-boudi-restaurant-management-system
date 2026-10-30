import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  template: `
    <div class="staff-layout">
      <!-- Staff Topbar -->
      <header class="staff-header">
        <div class="header-left">
          <div class="staff-badge">
            <span>🧑‍🍳 Floor Host Station</span>
          </div>
          <span class="restaurant-name">{{ restaurantName }}</span>
        </div>

        <nav class="staff-nav">
          <a routerLink="/staff/dashboard" routerLinkActive="active" class="staff-nav-item">
            <span>📊</span>
            <span>Shift Overview</span>
          </a>
          <a routerLink="/staff/arrivals" routerLinkActive="active" class="staff-nav-item">
            <span>🛎️</span>
            <span>Guest Arrivals</span>
          </a>
          <a routerLink="/staff/tables" routerLinkActive="active" class="staff-nav-item">
            <span>🗺️</span>
            <span>Table Turnover</span>
          </a>
        </nav>

        <div class="header-right">
          <button
            type="button"
            class="theme-toggle-btn"
            (click)="themeService.toggleTheme()"
            [title]="themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode'">
            {{ themeService.isDarkMode() ? '☀️' : '🌙' }}
          </button>

          <a routerLink="/dashboard" class="btn-portal-switch" title="Open Full Admin Dashboard">
            <span>💻</span>
            <span class="hide-mobile">Admin Suite</span>
          </a>

          <a routerLink="/" class="btn-customer-site" title="View Customer Website">
            <span>📱</span>
            <span class="hide-mobile">Customer View</span>
          </a>
        </div>
      </header>

      <!-- Main Content Outlet -->
      <main class="staff-content">
        <router-outlet></router-outlet>
      </main>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .staff-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-app);
      font-family: var(--font-sans);
    }
    .staff-header {
      height: 64px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-xs);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .staff-badge {
      background: #7c2d12;
      color: #fed7aa;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      letter-spacing: 0.03em;
    }
    .restaurant-name {
      font-family: var(--font-brand);
      font-weight: 800;
      font-size: 1rem;
      color: var(--text-main);
    }
    .staff-nav {
      display: flex;
      gap: 8px;
    }
    @media (max-width: 768px) {
      .staff-nav {
        display: none;
      }
      .hide-mobile {
        display: none !important;
      }
    }
    .staff-nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .staff-nav-item:hover {
      background: var(--bg-surface-secondary);
      color: var(--text-main);
    }
    .staff-nav-item.active {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
    }
    html.dark .staff-nav-item.active {
      background: rgba(234, 88, 12, 0.2);
      color: var(--color-primary-400);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .theme-toggle-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      cursor: pointer;
    }
    .btn-portal-switch, .btn-customer-site {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.45rem 0.85rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-portal-switch:hover, .btn-customer-site:hover {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      border-color: var(--color-primary-300);
    }

    .staff-content {
      flex: 1;
      padding: 1.5rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }
  `]
})
export class StaffLayoutComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  restaurantName = environment.restaurant.name;
}
