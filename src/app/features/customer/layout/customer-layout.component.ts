import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  template: `
    <div class="customer-site">
      <!-- Top Announcement Bar -->
      <div class="top-announcement">
        <div class="announcement-content">
          <span>🌟 <strong>Dada Boudi Restaurant</strong> — Legendary Biryani Since 1958 in Barrackpore</span>
          <span class="hours-badge">🕒 Open Today: 11:00 AM – 11:00 PM</span>
        </div>
      </div>

      <!-- Main Navigation Header -->
      <header class="customer-header">
        <div class="header-inner">
          <!-- Brand -->
          <a routerLink="/" class="brand-link" (click)="closeMobileMenu()">
            <div class="brand-crest">
              <span class="crest-icon">🍲</span>
            </div>
            <div class="brand-info">
              <span class="restaurant-title">{{ restaurantName }}</span>
              <span class="restaurant-loc">Barrackpore • Kolkata</span>
            </div>
          </a>

          <!-- Desktop Navigation -->
          <nav class="desktop-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">Home</a>
            <a routerLink="/menu" routerLinkActive="active" class="nav-item">Menu</a>
            <a routerLink="/restaurant" routerLinkActive="active" class="nav-item">About & Location</a>
            <a routerLink="/book-table" routerLinkActive="active" class="nav-item">Book a Table</a>
            <a *ngIf="authService.isAuthenticated()" routerLink="/my-bookings" routerLinkActive="active" class="nav-item">My Bookings</a>
          </nav>

          <!-- Right Action Area -->
          <div class="header-actions">
            <!-- Theme Toggle -->
            <button
              type="button"
              class="icon-btn"
              (click)="themeService.toggleTheme()"
              [title]="themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode'">
              <span>{{ themeService.isDarkMode() ? '☀️' : '🌙' }}</span>
            </button>

            <!-- Book Table CTA (Desktop) -->
            <a routerLink="/book-table" class="btn-book-cta hide-mobile">
              <span>📅</span>
              <span>Reserve Table</span>
            </a>

            <!-- Auth Profile / Login Button -->
            <div *ngIf="authService.isAuthenticated(); else loginBtn" class="user-pill-wrap">
              <button type="button" class="user-menu-btn" (click)="isUserDropdownOpen.set(!isUserDropdownOpen())">
                <img
                  *ngIf="authService.currentUser()?.photoURL; else defaultAvatar"
                  [src]="authService.currentUser()?.photoURL"
                  alt="Profile"
                  class="user-avatar" />
                <ng-template #defaultAvatar>
                  <div class="user-avatar-initials">
                    {{ (authService.currentUser()?.displayName || 'C').substring(0, 2).toUpperCase() }}
                  </div>
                </ng-template>
                <span class="user-name-text hide-mobile">{{ authService.currentUser()?.displayName }}</span>
                <span class="caret">▼</span>
              </button>

              <!-- Profile Dropdown -->
              <div *ngIf="isUserDropdownOpen()" class="user-dropdown-card">
                <div class="dropdown-header">
                  <strong>{{ authService.currentUser()?.displayName }}</strong>
                  <span class="user-email-text">{{ authService.currentUser()?.email || 'Customer' }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <a routerLink="/my-bookings" class="dropdown-link" (click)="isUserDropdownOpen.set(false)">
                  <span>📋</span> My Reservations
                </a>
                <a routerLink="/book-table" class="dropdown-link" (click)="isUserDropdownOpen.set(false)">
                  <span>🍽️</span> New Booking
                </a>
                <div class="dropdown-divider"></div>
                <button type="button" class="dropdown-link text-danger" (click)="onSignOut()">
                  <span>🚪</span> Sign Out
                </button>
              </div>
            </div>

            <ng-template #loginBtn>
              <a routerLink="/login" class="btn-login">
                <svg class="google-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign In</span>
              </a>
            </ng-template>

            <!-- Mobile Hamburger Toggle -->
            <button
              type="button"
              class="mobile-menu-btn"
              (click)="isMobileDrawerOpen.set(true)"
              aria-label="Open menu">
              ☰
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Navigation Drawer -->
      <div
        class="mobile-backdrop"
        *ngIf="isMobileDrawerOpen()"
        (click)="isMobileDrawerOpen.set(false)"></div>

      <aside class="mobile-drawer" [class.open]="isMobileDrawerOpen()">
        <div class="drawer-header">
          <div class="brand-crest">
            <span class="crest-icon">🍲</span>
          </div>
          <div class="drawer-brand">
            <strong>{{ restaurantName }}</strong>
            <span>Barrackpore, Kolkata</span>
          </div>
          <button type="button" class="drawer-close" (click)="isMobileDrawerOpen.set(false)">✕</button>
        </div>

        <nav class="drawer-nav">
          <a routerLink="/" (click)="closeMobileMenu()" class="drawer-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <span>🏠</span> Home
          </a>
          <a routerLink="/book-table" (click)="closeMobileMenu()" class="drawer-link cta-highlight" routerLinkActive="active">
            <span>📅</span> Book a Table
          </a>
          <a routerLink="/menu" (click)="closeMobileMenu()" class="drawer-link" routerLinkActive="active">
            <span>📖</span> Signature Menu
          </a>
          <a routerLink="/restaurant" (click)="closeMobileMenu()" class="drawer-link" routerLinkActive="active">
            <span>🏛️</span> About & Location
          </a>
          <a *ngIf="authService.isAuthenticated()" routerLink="/my-bookings" (click)="closeMobileMenu()" class="drawer-link" routerLinkActive="active">
            <span>📋</span> My Reservations
          </a>
        </nav>

        <div class="drawer-divider"></div>

        <!-- Quick Switch to Staff / Admin for Laptop/Testing -->
        <div class="drawer-admin-section">
          <span class="drawer-section-title">Portals</span>
          <a routerLink="/dashboard" (click)="closeMobileMenu()" class="drawer-sublink">
            <span>💻</span> Admin Dashboard (Laptop View)
          </a>
          <a routerLink="/staff/dashboard" (click)="closeMobileMenu()" class="drawer-sublink">
            <span>🧑‍🍳</span> Staff & Host Floor View
          </a>
        </div>

        <div class="drawer-footer">
          <div *ngIf="authService.isAuthenticated(); else drawerLogin" class="drawer-user-info">
            <p>Signed in as <strong>{{ authService.currentUser()?.displayName }}</strong></p>
            <button type="button" class="btn-drawer-signout" (click)="onSignOut()">Sign Out</button>
          </div>
          <ng-template #drawerLogin>
            <a routerLink="/login" (click)="closeMobileMenu()" class="btn-drawer-login">
              <span>Sign in with Google</span>
            </a>
          </ng-template>
        </div>
      </aside>

      <!-- Main Page Outlet -->
      <main class="customer-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Sticky Bottom Navigation -->
      <nav class="mobile-bottom-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="bottom-nav-item">
          <span class="b-icon">🏠</span>
          <span class="b-label">Home</span>
        </a>
        <a routerLink="/menu" routerLinkActive="active" class="bottom-nav-item">
          <span class="b-icon">🍲</span>
          <span class="b-label">Menu</span>
        </a>
        <a routerLink="/book-table" routerLinkActive="active" class="bottom-nav-item book-now-item">
          <span class="b-icon-main">📅</span>
          <span class="b-label-main">Book Table</span>
        </a>
        <a routerLink="/my-bookings" routerLinkActive="active" class="bottom-nav-item">
          <span class="b-icon">📋</span>
          <span class="b-label">Bookings</span>
        </a>
        <a routerLink="/restaurant" routerLinkActive="active" class="bottom-nav-item">
          <span class="b-icon">📍</span>
          <span class="b-label">Location</span>
        </a>
      </nav>

      <!-- Customer Website Footer -->
      <footer class="customer-footer">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <div class="footer-logo-row">
              <span class="f-crest">🍲</span>
              <h3>{{ restaurantName }}</h3>
            </div>
            <p class="footer-tagline">
              Serving the most beloved Kolkata-style Mutton Biryani, succulent Chaap, and Royal Mughlai delicacies to food connoisseurs since 1958.
            </p>
            <div class="footer-badges">
              <span class="f-badge">⭐ 4.8 / 5 Rating</span>
              <span class="f-badge">🏆 Barrackpore's Pride</span>
            </div>
          </div>

          <div class="footer-col">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/book-table">Reserve a Table</a></li>
              <li><a routerLink="/menu">Our Biryani & Menu</a></li>
              <li><a routerLink="/restaurant">Restaurant Story</a></li>
              <li><a routerLink="/my-bookings">Manage My Bookings</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Visit & Contact</h4>
            <p class="f-contact-line">📍 1, Ghoshpara Road, Near Barrackpore Railway Station, Barrackpore, West Bengal 700120</p>
            <p class="f-contact-line">📞 +91 98300 12345</p>
            <p class="f-contact-line">🕒 Open Daily: 11:00 AM – 11:00 PM</p>
            <p class="f-contact-line">✉️ reservations&#64;dadaboudirestaurant.in</p>
          </div>

          <div class="footer-col">
            <h4>Staff & System</h4>
            <p class="f-subtext">Access operational controls on your desktop or staff tablet:</p>
            <div class="portal-links">
              <a routerLink="/dashboard" class="portal-badge">💻 Admin Dashboard</a>
              <a routerLink="/staff/dashboard" class="portal-badge">🧑‍🍳 Staff / Host Interface</a>
            </div>
            <div class="demo-sync-pill">
              <span class="sync-dot"></span> Real-Time Synchronized
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 Dada Boudi Restaurant, Barrackpore. DineFlow Smart Reservation System.</p>
          <div class="footer-sublinks">
            <a routerLink="/restaurant">Booking Policy</a>
            <span>•</span>
            <a routerLink="/restaurant">Privacy & Security</a>
          </div>
        </div>
      </footer>

      <!-- Global Reactive Toasts -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .customer-site {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-app);
      color: var(--text-main);
      font-family: var(--font-sans);
      padding-bottom: 72px; /* space for mobile sticky bar */
    }
    @media (min-width: 769px) {
      .customer-site {
        padding-bottom: 0;
      }
    }

    /* Top announcement bar */
    .top-announcement {
      background: linear-gradient(90deg, #7c2d12, #9a3412, #ea580c);
      color: #fff;
      font-size: 0.78rem;
      padding: 6px 1rem;
      text-align: center;
      position: relative;
      z-index: 50;
    }
    .announcement-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .hours-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
    }

    /* Customer Header */
    .customer-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-light);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow-sm);
    }
    .header-inner {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    /* Brand */
    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }
    .brand-crest {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f97316, #c2410c);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
    }
    .crest-icon {
      font-size: 1.35rem;
    }
    .brand-info {
      display: flex;
      flex-direction: column;
    }
    .restaurant-title {
      font-family: var(--font-brand);
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.15;
      letter-spacing: -0.01em;
    }
    .restaurant-loc {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--color-primary-600);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* Desktop Navigation */
    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    @media (max-width: 900px) {
      .desktop-nav {
        display: none;
      }
    }
    .nav-item {
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .nav-item:hover {
      background: var(--bg-surface-secondary);
      color: var(--text-main);
    }
    .nav-item.active {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      font-weight: 700;
    }
    html.dark .nav-item.active {
      background: rgba(234, 88, 12, 0.15);
      color: var(--color-primary-400);
    }

    /* Actions */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.15s ease;
    }
    .icon-btn:hover {
      background: var(--bg-surface-tertiary);
    }

    .btn-book-cta {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0.55rem 1.15rem;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
      color: #fff;
      font-weight: 700;
      font-size: 0.875rem;
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn-book-cta:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(234, 88, 12, 0.45);
    }

    .btn-login {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0.45rem 0.95rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-full);
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-main);
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-login:hover {
      background: var(--bg-surface-secondary);
      border-color: var(--color-primary-500);
    }

    /* User Profile Pill */
    .user-pill-wrap {
      position: relative;
    }
    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 3px 10px 3px 4px;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-full);
      cursor: pointer;
    }
    .user-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
    }
    .user-avatar-initials {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--color-primary-600);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .user-name-text {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
      max-width: 110px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .caret {
      font-size: 0.65rem;
      color: var(--text-muted);
    }
    .user-dropdown-card {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: 220px;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border-light);
      padding: 0.5rem;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    .dropdown-header {
      padding: 0.5rem 0.75rem;
    }
    .dropdown-header strong {
      display: block;
      font-size: 0.875rem;
      color: var(--text-main);
    }
    .user-email-text {
      font-size: 0.72rem;
      color: var(--text-muted);
      word-break: break-all;
    }
    .dropdown-divider {
      height: 1px;
      background: var(--border-light);
      margin: 0.35rem 0;
    }
    .dropdown-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
      width: 100%;
      text-align: left;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .dropdown-link:hover {
      background: var(--bg-surface-secondary);
      color: var(--text-main);
    }
    .text-danger {
      color: #ef4444;
    }
    .text-danger:hover {
      background: #fef2f2;
      color: #b91c1c;
    }

    /* Mobile hamburger */
    .mobile-menu-btn {
      display: none;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      cursor: pointer;
    }
    @media (max-width: 900px) {
      .mobile-menu-btn {
        display: flex;
      }
      .hide-mobile {
        display: none !important;
      }
    }

    /* Mobile Drawer */
    .mobile-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
    }
    .mobile-drawer {
      position: fixed;
      top: 0;
      left: -300px;
      bottom: 0;
      width: 280px;
      background: var(--bg-surface);
      z-index: 1001;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xl);
      transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
    }
    .mobile-drawer.open {
      left: 0;
    }
    .drawer-header {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border-light);
    }
    .drawer-brand {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .drawer-brand strong {
      font-size: 0.95rem;
      color: var(--text-main);
    }
    .drawer-brand span {
      font-size: 0.72rem;
      color: var(--color-primary-600);
      font-weight: 600;
    }
    .drawer-close {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid var(--border-light);
      background: var(--bg-surface-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .drawer-nav {
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .drawer-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.925rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .drawer-link:hover, .drawer-link.active {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
    }
    .drawer-link.cta-highlight {
      background: var(--color-primary-500);
      color: #fff;
      margin: 4px 0;
    }
    .drawer-divider {
      height: 1px;
      background: var(--border-light);
      margin: 0.5rem 1rem;
    }
    .drawer-admin-section {
      padding: 0.5rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .drawer-section-title {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.25rem 0.75rem;
    }
    .drawer-sublink {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0.6rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
    }
    .drawer-sublink:hover {
      background: var(--bg-surface-secondary);
      color: var(--text-main);
    }
    .drawer-footer {
      margin-top: auto;
      padding: 1.25rem;
      border-top: 1px solid var(--border-light);
    }
    .btn-drawer-signout {
      width: 100%;
      padding: 0.55rem;
      margin-top: 8px;
      border-radius: var(--radius-md);
      border: 1px solid #fecaca;
      background: #fef2f2;
      color: #b91c1c;
      font-weight: 700;
      font-size: 0.8125rem;
      cursor: pointer;
    }
    .btn-drawer-login {
      display: block;
      width: 100%;
      text-align: center;
      padding: 0.75rem;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
      color: #fff;
      font-weight: 700;
      border-radius: var(--radius-md);
      text-decoration: none;
    }

    /* Main Container */
    .customer-main {
      flex: 1;
      width: 100%;
    }

    /* Mobile Sticky Bottom Navigation (<768px) */
    .mobile-bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 62px;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-light);
      z-index: 999;
      box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
      backdrop-filter: blur(10px);
    }
    @media (max-width: 768px) {
      .mobile-bottom-nav {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0 4px;
      }
    }
    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      height: 100%;
      text-decoration: none;
      color: var(--text-muted);
      transition: color 0.15s ease;
    }
    .bottom-nav-item.active {
      color: var(--color-primary-600);
    }
    .b-icon {
      font-size: 1.25rem;
      line-height: 1;
      margin-bottom: 2px;
    }
    .b-label {
      font-size: 0.68rem;
      font-weight: 600;
    }
    .book-now-item {
      position: relative;
      top: -12px;
    }
    .b-icon-main {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      box-shadow: 0 4px 14px rgba(234, 88, 12, 0.45);
      border: 3px solid var(--bg-surface);
    }
    .b-label-main {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--color-primary-600);
      margin-top: 2px;
    }

    /* Customer Footer */
    .customer-footer {
      background: #111827;
      color: #e5e7eb;
      padding: 3.5rem 1.5rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .footer-grid {
      max-width: 1250px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1.2fr 1fr;
      gap: 2.5rem;
      margin-bottom: 3rem;
    }
    @media (max-width: 900px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
    }
    @media (max-width: 600px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }
    }
    .footer-col h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1.25rem;
      font-family: var(--font-brand);
      letter-spacing: 0.02em;
    }
    .footer-logo-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1rem;
    }
    .f-crest {
      font-size: 1.75rem;
    }
    .footer-logo-row h3 {
      font-family: var(--font-brand);
      font-size: 1.35rem;
      font-weight: 800;
      color: #fff;
    }
    .footer-tagline {
      font-size: 0.85rem;
      color: #9ca3af;
      line-height: 1.55;
      margin-bottom: 1.25rem;
    }
    .footer-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .f-badge {
      background: rgba(234, 88, 12, 0.2);
      color: #fdba74;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid rgba(234, 88, 12, 0.4);
    }
    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .footer-links a {
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.15s ease;
    }
    .footer-links a:hover {
      color: #fb923c;
    }
    .f-contact-line {
      font-size: 0.825rem;
      color: #9ca3af;
      line-height: 1.55;
      margin-bottom: 8px;
    }
    .f-subtext {
      font-size: 0.8rem;
      color: #9ca3af;
      margin-bottom: 10px;
    }
    .portal-links {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }
    .portal-badge {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.12);
      transition: all 0.15s ease;
    }
    .portal-badge:hover {
      background: rgba(234, 88, 12, 0.25);
      border-color: #f97316;
    }
    .demo-sync-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #34d399;
      background: rgba(16, 185, 129, 0.15);
      padding: 3px 10px;
      border-radius: 999px;
    }
    .sync-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      animation: pulseDot 2s infinite;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .footer-bottom {
      max-width: 1250px;
      margin: 0 auto;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.78rem;
      color: #6b7280;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-sublinks {
      display: flex;
      gap: 8px;
    }
    .footer-sublinks a {
      color: #6b7280;
      text-decoration: none;
    }
    .footer-sublinks a:hover {
      color: #9ca3af;
    }
  `]
})
export class CustomerLayoutComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  restaurantName = environment.restaurant.name;
  isMobileDrawerOpen = signal<boolean>(false);
  isUserDropdownOpen = signal<boolean>(false);

  closeMobileMenu(): void {
    this.isMobileDrawerOpen.set(false);
  }

  onSignOut(): void {
    this.isUserDropdownOpen.set(false);
    this.isMobileDrawerOpen.set(false);
    this.authService.signOut();
  }
}
