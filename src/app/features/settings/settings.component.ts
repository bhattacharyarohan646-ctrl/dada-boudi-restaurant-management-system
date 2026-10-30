import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { TableService } from '../../core/services/table.service';
import { ReservationService } from '../../core/services/reservation.service';
import { ToastService } from '../../core/services/toast.service';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page animate-fade-in">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Restaurant & System Settings</h1>
          <p class="page-subtitle">Configure operating hours, service shifts, notifications and environment data</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Section 1: Restaurant Operations -->
        <div class="settings-section card">
          <h3 class="section-heading">Restaurant Information & Operations</h3>
          <p class="section-desc">Set restaurant details, operational hours and floor turnover pacing</p>

          <div class="form-grid">
            <div class="form-group full-width">
              <label class="form-label">Restaurant Name</label>
              <input type="text" class="form-input" [(ngModel)]="restaurantNameInput" placeholder="Enter Restaurant Name" />
            </div>

            <div class="form-group">
              <label class="form-label">Opening Time</label>
              <input type="time" class="form-input" [(ngModel)]="openTime" />
            </div>

            <div class="form-group">
              <label class="form-label">Closing Time</label>
              <input type="time" class="form-input" [(ngModel)]="closeTime" />
            </div>

            <div class="form-group">
              <label class="form-label">Default Seating Turnover Duration (Minutes)</label>
              <select class="form-select" [(ngModel)]="turnoverMinutes">
                <option [value]="60">60 Minutes (Fast Casual)</option>
                <option [value]="90">90 Minutes (Standard Dining)</option>
                <option [value]="120">120 Minutes (Fine Dining / Chef Tasting)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Auto-Hold Reservation Window</label>
              <select class="form-select" [(ngModel)]="gracePeriod">
                <option [value]="15">15 Minutes Grace Period</option>
                <option [value]="20">20 Minutes Grace Period</option>
                <option [value]="30">30 Minutes Grace Period</option>
              </select>
            </div>
          </div>

          <div class="action-row">
            <button type="button" class="btn btn-primary" (click)="saveOperationalSettings()">
              Save Restaurant Details
            </button>
          </div>
        </div>

        <!-- Section 2: Appearance & Theme -->
        <div class="settings-section card">
          <h3 class="section-heading">Appearance & Display</h3>
          <p class="section-desc">Customize UI color mode for daytime hosts or dark dinner ambiance</p>

          <div class="theme-options-grid">
            <div
              class="theme-card"
              [class.active]="!themeService.isDarkMode()"
              (click)="setTheme(false)">
              <div class="theme-preview light-preview">
                <div class="p-nav"></div>
                <div class="p-body">
                  <div class="p-card"></div>
                  <div class="p-card"></div>
                </div>
              </div>
              <div class="theme-label">
                <span>☀️ Light Theme</span>
                <span class="subtext">Warm neutral canvas for day shifts</span>
              </div>
            </div>

            <div
              class="theme-card"
              [class.active]="themeService.isDarkMode()"
              (click)="setTheme(true)">
              <div class="theme-preview dark-preview">
                <div class="p-nav"></div>
                <div class="p-body">
                  <div class="p-card"></div>
                  <div class="p-card"></div>
                </div>
              </div>
              <div class="theme-label">
                <span>🌙 Dark Theme</span>
                <span class="subtext">Deep slate mode for evening dinner service</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Reset & Demo Playground -->
        <div class="settings-section card reset-section">
          <h3 class="section-heading">Demo Sandbox & Data Reset</h3>
          <p class="section-desc">
            Conveniently restore initial demo state for evaluators and test flows without reloading the app.
          </p>

          <div class="reset-actions-row">
            <button type="button" class="btn btn-secondary" (click)="resetTables()">
              🔄 Reset Tables to Initial 24
            </button>
            <button type="button" class="btn btn-secondary" (click)="resetReservations()">
              🔄 Reset All Reservations
            </button>
            <button type="button" class="btn btn-danger" (click)="resetEntireApp()">
              ⚠️ Reset Entire Mock Database
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title {
      font-family: var(--font-brand);
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 900px;
    }
    .settings-section {
      padding: 1.5rem;
    }
    .section-heading {
      font-family: var(--font-brand);
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .section-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-bottom: 1.25rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
    .action-row {
      margin-top: 1.25rem;
      display: flex;
      justify-content: flex-end;
    }
    .theme-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 600px) {
      .theme-options-grid {
        grid-template-columns: 1fr;
      }
    }
    .theme-card {
      border: 2px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1rem;
      cursor: pointer;
      background: var(--bg-surface-secondary);
      transition: all 0.2s ease;
    }
    .theme-card:hover {
      border-color: var(--color-primary-400);
    }
    .theme-card.active {
      border-color: var(--color-primary-600);
      box-shadow: 0 0 0 2px var(--color-primary-glow);
    }
    .theme-preview {
      height: 90px;
      border-radius: var(--radius-sm);
      padding: 8px;
      margin-bottom: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .light-preview {
      background: #fbfbfa;
      border: 1px solid #e2e8f0;
    }
    .light-preview .p-nav {
      height: 12px;
      background: #ffffff;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }
    .light-preview .p-body {
      display: flex;
      gap: 6px;
      flex: 1;
    }
    .light-preview .p-card {
      flex: 1;
      background: #ffffff;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }
    .dark-preview {
      background: #090d16;
      border: 1px solid #253348;
    }
    .dark-preview .p-nav {
      height: 12px;
      background: #111827;
      border-radius: 3px;
      border: 1px solid #253348;
    }
    .dark-preview .p-body {
      display: flex;
      gap: 6px;
      flex: 1;
    }
    .dark-preview .p-card {
      flex: 1;
      background: #131b2e;
      border-radius: 3px;
      border: 1px solid #253348;
    }
    .theme-label span {
      display: block;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .theme-label .subtext {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
      margin-top: 2px;
    }
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    .reset-section {
      border: 1px dashed var(--border-medium);
      background: var(--bg-surface-secondary);
    }
    .reset-actions-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
  `]
})
export class SettingsComponent {
  themeService = inject(ThemeService);
  restaurantService = inject(RestaurantService);
  private tableService = inject(TableService);
  private resService = inject(ReservationService);
  private toastService = inject(ToastService);

  restaurantNameInput = this.restaurantService.restaurantName();
  openTime = '11:00';
  closeTime = '23:00';
  turnoverMinutes = 90;
  gracePeriod = 15;

  saveOperationalSettings(): void {
    if (this.restaurantNameInput && this.restaurantNameInput.trim()) {
      this.restaurantService.updateRestaurantName(this.restaurantNameInput.trim());
    }
    this.toastService.success('Settings Saved', `Restaurant settings and operating hours saved successfully.`);
  }

  setTheme(isDark: boolean): void {
    this.themeService.isDarkMode.set(isDark);
  }

  resetTables(): void {
    this.tableService.resetToDefault();
  }

  resetReservations(): void {
    this.resService.resetToDefault();
  }

  resetEntireApp(): void {
    this.tableService.resetToDefault();
    this.resService.resetToDefault();
    this.toastService.success('System Reset', 'All tables, reservations and demo states have been refreshed.');
  }
}
