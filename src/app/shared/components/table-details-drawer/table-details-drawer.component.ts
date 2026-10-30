import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantTable, TableStatus } from '../../../core/models/table.model';
import { Reservation } from '../../../core/models/reservation.model';
import { TableService } from '../../../core/services/table.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-table-details-drawer',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="drawer-backdrop" *ngIf="isOpen && table" (click)="onBackdropClick($event)">
      <div class="drawer-content animate-slide-in" role="dialog" aria-modal="true">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <div class="header-left">
            <span class="table-badge">{{ table.zone }}</span>
            <h2 class="drawer-title">Table {{ table.tableNumber }}</h2>
          </div>
          <button type="button" class="btn-icon btn-ghost" (click)="close.emit()" aria-label="Close drawer">
            ✕
          </button>
        </div>

        <div class="drawer-body">
          <!-- Status Banner -->
          <div class="status-summary-card">
            <div class="summary-meta">
              <span class="label">Current Status</span>
              <app-status-badge [status]="table.status"></app-status-badge>
            </div>
            <div class="summary-meta">
              <span class="label">Capacity</span>
              <span class="value-highlight">👥 {{ table.capacity }} Guests</span>
            </div>
            <div class="summary-meta">
              <span class="label">Shape</span>
              <span class="value">{{ table.shape | titlecase }}</span>
            </div>
          </div>

          <!-- Active Reservation / Occupancy Details -->
          @if (reservation && (table.status === 'reserved' || table.status === 'occupied')) {
            <div class="reservation-card card">
              <div class="res-card-header">
                <span class="res-card-tag">Active Booking</span>
                <span class="res-time-badge">🕒 {{ reservation.time }}</span>
              </div>

              <div class="customer-row">
                <div class="cust-avatar">
                  {{ reservation.customerName.charAt(0) }}
                </div>
                <div class="cust-info">
                  <h4 class="cust-name">{{ reservation.customerName }}</h4>
                  <p class="cust-sub">{{ reservation.phone }}</p>
                </div>
              </div>

              <div class="res-details-grid">
                <div class="grid-item">
                  <span class="item-label">Party Size</span>
                  <span class="item-val">{{ reservation.guests }} People</span>
                </div>
                <div class="grid-item">
                  <span class="item-label">Occasion</span>
                  <span class="item-val">{{ reservation.occasion || 'Casual Dining' }}</span>
                </div>
              </div>

              @if (reservation.specialRequest) {
                <div class="res-note">
                  <span class="note-label">Special Request:</span>
                  <p class="note-text">"{{ reservation.specialRequest }}"</p>
                </div>
              }

              <!-- Reservation Quick Actions -->
              <div class="res-actions">
                @if (table.status === 'reserved') {
                  <button type="button" class="btn btn-primary" (click)="seatGuest()">
                    Seat Guests Now
                  </button>
                }
                @if (table.status === 'occupied') {
                  <button type="button" class="btn btn-secondary" (click)="completeDining()">
                    Finish Dining
                  </button>
                }
                <button type="button" class="btn btn-danger" (click)="cancelReservation()">
                  Cancel Booking
                </button>
              </div>
            </div>
          } @else if (table.status === 'cleaning') {
            <div class="cleaning-notice card">
              <div class="notice-icon">🧹</div>
              <h4>Table Being Sanitized</h4>
              <p>Housekeeping is clearing tableware and preparing for the next seating.</p>
              <button type="button" class="btn btn-primary" (click)="setStatus('available')">
                ✓ Mark Sanitized & Available
              </button>
            </div>
          } @else {
            <!-- Table is Available -->
            <div class="available-prompt card">
              <div class="prompt-icon">✨</div>
              <h4>Table is Ready & Available</h4>
              <p>No active reservations currently seated. Ready to seat walk-ins or reserve.</p>
              <button type="button" class="btn btn-primary btn-block" (click)="bookReservation.emit(table)">
                + Book New Reservation
              </button>
            </div>
          }

          <!-- Quick Status Override Actions -->
          <div class="status-transition-section">
            <h4 class="section-title">Change Table Status</h4>
            <p class="section-sub">Quickly update restaurant floor operations:</p>
            <div class="status-btn-group">
              <button
                type="button"
                class="btn btn-status"
                [class.active]="table.status === 'available'"
                (click)="setStatus('available')">
                <span class="dot available-dot"></span> Available
              </button>
              <button
                type="button"
                class="btn btn-status"
                [class.active]="table.status === 'reserved'"
                (click)="setStatus('reserved')">
                <span class="dot reserved-dot"></span> Reserved
              </button>
              <button
                type="button"
                class="btn btn-status"
                [class.active]="table.status === 'occupied'"
                (click)="setStatus('occupied')">
                <span class="dot occupied-dot"></span> Occupied
              </button>
              <button
                type="button"
                class="btn btn-status"
                [class.active]="table.status === 'cleaning'"
                (click)="setStatus('cleaning')">
                <span class="dot cleaning-dot"></span> Cleaning
              </button>
            </div>
          </div>
        </div>

        <div class="drawer-footer">
          <button type="button" class="btn btn-outline" (click)="close.emit()">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-light);
    }
    .table-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--color-primary-600);
      background: var(--color-primary-50);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    html.dark .table-badge {
      background: rgba(234, 88, 12, 0.2);
      color: var(--color-primary-400);
    }
    .drawer-title {
      font-family: var(--font-brand);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
      margin-top: 2px;
    }
    .drawer-body {
      padding: 1.5rem;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .status-summary-card {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      padding: 1rem;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }
    .summary-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .summary-meta .label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .value-highlight {
      font-weight: 700;
      color: var(--text-main);
      font-size: 0.9rem;
    }
    .value {
      font-size: 0.9rem;
      color: var(--text-main);
      font-weight: 600;
    }
    .reservation-card {
      padding: 1.25rem;
      border-left: 4px solid var(--status-reserved);
    }
    .res-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.875rem;
    }
    .res-card-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .res-time-badge {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-primary-600);
      background: var(--color-primary-50);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .customer-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .cust-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-primary-500);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }
    .cust-name {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-main);
    }
    .cust-sub {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .res-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-top: 1px solid var(--border-subtle);
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 0.875rem;
    }
    .item-label {
      display: block;
      font-size: 0.72rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .item-val {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .res-note {
      background: var(--bg-surface-secondary);
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
    }
    .note-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
    }
    .note-text {
      font-size: 0.8125rem;
      color: var(--text-main);
      font-style: italic;
      margin-top: 2px;
    }
    .res-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .res-actions button {
      flex: 1;
    }
    .cleaning-notice, .available-prompt {
      padding: 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .notice-icon, .prompt-icon {
      font-size: 2.2rem;
      margin-bottom: 0.25rem;
    }
    .cleaning-notice h4, .available-prompt h4 {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-main);
    }
    .cleaning-notice p, .available-prompt p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
    }
    .btn-block {
      width: 100%;
    }
    .status-transition-section {
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-md);
      padding: 1.125rem;
      border: 1px solid var(--border-light);
    }
    .section-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .section-sub {
      font-size: 0.78rem;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
    }
    .status-btn-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
    .btn-status {
      padding: 0.5rem 0.75rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: flex-start;
      transition: all 0.15s ease;
    }
    .btn-status:hover {
      border-color: var(--border-medium);
      background: var(--bg-surface-tertiary);
    }
    .btn-status.active {
      border-color: var(--color-primary-500);
      background: var(--color-primary-50);
      color: var(--color-primary-700);
    }
    html.dark .btn-status.active {
      background: rgba(234, 88, 12, 0.2);
      color: var(--color-primary-300);
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .available-dot { background: var(--status-available); }
    .reserved-dot { background: var(--status-reserved); }
    .occupied-dot { background: var(--status-occupied); }
    .cleaning-dot { background: var(--status-cleaning); }
    .drawer-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-light);
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class TableDetailsDrawerComponent {
  private tableService = inject(TableService);
  private resService = inject(ReservationService);

  @Input() isOpen = false;
  @Input() table?: RestaurantTable;
  @Input() reservation?: Reservation;

  @Output() close = new EventEmitter<void>();
  @Output() bookReservation = new EventEmitter<RestaurantTable>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) {
      this.close.emit();
    }
  }

  setStatus(status: TableStatus): void {
    if (!this.table) return;
    this.tableService.updateTableStatus(this.table.id, status);
  }

  seatGuest(): void {
    if (!this.reservation) return;
    this.resService.seatGuest(this.reservation.id);
  }

  completeDining(): void {
    if (!this.reservation) return;
    this.resService.completeReservation(this.reservation.id);
  }

  cancelReservation(): void {
    if (!this.reservation) return;
    this.resService.cancelReservation(this.reservation.id);
  }
}
