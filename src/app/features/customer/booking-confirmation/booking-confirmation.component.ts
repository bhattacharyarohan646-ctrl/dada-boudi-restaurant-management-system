import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { TableService } from '../../../core/services/table.service';
import { Reservation } from '../../../core/models/reservation.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirmation-page animate-fade-in">
      <div class="confirmation-card">
        <!-- Success Animation / Checkmark Header -->
        <div class="success-seal-wrap">
          <div class="success-seal">
            <span class="seal-icon">✓</span>
          </div>
          <span class="status-chip" [class.confirmed]="reservation()?.status === 'confirmed'" [class.pending]="reservation()?.status === 'pending'">
            {{ reservation()?.status === 'confirmed' ? 'Reservation Confirmed' : 'Booking Pending Approval' }}
          </span>
        </div>

        <h1 class="confirm-title">Table Confirmed at {{ restaurantName }}!</h1>
        <p class="confirm-subtitle">
          Your dining reservation has been securely registered in our system and synced to the restaurant floor management.
        </p>

        <!-- Digital Booking Pass -->
        <div class="booking-ticket" *ngIf="reservation() as res">
          <!-- Ticket Header -->
          <div class="ticket-header">
            <div>
              <span class="ticket-brand">{{ restaurantName }}</span>
              <span class="ticket-location">Barrackpore • Kolkata</span>
            </div>
            <div class="ref-badge">
              <span class="ref-lbl">Booking Reference</span>
              <strong class="ref-code">{{ res.referenceCode || ('#' + res.id.substring(0, 8).toUpperCase()) }}</strong>
            </div>
          </div>

          <div class="ticket-notch-row">
            <div class="notch left"></div>
            <div class="notch-line"></div>
            <div class="notch right"></div>
          </div>

          <!-- Ticket Details Grid -->
          <div class="ticket-body">
            <div class="ticket-grid">
              <div class="ticket-col">
                <span class="t-label">Guest Name</span>
                <strong class="t-val">{{ res.customerName }}</strong>
              </div>
              <div class="ticket-col">
                <span class="t-label">Contact Phone</span>
                <strong class="t-val">{{ res.phone }}</strong>
              </div>
              <div class="ticket-col">
                <span class="t-label">Reservation Date</span>
                <strong class="t-val highlight">{{ res.date }}</strong>
              </div>
              <div class="ticket-col">
                <span class="t-label">Seating Time</span>
                <strong class="t-val highlight">{{ formatTime12(res.time) }}</strong>
              </div>
              <div class="ticket-col">
                <span class="t-label">Party Size</span>
                <strong class="t-val">{{ res.guests }} Guests</strong>
              </div>
              <div class="ticket-col">
                <span class="t-label">Assigned Table</span>
                <strong class="t-val table-val">Table {{ res.tableNumber }}</strong>
              </div>
              <div class="ticket-col" *ngIf="res.occasion">
                <span class="t-label">Occasion</span>
                <strong class="t-val">{{ res.occasion }}</strong>
              </div>
              <div class="ticket-col" *ngIf="res.specialRequest">
                <span class="t-label">Special Request</span>
                <strong class="t-val italic">"{{ res.specialRequest }}"</strong>
              </div>
            </div>

            <!-- Restaurant Location Directions Box -->
            <div class="directions-box">
              <span class="map-pin">📍</span>
              <div>
                <strong>Dada Boudi Restaurant</strong>
                <p>1, Ghoshpara Road, Near Barrackpore Railway Station, Barrackpore, West Bengal 700120</p>
              </div>
            </div>
          </div>

          <div class="ticket-footer">
            <span class="footer-notice">
              ⚠️ Please arrive within 15 minutes of reservation time to guarantee your table.
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="confirm-actions">
          <a routerLink="/my-bookings" class="btn-primary-action">
            <span>📋</span>
            <span>View in My Bookings</span>
          </a>
          <button type="button" class="btn-secondary-action" (click)="printPass()">
            <span>🖨️</span>
            <span>Print or Save Pass</span>
          </button>
          <a routerLink="/" class="btn-outline-action">
            <span>🏠</span>
            <span>Back to Home</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-page {
      min-height: calc(100vh - 140px);
      padding: 3rem 1rem 5rem;
      background: var(--bg-app);
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .confirmation-card {
      width: 100%;
      max-width: 640px;
      text-align: center;
    }
    .success-seal-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-bottom: 1.25rem;
    }
    .success-seal {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 800;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popIn {
      0% { transform: scale(0.4); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .status-chip {
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 12px;
      border-radius: 999px;
    }
    .status-chip.confirmed {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .status-chip.pending {
      background: #fffbeb;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .confirm-title {
      font-family: var(--font-brand);
      font-size: clamp(1.5rem, 3.5vw, 2rem);
      font-weight: 900;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .confirm-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 2rem;
      max-width: 520px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Ticket Pass */
    .booking-ticket {
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      text-align: left;
      overflow: hidden;
      margin-bottom: 2rem;
    }
    .ticket-header {
      padding: 1.5rem 1.75rem;
      background: linear-gradient(135deg, #7c2d12, #9a3412);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .ticket-brand {
      display: block;
      font-family: var(--font-brand);
      font-size: 1.25rem;
      font-weight: 800;
    }
    .ticket-location {
      font-size: 0.75rem;
      color: #fed7aa;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .ref-badge {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      background: rgba(0, 0, 0, 0.25);
      padding: 6px 12px;
      border-radius: var(--radius-md);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .ref-lbl {
      font-size: 0.62rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #fed7aa;
    }
    .ref-code {
      font-family: monospace;
      font-size: 1.15rem;
      letter-spacing: 0.08em;
      color: #fff;
    }

    .ticket-notch-row {
      position: relative;
      height: 20px;
      background: var(--bg-surface);
      display: flex;
      align-items: center;
    }
    .notch {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--bg-app);
      border: 1px solid var(--border-medium);
      top: 0;
    }
    .notch.left {
      left: -10px;
    }
    .notch.right {
      right: -10px;
    }
    .notch-line {
      width: 100%;
      height: 1px;
      border-top: 2px dashed var(--border-medium);
      margin: 0 16px;
    }

    .ticket-body {
      padding: 1.5rem 1.75rem;
    }
    .ticket-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    @media (max-width: 480px) {
      .ticket-grid {
        grid-template-columns: 1fr;
      }
    }
    .ticket-col {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .t-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 700;
    }
    .t-val {
      font-size: 0.95rem;
      color: var(--text-main);
    }
    .t-val.highlight {
      color: var(--color-primary-600);
      font-weight: 800;
    }
    .t-val.table-val {
      font-weight: 800;
      color: #065f46;
      background: #ecfdf5;
      padding: 2px 8px;
      border-radius: 6px;
      display: inline-block;
      width: fit-content;
    }
    .t-val.italic {
      font-style: italic;
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    .directions-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 0.85rem 1rem;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      font-size: 0.8125rem;
    }
    .map-pin {
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .directions-box strong {
      display: block;
      color: var(--text-main);
      margin-bottom: 2px;
    }
    .directions-box p {
      color: var(--text-secondary);
      margin: 0;
      font-size: 0.78rem;
    }

    .ticket-footer {
      background: var(--bg-surface-secondary);
      padding: 0.85rem 1.75rem;
      border-top: 1px solid var(--border-subtle);
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
    }

    /* Actions */
    .confirm-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }
    .btn-primary-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      max-width: 380px;
      padding: 0.85rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 800;
      font-size: 0.95rem;
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: 0 4px 14px var(--color-primary-glow);
      transition: background 0.15s ease;
    }
    .btn-primary-action:hover {
      background: var(--color-primary-700);
    }
    .btn-secondary-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      max-width: 380px;
      padding: 0.75rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      color: var(--text-secondary);
      font-weight: 700;
      font-size: 0.875rem;
      border-radius: var(--radius-full);
      cursor: pointer;
    }
    .btn-outline-action {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-decoration: none;
      margin-top: 6px;
    }
    .btn-outline-action:hover {
      color: var(--text-main);
    }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  private resService = inject(ReservationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  restaurantName = environment.restaurant.name;
  reservation = signal<Reservation | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Check if passed via router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['reservation']) {
      this.reservation.set(navigation.extras.state['reservation']);
      return;
    }

    if (id) {
      const found = this.resService.getReservationById(id);
      if (found) {
        this.reservation.set(found);
      }
    }
  }

  formatTime12(time24?: string): string {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  printPass(): void {
    window.print();
  }
}
