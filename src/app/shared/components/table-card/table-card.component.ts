import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantTable } from '../../../core/models/table.model';
import { Reservation } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="table-node"
      [ngClass]="[
        'status-' + table.status,
        'shape-' + table.shape,
        isSelected ? 'is-selected' : '',
        compact ? 'is-compact' : ''
      ]"
      (click)="clicked.emit(table)"
      tabindex="0"
      (keydown.enter)="clicked.emit(table)"
      role="button"
      [attr.aria-label]="'Table ' + table.tableNumber + ' ' + table.status + ' capacity ' + table.capacity">

      <!-- Status glow ring -->
      <div class="status-indicator"></div>

      <!-- Top capacity header -->
      <div class="table-header">
        <span class="table-number">{{ table.tableNumber }}</span>
        <span class="table-cap">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          {{ table.capacity }}
        </span>
      </div>

      <!-- Table Visual Representation with seats -->
      <div class="table-surface">
        <div class="table-surface-inner">
          <span class="status-pill">{{ table.status }}</span>
        </div>
      </div>

      <!-- Footer Info: Customer or status note -->
      <div class="table-footer" *ngIf="!compact">
        @if (reservation && (table.status === 'reserved' || table.status === 'occupied')) {
          <div class="guest-info">
            <span class="guest-name" [title]="reservation.customerName">{{ reservation.customerName }}</span>
            <span class="guest-time">{{ reservation.time }}</span>
          </div>
        } @else {
          <div class="zone-info">
            <span class="zone-label">{{ table.zone }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .table-node {
      position: relative;
      background: var(--bg-card);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 0.875rem 1rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 120px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-xs);
      outline: none;
    }
    .table-node:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: var(--shadow-md);
      border-color: var(--border-medium);
    }
    .table-node:focus-visible {
      box-shadow: 0 0 0 3px var(--color-primary-glow);
      border-color: var(--color-primary);
    }
    .table-node.is-selected {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 2px var(--color-primary-500), var(--shadow-md);
    }

    /* Status variants */
    .status-available {
      border-top: 4px solid var(--status-available);
    }
    .status-available .status-indicator {
      background: var(--status-available);
    }
    .status-available .status-pill {
      background: var(--status-available-bg);
      color: var(--status-available-text);
      border: 1px solid var(--status-available-border);
    }

    .status-reserved {
      border-top: 4px solid var(--status-reserved);
    }
    .status-reserved .status-indicator {
      background: var(--status-reserved);
    }
    .status-reserved .status-pill {
      background: var(--status-reserved-bg);
      color: var(--status-reserved-text);
      border: 1px solid var(--status-reserved-border);
    }

    .status-occupied {
      border-top: 4px solid var(--status-occupied);
    }
    .status-occupied .status-indicator {
      background: var(--status-occupied);
    }
    .status-occupied .status-pill {
      background: var(--status-occupied-bg);
      color: var(--status-occupied-text);
      border: 1px solid var(--status-occupied-border);
    }

    .status-cleaning {
      border-top: 4px solid var(--status-cleaning);
    }
    .status-cleaning .status-indicator {
      background: var(--status-cleaning);
    }
    .status-cleaning .status-pill {
      background: var(--status-cleaning-bg);
      color: var(--status-cleaning-text);
      border: 1px solid var(--status-cleaning-border);
    }

    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .table-number {
      font-family: var(--font-brand);
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }
    .table-cap {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      background: var(--bg-surface-tertiary);
      padding: 2px 7px;
      border-radius: var(--radius-full);
    }

    .table-surface {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.75rem 0;
    }
    .table-surface-inner {
      width: 100%;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-secondary);
      border: 1px dashed var(--border-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .shape-round .table-surface-inner {
      border-radius: 20px;
      width: 80px;
    }
    .shape-rectangle .table-surface-inner {
      border-radius: var(--radius-sm);
      height: 44px;
    }

    .status-pill {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }

    .table-footer {
      border-top: 1px solid var(--border-subtle);
      padding-top: 0.5rem;
      min-height: 26px;
    }
    .guest-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .guest-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }
    .guest-time {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-primary-600);
      background: var(--color-primary-50);
      padding: 1px 6px;
      border-radius: 4px;
    }
    html.dark .guest-time {
      background: rgba(234, 88, 12, 0.2);
      color: var(--color-primary-400);
    }

    .zone-info {
      display: flex;
      align-items: center;
    }
    .zone-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Compact mode */
    .is-compact {
      min-height: 90px;
      padding: 0.625rem 0.75rem;
    }
    .is-compact .table-surface {
      margin: 0.35rem 0 0;
    }
    .is-compact .table-surface-inner {
      height: 28px;
    }
  `]
})
export class TableCardComponent {
  @Input({ required: true }) table!: RestaurantTable;
  @Input() reservation?: Reservation;
  @Input() isSelected = false;
  @Input() compact = false;

  @Output() clicked = new EventEmitter<RestaurantTable>();
}
