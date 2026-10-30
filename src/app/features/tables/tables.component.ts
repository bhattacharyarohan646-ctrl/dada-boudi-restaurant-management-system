import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableService } from '../../core/services/table.service';
import { ReservationService } from '../../core/services/reservation.service';
import { RestaurantTable, TableStatus, TableZone, TableShape } from '../../core/models/table.model';
import { Reservation } from '../../core/models/reservation.model';
import { TableCardComponent } from '../../shared/components/table-card/table-card.component';
import { TableDetailsDrawerComponent } from '../../shared/components/table-details-drawer/table-details-drawer.component';
import { NewReservationModalComponent } from '../../shared/components/new-reservation-modal/new-reservation-modal.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableCardComponent,
    TableDetailsDrawerComponent,
    NewReservationModalComponent,
    ConfirmationDialogComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="tables-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Table & Floor Plan Management</h1>
          <p class="page-subtitle">Real-time interactive floor plan, zone layouts, and seating transitions</p>
        </div>

        <div class="header-actions">
          <!-- View switcher tabs -->
          <div class="tab-pill-group">
            <button
              type="button"
              class="tab-pill"
              [class.active]="activeTab === 'floorplan'"
              (click)="activeTab = 'floorplan'">
              🗺️ Interactive Floor Plan
            </button>
            <button
              type="button"
              class="tab-pill"
              [class.active]="activeTab === 'list'"
              (click)="activeTab = 'list'">
              📋 Table Directory
            </button>
          </div>

          <button type="button" class="btn btn-primary" (click)="openAddTableModal()">
            + Add Table
          </button>
        </div>
      </div>

      <!-- Filters & Status Legend Bar -->
      <div class="filter-legend-bar card">
        <div class="zone-filter-chips">
          <button
            type="button"
            class="chip-btn"
            [class.active]="selectedZone === 'All'"
            (click)="selectedZone = 'All'">
            All Zones ({{ tableService.totalTables() }})
          </button>
          <button
            type="button"
            class="chip-btn"
            [class.active]="selectedZone === 'Window'"
            (click)="selectedZone = 'Window'">
            🪟 Window
          </button>
          <button
            type="button"
            class="chip-btn"
            [class.active]="selectedZone === 'Main Dining'"
            (click)="selectedZone = 'Main Dining'">
            🍽️ Main Dining
          </button>
          <button
            type="button"
            class="chip-btn"
            [class.active]="selectedZone === 'Bar Area'"
            (click)="selectedZone = 'Bar Area'">
            🍸 Bar Area
          </button>
          <button
            type="button"
            class="chip-btn"
            [class.active]="selectedZone === 'Outdoor Patio'"
            (click)="selectedZone = 'Outdoor Patio'">
            🌿 Outdoor Patio
          </button>
          <button
            type="button"
            class="chip-btn"
            [class.active]="selectedZone === 'Private Dining'"
            (click)="selectedZone = 'Private Dining'">
            👑 Private Dining
          </button>
        </div>

        <div class="status-legend">
          <div class="legend-item" (click)="toggleStatusFilter('available')" [class.muted]="statusFilter && statusFilter !== 'available'">
            <span class="legend-dot dot-available"></span>
            <span>Available ({{ tableService.availableCount() }})</span>
          </div>
          <div class="legend-item" (click)="toggleStatusFilter('reserved')" [class.muted]="statusFilter && statusFilter !== 'reserved'">
            <span class="legend-dot dot-reserved"></span>
            <span>Reserved ({{ tableService.reservedCount() }})</span>
          </div>
          <div class="legend-item" (click)="toggleStatusFilter('occupied')" [class.muted]="statusFilter && statusFilter !== 'occupied'">
            <span class="legend-dot dot-occupied"></span>
            <span>Occupied ({{ tableService.occupiedCount() }})</span>
          </div>
          <div class="legend-item" (click)="toggleStatusFilter('cleaning')" [class.muted]="statusFilter && statusFilter !== 'cleaning'">
            <span class="legend-dot dot-cleaning"></span>
            <span>Cleaning ({{ tableService.cleaningCount() }})</span>
          </div>
        </div>
      </div>

      <!-- TAB 1: HERO INTERACTIVE FLOOR PLAN -->
      @if (activeTab === 'floorplan') {
        <div class="floor-plan-container card">
          <!-- Architectural Header / Compass -->
          <div class="architectural-bar window-facade">
            <span class="arch-label">🪟 LARGE PANORAMIC GLASS WINDOW FACADE (STREET VIEW)</span>
          </div>

          <!-- Restaurant Floor Layout Area -->
          <div class="floor-canvas">
            <!-- Zone 1: Window Section -->
            <div class="floor-zone-block zone-window" *ngIf="isZoneVisible('Window')">
              <div class="zone-header">
                <span class="zone-title-badge">Window Seating Area</span>
                <span class="zone-hint">Natural light & street view</span>
              </div>
              <div class="tables-grid">
                @for (tbl of getTablesForZone('Window'); track tbl.id) {
                  <app-table-card
                    [table]="tbl"
                    [reservation]="getReservationForTable(tbl.id)"
                    (clicked)="onTableSelected(tbl)">
                  </app-table-card>
                }
              </div>
            </div>

            <!-- Floor Divider Corridor -->
            <div class="floor-corridor">
              <span class="corridor-line">────── PRIMARY GUEST WALKWAY ──────</span>
            </div>

            <!-- Middle Section: Main Dining & Bar Area split -->
            <div class="floor-middle-split">
              <!-- Main Dining Zone -->
              <div class="floor-zone-block zone-main flex-2" *ngIf="isZoneVisible('Main Dining')">
                <div class="zone-header">
                  <span class="zone-title-badge">Main Dining Hall</span>
                  <span class="zone-hint">Central banquettes & dinner tables</span>
                </div>
                <div class="tables-grid grid-3col">
                  @for (tbl of getTablesForZone('Main Dining'); track tbl.id) {
                    <app-table-card
                      [table]="tbl"
                      [reservation]="getReservationForTable(tbl.id)"
                      (clicked)="onTableSelected(tbl)">
                    </app-table-card>
                  }
                </div>
              </div>

              <!-- Bar Area Zone -->
              <div class="floor-zone-block zone-bar flex-1" *ngIf="isZoneVisible('Bar Area')">
                <div class="zone-header">
                  <span class="zone-title-badge">🍸 Bar & Lounge</span>
                  <span class="zone-hint">Cocktail bar counter</span>
                </div>
                <div class="bar-counter-graphic">
                  <span>MARBLE COCKTAIL BAR</span>
                </div>
                <div class="tables-grid grid-2col">
                  @for (tbl of getTablesForZone('Bar Area'); track tbl.id) {
                    <app-table-card
                      [table]="tbl"
                      [reservation]="getReservationForTable(tbl.id)"
                      (clicked)="onTableSelected(tbl)">
                    </app-table-card>
                  }
                </div>
              </div>
            </div>

            <!-- Bottom Section: Outdoor Patio & Private Dining -->
            <div class="floor-bottom-split">
              <!-- Outdoor Patio -->
              <div class="floor-zone-block zone-patio flex-1" *ngIf="isZoneVisible('Outdoor Patio')">
                <div class="zone-header">
                  <span class="zone-title-badge">🌿 Garden Patio</span>
                  <span class="zone-hint">Open-air botanical terrace</span>
                </div>
                <div class="tables-grid grid-2col">
                  @for (tbl of getTablesForZone('Outdoor Patio'); track tbl.id) {
                    <app-table-card
                      [table]="tbl"
                      [reservation]="getReservationForTable(tbl.id)"
                      (clicked)="onTableSelected(tbl)">
                    </app-table-card>
                  }
                </div>
              </div>

              <!-- Private Dining Room (VIP) -->
              <div class="floor-zone-block zone-vip flex-1" *ngIf="isZoneVisible('Private Dining')">
                <div class="zone-header">
                  <span class="zone-title-badge vip-zone-badge">👑 Royal Private Chambers</span>
                  <span class="zone-hint">Acoustic privacy & sommelier service</span>
                </div>
                <div class="tables-grid grid-2col">
                  @for (tbl of getTablesForZone('Private Dining'); track tbl.id) {
                    <app-table-card
                      [table]="tbl"
                      [reservation]="getReservationForTable(tbl.id)"
                      (clicked)="onTableSelected(tbl)">
                    </app-table-card>
                  }
                </div>
              </div>
            </div>

            <!-- Architectural Footer: Main Entrance & Kitchen Door -->
            <div class="floor-bottom-architecture">
              <div class="arch-box entrance-box">
                <span>🚪 MAIN HOST RECEPTION & ENTRANCE</span>
              </div>
              <div class="arch-box kitchen-box">
                <span>👨‍🍳 CHEF EXPEDITE / KITCHEN ACCESS</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: TABLE DIRECTORY / LIST VIEW -->
      @if (activeTab === 'list') {
        <div class="table-list-container card">
          <div class="list-controls-bar">
            <div class="search-wrap">
              <input
                type="text"
                class="form-input"
                placeholder="Filter table number, zone or capacity..."
                [(ngModel)]="searchQuery" />
            </div>
            <span class="count-badge">Showing {{ filteredTables.length }} of {{ tableService.totalTables() }}</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Capacity</th>
                  <th>Zone / Section</th>
                  <th>Shape</th>
                  <th>Status</th>
                  <th>Current Booking</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (tbl of filteredTables; track tbl.id) {
                  <tr>
                    <td>
                      <div class="table-num-pill">
                        <strong>{{ tbl.tableNumber }}</strong>
                      </div>
                    </td>
                    <td>
                      <span class="cap-tag">👥 {{ tbl.capacity }} Seats</span>
                    </td>
                    <td>
                      <span class="zone-text">{{ tbl.zone }}</span>
                    </td>
                    <td>
                      <span class="shape-text">{{ tbl.shape | titlecase }}</span>
                    </td>
                    <td>
                      <app-status-badge [status]="tbl.status"></app-status-badge>
                    </td>
                    <td>
                      @if (getReservationForTable(tbl.id); as res) {
                        <div class="table-booking-info">
                          <strong>{{ res.customerName }}</strong>
                          <span>🕒 {{ res.time }} ({{ res.guests }} guests)</span>
                        </div>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                    <td class="text-right">
                      <div class="action-btn-group">
                        <button
                          type="button"
                          class="btn btn-secondary btn-sm"
                          (click)="onTableSelected(tbl)">
                          Manage
                        </button>
                        <button
                          type="button"
                          class="btn btn-ghost btn-sm text-danger"
                          (click)="confirmDeleteTable(tbl)">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Table Details Drawer -->
      <app-table-details-drawer
        [isOpen]="isDrawerOpen"
        [table]="selectedTable"
        [reservation]="selectedReservation"
        (close)="isDrawerOpen = false"
        (bookReservation)="onBookFromDrawer($event)">
      </app-table-details-drawer>

      <!-- New Reservation Modal -->
      <app-new-reservation-modal
        [isOpen]="isResModalOpen"
        [preselectedTable]="selectedTable"
        (close)="isResModalOpen = false">
      </app-new-reservation-modal>

      <!-- Add Table Modal Dialog -->
      <div class="modal-backdrop" *ngIf="isAddTableModalOpen" (click)="onAddModalBackdrop($event)">
        <div class="modal-box card animate-fade-in">
          <div class="modal-box-header">
            <h3>Add New Table</h3>
            <button type="button" class="btn-icon btn-ghost" (click)="isAddTableModalOpen = false">✕</button>
          </div>

          <form [formGroup]="tableForm" (ngSubmit)="onAddTableSubmit()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Table Number (Identifier) *</label>
              <input
                type="text"
                class="form-input"
                formControlName="tableNumber"
                placeholder="e.g. T25" />
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Capacity (Seats) *</label>
                <select class="form-select" formControlName="capacity">
                  <option [value]="2">2 Guests</option>
                  <option [value]="4">4 Guests</option>
                  <option [value]="6">6 Guests</option>
                  <option [value]="8">8 Guests</option>
                  <option [value]="10">10 Guests</option>
                </select>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Shape *</label>
                <select class="form-select" formControlName="shape">
                  <option value="square">Square</option>
                  <option value="round">Round</option>
                  <option value="rectangle">Rectangle</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Restaurant Zone *</label>
              <select class="form-select" formControlName="zone">
                <option value="Window">Window</option>
                <option value="Main Dining">Main Dining</option>
                <option value="Bar Area">Bar Area</option>
                <option value="Outdoor Patio">Outdoor Patio</option>
                <option value="Private Dining">Private Dining</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Initial Status</label>
              <select class="form-select" formControlName="status">
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="isAddTableModalOpen = false">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="tableForm.invalid">
                Save Table
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <app-confirmation-dialog
        [isOpen]="isDeleteConfirmOpen"
        title="Delete Restaurant Table?"
        [message]="'Are you sure you want to remove Table ' + (tableToDelete?.tableNumber || '') + '? Active bookings attached to this table may be affected.'"
        confirmText="Delete Table"
        [isDanger]="true"
        (confirm)="onDeleteConfirmed()"
        (cancel)="isDeleteConfirmOpen = false">
      </app-confirmation-dialog>
    </div>
  `,
  styles: [`
    .tables-page {
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

    /* Filters & Legend Bar */
    .filter-legend-bar {
      padding: 0.875rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .zone-filter-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .chip-btn {
      padding: 0.35rem 0.75rem;
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
    .status-legend {
      display: flex;
      gap: 1rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    .legend-item.muted {
      opacity: 0.4;
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-available { background: var(--status-available); }
    .dot-reserved { background: var(--status-reserved); }
    .dot-occupied { background: var(--status-occupied); }
    .dot-cleaning { background: var(--status-cleaning); }

    /* Floor Plan Hero Container */
    .floor-plan-container {
      padding: 1.5rem;
      background: var(--bg-card);
      border-radius: var(--radius-xl);
      overflow-x: auto;
    }
    .architectural-bar {
      text-align: center;
      padding: 0.65rem 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .window-facade {
      background: linear-gradient(90deg, #dbeafe, #eff6ff, #dbeafe);
      color: #1e40af;
      border: 1px dashed #93c5fd;
    }
    html.dark .window-facade {
      background: linear-gradient(90deg, #172554, #1e3a8a, #172554);
      color: #93c5fd;
      border-color: #3b82f6;
    }
    .floor-canvas {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 850px;
    }
    .floor-zone-block {
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      position: relative;
    }
    .zone-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .zone-title-badge {
      font-family: var(--font-brand);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .vip-zone-badge {
      color: #b45309;
    }
    html.dark .vip-zone-badge {
      color: #fbbf24;
    }
    .zone-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .tables-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .grid-3col {
      grid-template-columns: repeat(3, 1fr);
    }
    .grid-2col {
      grid-template-columns: repeat(2, 1fr);
    }
    .floor-corridor {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      font-weight: 700;
      padding: 0.25rem 0;
    }
    .floor-middle-split, .floor-bottom-split {
      display: flex;
      gap: 1.25rem;
    }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    .bar-counter-graphic {
      background: var(--bg-surface-tertiary);
      border: 2px dashed var(--border-medium);
      padding: 0.5rem;
      border-radius: var(--radius-md);
      text-align: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: 0.06em;
      margin-bottom: 1rem;
    }
    .floor-bottom-architecture {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-top: 0.5rem;
    }
    .arch-box {
      text-align: center;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }
    .entrance-box {
      background: #f0fdf4;
      color: #166534;
      border: 1px dashed #86efac;
    }
    html.dark .entrance-box {
      background: rgba(16, 185, 129, 0.1);
      color: #86efac;
      border-color: rgba(16, 185, 129, 0.3);
    }
    .kitchen-box {
      background: #fff7ed;
      color: #9a3412;
      border: 1px dashed #fdba74;
    }
    html.dark .kitchen-box {
      background: rgba(234, 88, 12, 0.1);
      color: #fdba74;
      border-color: rgba(234, 88, 12, 0.3);
    }

    /* List view styles */
    .table-list-container {
      padding: 1.5rem;
    }
    .list-controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      gap: 1rem;
    }
    .search-wrap {
      max-width: 380px;
      width: 100%;
    }
    .count-badge {
      font-size: 0.8125rem;
      color: var(--text-secondary);
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
    .table-num-pill {
      font-family: var(--font-brand);
      font-size: 1.1rem;
      color: var(--text-main);
    }
    .cap-tag {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .zone-text {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-main);
    }
    .shape-text {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .table-booking-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .table-booking-info strong {
      font-size: 0.84rem;
      color: var(--text-main);
    }
    .table-booking-info span {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .text-right {
      text-align: right;
    }
    .action-btn-group {
      display: inline-flex;
      gap: 0.5rem;
    }
    .btn-sm {
      padding: 0.35rem 0.75rem;
      font-size: 0.78rem;
    }

    /* Modal Form */
    .modal-box {
      width: 100%;
      max-width: 480px;
      padding: 1.5rem;
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
    }
    .modal-box-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .modal-box-header h3 {
      font-family: var(--font-brand);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light);
    }
  `]
})
export class TablesComponent {
  tableService = inject(TableService);
  resService = inject(ReservationService);
  private fb = inject(FormBuilder);

  activeTab: 'floorplan' | 'list' = 'floorplan';
  selectedZone: string = 'All';
  statusFilter: TableStatus | null = null;
  searchQuery: string = '';

  isDrawerOpen = false;
  selectedTable?: RestaurantTable;
  selectedReservation?: Reservation;

  isResModalOpen = false;
  isAddTableModalOpen = false;
  tableForm!: FormGroup;

  isDeleteConfirmOpen = false;
  tableToDelete?: RestaurantTable;

  constructor() {
    this.tableForm = this.fb.group({
      tableNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]],
      capacity: [4, Validators.required],
      zone: ['Main Dining', Validators.required],
      shape: ['square', Validators.required],
      status: ['available', Validators.required]
    });
  }

  isZoneVisible(zone: string): boolean {
    if (this.selectedZone === 'All') return true;
    return this.selectedZone === zone;
  }

  getTablesForZone(zone: TableZone): RestaurantTable[] {
    return this.tableService.tables().filter(t => {
      const zoneMatch = t.zone === zone;
      const statusMatch = this.statusFilter ? t.status === this.statusFilter : true;
      return zoneMatch && statusMatch;
    });
  }

  get filteredTables(): RestaurantTable[] {
    return this.tableService.tables().filter(t => {
      const matchesZone = this.selectedZone === 'All' || t.zone === this.selectedZone;
      const matchesStatus = !this.statusFilter || t.status === this.statusFilter;
      const matchesQuery = !this.searchQuery ||
        t.tableNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.zone.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.capacity.toString().includes(this.searchQuery);

      return matchesZone && matchesStatus && matchesQuery;
    });
  }

  toggleStatusFilter(status: TableStatus): void {
    if (this.statusFilter === status) {
      this.statusFilter = null;
    } else {
      this.statusFilter = status;
    }
  }

  getReservationForTable(tableId: string): Reservation | undefined {
    return this.resService.getReservationForTable(tableId);
  }

  onTableSelected(table: RestaurantTable): void {
    this.selectedTable = table;
    this.selectedReservation = this.getReservationForTable(table.id);
    this.isDrawerOpen = true;
  }

  onBookFromDrawer(table: RestaurantTable): void {
    this.isDrawerOpen = false;
    this.selectedTable = table;
    this.isResModalOpen = true;
  }

  openAddTableModal(): void {
    const nextNum = 'T' + String(this.tableService.totalTables() + 1).padStart(2, '0');
    this.tableForm.reset({
      tableNumber: nextNum,
      capacity: 4,
      zone: 'Main Dining',
      shape: 'square',
      status: 'available'
    });
    this.isAddTableModalOpen = true;
  }

  onAddModalBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.isAddTableModalOpen = false;
    }
  }

  onAddTableSubmit(): void {
    if (this.tableForm.invalid) return;

    const val = this.tableForm.value;
    this.tableService.addTable({
      tableNumber: val.tableNumber.toUpperCase(),
      capacity: Number(val.capacity),
      zone: val.zone,
      shape: val.shape,
      status: val.status,
      gridRow: 7,
      gridCol: 1
    });

    this.isAddTableModalOpen = false;
  }

  confirmDeleteTable(table: RestaurantTable): void {
    this.tableToDelete = table;
    this.isDeleteConfirmOpen = true;
  }

  onDeleteConfirmed(): void {
    if (!this.tableToDelete) return;
    this.tableService.deleteTable(this.tableToDelete.id);
    this.isDeleteConfirmOpen = false;
    this.tableToDelete = undefined;
  }
}
