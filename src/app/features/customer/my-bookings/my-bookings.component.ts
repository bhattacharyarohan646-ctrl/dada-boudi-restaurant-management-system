import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ToastService } from '../../../core/services/toast.service';
import { Reservation } from '../../../core/models/reservation.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="my-bookings-page animate-fade-in">
      <div class="bookings-container">
        <!-- Header -->
        <div class="page-head">
          <div>
            <span class="head-pill">Diner Portal</span>
            <h1 class="page-title">My Dining Reservations</h1>
            <p class="page-sub">
              Live status updates for your table reservations at {{ restaurantName }}.
            </p>
          </div>

          <a routerLink="/book-table" class="btn-new-res">
            <span>+</span>
            <span>Book Another Table</span>
          </a>
        </div>

        <!-- Filter Tabs -->
        <div class="tabs-row">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'upcoming'"
            (click)="activeTab.set('upcoming')">
            Upcoming ({{ upcomingBookings().length }})
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'past'"
            (click)="activeTab.set('past')">
            History & Cancelled ({{ pastBookings().length }})
          </button>
        </div>

        <!-- Bookings List -->
        <div *ngIf="displayedBookings().length > 0; else emptyState" class="bookings-list">
          @for (res of displayedBookings(); track res.id) {
            <div class="res-card" [class.cancelled]="res.status === 'cancelled'">
              <div class="res-card-head">
                <div class="res-ref-group">
                  <span class="ref-badge">{{ res.referenceCode || ('#' + res.id.substring(0, 8).toUpperCase()) }}</span>
                  <span class="table-chip">Table {{ res.tableNumber }}</span>
                </div>

                <div class="status-indicator" [ngClass]="'status-' + res.status">
                  <span class="dot"></span>
                  <span>{{ getStatusLabel(res.status) }}</span>
                </div>
              </div>

              <div class="res-card-body">
                <div class="res-info-grid">
                  <div class="info-cell">
                    <span class="cell-label">Date</span>
                    <strong class="cell-val">{{ res.date }}</strong>
                  </div>
                  <div class="info-cell">
                    <span class="cell-label">Time</span>
                    <strong class="cell-val">{{ formatTime12(res.time) }}</strong>
                  </div>
                  <div class="info-cell">
                    <span class="cell-label">Guests</span>
                    <strong class="cell-val">{{ res.guests }} Persons</strong>
                  </div>
                  <div class="info-cell" *ngIf="res.occasion">
                    <span class="cell-label">Occasion</span>
                    <strong class="cell-val">{{ res.occasion }}</strong>
                  </div>
                </div>

                <p *ngIf="res.specialRequest" class="special-request-text">
                  💬 <em>"{{ res.specialRequest }}"</em>
                </p>

                <!-- Live Status Hint -->
                <div class="status-hint-bar" *ngIf="res.status === 'seated'">
                  <span class="live-pulse">🟢</span>
                  <span>You are currently seated at Table {{ res.tableNumber }}. Enjoy your meal!</span>
                </div>
                <div class="status-hint-bar" *ngIf="res.status === 'pending'">
                  <span>⏳ Awaiting host approval. We will notify you shortly.</span>
                </div>
              </div>

              <div class="res-card-footer">
                <span class="booked-on">Booked on {{ res.createdAt }}</span>

                <div class="card-actions">
                  <a [routerLink]="['/booking-confirmation', res.id]" class="btn-card-view">
                    View Pass
                  </a>

                  <!-- Eligible to cancel if status is confirmed or pending -->
                  <button
                    *ngIf="res.status === 'confirmed' || res.status === 'pending'"
                    type="button"
                    class="btn-card-cancel"
                    (click)="confirmCancellation(res)">
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Empty State -->
        <ng-template #emptyState>
          <div class="empty-state-card">
            <span class="empty-icon">🍽️</span>
            <h3>No {{ activeTab() === 'upcoming' ? 'Upcoming' : 'Past' }} Bookings Found</h3>
            <p>
              {{ activeTab() === 'upcoming'
                ? 'You do not have any active reservations scheduled. Book a table now to enjoy legendary Barrackpore biryani!'
                : 'No past or cancelled reservation records are on file for your account.' }}
            </p>
            <a routerLink="/book-table" class="btn-empty-book">
              Reserve a Table Now →
            </a>
          </div>
        </ng-template>

        <!-- Cancel Confirmation Modal -->
        <div class="modal-backdrop" *ngIf="cancellingReservation()" (click)="cancellingReservation.set(null)">
          <div class="modal-dialog animate-fade-in" (click)="$event.stopPropagation()">
            <div class="modal-icon warning">⚠️</div>
            <h3>Cancel Reservation?</h3>
            <p>
              Are you sure you want to cancel your table booking <strong>{{ cancellingReservation()?.referenceCode }}</strong>
              for <strong>{{ cancellingReservation()?.date }}</strong> at <strong>{{ formatTime12(cancellingReservation()?.time) }}</strong>?
            </p>
            <p class="modal-sub">
              Your table (Table {{ cancellingReservation()?.tableNumber }}) will be immediately released back to other patrons.
            </p>

            <div class="modal-actions">
              <button type="button" class="btn-modal-back" (click)="cancellingReservation.set(null)">
                Keep Booking
              </button>
              <button type="button" class="btn-modal-confirm-cancel" (click)="executeCancellation()">
                Yes, Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-bookings-page {
      min-height: calc(100vh - 140px);
      padding: 2.5rem 1rem 5rem;
      background: var(--bg-app);
      display: flex;
      justify-content: center;
    }
    .bookings-container {
      width: 100%;
      max-width: 800px;
    }
    .page-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }
    .head-pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--color-primary-600);
      background: var(--color-primary-50);
      padding: 3px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }
    html.dark .head-pill {
      background: rgba(234, 88, 12, 0.2);
    }
    .page-title {
      font-family: var(--font-brand);
      font-size: clamp(1.5rem, 3.5vw, 2rem);
      font-weight: 900;
      color: var(--text-main);
      margin-bottom: 0.35rem;
    }
    .page-sub {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }
    .btn-new-res {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.65rem 1.25rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 700;
      font-size: 0.875rem;
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: 0 4px 12px var(--color-primary-glow);
      transition: background 0.15s ease;
    }
    .btn-new-res:hover {
      background: var(--color-primary-700);
    }

    .tabs-row {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 1.75rem;
    }
    .tab-btn {
      padding: 0.65rem 1.25rem;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tab-btn.active {
      color: var(--color-primary-600);
      border-bottom-color: var(--color-primary-600);
    }

    /* Cards */
    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .res-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: box-shadow 0.2s ease;
    }
    .res-card:hover {
      box-shadow: var(--shadow-md);
    }
    .res-card.cancelled {
      opacity: 0.75;
      background: var(--bg-surface-secondary);
    }
    .res-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .res-ref-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ref-badge {
      font-family: monospace;
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--color-primary-700);
      background: var(--color-primary-50);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid var(--color-primary-200);
    }
    html.dark .ref-badge {
      background: rgba(234, 88, 12, 0.2);
      border-color: rgba(234, 88, 12, 0.4);
      color: #fdba74;
    }
    .table-chip {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-secondary);
      background: var(--bg-surface-secondary);
      padding: 3px 8px;
      border-radius: 6px;
    }

    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .status-indicator .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .status-confirmed {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .status-confirmed .dot { background: #10b981; }

    .status-pending {
      background: #fffbeb;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .status-pending .dot { background: #f59e0b; }

    .status-seated {
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    .status-seated .dot { background: #3b82f6; }

    .status-completed {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .status-completed .dot { background: #64748b; }

    .status-cancelled {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .status-cancelled .dot { background: #ef4444; }

    .res-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 12px;
      padding: 0.75rem 0;
    }
    .info-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cell-label {
      font-size: 0.68rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .cell-val {
      font-size: 0.925rem;
      color: var(--text-main);
    }
    .special-request-text {
      font-size: 0.825rem;
      color: var(--text-secondary);
      background: var(--bg-surface-secondary);
      padding: 6px 12px;
      border-radius: var(--radius-md);
      margin: 4px 0 0;
    }
    .status-hint-bar {
      padding: 6px 12px;
      background: var(--color-primary-50);
      color: var(--color-primary-900);
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: var(--radius-md);
      margin-top: 6px;
    }
    html.dark .status-hint-bar {
      background: rgba(234, 88, 12, 0.15);
      color: #fed7aa;
    }

    .res-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 0.85rem;
      flex-wrap: wrap;
      gap: 10px;
    }
    .booked-on {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .card-actions {
      display: flex;
      gap: 8px;
    }
    .btn-card-view {
      padding: 0.45rem 0.95rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-medium);
      color: var(--text-main);
      font-weight: 700;
      font-size: 0.78rem;
      border-radius: var(--radius-md);
      text-decoration: none;
    }
    .btn-card-cancel {
      padding: 0.45rem 0.95rem;
      background: transparent;
      border: 1px solid #fecaca;
      color: #dc2626;
      font-weight: 700;
      font-size: 0.78rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-card-cancel:hover {
      background: #fef2f2;
    }

    /* Empty state */
    .empty-state-card {
      text-align: center;
      padding: 4rem 1.5rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
    }
    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }
    .empty-state-card h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .empty-state-card p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      max-width: 440px;
      margin: 0 auto 1.75rem;
      line-height: 1.5;
    }
    .btn-empty-book {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 800;
      border-radius: var(--radius-full);
      text-decoration: none;
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-dialog {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 2rem;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: var(--shadow-xl);
    }
    .modal-icon.warning {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    .modal-dialog h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .modal-dialog p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      line-height: 1.45;
    }
    .modal-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem !important;
    }
    .modal-actions {
      display: flex;
      gap: 10px;
    }
    .btn-modal-back {
      flex: 1;
      padding: 0.75rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-medium);
      color: var(--text-secondary);
      font-weight: 700;
      border-radius: var(--radius-md);
      cursor: pointer;
    }
    .btn-modal-confirm-cancel {
      flex: 1;
      padding: 0.75rem;
      background: #dc2626;
      border: none;
      color: #fff;
      font-weight: 700;
      border-radius: var(--radius-md);
      cursor: pointer;
    }
  `]
})
export class MyBookingsComponent {
  authService = inject(AuthService);
  private resService = inject(ReservationService);
  private toastService = inject(ToastService);

  restaurantName = environment.restaurant.name;
  activeTab = signal<'upcoming' | 'past'>('upcoming');
  cancellingReservation = signal<Reservation | null>(null);

  /**
   * Filters reservations for the currently authenticated customer:
   * Matches by customerUid, or by phone/email.
   */
  customerBookings = computed(() => {
    const user = this.authService.currentUser();
    const all = this.resService.reservations();
    const lastBookingId = localStorage.getItem('dineflow_last_booking_id');
    const customerPhone = localStorage.getItem('dineflow_customer_phone');

    return all.filter(r => {
      if (user && r.customerUid && r.customerUid === user.uid) return true;
      if (user && user.phoneNumber && r.phone && r.phone.replace(/\D/g, '') === user.phoneNumber.replace(/\D/g, '')) return true;
      if (user && user.email && r.email && r.email.toLowerCase() === user.email.toLowerCase()) return true;
      if (lastBookingId && r.id === lastBookingId) return true;
      if (customerPhone && r.phone && r.phone.replace(/\D/g, '') === customerPhone.replace(/\D/g, '')) return true;
      return false;
    });
  });

  upcomingBookings = computed(() => {
    return this.customerBookings().filter(r => r.status === 'confirmed' || r.status === 'pending' || r.status === 'seated');
  });

  pastBookings = computed(() => {
    return this.customerBookings().filter(r => r.status === 'completed' || r.status === 'cancelled');
  });

  displayedBookings = computed(() => {
    return this.activeTab() === 'upcoming' ? this.upcomingBookings() : this.pastBookings();
  });

  formatTime12(time24?: string): string {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending Approval';
      case 'seated': return 'Seated Now';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  confirmCancellation(res: Reservation): void {
    this.cancellingReservation.set(res);
  }

  executeCancellation(): void {
    const res = this.cancellingReservation();
    if (!res) return;

    this.resService.cancelReservation(res.id);
    this.cancellingReservation.set(null);
    this.toastService.success('Reservation Cancelled', `Booking ${res.referenceCode} was cancelled.`);
  }
}
