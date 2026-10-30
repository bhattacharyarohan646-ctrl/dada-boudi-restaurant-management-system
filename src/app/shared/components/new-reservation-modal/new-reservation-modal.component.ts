import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableService } from '../../../core/services/table.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { RestaurantTable, TableMatchRecommendation } from '../../../core/models/table.model';

@Component({
  selector: 'app-new-reservation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-card card animate-fade-in" role="dialog" aria-modal="true">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <span class="modal-subtitle">Direct Booking System</span>
            <h2 class="modal-title">New Table Reservation</h2>
          </div>
          <button type="button" class="btn-icon btn-ghost" (click)="close.emit()" aria-label="Close dialog">
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form [formGroup]="resForm" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-row">
            <!-- Customer Name -->
            <div class="form-group flex-1">
              <label class="form-label">Customer Name *</label>
              <input
                type="text"
                class="form-input"
                [class.is-invalid]="f['customerName'].touched && f['customerName'].invalid"
                formControlName="customerName"
                placeholder="e.g. Rahul Sharma" />
              <div *ngIf="f['customerName'].touched && f['customerName'].invalid" class="form-error">
                Name is required (min 2 letters).
              </div>
            </div>

            <!-- Phone -->
            <div class="form-group flex-1">
              <label class="form-label">Phone Number *</label>
              <input
                type="tel"
                class="form-input"
                [class.is-invalid]="f['phone'].touched && f['phone'].invalid"
                formControlName="phone"
                placeholder="e.g. +91 98201 44521" />
              <div *ngIf="f['phone'].touched && f['phone'].invalid" class="form-error">
                Valid contact number is required.
              </div>
            </div>
          </div>

          <div class="form-row">
            <!-- Email -->
            <div class="form-group flex-1">
              <label class="form-label">Email Address</label>
              <input
                type="email"
                class="form-input"
                formControlName="email"
                placeholder="e.g. rahul@example.com" />
            </div>

            <!-- Occasion -->
            <div class="form-group flex-1">
              <label class="form-label">Occasion</label>
              <select class="form-select" formControlName="occasion">
                <option value="Casual">Casual Dining</option>
                <option value="Birthday">Birthday Celebration 🎂</option>
                <option value="Anniversary">Anniversary 🥂</option>
                <option value="Business">Business Meeting 💼</option>
                <option value="Date Night">Date Night ✨</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <!-- Number of Guests -->
            <div class="form-group flex-1">
              <label class="form-label">Number of Guests *</label>
              <div class="guest-selector">
                <button
                  type="button"
                  class="btn-guest-adj"
                  (click)="adjustGuests(-1)"
                  [disabled]="f['guests'].value <= 1">
                  -
                </button>
                <span class="guest-display">
                  <strong>{{ f['guests'].value }}</strong> Guests
                </span>
                <button
                  type="button"
                  class="btn-guest-adj"
                  (click)="adjustGuests(1)"
                  [disabled]="f['guests'].value >= 12">
                  +
                </button>
              </div>
            </div>

            <!-- Date -->
            <div class="form-group flex-1">
              <label class="form-label">Date *</label>
              <input
                type="date"
                class="form-input"
                formControlName="date"
                [class.is-invalid]="f['date'].touched && f['date'].invalid" />
            </div>

            <!-- Time -->
            <div class="form-group flex-1">
              <label class="form-label">Time Slot *</label>
              <select class="form-select" formControlName="time">
                <option value="18:30">6:30 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="19:30">7:30 PM</option>
                <option value="20:00">8:00 PM</option>
                <option value="20:30">8:30 PM</option>
                <option value="21:00">9:00 PM</option>
                <option value="21:30">9:30 PM</option>
                <option value="22:00">10:00 PM</option>
              </select>
            </div>
          </div>

          <!-- SMART TABLE RECOMMENDATION SECTION -->
          <div class="recommendation-box">
            <div class="rec-header">
              <div class="rec-title">
                <span class="sparkle-icon">✨</span>
                <strong>Smart Table Recommendations</strong>
              </div>
              <span class="rec-hint">
                Matched for <strong>{{ f['guests'].value }} guests</strong> from currently available tables:
              </span>
            </div>

            <div class="rec-list" *ngIf="recommendedTables.length > 0; else noTablesFound">
              @for (rec of recommendedTables; track rec.table.id) {
                <div
                  class="rec-card"
                  [class.is-selected]="f['tableId'].value === rec.table.id"
                  [class.is-best]="rec.isBestMatch"
                  (click)="selectTable(rec.table.id)">
                  <div class="rec-badge-row">
                    <span class="best-badge" *ngIf="rec.isBestMatch">⭐ Best Match</span>
                    <span class="zone-badge">{{ rec.table.zone }}</span>
                  </div>
                  <div class="rec-card-main">
                    <span class="rec-table-num">{{ rec.table.tableNumber }}</span>
                    <span class="rec-cap">{{ rec.table.capacity }} seats</span>
                  </div>
                  <div class="rec-reason">{{ rec.matchReason }}</div>
                </div>
              }
            </div>

            <ng-template #noTablesFound>
              <div class="no-tables-warn">
                <span>⚠️ No tables currently available with capacity for {{ f['guests'].value }} guests.</span>
                <span class="subtext">You may choose any active table or add this guest to the Waitlist.</span>
              </div>
            </ng-template>

            <div *ngIf="f['tableId'].touched && f['tableId'].invalid" class="form-error mt-2">
              Please click to select an assigned table.
            </div>
          </div>

          <!-- Special Request -->
          <div class="form-group">
            <label class="form-label">Special Dietary or Seating Requests</label>
            <textarea
              class="form-textarea"
              rows="2"
              formControlName="specialRequest"
              placeholder="e.g. Window preference, high chair for toddler, champagne service..."></textarea>
          </div>

          <!-- Footer Actions -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="close.emit()">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="resForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Confirming Booking...' : '✓ Confirm Reservation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-card {
      width: 100%;
      max-width: 680px;
      max-height: 92vh;
      overflow-y: auto;
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-light);
    }
    .modal-subtitle {
      font-size: 0.75rem;
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
      margin-top: 2px;
    }
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .flex-1 {
      flex: 1;
    }
    .guest-selector {
      display: flex;
      align-items: center;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 4px;
      height: 42px;
    }
    .btn-guest-adj {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      font-weight: 700;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-light);
      color: var(--text-main);
    }
    .btn-guest-adj:hover:not(:disabled) {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
    }
    .btn-guest-adj:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .guest-display {
      flex: 1;
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-main);
    }
    /* Smart recommendations */
    .recommendation-box {
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1rem 1.25rem;
      margin: 0.5rem 0 1rem;
    }
    .rec-header {
      margin-bottom: 0.75rem;
    }
    .rec-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: var(--text-main);
    }
    .sparkle-icon {
      font-size: 1.1rem;
    }
    .rec-hint {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .rec-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 0.75rem;
    }
    .rec-card {
      background: var(--bg-surface);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .rec-card:hover {
      border-color: var(--color-primary-400);
      transform: translateY(-2px);
    }
    .rec-card.is-selected {
      border-color: var(--color-primary-600);
      background: var(--color-primary-50);
      box-shadow: 0 0 0 2px var(--color-primary-500);
    }
    html.dark .rec-card.is-selected {
      background: rgba(234, 88, 12, 0.15);
    }
    .rec-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 18px;
    }
    .best-badge {
      font-size: 0.68rem;
      font-weight: 700;
      color: #92400e;
      background: #fef3c7;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      border: 1px solid #fde68a;
    }
    .zone-badge {
      font-size: 0.65rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .rec-card-main {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    .rec-table-num {
      font-family: var(--font-brand);
      font-weight: 800;
      font-size: 1.15rem;
      color: var(--text-main);
    }
    .rec-cap {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .rec-reason {
      font-size: 0.7rem;
      color: var(--text-secondary);
      line-height: 1.3;
    }
    .no-tables-warn {
      padding: 1rem;
      text-align: center;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: var(--radius-sm);
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.8125rem;
      color: #92400e;
    }
    html.dark .no-tables-warn {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.3);
      color: #fde68a;
    }
    .mt-2 {
      margin-top: 0.5rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light);
    }
    @media (max-width: 640px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class NewReservationModalComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private tableService = inject(TableService);
  private resService = inject(ReservationService);

  @Input() isOpen = false;
  @Input() preselectedTable?: RestaurantTable;

  @Output() close = new EventEmitter<void>();
  @Output() reservationCreated = new EventEmitter<void>();

  resForm!: FormGroup;
  recommendedTables: TableMatchRecommendation[] = [];
  isSubmitting = false;

  get f() {
    return this.resForm.controls;
  }

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.resForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      email: [''],
      guests: [4, [Validators.required, Validators.min(1), Validators.max(20)]],
      date: [today, Validators.required],
      time: ['19:30', Validators.required],
      occasion: ['Casual'],
      tableId: ['', Validators.required],
      specialRequest: ['']
    });

    this.updateRecommendations(4);

    // Reactively update recommendations when guest count changes
    this.resForm.get('guests')?.valueChanges.subscribe(count => {
      this.updateRecommendations(count);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preselectedTable'] && this.preselectedTable && this.resForm) {
      this.resForm.patchValue({
        tableId: this.preselectedTable.id,
        guests: Math.min(this.preselectedTable.capacity, 4)
      });
      this.updateRecommendations(this.resForm.get('guests')?.value);
    }
  }

  updateRecommendations(guests: number): void {
    this.recommendedTables = this.tableService.recommendTables(guests);

    // If preselected table is available, prefer keeping it selected
    if (this.preselectedTable && this.recommendedTables.some(r => r.table.id === this.preselectedTable?.id)) {
      this.resForm.patchValue({ tableId: this.preselectedTable.id });
    } else if (this.recommendedTables.length > 0) {
      // Auto-select the Best Match table!
      const currentSelected = this.resForm.get('tableId')?.value;
      if (!currentSelected || !this.recommendedTables.some(r => r.table.id === currentSelected)) {
        this.resForm.patchValue({ tableId: this.recommendedTables[0].table.id });
      }
    } else {
      this.resForm.patchValue({ tableId: '' });
    }
  }

  adjustGuests(delta: number): void {
    const current = Number(this.resForm.get('guests')?.value || 1);
    const updated = Math.max(1, Math.min(12, current + delta));
    this.resForm.patchValue({ guests: updated });
  }

  selectTable(tableId: string): void {
    this.resForm.patchValue({ tableId });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    if (this.resForm.invalid) {
      this.resForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const values = this.resForm.value;

    setTimeout(() => {
      this.resService.createReservation({
        customerName: values.customerName,
        phone: values.phone,
        email: values.email,
        guests: Number(values.guests),
        date: values.date,
        time: values.time,
        tableId: values.tableId,
        specialRequest: values.specialRequest,
        occasion: values.occasion
      });

      this.isSubmitting = false;
      this.reservationCreated.emit();
      this.close.emit();
      this.resForm.reset({
        guests: 4,
        date: new Date().toISOString().split('T')[0],
        time: '19:30',
        occasion: 'Casual'
      });
    }, 350);
  }
}
