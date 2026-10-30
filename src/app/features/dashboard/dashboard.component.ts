import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableService } from '../../core/services/table.service';
import { ReservationService } from '../../core/services/reservation.service';
import { WaitlistService } from '../../core/services/waitlist.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { TableCardComponent } from '../../shared/components/table-card/table-card.component';
import { TableDetailsDrawerComponent } from '../../shared/components/table-details-drawer/table-details-drawer.component';
import { NewReservationModalComponent } from '../../shared/components/new-reservation-modal/new-reservation-modal.component';
import { RestaurantTable } from '../../core/models/table.model';
import { Reservation } from '../../core/models/reservation.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    StatusBadgeComponent,
    TableCardComponent,
    TableDetailsDrawerComponent,
    NewReservationModalComponent
  ],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Dashboard Header -->
      <div class="page-header">
        <div class="header-intro">
          <div class="greeting-row">
            <h1 class="greeting-title">Good Evening, Admin 👋</h1>
            <span class="live-pulse-badge">
              <span class="pulse-dot"></span> Live Operations
            </span>
          </div>
          <p class="greeting-subtitle">
            {{ currentDateFormatted }} • Shift: Dinner Service (Peak Hours)
          </p>
        </div>

        <div class="header-actions">
          <button type="button" class="btn btn-secondary" routerLink="/tables">
            🗺️ Open Floor Plan
          </button>
          <button type="button" class="btn btn-primary" (click)="openReservationModal()">
            + Quick Reservation
          </button>
        </div>
      </div>

      <!-- 4 Main Dynamic Metric Cards -->
      <div class="metrics-grid">
        <app-stat-card
          title="Today's Reservations"
          [value]="resService.todayReservationsCount()"
          trend="12% from yesterday"
          [trendPositive]="true"
          subtitle="Target: 50 covers"
          iconColor="orange">
          <span icon>📅</span>
        </app-stat-card>

        <app-stat-card
          title="Confirmed Bookings"
          [value]="resService.confirmedCount()"
          trend="8% vs last week"
          [trendPositive]="true"
          subtitle="Active reservations"
          iconColor="green">
          <span icon>✅</span>
        </app-stat-card>

        <app-stat-card
          title="Available Tables"
          [value]="tableService.availableCount()"
          trend="Ready for walk-ins"
          [trendPositive]="true"
          subtitle="Out of {{ tableService.totalTables() }} total"
          iconColor="amber">
          <span icon>🪑</span>
        </app-stat-card>

        <app-stat-card
          title="Occupancy Rate"
          [value]="tableService.occupancyRate() + '%'"
          trend="Optimal throughput"
          [trendPositive]="true"
          subtitle="Dining & Reserved"
          iconColor="blue">
          <span icon>📊</span>
        </app-stat-card>
      </div>

      <!-- Live Restaurant Overview Bar -->
      <div class="overview-panel card">
        <div class="overview-header">
          <div class="overview-title-group">
            <h2 class="section-title">Live Restaurant Overview</h2>
            <span class="total-tables-pill">{{ tableService.totalTables() }} Tables Total</span>
          </div>
          <span class="status-sync-text">Auto-synchronized in real-time</span>
        </div>

        <!-- Visual Capacity Progress Bar -->
        <div class="progress-segmented">
          <div
            class="seg-item seg-available"
            [style.width.%]="(tableService.availableCount() / tableService.totalTables()) * 100"
            title="Available: {{ tableService.availableCount() }}">
          </div>
          <div
            class="seg-item seg-reserved"
            [style.width.%]="(tableService.reservedCount() / tableService.totalTables()) * 100"
            title="Reserved: {{ tableService.reservedCount() }}">
          </div>
          <div
            class="seg-item seg-occupied"
            [style.width.%]="(tableService.occupiedCount() / tableService.totalTables()) * 100"
            title="Occupied: {{ tableService.occupiedCount() }}">
          </div>
          <div
            class="seg-item seg-cleaning"
            [style.width.%]="(tableService.cleaningCount() / tableService.totalTables()) * 100"
            title="Cleaning: {{ tableService.cleaningCount() }}">
          </div>
        </div>

        <!-- Status Counter Pills -->
        <div class="status-pills-row">
          <div class="status-stat-chip">
            <span class="chip-dot dot-available"></span>
            <span class="chip-count">{{ tableService.availableCount() }}</span>
            <span class="chip-label">Available</span>
          </div>
          <div class="status-stat-chip">
            <span class="chip-dot dot-reserved"></span>
            <span class="chip-count">{{ tableService.reservedCount() }}</span>
            <span class="chip-label">Reserved</span>
          </div>
          <div class="status-stat-chip">
            <span class="chip-dot dot-occupied"></span>
            <span class="chip-count">{{ tableService.occupiedCount() }}</span>
            <span class="chip-label">Occupied</span>
          </div>
          <div class="status-stat-chip">
            <span class="chip-dot dot-cleaning"></span>
            <span class="chip-count">{{ tableService.cleaningCount() }}</span>
            <span class="chip-label">Cleaning</span>
          </div>
          <div class="status-stat-chip waitlist-chip" routerLink="/waitlist">
            <span class="chip-icon">⏳</span>
            <span class="chip-count">{{ waitlistService.waitingCount() }}</span>
            <span class="chip-label">Waitlist Queue</span>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Content Split: Live Floor Quick Preview + Today's Active Reservations -->
      <div class="dashboard-split">
        <!-- Left: Quick Floor Snapshot -->
        <div class="split-column floor-preview-card card">
          <div class="column-header">
            <div>
              <h3 class="column-title">Live Floor Snapshot</h3>
              <p class="column-sub">Click any table to open details or seat guests</p>
            </div>
            <a routerLink="/tables" class="link-action">Full Floor Plan →</a>
          </div>

          <div class="mini-floor-grid">
            @for (tbl of tableService.tables().slice(0, 12); track tbl.id) {
              <app-table-card
                [table]="tbl"
                [reservation]="getReservationForTable(tbl.id)"
                [compact]="true"
                (clicked)="onTableClicked($event)">
              </app-table-card>
            }
          </div>

          <div class="floor-preview-footer">
            <span>Showing primary dining tables (1–12)</span>
            <button type="button" class="btn btn-outline" routerLink="/tables">
              View All 24 Tables
            </button>
          </div>
        </div>

        <!-- Right: Real-time Bookings Feed -->
        <div class="split-column bookings-card card">
          <div class="column-header">
            <div>
              <h3 class="column-title">Today's Dinner Reservations</h3>
              <p class="column-sub">Real-time guest itinerary & seating</p>
            </div>
            <a routerLink="/reservations" class="link-action">View All ({{ resService.reservations().length }}) →</a>
          </div>

          <div class="bookings-list">
            @for (res of resService.todayReservations().slice(0, 6); track res.id) {
              <div class="booking-item">
                <div class="booking-time-col">
                  <span class="booking-time">{{ res.time }}</span>
                  <span class="booking-table-badge">{{ res.tableNumber }}</span>
                </div>

                <div class="booking-cust-col">
                  <div class="cust-title-line">
                    <span class="cust-name">{{ res.customerName }}</span>
                    <span class="party-tag">👥 {{ res.guests }}</span>
                  </div>
                  <span class="cust-phone">{{ res.phone }}</span>
                  <span *ngIf="res.specialRequest" class="cust-note">"{{ res.specialRequest }}"</span>
                </div>

                <div class="booking-status-col">
                  <app-status-badge [status]="res.status"></app-status-badge>
                  <div class="action-btn-row">
                    @if (res.status === 'confirmed') {
                      <button
                        type="button"
                        class="btn-tiny btn-primary"
                        (click)="resService.seatGuest(res.id)"
                        title="Seat guests now">
                        Seat
                      </button>
                    }
                    @if (res.status === 'confirmed' || res.status === 'pending') {
                      <button
                        type="button"
                        class="btn-tiny btn-ghost text-danger"
                        (click)="resService.cancelReservation(res.id)"
                        title="Cancel reservation">
                        Cancel
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Quick Action Shortcuts -->
          <div class="quick-actions-bar">
            <button type="button" class="action-shortcut" (click)="openReservationModal()">
              <span>📝</span>
              <span>New Reservation</span>
            </button>
            <button type="button" class="action-shortcut" routerLink="/waitlist">
              <span>⏳</span>
              <span>Add to Waitlist</span>
            </button>
            <button type="button" class="action-shortcut" routerLink="/customers">
              <span>👥</span>
              <span>Search Guests</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Details Drawer -->
      <app-table-details-drawer
        [isOpen]="isDrawerOpen"
        [table]="selectedTable"
        [reservation]="selectedReservation"
        (close)="isDrawerOpen = false"
        (bookReservation)="onBookTableFromDrawer($event)">
      </app-table-details-drawer>

      <!-- New Reservation Modal -->
      <app-new-reservation-modal
        [isOpen]="isResModalOpen"
        [preselectedTable]="modalPreselectedTable"
        (close)="isResModalOpen = false">
      </app-new-reservation-modal>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .greeting-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .greeting-title {
      font-family: var(--font-brand);
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .live-pulse-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #065f46;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 3px 10px;
      border-radius: var(--radius-full);
    }
    html.dark .live-pulse-badge {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
    .greeting-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }
    @media (max-width: 1024px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 580px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Overview Panel */
    .overview-panel {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .overview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .overview-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .total-tables-pill {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-primary-600);
      background: var(--color-primary-50);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    html.dark .total-tables-pill {
      background: rgba(234, 88, 12, 0.2);
      color: var(--color-primary-400);
    }
    .status-sync-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .progress-segmented {
      height: 10px;
      border-radius: var(--radius-full);
      overflow: hidden;
      display: flex;
      background: var(--bg-surface-tertiary);
    }
    .seg-item {
      height: 100%;
      transition: width 0.3s ease;
    }
    .seg-available { background: var(--status-available); }
    .seg-reserved { background: var(--status-reserved); }
    .seg-occupied { background: var(--status-occupied); }
    .seg-cleaning { background: var(--status-cleaning); }

    .status-pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }
    .status-stat-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0.375rem 0.875rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
    }
    .chip-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-available { background: var(--status-available); }
    .dot-reserved { background: var(--status-reserved); }
    .dot-occupied { background: var(--status-occupied); }
    .dot-cleaning { background: var(--status-cleaning); }
    .chip-count {
      font-weight: 800;
      color: var(--text-main);
    }
    .chip-label {
      color: var(--text-secondary);
    }
    .waitlist-chip {
      margin-left: auto;
      cursor: pointer;
      border-color: var(--color-primary-300);
      background: var(--color-primary-50);
    }
    html.dark .waitlist-chip {
      background: rgba(234, 88, 12, 0.15);
      border-color: rgba(234, 88, 12, 0.3);
    }

    /* Dashboard Split */
    .dashboard-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 1100px) {
      .dashboard-split {
        grid-template-columns: 1fr;
      }
    }
    .split-column {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }
    .column-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .column-sub {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .link-action {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-primary-600);
    }
    .link-action:hover {
      text-decoration: underline;
    }

    /* Mini Floor Grid */
    .mini-floor-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    @media (max-width: 600px) {
      .mini-floor-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .floor-preview-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Bookings feed */
    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
    }
    .booking-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.75rem 1rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      transition: background 0.15s ease;
    }
    .booking-item:hover {
      background: var(--bg-surface-tertiary);
    }
    .booking-time-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 58px;
    }
    .booking-time {
      font-weight: 800;
      font-size: 0.875rem;
      color: var(--color-primary-600);
    }
    .booking-table-badge {
      font-size: 0.7rem;
      font-weight: 700;
      background: var(--bg-surface);
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid var(--border-light);
      margin-top: 2px;
    }
    .booking-cust-col {
      flex: 1;
      min-width: 0;
    }
    .cust-title-line {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cust-name {
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .party-tag {
      font-size: 0.72rem;
      color: var(--text-secondary);
      font-weight: 600;
    }
    .cust-phone {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .cust-note {
      display: block;
      font-size: 0.72rem;
      color: var(--text-secondary);
      font-style: italic;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .booking-status-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .action-btn-row {
      display: flex;
      gap: 4px;
    }
    .btn-tiny {
      padding: 2px 8px;
      font-size: 0.7rem;
      font-weight: 700;
      border-radius: 4px;
    }
    .quick-actions-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }
    .action-shortcut {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0.625rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-main);
      transition: all 0.15s ease;
    }
    .action-shortcut:hover {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      border-color: var(--color-primary-300);
    }
    html.dark .action-shortcut:hover {
      background: rgba(234, 88, 12, 0.15);
      color: var(--color-primary-300);
    }
  `]
})
export class DashboardComponent {
  tableService = inject(TableService);
  resService = inject(ReservationService);
  waitlistService = inject(WaitlistService);

  isDrawerOpen = false;
  selectedTable?: RestaurantTable;
  selectedReservation?: Reservation;

  isResModalOpen = false;
  modalPreselectedTable?: RestaurantTable;

  get currentDateFormatted(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date().toLocaleDateString('en-US', options);
  }

  getReservationForTable(tableId: string): Reservation | undefined {
    return this.resService.getReservationForTable(tableId);
  }

  onTableClicked(table: RestaurantTable): void {
    this.selectedTable = table;
    this.selectedReservation = this.getReservationForTable(table.id);
    this.isDrawerOpen = true;
  }

  openReservationModal(): void {
    this.modalPreselectedTable = undefined;
    this.isResModalOpen = true;
  }

  onBookTableFromDrawer(table: RestaurantTable): void {
    this.isDrawerOpen = false;
    this.modalPreselectedTable = table;
    this.isResModalOpen = true;
  }
}
