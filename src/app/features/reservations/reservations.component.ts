import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { TableService } from '../../core/services/table.service';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { NewReservationModalComponent } from '../../shared/components/new-reservation-modal/new-reservation-modal.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StatusBadgeComponent,
    NewReservationModalComponent,
    ConfirmationDialogComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="reservations-page animate-fade-in">
      <!-- Top Action Bar -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Reservations Management</h1>
          <p class="page-subtitle">Track, seat, reschedule and manage customer bookings</p>
        </div>

        <div class="header-actions">
          <!-- View switcher tabs -->
          <div class="tab-pill-group">
            <button
              type="button"
              class="tab-pill"
              [class.active]="viewMode === 'table'"
              (click)="viewMode = 'table'">
              📋 Bookings List
            </button>
            <button
              type="button"
              class="tab-pill"
              [class.active]="viewMode === 'timeline'"
              (click)="viewMode = 'timeline'">
              🕒 Visual Timeline
            </button>
          </div>

          <button type="button" class="btn btn-primary" (click)="isNewModalOpen = true">
            + New Reservation
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="filters-card card">
        <div class="search-input-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="form-input search-field"
            placeholder="Search customer, phone or table number..."
            [(ngModel)]="searchQuery" />
        </div>

        <!-- Status Filter Tabs -->
        <div class="status-chips-wrap">
          <button
            type="button"
            class="filter-chip"
            [class.active]="selectedStatus === 'all'"
            (click)="selectedStatus = 'all'">
            All ({{ resService.reservations().length }})
          </button>
          <button
            type="button"
            class="filter-chip"
            [class.active]="selectedStatus === 'confirmed'"
            (click)="selectedStatus = 'confirmed'">
            Confirmed ({{ resService.confirmedCount() }})
          </button>
          <button
            type="button"
            class="filter-chip"
            [class.active]="selectedStatus === 'pending'"
            (click)="selectedStatus = 'pending'">
            Pending ({{ resService.pendingCount() }})
          </button>
          <button
            type="button"
            class="filter-chip"
            [class.active]="selectedStatus === 'completed'"
            (click)="selectedStatus = 'completed'">
            Completed ({{ resService.completedCount() }})
          </button>
          <button
            type="button"
            class="filter-chip"
            [class.active]="selectedStatus === 'cancelled'"
            (click)="selectedStatus = 'cancelled'">
            Cancelled ({{ resService.cancelledCount() }})
          </button>
        </div>

        <!-- Date selector -->
        <div class="date-filter-box">
          <label class="filter-label">Filter Date:</label>
          <input
            type="date"
            class="form-input date-input"
            [(ngModel)]="selectedDate" />
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            *ngIf="selectedDate"
            (click)="selectedDate = ''"
            title="Clear date filter">
            ✕ Clear
          </button>
        </div>
      </div>

      <!-- VIEW 1: DATA TABLE / CARDS -->
      @if (viewMode === 'table') {
        <div class="table-container card">
          <div class="table-header-meta">
            <span class="meta-count">
              Showing <strong>{{ paginatedReservations.length }}</strong> of <strong>{{ filteredReservations.length }}</strong> bookings
            </span>
            <div class="pagination-controls" *ngIf="totalPages > 1">
              <button
                type="button"
                class="btn btn-outline btn-sm"
                [disabled]="currentPage === 1"
                (click)="currentPage = currentPage - 1">
                ← Prev
              </button>
              <span class="page-indicator">Page {{ currentPage }} / {{ totalPages }}</span>
              <button
                type="button"
                class="btn btn-outline btn-sm"
                [disabled]="currentPage === totalPages"
                (click)="currentPage = currentPage + 1">
                Next →
              </button>
            </div>
          </div>

          <div class="table-responsive" *ngIf="paginatedReservations.length > 0; else noBookings">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Date & Time</th>
                  <th>Guests</th>
                  <th>Assigned Table</th>
                  <th>Status</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (res of paginatedReservations; track res.id) {
                  <tr [class.row-cancelled]="res.status === 'cancelled'">
                    <td>
                      <div class="cust-cell">
                        <div class="cust-avatar-sm">
                          {{ res.customerName.charAt(0) }}
                        </div>
                        <div>
                          <strong class="cust-title">{{ res.customerName }}</strong>
                          <span *ngIf="res.occasion" class="occasion-tag">{{ res.occasion }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="contact-cell">
                        <span class="contact-phone">{{ res.phone }}</span>
                        <span class="contact-email" *ngIf="res.email">{{ res.email }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="time-cell">
                        <span class="time-bold">{{ res.time }}</span>
                        <span class="date-sub">{{ res.date }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="guest-pill">👥 {{ res.guests }}</span>
                    </td>
                    <td>
                      <span class="table-pill">
                        <strong>{{ res.tableNumber }}</strong>
                      </span>
                    </td>
                    <td>
                      <app-status-badge [status]="res.status"></app-status-badge>
                    </td>
                    <td class="text-right">
                      <div class="action-btn-row">
                        <button
                          type="button"
                          class="btn btn-ghost btn-sm"
                          (click)="openDetailsModal(res)">
                          View
                        </button>
                        @if (res.status === 'confirmed') {
                          <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            (click)="resService.seatGuest(res.id)">
                            Seat
                          </button>
                        }
                        @if (res.status === 'confirmed' || res.status === 'pending') {
                          <button
                            type="button"
                            class="btn btn-ghost btn-sm text-danger"
                            (click)="confirmCancelReservation(res)">
                            Cancel
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <ng-template #noBookings>
            <app-empty-state
              icon="📅"
              title="No Reservations Found"
              description="Try adjusting your search criteria, selected date, or filters to find reservations."
              actionLabel="+ Create New Reservation"
              (actionClicked)="isNewModalOpen = true">
            </app-empty-state>
          </ng-template>
        </div>
      }

      <!-- VIEW 2: VISUAL TIMELINE COMPONENT (SECTION 15) -->
      @if (viewMode === 'timeline') {
        <div class="timeline-container card">
          <div class="timeline-header">
            <div>
              <h3 class="timeline-title">Evening Dinner Service Timeline</h3>
              <p class="timeline-sub">Live booking blocks plotted across dinner service hours (18:00 – 23:00)</p>
            </div>
            <div class="timeline-legend">
              <span class="leg-pill confirmed-pill">■ Confirmed</span>
              <span class="leg-pill pending-pill">■ Pending</span>
              <span class="leg-pill completed-pill">■ Seated / Done</span>
            </div>
          </div>

          <!-- Time Markers Bar -->
          <div class="time-ruler">
            <div class="ruler-col-header">Table</div>
            <div class="ruler-slots">
              <div class="ruler-mark">18:00 (6 PM)</div>
              <div class="ruler-mark">19:00 (7 PM)</div>
              <div class="ruler-mark">20:00 (8 PM)</div>
              <div class="ruler-mark">21:00 (9 PM)</div>
              <div class="ruler-mark">22:00 (10 PM)</div>
              <div class="ruler-mark">23:00 (11 PM)</div>
            </div>
          </div>

          <!-- Table by Table Rows -->
          <div class="timeline-rows-list">
            @for (tbl of tableService.tables().slice(0, 16); track tbl.id) {
              <div class="timeline-row">
                <div class="timeline-table-cell">
                  <strong>{{ tbl.tableNumber }}</strong>
                  <span class="table-cap-sub">{{ tbl.capacity }}p</span>
                </div>
                <div class="timeline-track">
                  <!-- Grid vertical guide lines -->
                  <div class="grid-line line-1"></div>
                  <div class="grid-line line-2"></div>
                  <div class="grid-line line-3"></div>
                  <div class="grid-line line-4"></div>
                  <div class="grid-line line-5"></div>

                  <!-- Reservation blocks positioned on timeline -->
                  @for (res of getBookingsForTable(tbl.id); track res.id) {
                    <div
                      class="booking-timeline-block"
                      [ngClass]="'block-' + res.status"
                      [style.left]="calculateTimelineLeft(res.time)"
                      (click)="openDetailsModal(res)"
                      [title]="res.customerName + ' (' + res.guests + ' guests) at ' + res.time">
                      <span class="block-name">{{ res.customerName }}</span>
                      <span class="block-guests">👥 {{ res.guests }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Reservation Details Drawer / Modal -->
      <div class="modal-backdrop" *ngIf="selectedReservation" (click)="onDetailsBackdrop($event)">
        <div class="modal-box card animate-fade-in">
          <div class="modal-header">
            <div>
              <span class="res-tag">{{ selectedReservation.occasion || 'Dining Reservation' }}</span>
              <h3 class="modal-title">{{ selectedReservation.customerName }}</h3>
            </div>
            <button type="button" class="btn-icon btn-ghost" (click)="selectedReservation = null">✕</button>
          </div>

          <div class="modal-body-details">
            <div class="details-status-row">
              <span class="meta-label">Booking Status:</span>
              <app-status-badge [status]="selectedReservation.status"></app-status-badge>
            </div>

            <div class="details-grid">
              <div class="grid-item">
                <span class="meta-label">Date & Time</span>
                <strong class="meta-val">📅 {{ selectedReservation.date }} at {{ selectedReservation.time }}</strong>
              </div>
              <div class="grid-item">
                <span class="meta-label">Assigned Table</span>
                <strong class="meta-val">🪑 Table {{ selectedReservation.tableNumber }}</strong>
              </div>
              <div class="grid-item">
                <span class="meta-label">Guests Count</span>
                <strong class="meta-val">👥 {{ selectedReservation.guests }} People</strong>
              </div>
              <div class="grid-item">
                <span class="meta-label">Contact Phone</span>
                <strong class="meta-val">📞 {{ selectedReservation.phone }}</strong>
              </div>
            </div>

            @if (selectedReservation.specialRequest) {
              <div class="note-box">
                <span class="note-title">Special Request Note:</span>
                <p>"{{ selectedReservation.specialRequest }}"</p>
              </div>
            }

            <div class="modal-actions-bar">
              @if (selectedReservation.status === 'confirmed') {
                <button
                  type="button"
                  class="btn btn-primary"
                  (click)="resService.seatGuest(selectedReservation.id); selectedReservation = null">
                  Seat Guests Now
                </button>
              }
              @if (selectedReservation.status === 'confirmed' || selectedReservation.status === 'pending') {
                <button
                  type="button"
                  class="btn btn-danger"
                  (click)="confirmCancelReservation(selectedReservation); selectedReservation = null">
                  Cancel Reservation
                </button>
              }
              <button
                type="button"
                class="btn btn-secondary"
                (click)="selectedReservation = null">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel Confirmation Dialog -->
      <app-confirmation-dialog
        [isOpen]="isCancelConfirmOpen"
        title="Cancel This Reservation?"
        [message]="'Are you sure you want to cancel the booking for ' + (reservationToCancel?.customerName || '') + '? Table ' + (reservationToCancel?.tableNumber || '') + ' will immediately become Available.'"
        confirmText="Confirm Cancellation"
        [isDanger]="true"
        (confirm)="onCancelConfirmed()"
        (cancel)="isCancelConfirmOpen = false">
      </app-confirmation-dialog>

      <!-- New Reservation Modal -->
      <app-new-reservation-modal
        [isOpen]="isNewModalOpen"
        (close)="isNewModalOpen = false">
      </app-new-reservation-modal>
    </div>
  `,
  styles: [`
    .reservations-page {
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
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .tab-pill-group {
      display: flex;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 3px;
    }
    .tab-pill {
      padding: 0.45rem 0.85rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
    }
    .tab-pill.active {
      background: var(--bg-surface);
      color: var(--color-primary-600);
      box-shadow: var(--shadow-xs);
    }
    html.dark .tab-pill.active {
      color: var(--color-primary-400);
    }

    /* Filters card */
    .filters-card {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .search-input-box {
      position: relative;
      flex: 1;
      min-width: 260px;
      max-width: 400px;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .search-field {
      padding-left: 2.25rem;
    }
    .status-chips-wrap {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .filter-chip {
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all 0.15s ease;
    }
    .filter-chip:hover {
      border-color: var(--border-medium);
      color: var(--text-main);
    }
    .filter-chip.active {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      border-color: var(--color-primary-400);
    }
    html.dark .filter-chip.active {
      background: rgba(234, 88, 12, 0.15);
      color: var(--color-primary-300);
    }
    .date-filter-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .filter-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .date-input {
      padding: 0.4rem 0.75rem;
      font-size: 0.8125rem;
      width: auto;
    }

    /* Table view */
    .table-container {
      padding: 1.25rem 1.5rem;
    }
    .table-header-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .meta-count {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .page-indicator {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th {
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border-light);
    }
    .data-table td {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.875rem;
      vertical-align: middle;
    }
    .row-cancelled td {
      opacity: 0.65;
    }
    .cust-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cust-avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-primary-500);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      flex-shrink: 0;
    }
    .cust-title {
      display: block;
      color: var(--text-main);
      font-size: 0.875rem;
    }
    .occasion-tag {
      font-size: 0.68rem;
      color: var(--color-primary-600);
      background: var(--color-primary-50);
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    html.dark .occasion-tag {
      background: rgba(234, 88, 12, 0.2);
      color: var(--color-primary-400);
    }
    .contact-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .contact-phone {
      font-size: 0.8125rem;
      color: var(--text-main);
      font-weight: 500;
    }
    .contact-email {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .time-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .time-bold {
      font-weight: 700;
      color: var(--text-main);
      font-size: 0.875rem;
    }
    .date-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .guest-pill {
      font-size: 0.78rem;
      font-weight: 600;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }
    .table-pill {
      font-family: var(--font-brand);
      font-size: 0.9rem;
      background: var(--bg-surface-tertiary);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }
    .text-right {
      text-align: right;
    }
    .action-btn-row {
      display: inline-flex;
      gap: 4px;
    }
    .btn-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.78rem;
    }

    /* Timeline View Styles */
    .timeline-container {
      padding: 1.5rem;
      overflow-x: auto;
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .timeline-title {
      font-family: var(--font-brand);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .timeline-sub {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .timeline-legend {
      display: flex;
      gap: 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .confirmed-pill { color: #f59e0b; }
    .pending-pill { color: #3b82f6; }
    .completed-pill { color: #10b981; }

    .time-ruler {
      display: flex;
      border-bottom: 2px solid var(--border-medium);
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
      min-width: 800px;
    }
    .ruler-col-header {
      width: 80px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .ruler-slots {
      flex: 1;
      display: flex;
      justify-content: space-between;
      padding-right: 20px;
    }
    .ruler-mark {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
    }
    .timeline-rows-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 800px;
    }
    .timeline-row {
      display: flex;
      align-items: center;
      height: 44px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .timeline-table-cell {
      width: 80px;
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .timeline-table-cell strong {
      font-family: var(--font-brand);
      font-size: 0.95rem;
      color: var(--text-main);
    }
    .table-cap-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .timeline-track {
      flex: 1;
      height: 100%;
      position: relative;
      background: var(--bg-surface-secondary);
      border-radius: 4px;
    }
    .grid-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--border-light);
      pointer-events: none;
    }
    .line-1 { left: 20%; }
    .line-2 { left: 40%; }
    .line-3 { left: 60%; }
    .line-4 { left: 80%; }
    .line-5 { left: 100%; }

    .booking-timeline-block {
      position: absolute;
      top: 6px;
      bottom: 6px;
      width: 15%;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-shadow: var(--shadow-xs);
    }
    .booking-timeline-block:hover {
      transform: scaleY(1.1);
      box-shadow: var(--shadow-md);
      z-index: 10;
    }
    .block-confirmed {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      color: #92400e;
    }
    html.dark .block-confirmed {
      background: rgba(245, 158, 11, 0.25);
      border-color: rgba(245, 158, 11, 0.5);
      color: #fbbf24;
    }
    .block-completed {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }
    html.dark .block-completed {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.4);
      color: #34d399;
    }
    .block-pending {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
    }
    html.dark .block-pending {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.4);
      color: #93c5fd;
    }
    .block-name {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .block-guests {
      margin-left: 4px;
      opacity: 0.85;
    }

    /* Modal details */
    .modal-box {
      width: 100%;
      max-width: 500px;
      padding: 1.5rem;
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }
    .res-tag {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--color-primary-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .modal-title {
      font-family: var(--font-brand);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .modal-body-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .details-status-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.875rem;
      padding: 1rem;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }
    .meta-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      display: block;
    }
    .meta-val {
      font-size: 0.875rem;
      color: var(--text-main);
    }
    .note-box {
      background: var(--bg-surface-secondary);
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--color-primary-500);
    }
    .note-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-secondary);
    }
    .note-box p {
      font-size: 0.8125rem;
      color: var(--text-main);
      font-style: italic;
      margin-top: 2px;
    }
    .modal-actions-bar {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }
  `]
})
export class ReservationsComponent implements OnInit {
  resService = inject(ReservationService);
  tableService = inject(TableService);
  private route = inject(ActivatedRoute);

  viewMode: 'table' | 'timeline' = 'table';
  searchQuery = '';
  selectedStatus: string = 'all';
  selectedDate = '';

  currentPage = 1;
  pageSize = 10;

  isNewModalOpen = false;
  selectedReservation: Reservation | null = null;

  isCancelConfirmOpen = false;
  reservationToCancel: Reservation | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
    });
  }

  get filteredReservations(): Reservation[] {
    return this.resService.reservations().filter(res => {
      const matchesStatus = this.selectedStatus === 'all' || res.status === this.selectedStatus;
      const matchesDate = !this.selectedDate || res.date === this.selectedDate;

      const q = this.searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        res.customerName.toLowerCase().includes(q) ||
        res.phone.toLowerCase().includes(q) ||
        res.tableNumber.toLowerCase().includes(q);

      return matchesStatus && matchesDate && matchesQuery;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredReservations.length / this.pageSize) || 1;
  }

  get paginatedReservations(): Reservation[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredReservations.slice(start, start + this.pageSize);
  }

  getBookingsForTable(tableId: string): Reservation[] {
    return this.resService.reservations().filter(r =>
      r.tableId === tableId && r.status !== 'cancelled'
    );
  }

  calculateTimelineLeft(timeStr: string): string {
    // Range from 18:00 (0%) to 23:00 (100%) -> 5 hours = 300 minutes
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutesFrom18 = (h - 18) * 60 + m;
    const clamped = Math.max(0, Math.min(300, totalMinutesFrom18));
    const percentage = (clamped / 300) * 80; // keep within 80% to avoid overflow
    return percentage + '%';
  }

  openDetailsModal(res: Reservation): void {
    this.selectedReservation = res;
  }

  onDetailsBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.selectedReservation = null;
    }
  }

  confirmCancelReservation(res: Reservation): void {
    this.reservationToCancel = res;
    this.isCancelConfirmOpen = true;
  }

  onCancelConfirmed(): void {
    if (!this.reservationToCancel) return;
    this.resService.cancelReservation(this.reservationToCancel.id);
    this.isCancelConfirmOpen = false;
    this.reservationToCancel = null;
  }
}
