import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../../../core/services/table.service';
import { RestaurantTable, TableStatus, TableZone } from '../../../core/models/table.model';

@Component({
  selector: 'app-staff-tables',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="staff-tables-page animate-fade-in">
      <div class="page-head">
        <div>
          <h1 class="page-title">Quick Table Turnover & Floor Status</h1>
          <p class="page-sub">Tap table status buttons to instantly update real-time floor availability across phone and laptop.</p>
        </div>

        <div class="zone-filter-bar">
          <button
            type="button"
            class="zone-chip"
            [class.active]="selectedZone() === 'All'"
            (click)="selectedZone.set('All')">
            All ({{ tableService.totalTables() }})
          </button>
          @for (zone of zones; track zone) {
            <button
              type="button"
              class="zone-chip"
              [class.active]="selectedZone() === zone"
              (click)="selectedZone.set(zone)">
              {{ zone }}
            </button>
          }
        </div>
      </div>

      <!-- Tables Turnover Grid -->
      <div class="tables-grid">
        @for (table of filteredTables(); track table.id) {
          <div class="staff-table-card" [ngClass]="'status-' + table.status">
            <div class="table-card-top">
              <div class="table-ident">
                <span class="t-number">{{ table.tableNumber }}</span>
                <span class="t-cap">👥 {{ table.capacity }} Seats</span>
              </div>
              <span class="t-zone-tag">{{ table.zone }}</span>
            </div>

            <div class="status-display">
              <span class="status-title">{{ getStatusDisplay(table.status) }}</span>
            </div>

            <!-- Touch Action Buttons -->
            <div class="turnover-actions">
              <button
                *ngIf="table.status === 'available'"
                type="button"
                class="btn-turnover to-occupied"
                (click)="setStatus(table.id, 'occupied')">
                🍽️ Seat Walk-In
              </button>

              <button
                *ngIf="table.status === 'reserved'"
                type="button"
                class="btn-turnover to-occupied"
                (click)="setStatus(table.id, 'occupied')">
                🚶 Seat Guests
              </button>

              <button
                *ngIf="table.status === 'occupied'"
                type="button"
                class="btn-turnover to-cleaning"
                (click)="setStatus(table.id, 'cleaning')">
                🧹 Mark for Cleaning
              </button>

              <button
                *ngIf="table.status === 'cleaning'"
                type="button"
                class="btn-turnover to-available"
                (click)="setStatus(table.id, 'available')">
                ✨ Cleaned & Ready
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .staff-tables-page {
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
    .zone-filter-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .zone-chip {
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      background: var(--bg-surface);
      color: var(--text-secondary);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
    }
    .zone-chip.active {
      background: var(--color-primary-600);
      color: #fff;
      border-color: var(--color-primary-600);
    }

    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 1rem;
    }
    .staff-table-card {
      background: var(--bg-surface);
      border: 2px solid var(--border-medium);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: var(--shadow-sm);
    }
    .staff-table-card.status-available {
      border-color: #10b981;
    }
    .staff-table-card.status-reserved {
      border-color: #f59e0b;
    }
    .staff-table-card.status-occupied {
      border-color: #ef4444;
    }
    .staff-table-card.status-cleaning {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.04);
    }

    .table-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .table-ident {
      display: flex;
      flex-direction: column;
    }
    .t-number {
      font-family: var(--font-brand);
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--text-main);
      line-height: 1.1;
    }
    .t-cap {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .t-zone-tag {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-secondary);
      background: var(--bg-surface-secondary);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .status-display {
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .status-available .status-title { color: #10b981; }
    .status-reserved .status-title { color: #f59e0b; }
    .status-occupied .status-title { color: #ef4444; }
    .status-cleaning .status-title { color: #3b82f6; }

    .turnover-actions {
      margin-top: auto;
    }
    .btn-turnover {
      width: 100%;
      padding: 0.65rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: var(--shadow-sm);
    }
    .to-occupied {
      background: #ef4444;
      color: #fff;
    }
    .to-cleaning {
      background: #3b82f6;
      color: #fff;
    }
    .to-available {
      background: #10b981;
      color: #fff;
    }
  `]
})
export class StaffTablesComponent {
  tableService = inject(TableService);

  zones: TableZone[] = ['Window', 'Main Dining', 'Bar Area', 'Outdoor Patio', 'Private Dining'];
  selectedZone = signal<string>('All');

  filteredTables = computed(() => {
    const zone = this.selectedZone();
    const list = this.tableService.tables();
    if (zone === 'All') return list;
    return list.filter(t => t.zone === zone);
  });

  getStatusDisplay(status: TableStatus): string {
    switch (status) {
      case 'available': return '🟢 Available';
      case 'reserved': return '🟡 Reserved';
      case 'occupied': return '🔴 Occupied';
      case 'cleaning': return '🧹 Needs Cleaning';
      default: return status;
    }
  }

  setStatus(tableId: string, status: TableStatus): void {
    this.tableService.updateTableStatus(tableId, status);
  }
}
