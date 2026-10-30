import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WaitlistService } from '../../core/services/waitlist.service';
import { TableService } from '../../core/services/table.service';
import { WaitlistEntry, WaitlistPriority } from '../../core/models/waitlist.model';
import { RestaurantTable } from '../../core/models/table.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EmptyStateComponent],
  template: `
    <div class="waitlist-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Live Walk-in & Waitlist Queue</h1>
          <p class="page-subtitle">Manage waiting parties, live wait estimations, and instant table seating</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openAddModal()">
          + Add to Waitlist
        </button>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="metrics-row">
        <div class="metric-card card">
          <span class="m-icon">⏳</span>
          <div>
            <span class="m-title">Currently Waiting</span>
            <strong class="m-val">{{ waitlistService.waitingCount() }} Parties</strong>
          </div>
        </div>
        <div class="metric-card card">
          <span class="m-icon">🪑</span>
          <div>
            <span class="m-title">Tables Ready for Seating</span>
            <strong class="m-val">{{ tableService.availableCount() }} Available</strong>
          </div>
        </div>
        <div class="metric-card card">
          <span class="m-icon">⏱️</span>
          <div>
            <span class="m-title">Est. Average Wait</span>
            <strong class="m-val">15 - 20 Mins</strong>
          </div>
        </div>
      </div>

      <!-- Main Queue List -->
      <div class="waitlist-container card">
        <div class="table-responsive" *ngIf="waitlistService.activeWaitlist().length > 0; else noWaitlist">
          <table class="data-table">
            <thead>
              <tr>
                <th>Queue #</th>
                <th>Guest Name</th>
                <th>Contact</th>
                <th>Party Size</th>
                <th>Wait Time</th>
                <th>Priority</th>
                <th>Notes</th>
                <th class="text-right">Seating Action</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of waitlistService.activeWaitlist(); track entry.id; let idx = $index) {
                <tr [class.vip-row]="entry.priority === 'VIP'">
                  <td>
                    <div class="queue-num-badge">
                      #{{ idx + 1 }}
                    </div>
                  </td>
                  <td>
                    <strong class="cust-title">{{ entry.customerName }}</strong>
                    <span class="added-time">Added at {{ entry.addedAt }}</span>
                  </td>
                  <td>
                    <span class="phone-text">{{ entry.phone }}</span>
                  </td>
                  <td>
                    <span class="guest-pill">👥 {{ entry.guests }} Guests</span>
                  </td>
                  <td>
                    <div class="wait-counter">
                      <span class="wait-minutes">⏱️ {{ entry.waitingTimeMinutes }} mins</span>
                    </div>
                  </td>
                  <td>
                    <span class="priority-badge" [ngClass]="'prio-' + entry.priority.toLowerCase()">
                      {{ entry.priority === 'VIP' ? '⭐ VIP' : entry.priority }}
                    </span>
                  </td>
                  <td>
                    <span class="notes-text" *ngIf="entry.notes; else noNotes">
                      "{{ entry.notes }}"
                    </span>
                    <ng-template #noNotes>
                      <span class="text-muted">—</span>
                    </ng-template>
                  </td>
                  <td class="text-right">
                    <div class="action-btn-row">
                      <button
                        type="button"
                        class="btn btn-primary btn-sm"
                        (click)="openAssignModal(entry)">
                        Assign Table
                      </button>
                      <button
                        type="button"
                        class="btn btn-ghost btn-sm text-danger"
                        (click)="waitlistService.cancelWaitlist(entry.id)"
                        title="Remove from queue">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <ng-template #noWaitlist>
          <app-empty-state
            icon="🎉"
            title="Waitlist Queue is Clear"
            description="All walk-in parties have been seated. Ready to accept new guests or walk-ins."
            actionLabel="+ Add Walk-in Party"
            (actionClicked)="openAddModal()">
          </app-empty-state>
        </ng-template>
      </div>

      <!-- Add to Waitlist Modal -->
      <div class="modal-backdrop" *ngIf="isAddModalOpen" (click)="onBackdropClick($event)">
        <div class="modal-box card animate-fade-in">
          <div class="modal-header">
            <h3>Add Guest to Waitlist</h3>
            <button type="button" class="btn-icon btn-ghost" (click)="isAddModalOpen = false">✕</button>
          </div>

          <form [formGroup]="waitlistForm" (ngSubmit)="onAddSubmit()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Customer Name *</label>
              <input type="text" class="form-input" formControlName="customerName" placeholder="e.g. Manan Joshi" />
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Phone Number *</label>
                <input type="tel" class="form-input" formControlName="phone" placeholder="+91 98200 45192" />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Party Size *</label>
                <select class="form-select" formControlName="guests">
                  <option [value]="1">1 Person</option>
                  <option [value]="2">2 Guests</option>
                  <option [value]="3">3 Guests</option>
                  <option [value]="4">4 Guests</option>
                  <option [value]="5">5 Guests</option>
                  <option [value]="6">6 Guests</option>
                  <option [value]="8">8 Guests</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Preferred Time Slot</label>
                <input type="time" class="form-input" formControlName="preferredTime" />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Queue Priority</label>
                <select class="form-select" formControlName="priority">
                  <option value="Normal">Normal Walk-in</option>
                  <option value="High">High Urgency</option>
                  <option value="VIP">⭐ VIP Member</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Seating Preferences / Notes</label>
              <textarea class="form-textarea" rows="2" formControlName="notes" placeholder="e.g. Window preferred, high chair needed..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="isAddModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="waitlistForm.invalid">Add to Queue</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Assign Table Modal -->
      <div class="modal-backdrop" *ngIf="selectedEntryToSeat" (click)="onAssignBackdrop($event)">
        <div class="modal-box card animate-fade-in">
          <div class="modal-header">
            <div>
              <span class="sub-pill">Party of {{ selectedEntryToSeat.guests }}</span>
              <h3>Seat {{ selectedEntryToSeat.customerName }}</h3>
            </div>
            <button type="button" class="btn-icon btn-ghost" (click)="selectedEntryToSeat = null">✕</button>
          </div>

          <div class="assign-body">
            <p class="assign-hint">Select a table with capacity of at least {{ selectedEntryToSeat.guests }} guests:</p>

            <div class="assign-tables-grid">
              @for (tbl of availableTablesForParty; track tbl.id) {
                <div class="assign-table-card" (click)="confirmTableAssignment(tbl.id)">
                  <div class="tbl-head">
                    <strong class="t-num">{{ tbl.tableNumber }}</strong>
                    <span class="t-cap">👥 {{ tbl.capacity }} Seats</span>
                  </div>
                  <span class="t-zone">{{ tbl.zone }}</span>
                  <button type="button" class="btn btn-primary btn-sm btn-block mt-2">
                    Seat Here
                  </button>
                </div>
              }
            </div>

            <div *ngIf="availableTablesForParty.length === 0" class="no-available-alert">
              <span>⚠️ No currently available table has capacity for {{ selectedEntryToSeat.guests }} guests.</span>
              <p>Please wait for seated tables to clear and be sanitized.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .waitlist-page {
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
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }
    @media (max-width: 768px) {
      .metrics-row {
        grid-template-columns: 1fr;
      }
    }
    .metric-card {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .m-icon {
      font-size: 1.75rem;
    }
    .m-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-muted);
      display: block;
    }
    .m-val {
      font-family: var(--font-brand);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .waitlist-container {
      padding: 1.25rem 1.5rem;
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
    .queue-num-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
      color: var(--text-main);
    }
    .vip-row {
      background: rgba(245, 158, 11, 0.04);
    }
    .cust-title {
      display: block;
      color: var(--text-main);
    }
    .added-time {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .phone-text {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }
    .guest-pill {
      font-size: 0.78rem;
      font-weight: 600;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }
    .wait-minutes {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--color-primary-600);
    }
    .priority-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .prio-normal {
      background: var(--bg-surface-secondary);
      color: var(--text-secondary);
      border: 1px solid var(--border-light);
    }
    .prio-high {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }
    .prio-vip {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .notes-text {
      font-size: 0.78rem;
      color: var(--text-secondary);
      font-style: italic;
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

    /* Modal styles */
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
    .sub-pill {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--color-primary-600);
      text-transform: uppercase;
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
    .assign-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .assign-hint {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .assign-tables-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .assign-table-card {
      background: var(--bg-surface-secondary);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 0.875rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .assign-table-card:hover {
      border-color: var(--color-primary-500);
      transform: translateY(-2px);
    }
    .tbl-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .t-num {
      font-family: var(--font-brand);
      font-size: 1.15rem;
      color: var(--text-main);
    }
    .t-cap {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 600;
    }
    .t-zone {
      font-size: 0.72rem;
      color: var(--text-muted);
      display: block;
      margin-top: 2px;
    }
    .btn-block {
      width: 100%;
    }
    .mt-2 {
      margin-top: 0.5rem;
    }
    .no-available-alert {
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: var(--radius-md);
      text-align: center;
      color: #991b1b;
      font-size: 0.85rem;
    }
    html.dark .no-available-alert {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
  `]
})
export class WaitlistComponent {
  waitlistService = inject(WaitlistService);
  tableService = inject(TableService);
  private fb = inject(FormBuilder);

