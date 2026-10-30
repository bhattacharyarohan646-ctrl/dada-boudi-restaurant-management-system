import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { ReservationService } from '../../core/services/reservation.service';
import { Customer } from '../../core/models/customer.model';
import { Reservation } from '../../core/models/reservation.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="customers-page animate-fade-in">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Guest & Customer CRM</h1>
          <p class="page-subtitle">Track diner profiles, visit loyalty, VIP preferences and dining history</p>
        </div>

        <div class="stats-pills">
          <div class="stat-bubble">
            <span class="bubble-num">{{ customerService.totalCustomers() }}</span>
            <span class="bubble-lbl">Registered Guests</span>
          </div>
          <div class="stat-bubble vip-bubble">
            <span class="bubble-num">⭐ {{ customerService.vipCount() }}</span>
            <span class="bubble-lbl">VIP Members</span>
          </div>
        </div>
      </div>

      <!-- Controls Row -->
      <div class="controls-card card">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="form-input search-input"
            placeholder="Search by guest name, phone or email..."
            [(ngModel)]="searchQuery" />
        </div>

        <div class="filter-group">
          <button
            type="button"
            class="chip-btn"
            [class.active]="filterType === 'all'"
            (click)="filterType = 'all'">
            All Guests ({{ customerService.totalCustomers() }})
          </button>
          <button
            type="button"
            class="chip-btn"
            [class.active]="filterType === 'vip'"
            (click)="filterType = 'vip'">
            ⭐ VIP Only ({{ customerService.vipCount() }})
          </button>
          <button
            type="button"
            class="chip-btn"
            [class.active]="filterType === 'frequent'"
            (click)="filterType = 'frequent'">
            🔥 Frequent Diners (5+ visits)
          </button>
        </div>
      </div>

      <!-- Customer Cards Grid -->
      <div class="customers-grid" *ngIf="filteredCustomers.length > 0; else noGuests">
        @for (cust of filteredCustomers; track cust.id) {
          <div class="customer-card card card-hover" (click)="openProfileDrawer(cust)">
            <div class="card-top">
              <div class="avatar-box" [class.vip-avatar]="cust.isVip">
                {{ cust.name.charAt(0) }}
              </div>
              <div class="top-info">
                <div class="name-row">
                  <h3 class="cust-name">{{ cust.name }}</h3>
                  <span class="vip-tag" *ngIf="cust.isVip">⭐ VIP</span>
                </div>
                <span class="cust-phone">{{ cust.phone }}</span>
              </div>
            </div>

            <div class="metrics-strip">
              <div class="metric-item">
                <span class="m-val">{{ cust.totalVisits }}</span>
                <span class="m-lbl">Visits</span>
              </div>
              <div class="metric-item">
                <span class="m-val">{{ cust.totalReservations }}</span>
                <span class="m-lbl">Bookings</span>
              </div>
              <div class="metric-item">
                <span class="m-val">{{ cust.favoriteTable }}</span>
                <span class="m-lbl">Fav Table</span>
              </div>
            </div>

            <div class="tags-row" *ngIf="cust.tags && cust.tags.length > 0">
              @for (tag of cust.tags.slice(0, 2); track tag) {
                <span class="tag-pill">{{ tag }}</span>
              }
            </div>

            <div class="card-footer">
              <span class="last-visit-text">Last visit: {{ cust.lastVisit }}</span>
              <span class="arrow-hint">View Profile →</span>
            </div>
          </div>
        }
      </div>

      <ng-template #noGuests>
        <app-empty-state
          icon="👥"
          title="No Guests Found"
          description="Try changing your search term or filtering options."
          actionLabel="Clear Search"
          (actionClicked)="searchQuery = ''; filterType = 'all'">
        </app-empty-state>
      </ng-template>

      <!-- Customer Profile Drawer -->
      <div class="drawer-backdrop" *ngIf="selectedCustomer" (click)="onBackdropClick($event)">
        <div class="drawer-content animate-slide-in" role="dialog" aria-modal="true">
          <!-- Drawer Header -->
          <div class="profile-drawer-head">
            <div class="head-left">
              <div class="avatar-large" [class.vip-avatar]="selectedCustomer.isVip">
                {{ selectedCustomer.name.charAt(0) }}
              </div>
              <div>
                <div class="drawer-name-row">
                  <h2 class="drawer-name">{{ selectedCustomer.name }}</h2>
                  <span class="vip-tag" *ngIf="selectedCustomer.isVip">VIP Member</span>
                </div>
                <span class="drawer-meta">{{ selectedCustomer.phone }} • {{ selectedCustomer.email }}</span>
              </div>
            </div>
            <button type="button" class="btn-icon btn-ghost" (click)="selectedCustomer = null">✕</button>
          </div>

          <!-- Drawer Body -->
          <div class="drawer-body">
            <!-- Key Stats Cards -->
            <div class="stats-row">
              <div class="stat-card-mini">
                <span class="stat-label">Total Visits</span>
                <strong class="stat-digit">{{ selectedCustomer.totalVisits }}</strong>
              </div>
              <div class="stat-card-mini">
                <span class="stat-label">Preferred Time</span>
                <strong class="stat-digit">{{ selectedCustomer.preferredTime }}</strong>
              </div>
              <div class="stat-card-mini">
                <span class="stat-label">Favorite Table</span>
                <strong class="stat-digit">Table {{ selectedCustomer.favoriteTable }}</strong>
              </div>
            </div>

            <!-- Tags & Preferences -->
            <div class="section-box" *ngIf="selectedCustomer.tags && selectedCustomer.tags.length > 0">
              <h4 class="box-title">Guest Preferences & Notes</h4>
              <div class="pref-tags-wrap">
                @for (tag of selectedCustomer.tags; track tag) {
                  <span class="pref-badge">{{ tag }}</span>
                }
              </div>
            </div>

            <!-- Reservation History -->
            <div class="section-box">
              <h4 class="box-title">Booking History</h4>
              <div class="history-list">
                @for (res of customerBookings; track res.id) {
                  <div class="history-item">
                    <div class="hist-time">
                      <strong>{{ res.time }}</strong>
                      <span>{{ res.date }}</span>
                    </div>
                    <div class="hist-details">
                      <span class="hist-table">Table {{ res.tableNumber }}</span>
                      <span class="hist-guests">{{ res.guests }} Guests • {{ res.occasion || 'Casual' }}</span>
                      <p *ngIf="res.specialRequest" class="hist-note">"{{ res.specialRequest }}"</p>
                    </div>
                    <div class="hist-badge">
                      <app-status-badge [status]="res.status"></app-status-badge>
                    </div>
                  </div>
                }
                @if (customerBookings.length === 0) {
                  <p class="empty-hist">No past bookings found for this customer.</p>
                }
              </div>
            </div>
          </div>

          <div class="drawer-footer">
            <button type="button" class="btn btn-outline" (click)="selectedCustomer = null">
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customers-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
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
    .stats-pills {
      display: flex;
      gap: 0.75rem;
    }
    .stat-bubble {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.35rem 1rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
    }
    .vip-bubble {
      background: #fef3c7;
      border-color: #fde68a;
    }
    html.dark .vip-bubble {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.3);
    }
    .bubble-num {
      font-family: var(--font-brand);
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--text-main);
    }
    .bubble-lbl {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
    }
    .controls-card {
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 260px;
      max-width: 420px;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .search-input {
      padding-left: 2.25rem;
    }
    .filter-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .chip-btn {
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-full);
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all 0.15s ease;
    }
    .chip-btn:hover {
      border-color: var(--border-medium);
      color: var(--text-main);
    }
    .chip-btn.active {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      border-color: var(--color-primary-400);
    }
    html.dark .chip-btn.active {
      background: rgba(234, 88, 12, 0.15);
      color: var(--color-primary-300);
    }

    /* Grid */
    .customers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }
    .customer-card {
      padding: 1.25rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .card-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-box {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: var(--bg-surface-tertiary);
      border: 2px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.15rem;
      color: var(--text-main);
      flex-shrink: 0;
    }
    .vip-avatar {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #fff;
      border-color: #fde68a;
    }
    .top-info {
      flex: 1;
      min-width: 0;
    }
    .name-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cust-name {
      font-family: var(--font-brand);
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .vip-tag {
      font-size: 0.65rem;
      font-weight: 800;
      color: #78350f;
      background: #fef3c7;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      border: 1px solid #fde68a;
    }
    .cust-phone {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .metrics-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      padding: 0.625rem;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-md);
      text-align: center;
    }
    .metric-item {
      display: flex;
      flex-direction: column;
    }
    .m-val {
      font-weight: 800;
      font-size: 0.95rem;
      color: var(--text-main);
    }
    .m-lbl {
      font-size: 0.68rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .tags-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .tag-pill {
      font-size: 0.7rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      padding: 2px 7px;
      border-radius: 4px;
      color: var(--text-secondary);
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-subtle);
      font-size: 0.75rem;
    }
    .last-visit-text {
      color: var(--text-muted);
    }
    .arrow-hint {
      color: var(--color-primary-600);
      font-weight: 600;
    }

    /* Profile Drawer */
    .profile-drawer-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-light);
    }
    .head-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-large {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--bg-surface-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.4rem;
      color: var(--text-main);
    }
    .drawer-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .drawer-name {
      font-family: var(--font-brand);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .drawer-meta {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .drawer-body {
      padding: 1.5rem;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }
    .stat-card-mini {
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 0.875rem;
      text-align: center;
    }
    .stat-label {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      display: block;
      margin-bottom: 4px;
    }
    .stat-digit {
      font-size: 1.15rem;
      color: var(--text-main);
    }
    .section-box {
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 1rem;
    }
    .box-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.75rem;
    }
    .pref-tags-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .pref-badge {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .history-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0.65rem 0.85rem;
      background: var(--bg-surface);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
    }
    .hist-time {
      display: flex;
      flex-direction: column;
      min-width: 60px;
    }
    .hist-time strong {
      font-size: 0.84rem;
      color: var(--color-primary-600);
    }
    .hist-time span {
      font-size: 0.68rem;
      color: var(--text-muted);
    }
    .hist-details {
      flex: 1;
      min-width: 0;
    }
    .hist-table {
      font-weight: 700;
      font-size: 0.84rem;
      color: var(--text-main);
      display: block;
    }
    .hist-guests {
      font-size: 0.75rem;
      color: var(--text-secondary);
      display: block;
    }
    .hist-note {
      font-size: 0.7rem;
      color: var(--text-muted);
      font-style: italic;
      margin-top: 2px;
    }
    .empty-hist {
      font-size: 0.8125rem;
      color: var(--text-muted);
      text-align: center;
      padding: 0.5rem;
    }
    .drawer-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-light);
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class CustomersComponent {
  customerService = inject(CustomerService);
  private resService = inject(ReservationService);

  searchQuery = '';
  filterType: 'all' | 'vip' | 'frequent' = 'all';

  selectedCustomer: Customer | null = null;

  get filteredCustomers(): Customer[] {
    return this.customerService.customers().filter(c => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);

      let matchesFilter = true;
      if (this.filterType === 'vip') {
        matchesFilter = c.isVip;
      } else if (this.filterType === 'frequent') {
        matchesFilter = c.totalVisits >= 5;
      }

      return matchesSearch && matchesFilter;
    });
  }

  get customerBookings(): Reservation[] {
    if (!this.selectedCustomer) return [];
    return this.resService.reservations().filter(r =>
      r.customerName.toLowerCase() === this.selectedCustomer?.name.toLowerCase()
    );
  }

  openProfileDrawer(cust: Customer): void {
    this.selectedCustomer = cust;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) {
      this.selectedCustomer = null;
    }
  }
}
