import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Backdrop -->
    <div
      class="mobile-backdrop"
      *ngIf="isMobileOpen"
      (click)="closeMobile.emit()"></div>

    <aside
      class="sidebar"
      [class.is-collapsed]="isCollapsed"
      [class.is-mobile-open]="isMobileOpen">

      <!-- Brand Header -->
      <div class="sidebar-header">
        <div class="brand-group">
          <div class="brand-logo">
            <span class="logo-flame">🍽️</span>
          </div>
          <div class="brand-text" *ngIf="!isCollapsed">
            <h1 class="brand-name" [title]="restaurantService.restaurantName()">{{ restaurantService.restaurantName() }}</h1>
            <span class="brand-tag">Management Suite</span>
          </div>
        </div>

        <button
          type="button"
          class="btn-collapse"
          (click)="toggleCollapse.emit()"
          [title]="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'">
          <span class="collapse-arrow">{{ isCollapsed ? '→' : '←' }}</span>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div class="nav-section-title" *ngIf="!isCollapsed">Management</div>

        <ul class="nav-list">
          <li>
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              (click)="closeMobile.emit()"
              class="nav-link"
              [title]="isCollapsed ? 'Dashboard' : ''">
              <span class="nav-icon">📊</span>
              <span class="nav-label" *ngIf="!isCollapsed">Dashboard</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/tables"
              routerLinkActive="active"
              (click)="closeMobile.emit()"
              class="nav-link"
              [title]="isCollapsed ? 'Table Layout' : ''">
              <span class="nav-icon">🗺️</span>
              <span class="nav-label" *ngIf="!isCollapsed">Table Layout</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/reservations"
              routerLinkActive="active"
              (click)="closeMobile.emit()"
              class="nav-link"
              [title]="isCollapsed ? 'Reservations' : ''">
              <span class="nav-icon">📅</span>
              <span class="nav-label" *ngIf="!isCollapsed">Reservations</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/customers"
              routerLinkActive="active"
              (click)="closeMobile.emit()"
              class="nav-link"
              [title]="isCollapsed ? 'Customers' : ''">
              <span class="nav-icon">👥</span>
              <span class="nav-label" *ngIf="!isCollapsed">Customers</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/waitlist"
              routerLinkActive="active"
              (click)="closeMobile.emit()"
              class="nav-link"
              [title]="isCollapsed ? 'Waitlist' : ''">
              <span class="nav-icon">⏳</span>
              <span class="nav-label" *ngIf="!isCollapsed">Waitlist</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/analytics"
              routerLinkActive="active"
              (click)="closeMobile.emit()"
              class="nav-link"
              [title]="isCollapsed ? 'Analytics' : ''">
              <span class="nav-icon">📈</span>
              <span class="nav-label" *ngIf="!isCollapsed">Analytics</span>
            </a>
          </li>
        </ul>

        <div class="nav-section-title" *ngIf="!isCollapsed">System</div>
        <ul class="nav-list">
          <li>
            <a
              routerLink="/settings"
              routerLinkActive="active"
              (click)="closeMobile.emit()"
              class="nav-link"
              [title]="isCollapsed ? 'Settings' : ''">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label" *ngIf="!isCollapsed">Settings</span>
            </a>
          </li>
        </ul>

        <div class="nav-section-title" *ngIf="!isCollapsed">Portals</div>
        <ul class="nav-list">
          <li>
            <a
              routerLink="/"
              (click)="closeMobile.emit()"
              class="nav-link"
              [title]="isCollapsed ? 'Customer Site' : ''">
              <span class="nav-icon">📱</span>
              <span class="nav-label" *ngIf="!isCollapsed">Customer Site</span>
            </a>
          </li>
          <li>
            <a
              routerLink="/staff/dashboard"
              routerLinkActive="active"
              (click)="closeMobile.emit()"
              class="nav-link"
              [title]="isCollapsed ? 'Staff Station' : ''">
              <span class="nav-icon">🧑‍🍳</span>
              <span class="nav-label" *ngIf="!isCollapsed">Staff Station</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer / User Mini Profile -->
      <div class="sidebar-footer">
        <div class="user-pill" [class.is-compact]="isCollapsed">
          <div class="avatar">AD</div>
          <div class="user-details" *ngIf="!isCollapsed">
            <span class="user-name">Aditi Roy</span>
            <span class="user-role">General Manager</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      z-index: 100;
      transition: width var(--transition-normal);
      flex-shrink: 0;
    }
    .sidebar.is-collapsed {
      width: var(--sidebar-collapsed-width);
    }
    .sidebar-header {
      height: var(--topbar-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px var(--color-primary-glow);
    }
    .logo-flame {
      font-size: 1.2rem;
    }
    .brand-name {
      font-family: var(--font-brand);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .brand-tag {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--color-primary-600);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .btn-collapse {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      border: 1px solid var(--border-light);
      background: var(--bg-surface-secondary);
      font-size: 0.85rem;
      transition: all 0.15s ease;
    }
    .btn-collapse:hover {
      color: var(--text-main);
      border-color: var(--border-medium);
    }
    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.75rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .nav-section-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.5rem 0.75rem 0.25rem;
    }
    .nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 1rem;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.875rem;
      transition: all var(--transition-fast);
      position: relative;
    }
    .nav-link:hover {
      background: var(--bg-surface-tertiary);
      color: var(--text-main);
    }
    .nav-link.active {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      font-weight: 700;
    }
    html.dark .nav-link.active {
      background: rgba(234, 88, 12, 0.15);
      color: var(--color-primary-400);
    }
    .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      bottom: 8px;
      width: 4px;
      border-radius: 0 4px 4px 0;
      background: var(--color-primary-600);
    }
    .nav-icon {
      font-size: 1.15rem;
      flex-shrink: 0;
      width: 24px;
      display: flex;
      justify-content: center;
    }
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--border-subtle);
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0.5rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface-secondary);
    }
    .user-pill.is-compact {
      justify-content: center;
      padding: 0.35rem 0;
      background: transparent;
    }
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #475569;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .user-role {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .mobile-backdrop {
      display: none;
    }

    @media (max-width: 900px) {
      .sidebar {
        position: fixed;
        left: -100%;
        top: 0;
        bottom: 0;
        z-index: 2000;
        transition: left 0.3s ease;
      }
      .sidebar.is-mobile-open {
        left: 0;
      }
      .mobile-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.5);
        z-index: 1999;
      }
    }
  `]
})
export class SidebarComponent {
  restaurantService = inject(RestaurantService);

  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;

  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();
}
