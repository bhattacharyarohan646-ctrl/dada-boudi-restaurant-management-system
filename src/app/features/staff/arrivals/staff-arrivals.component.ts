import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../core/services/reservation.service';
import { TableService } from '../../../core/services/table.service';
import { Reservation } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-staff-arrivals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="staff-arrivals animate-fade-in">
      <div class="page-head">
        <div>
          <h1 class="page-title">Guest Arrivals & Seating Timeline</h1>
          <p class="page-sub">Today's reservations, guest check-ins, and table allocations</p>
        </div>

        <div class="search-box">
          <input
            type="text"
            class="search-input"
            placeholder="Search by name, phone or table number..."
            [(ngModel)]="searchQuery" />
        </div>
      </div>

      <!-- Filter Chips -->
      <div class="filter-chips-row">
        <button
          type="button"
          class="chip"
          [class.active]="statusFilter() === 'all'"
          (click)="statusFilter.set('all')">
          All ({{ resService.todayReservationsCount() }})
        </button>
        <button
          type="button"
          class="chip"
          [class.active]="statusFilter() === 'confirmed'"
          (click)="statusFilter.set('confirmed')">
          Expected ({{ confirmedCount() }})
        </button>
        <button
          type="button"
          class="chip"
          [class.active]="statusFilter() === 'seated'"
          (click)="statusFilter.set('seated')">
          Seated ({{ seatedCount() }})
        </button>
        <button
          type="button"
          class="chip"
          [class.active]="statusFilter() === 'completed'"
          (click)="statusFilter.set('completed')">
          Completed ({{ completedCount() }})
        </button>
      </div>

      <!-- Arrivals Table / Grid -->
      <div class="arrivals-table-card">
        <table class="arrivals-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Guest Name & Ref</th>
              <th>Party Size</th>
              <th>Assigned Table</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (res of filteredArrivals(); track res.id) {
              <tr [class.is-seated]="res.status === 'seated'">
                <td class="time-td">
                  <strong>{{ res.time }}</strong>
                </td>
                <td class="guest-td">
                  <div class="guest-name-cell">
                    <strong>{{ res.customerName }}</strong>
                    <span class="guest-phone-text">📞 {{ res.phone }}</span>
                    <span class="ref-sub">{{ res.referenceCode || res.id.substring(0, 8) }}</span>
                  </div>
                </td>
                <td>
                  <span class="party-badge">{{ res.guests }} Guests</span>
                </td>
                <td>
                  <span class="table-tag">Table {{ res.tableNumber }}</span>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="'badge-' + res.status">
                    {{ res.status | titlecase }}
                  </span>
                </td>
                <td class="actions-td">
                  <button
                    *ngIf="res.status === 'confirmed' || res.status === 'pending'"
                    type="button"
                    class="btn-action-seat"
                    (click)="resService.seatGuest(res.id)">
                    Seat Guest
                  </button>

                  <button
                    *ngIf="res.status === 'seated'"
                    type="button"
                    class="btn-action-complete"
                    (click)="resService.completeReservation(res.id)">
                    Finish Dining
                  </button>

                  <button
                    *ngIf="res.status === 'confirmed' || res.status === 'pending'"
                    type="button"
                    class="btn-action-cancel"
                    (click)="resService.cancelReservation(res.id)">
                    No-Show / Cancel
                  </button>
                </td>
              </tr>
            }
            @if (filteredArrivals().length === 0) {
              <tr>
                <td colspan="6" class="empty-td">
                  No matching arrivals found for today.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .staff-arrivals {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-family: var(--font-brand);
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 2px;
    }
    .page-sub {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0;
    }
    .search-box {
      min-width: 280px;
    }
    .search-input {
      width: 100%;
      padding: 0.6rem 1rem;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      color: var(--text-main);
      font-size: 0.85rem;
      outline: none;
    }

    .filter-chips-row {
      display: flex;
      gap: 8px;
    }
    .chip {
      padding: 0.45rem 0.95rem;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-light);
      background: var(--bg-surface);
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }
    .chip.active {
      background: var(--color-primary-600);
      color: #fff;
      border-color: var(--color-primary-600);
    }

    .arrivals-table-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow-x: auto;
      box-shadow: var(--shadow-sm);
    }
    .arrivals-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .arrivals-table th {
      padding: 0.85rem 1rem;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-light);
      background: var(--bg-surface-secondary);
    }
    .arrivals-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.85rem;
      color: var(--text-main);
    }
    .arrivals-table tr.is-seated {
      background: rgba(59, 130, 246, 0.03);
    }
    .time-td strong {
      font-family: var(--font-brand);
      font-size: 1.05rem;
      color: var(--color-primary-600);
    }
    .guest-name-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .guest-phone-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .ref-sub {
      font-size: 0.68rem;
      font-family: monospace;
      color: var(--text-muted);
    }
    .party-badge {
      font-weight: 700;
      background: var(--bg-surface-secondary);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .table-tag {
      font-weight: 800;
      color: #065f46;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #a7f3d0;
    }
    .status-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .badge-confirmed { background: #ecfdf5; color: #065f46; }
    .badge-pending { background: #fffbeb; color: #92400e; }
    .badge-seated { background: #eff6ff; color: #1e40af; }
    .badge-completed { background: #f1f5f9; color: #475569; }
    .badge-cancelled { background: #fef2f2; color: #991b1b; }

    .actions-td {
      display: flex;
      gap: 6px;
    }
    .btn-action-seat {
      padding: 0.4rem 0.85rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 700;
      font-size: 0.75rem;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
    }
    .btn-action-complete {
      padding: 0.4rem 0.85rem;
      background: #3b82f6;
      color: #fff;
      font-weight: 700;
      font-size: 0.75rem;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
    }
    .btn-action-cancel {
      padding: 0.4rem 0.65rem;
      background: transparent;
      border: 1px solid #fecaca;
      color: #dc2626;
      font-weight: 600;
      font-size: 0.72rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .empty-td {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }
  `]
})
export class StaffArrivalsComponent {
  resService = inject(ReservationService);

  searchQuery: string = '';
  statusFilter = signal<string>('all');

  todayList = computed(() => this.resService.todayReservations());

  confirmedCount = computed(() => this.todayList().filter(r => r.status === 'confirmed').length);
  seatedCount = computed(() => this.todayList().filter(r => r.status === 'seated').length);
  completedCount = computed(() => this.todayList().filter(r => r.status === 'completed').length);

  filteredArrivals = computed(() => {
    let list = this.todayList();

    const status = this.statusFilter();
    if (status !== 'all') {
      list = list.filter(r => r.status === status);
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(r =>
        r.customerName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.tableNumber.toLowerCase().includes(q) ||
        (r.referenceCode && r.referenceCode.toLowerCase().includes(q))
      );
    }

    return list;
  });
}
