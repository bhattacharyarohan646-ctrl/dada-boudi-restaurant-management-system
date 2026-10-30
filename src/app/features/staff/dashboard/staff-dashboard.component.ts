import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { TableService } from '../../../core/services/table.service';
import { WaitlistService } from '../../../core/services/waitlist.service';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="staff-dashboard animate-fade-in">
      <!-- Top Title -->
      <div class="dash-title-row">
        <div>
          <h1 class="dash-title">Host Operations & Seating Desk</h1>
          <p class="dash-sub">Live synchronized floor activity • Shift: Dinner Service</p>
        </div>
        <a routerLink="/staff/arrivals" class="btn-primary-action">
          <span>🛎️</span>
          <span>View All Today's Arrivals ({{ resService.todayReservationsCount() }})</span>
        </a>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="m-label">Today's Total Bookings</span>
          <strong class="m-val">{{ resService.todayReservationsCount() }}</strong>
          <span class="m-sub">Covers scheduled for today</span>
        </div>
        <div class="metric-card highlight-green">
          <span class="m-label">Tables Available Now</span>
          <strong class="m-val">{{ tableService.availableCount() }}</strong>
          <span class="m-sub">Out of {{ tableService.totalTables() }} Total Tables</span>
        </div>
        <div class="metric-card highlight-blue">
          <span class="m-label">Currently Occupied</span>
          <strong class="m-val">{{ tableService.occupiedCount() }}</strong>
          <span class="m-sub">Floor Occupancy: {{ tableService.occupancyRate() }}%</span>
        </div>
        <div class="metric-card highlight-amber">
          <span class="m-label">Waiting in Queue</span>
          <strong class="m-val">{{ waitlistService.waitingCount() }}</strong>
          <span class="m-sub">Active Waitlist Entries</span>
        </div>
      </div>

      <!-- Main Layout: Upcoming Immediate Arrivals & Quick Tables Turnover -->
      <div class="split-grid">
        <!-- Next Arrivals List -->
        <div class="section-card">
          <div class="section-head">
            <h3>Immediate Upcoming Arrivals</h3>
            <a routerLink="/staff/arrivals" class="head-link">View Full Timeline →</a>
          </div>

          <div class="arrivals-list">
            @for (res of nextArrivals(); track res.id) {
              <div class="arrival-row" [class.seated]="res.status === 'seated'">
                <div class="time-col">
                  <strong>{{ res.time }}</strong>
                  <span>{{ res.guests }} Guests</span>
                </div>

                <div class="guest-col">
                  <div class="guest-name-row">
                    <strong>{{ res.customerName }}</strong>
                    <span class="res-ref">{{ res.referenceCode || res.id.substring(0, 8) }}</span>
                  </div>
                  <span class="guest-phone">📞 {{ res.phone }}</span>
                  <span class="guest-table">Assigned: <strong>Table {{ res.tableNumber }}</strong></span>
                </div>

                <div class="action-col">
                  <button
                    *ngIf="res.status !== 'seated'"
                    type="button"
                    class="btn-seat"
                    (click)="seatGuest(res.id)">
                    Seat Now
                  </button>
                  <span *ngIf="res.status === 'seated'" class="seated-badge">
                    ✓ Seated
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Tables Requiring Cleaning or Attention -->
        <div class="section-card">
          <div class="section-head">
            <h3>Cleaning & Turnover Needed</h3>
            <a routerLink="/staff/tables" class="head-link">Open Floor Map →</a>
          </div>

          <div class="tables-attention-list">
            @for (t of cleaningTables(); track t.id) {
              <div class="cleaning-row">
                <div class="t-badge">
                  <span>{{ t.tableNumber }}</span>
                </div>
                <div class="t-info">
                  <strong>Table {{ t.tableNumber }} ({{ t.zone }})</strong>
                  <span>Needs sanitization & resetting for next diner</span>
                </div>
                <button type="button" class="btn-clean-done" (click)="markAvailable(t.id)">
                  Mark Available
                </button>
              </div>
            }
            @if (cleaningTables().length === 0) {
              <div class="empty-cleaning">
                <span>✨ All tables clean and sanitized!</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .staff-dashboard {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .dash-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .dash-title {
      font-family: var(--font-brand);
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 2px;
    }
    .dash-sub {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0;
    }
    .btn-primary-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.55rem 1.15rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: var(--radius-md);
      text-decoration: none;
      box-shadow: 0 4px 10px var(--color-primary-glow);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .metric-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: var(--shadow-xs);
    }
    .m-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .m-val {
      font-family: var(--font-brand);
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.1;
    }
    .m-sub {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .highlight-green {
      border-left: 4px solid var(--status-available);
    }
    .highlight-blue {
      border-left: 4px solid var(--status-cleaning);
    }
    .highlight-amber {
      border-left: 4px solid var(--status-reserved);
    }

    .split-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .split-grid {
        grid-template-columns: 1fr;
      }
    }

    .section-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
    }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 0.75rem;
    }
    .section-head h3 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
    }
    .head-link {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--color-primary-600);
      text-decoration: none;
    }

    .arrivals-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .arrival-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.85rem;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }
    .arrival-row.seated {
      opacity: 0.7;
    }
    .time-col {
      width: 70px;
      display: flex;
      flex-direction: column;
    }
    .time-col strong {
      font-family: var(--font-brand);
      font-size: 1.05rem;
      color: var(--text-main);
    }
    .time-col span {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .guest-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .guest-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .guest-name-row strong {
      font-size: 0.9rem;
      color: var(--text-main);
    }
    .res-ref {
      font-size: 0.68rem;
      font-family: monospace;
      background: var(--bg-surface);
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid var(--border-medium);
      color: var(--text-muted);
    }
    .guest-phone {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .guest-table {
      font-size: 0.75rem;
      color: var(--color-primary-700);
    }
    .btn-seat {
      padding: 0.45rem 0.9rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 700;
      font-size: 0.78rem;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
    }
    .seated-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #065f46;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .tables-attention-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cleaning-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.85rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-md);
    }
    html.dark .cleaning-row {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }
    .t-badge {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: #3b82f6;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.95rem;
      flex-shrink: 0;
    }
    .t-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .t-info strong {
      font-size: 0.85rem;
      color: var(--text-main);
    }
    .t-info span {
      font-size: 0.72rem;
      color: var(--text-secondary);
    }
    .btn-clean-done {
      padding: 0.4rem 0.85rem;
      background: #10b981;
      color: #fff;
      font-weight: 700;
      font-size: 0.75rem;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
    }
    .empty-cleaning {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  `]
})
export class StaffDashboardComponent {
  resService = inject(ReservationService);
  tableService = inject(TableService);
  waitlistService = inject(WaitlistService);

  nextArrivals = computed(() => {
    return this.resService.todayReservations()
      .filter(r => r.status === 'confirmed' || r.status === 'seated')
      .slice(0, 6);
  });

  cleaningTables = computed(() => {
    return this.tableService.tables().filter(t => t.status === 'cleaning');
  });

  seatGuest(resId: string): void {
    this.resService.seatGuest(resId);
  }

  markAvailable(tableId: string): void {
    this.tableService.updateTableStatus(tableId, 'available');
  }
}