  isAddModalOpen = false;
  selectedEntryToSeat: WaitlistEntry | null = null;
  waitlistForm!: FormGroup;

  constructor() {
    this.waitlistForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      guests: [2, Validators.required],
      preferredTime: ['20:00'],
      priority: ['Normal', Validators.required],
      notes: ['']
    });
  }

  get availableTablesForParty(): RestaurantTable[] {
    if (!this.selectedEntryToSeat) return [];
    return this.tableService.tables().filter(t =>
      t.status === 'available' && t.capacity >= (this.selectedEntryToSeat?.guests || 1)
    );
  }

  openAddModal(): void {
    this.waitlistForm.reset({
      guests: 2,
      priority: 'Normal',
      preferredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.isAddModalOpen = true;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.isAddModalOpen = false;
    }
  }

  onAssignBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.selectedEntryToSeat = null;
    }
  }

  onAddSubmit(): void {
    if (this.waitlistForm.invalid) return;

    const val = this.waitlistForm.value;
    this.waitlistService.addEntry({
      customerName: val.customerName,
      phone: val.phone,
      guests: Number(val.guests),
      preferredTime: val.preferredTime || 'Now',
      priority: val.priority as WaitlistPriority,
      notes: val.notes
    });

    this.isAddModalOpen = false;
  }

  openAssignModal(entry: WaitlistEntry): void {
    this.selectedEntryToSeat = entry;
  }

  confirmTableAssignment(tableId: string): void {
    if (!this.selectedEntryToSeat) return;
    this.waitlistService.assignTable(this.selectedEntryToSeat.id, tableId);
    this.selectedEntryToSeat = null;
  }
}
