import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="topbar">
      <!-- Left: Mobile Hamburger & Status -->
      <div class="topbar-left">
        <button
          type="button"
          class="btn-icon btn-ghost mobile-menu-btn"
          (click)="toggleMobile.emit()"
          aria-label="Toggle navigation menu">
          ☰
        </button>

        <!-- Restaurant Live Status Pill -->
        <div class="restaurant-status-pill">
          <div class="status-indicator-box">
            <span class="live-dot pulse-dot"></span>
            <span class="status-title">Restaurant Open</span>
          </div>
          <span class="hours-text">11:00 AM – 11:00 PM</span>
        </div>
      </div>

      <!-- Center Search -->
      <div class="topbar-center">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="topbar-search"
            placeholder="Quick search tables, guests, bookings... (Press /)"
            (keyup.enter)="onSearch($event)" />
        </div>
      </div>

      <!-- Right Controls -->
      <div class="topbar-right">
        <!-- New Reservation CTA Button -->
        <button type="button" class="btn btn-primary topbar-cta" (click)="openNewReservation.emit()">
          <span>+</span>
          <span>New Reservation</span>
        </button>

        <!-- Dark/Light Theme Toggle -->
        <button
          type="button"
          class="btn-icon btn-ghost theme-btn"
          (click)="themeService.toggleTheme()"
          [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <span>{{ themeService.isDarkMode() ? '☀️' : '🌙' }}</span>
        </button>

        <!-- Notification Bell with Dropdown -->
        <div class="notif-wrapper">
          <button
            type="button"
            class="btn-icon btn-ghost notif-btn"
            (click)="toggleNotifications()"
            aria-label="Notifications">
            <span>🔔</span>
            <span *ngIf="notifService.unreadCount() > 0" class="notif-badge">
              {{ notifService.unreadCount() }}
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <div class="notif-dropdown card animate-fade-in" *ngIf="showNotifications">
            <div class="notif-header">
              <div class="notif-title-row">
                <h4>Notifications</h4>
                <span class="unread-pill">{{ notifService.unreadCount() }} New</span>
              </div>
              <button type="button" class="btn-text-sm" (click)="notifService.markAllAsRead()">
                Mark all read
              </button>
            </div>

            <div class="notif-list">
              @for (notif of notifService.notifications(); track notif.id) {
                <div class="notif-row" [class.unread]="!notif.read" (click)="onNotifClick(notif.id)">
                  <div class="notif-dot" *ngIf="!notif.read"></div>
                  <div class="notif-row-content">
                    <span class="notif-row-title">{{ notif.title }}</span>
                    <p class="notif-row-msg">{{ notif.message }}</p>
                    <span class="notif-row-time">{{ notif.time }}</span>
                  </div>
                </div>
              }
            </div>

            <div class="notif-footer">
              <span class="footer-hint">Live synced with floor actions</span>
            </div>
          </div>
        </div>

        <!-- User Profile Dropdown -->
        <div class="profile-wrapper">
          <button
            type="button"
            class="profile-btn"
            (click)="toggleProfile()"
            aria-label="User Profile Menu">
            <div class="avatar-ring">
              <div class="avatar-inner">AD</div>
            </div>
            <div class="profile-meta hide-mobile">
              <span class="user-display">Aditi Roy</span>
              <span class="role-display">Floor Manager</span>
            </div>
            <span class="dropdown-arrow">▼</span>
          </button>

          <!-- Profile Dropdown Menu -->
          <div class="profile-dropdown card animate-fade-in" *ngIf="showProfile">
            <div class="profile-head">
              <div class="avatar-large">AD</div>
              <div>
                <strong>Aditi Roy</strong>
                <p>aditi.roy&#64;dineflow.com</p>
              </div>
            </div>
            <div class="menu-divider"></div>
            <a routerLink="/" class="dropdown-item" (click)="showProfile = false">
              <span>📱</span> Customer Site (Mobile View)
            </a>
            <a routerLink="/staff/dashboard" class="dropdown-item" (click)="showProfile = false">
              <span>🧑‍🍳</span> Staff / Host Interface
            </a>
            <div class="menu-divider"></div>
            <a routerLink="/settings" class="dropdown-item" (click)="showProfile = false">
              <span>⚙️</span> System Settings
            </a>
            <a routerLink="/analytics" class="dropdown-item" (click)="showProfile = false">
              <span>📊</span> Shift Analytics
            </a>
            <div class="menu-divider"></div>
            <button type="button" class="dropdown-item text-danger" (click)="onLogout()">
              <span>🚪</span> Sign Out / Lock Register
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 90;
      backdrop-filter: blur(8px);
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mobile-menu-btn {
      display: none;
      font-size: 1.25rem;
    }
    .restaurant-status-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-full);
    }
    .status-indicator-box {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--status-available);
    }
    .status-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .hours-text {
      font-size: 0.75rem;
      color: var(--text-muted);
      border-left: 1px solid var(--border-medium);
      padding-left: 8px;
    }
    .topbar-center {
      flex: 1;
      max-width: 440px;
      margin: 0 1.5rem;
    }
    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      font-size: 0.85rem;
      color: var(--text-muted);
      pointer-events: none;
    }
    .topbar-search {
      width: 100%;
      padding: 0.5rem 1rem 0.5rem 2.25rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-full);
      font-size: 0.8125rem;
      color: var(--text-main);
      outline: none;
      transition: all var(--transition-fast);
    }
    .topbar-search:focus {
      background: var(--bg-surface);
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-glow);
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .topbar-cta {
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
    }
    .notif-wrapper, .profile-wrapper {
      position: relative;
    }
    .notif-btn {
      position: relative;
      font-size: 1.15rem;
    }
    .notif-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #ef4444;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .notif-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 10px);
      width: 340px;
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border-light);
      z-index: 1000;
      overflow: hidden;
    }
    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--border-light);
    }
    .notif-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .notif-title-row h4 {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .unread-pill {
      font-size: 0.68rem;
      font-weight: 700;
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      padding: 1px 6px;
      border-radius: var(--radius-full);
    }
    .btn-text-sm {
      font-size: 0.72rem;
      color: var(--color-primary-600);
      font-weight: 600;
    }
    .btn-text-sm:hover {
      text-decoration: underline;
    }
    .notif-list {
      max-height: 280px;
      overflow-y: auto;
    }
    .notif-row {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      gap: 10px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .notif-row:hover {
      background: var(--bg-surface-secondary);
    }
    .notif-row.unread {
      background: rgba(234, 88, 12, 0.04);
    }
    .notif-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-primary-600);
      margin-top: 6px;
      flex-shrink: 0;
    }
    .notif-row-content {
      flex: 1;
    }
    .notif-row-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-main);
      display: block;
    }
    .notif-row-msg {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.35;
      margin: 2px 0 4px;
    }
    .notif-row-time {
      font-size: 0.68rem;
      color: var(--text-muted);
    }
    .notif-footer {
      padding: 0.5rem 1rem;
      background: var(--bg-surface-secondary);
      text-align: center;
      border-top: 1px solid var(--border-subtle);
    }
    .footer-hint {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .profile-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: var(--radius-full);
      transition: background 0.15s ease;
    }
    .profile-btn:hover {
      background: var(--bg-surface-secondary);
    }
    .avatar-ring {
      padding: 2px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-500), #f59e0b);
    }
    .avatar-inner {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-surface);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .profile-meta {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .user-display {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.2;
    }
    .role-display {
      font-size: 0.68rem;
      color: var(--text-muted);
    }
    .dropdown-arrow {
      font-size: 0.65rem;
      color: var(--text-muted);
    }
    .profile-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 10px);
      width: 230px;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border-light);
      padding: 0.5rem;
      z-index: 1000;
    }
    .profile-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0.75rem;
    }
    .avatar-large {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--color-primary-600);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
    }
    .profile-head strong {
      display: block;
      font-size: 0.875rem;
      color: var(--text-main);
    }
    .profile-head p {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .menu-divider {
      height: 1px;
      background: var(--border-light);
      margin: 0.35rem 0;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
      width: 100%;
      text-align: left;
      transition: all 0.15s ease;
    }
    .dropdown-item:hover {
      background: var(--bg-surface-secondary);
      color: var(--text-main);
    }
    .text-danger {
      color: #ef4444;
    }
    .text-danger:hover {
      background: #fee2e2;
      color: #b91c1c;
    }

    @media (max-width: 900px) {
      .mobile-menu-btn {
        display: inline-flex;
      }
      .hours-text {
        display: none;
      }
      .topbar-center {
        display: none;
      }
    }
    @media (max-width: 640px) {
      .topbar-cta span:last-child {
        display: none;
      }
      .hide-mobile {
        display: none;
      }
    }
  `]
})
export class TopbarComponent {
  themeService = inject(ThemeService);
  notifService = inject(NotificationService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  @Output() toggleMobile = new EventEmitter<void>();
  @Output() openNewReservation = new EventEmitter<void>();

  showNotifications = false;
  showProfile = false;

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false;
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
  }

  onNotifClick(id: string): void {
    this.notifService.markAsRead(id);
  }

  onLogout(): void {
    this.showProfile = false;
    this.toastService.info('Session Locked', 'Returned to manager lock screen mode.');
  }

  onSearch(event: any): void {
    const val = event.target.value.trim();
    if (val) {
      this.router.navigate(['/reservations'], { queryParams: { q: val } });
    }
  }
}
