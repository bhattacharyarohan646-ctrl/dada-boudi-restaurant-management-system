import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TableService } from '../../../core/services/table.service';
import { FirebaseService } from '../../../core/services/firebase.service';
import { ToastService } from '../../../core/services/toast.service';
import { RestaurantTable } from '../../../core/models/table.model';
import { environment } from '../../../../environments/environment';

interface TimeSlotOption {
  time: string;
  label: string;
  period: 'Lunch' | 'Dinner';
  isAvailable: boolean;
  availableTableCount: number;
}

@Component({
  selector: 'app-book-table',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="booking-page animate-fade-in">
      <div class="booking-container">
        <!-- Progress Stepper -->
        <div class="stepper-bar">
          <div class="step-item" [class.active]="currentStep() >= 1" [class.current]="currentStep() === 1">
            <span class="step-circle">1</span>
            <span class="step-label">Party & Time</span>
          </div>
          <div class="step-line" [class.active]="currentStep() >= 2"></div>
          <div class="step-item" [class.active]="currentStep() >= 2" [class.current]="currentStep() === 2">
            <span class="step-circle">2</span>
            <span class="step-label">Table Match</span>
          </div>
          <div class="step-line" [class.active]="currentStep() >= 3"></div>
          <div class="step-item" [class.active]="currentStep() >= 3" [class.current]="currentStep() === 3">
            <span class="step-circle">3</span>
            <span class="step-label">Details</span>
          </div>
        </div>

        <!-- Header -->
        <div class="booking-header">
          <span class="header-pill">Dada Boudi Restaurant • Barrackpore</span>
          <h1 class="booking-title">Reserve Your Dining Table</h1>
          <p class="booking-sub">
            Real-time table allocation. Confirmed bookings appear on the manager's laptop instantly.
          </p>
        </div>

        <!-- STEP 1: Date, Guest Count & Slot Selection -->
        <div *ngIf="currentStep() === 1" class="step-card animate-fade-in">
          <h2 class="step-heading">1. Choose Date, Guests & Service Time</h2>

          <div class="form-grid">
            <!-- Reservation Date -->
            <div class="form-field">
              <label class="field-label">Reservation Date *</label>
              <input
                type="date"
                class="field-input"
                [min]="todayDate"
                [max]="maxDate"
                [(ngModel)]="selectedDate"
                (change)="onDateOrGuestsChange()" />
              <span class="field-hint">Bookings open up to 30 days in advance.</span>
            </div>

            <!-- Number of Guests (Quick Selector) -->
            <div class="form-field">
              <label class="field-label">Number of Guests * (Party Size: {{ selectedGuests }})</label>
              <div class="guests-selector-row">
                @for (count of [1, 2, 3, 4, 5, 6, 8, 10]; track count) {
                  <button
                    type="button"
                    class="guest-pill"
                    [class.selected]="selectedGuests === count"
                    (click)="setGuests(count)">
                    {{ count }} {{ count === 1 ? 'Guest' : 'Guests' }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Time Slots Selector -->
          <div class="slots-section">
            <div class="slots-header">
              <label class="field-label">Available Time Slots for {{ selectedDate }}</label>
              <span class="duration-badge">⏱️ {{ defaultDuration }} Min Dining Window</span>
            </div>

            <!-- Lunch Slots -->
            <div class="slot-group">
              <span class="period-title">☀️ Lunch Dum Service (12:00 PM – 4:00 PM)</span>
              <div class="slots-grid">
                @for (slot of lunchSlots(); track slot.time) {
                  <button
                    type="button"
                    class="slot-btn"
                    [class.selected]="selectedTime === slot.time"
                    [disabled]="!slot.isAvailable"
                    (click)="selectSlot(slot.time)">
                    <span class="slot-time">{{ slot.label }}</span>
                    <span class="slot-status" [class.full]="!slot.isAvailable">
                      {{ slot.isAvailable ? slot.availableTableCount + ' Tables' : 'Filled' }}
                    </span>
                  </button>
                }
              </div>
            </div>

            <!-- Dinner Slots -->
            <div class="slot-group">
              <span class="period-title">🌙 Dinner Service (6:30 PM – 10:30 PM)</span>
              <div class="slots-grid">
                @for (slot of dinnerSlots(); track slot.time) {
                  <button
                    type="button"
                    class="slot-btn"
                    [class.selected]="selectedTime === slot.time"
                    [disabled]="!slot.isAvailable"
                    (click)="selectSlot(slot.time)">
                    <span class="slot-time">{{ slot.label }}</span>
                    <span class="slot-status" [class.full]="!slot.isAvailable">
                      {{ slot.isAvailable ? slot.availableTableCount + ' Tables' : 'Filled' }}
                    </span>
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Step 1 Actions -->
          <div class="step-actions">
            <button
              type="button"
              class="btn-next"
              [disabled]="!selectedTime"
              (click)="goToStep(2)">
              <span>View Table Options</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <!-- STEP 2: Smart Table Recommendation & Selection -->
        <div *ngIf="currentStep() === 2" class="step-card animate-fade-in">
          <div class="step-head-row">
            <div>
              <h2 class="step-heading">2. Select Your Preferred Table</h2>
              <p class="step-sub">
                Recommended tables for <strong>{{ selectedGuests }} guests</strong> on <strong>{{ selectedDate }}</strong> at <strong>{{ formatTime12(selectedTime) }}</strong>.
              </p>
            </div>
            <button type="button" class="btn-text" (click)="goToStep(1)">← Change Time</button>
          </div>

          <!-- Recommendation Banner -->
          <div class="recommendation-info-box">
            <span class="rec-icon">💡</span>
            <div>
              <strong>Smart Seat Allocation</strong>: The system prioritizes the smallest best-fitting table to maximize restaurant seating comfort.
            </div>
          </div>

          <!-- Available Tables Grid -->
          <div *ngIf="matchingTables().length > 0; else noTablesFound" class="tables-choice-grid">
            @for (item of matchingTables(); track item.table.id) {
              <div
                class="table-choice-card"
                [class.selected]="selectedTableId === item.table.id"
                [class.is-recommended]="item.isBestMatch"
                (click)="selectTable(item.table.id)">
                <div class="rec-top-row">
                  <span *ngIf="item.isBestMatch" class="recommended-badge">⭐ Recommended Match</span>
                  <span class="zone-badge">{{ item.table.zone }}</span>
                </div>

                <div class="table-card-main">
                  <div class="table-number-box">
                    <span class="t-label">Table</span>
                    <span class="t-num">{{ item.table.tableNumber }}</span>
                  </div>

                  <div class="table-specs">
                    <div class="spec-row">
                      <span>👥 Capacity:</span>
                      <strong>{{ item.table.capacity }} Persons</strong>
                    </div>
                    <div class="spec-row">
                      <span>📐 Shape:</span>
                      <strong>{{ item.table.shape | titlecase }}</strong>
                    </div>
                    <div class="spec-row match-reason">
                      <span>{{ item.matchReason }}</span>
                    </div>
                  </div>
                </div>

                <div class="table-select-indicator">
                  <span class="radio-circle" [class.checked]="selectedTableId === item.table.id"></span>
                  <span>{{ selectedTableId === item.table.id ? 'Selected Table' : 'Choose This Table' }}</span>
                </div>
              </div>
            }
          </div>

          <!-- No Table Fallback / Waitlist -->
          <ng-template #noTablesFound>
            <div class="no-tables-box">
              <span class="no-t-icon">⏳</span>
              <h3>All Suitable Tables Booked for This Slot</h3>
              <p>Every table matching {{ selectedGuests }} guests at {{ formatTime12(selectedTime) }} is currently reserved.</p>
              <div class="no-tables-actions">
                <button type="button" class="btn-alt-time" (click)="goToStep(1)">
                  Choose Another Time Slot
                </button>
                <button type="button" class="btn-waitlist" (click)="joinWaitlist()">
                  Join Waitlist Queue
                </button>
              </div>
            </div>
          </ng-template>

          <div class="step-actions">
            <button type="button" class="btn-back" (click)="goToStep(1)">Back</button>
            <button
              type="button"
              class="btn-next"
              [disabled]="!selectedTableId"
              (click)="goToStep(3)">
              <span>Guest Details</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <!-- STEP 3: Customer Details & Confirmation -->
        <div *ngIf="currentStep() === 3" class="step-card animate-fade-in">
          <div class="step-head-row">
            <div>
              <h2 class="step-heading">3. Guest Details & Confirmation</h2>
              <p class="step-sub">Please verify your contact number for booking SMS and entry pass.</p>
            </div>
            <button type="button" class="btn-text" (click)="goToStep(2)">← Change Table</button>
          </div>

          <!-- Booking Summary Box -->
          <div class="booking-summary-pill">
            <div class="summary-item">
              <span>📅 Date</span>
              <strong>{{ selectedDate }}</strong>
            </div>
            <div class="summary-item">
              <span>🕒 Time</span>
              <strong>{{ formatTime12(selectedTime) }}</strong>
            </div>
            <div class="summary-item">
              <span>👥 Party</span>
              <strong>{{ selectedGuests }} Guests</strong>
            </div>
            <div class="summary-item">
              <span>🍽️ Table</span>
              <strong>{{ getSelectedTableNumber() }} ({{ getSelectedTableZone() }})</strong>
            </div>
          </div>

          <!-- Reactive Customer Details Form -->
          <form [formGroup]="bookingForm" (ngSubmit)="onSubmitBooking()" class="booking-form">
            <div class="form-row-2">
              <!-- Name -->
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input
                  type="text"
                  formControlName="customerName"
                  class="form-input"
                  [class.is-invalid]="f['customerName'].touched && f['customerName'].invalid"
                  placeholder="e.g. Sneha Roy" />
                <div *ngIf="f['customerName'].touched && f['customerName'].invalid" class="form-error">
                  Name is required (at least 2 letters).
                </div>
              </div>

              <!-- Phone -->
              <div class="form-group">
                <label class="form-label">Contact Phone Number *</label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="form-input"
                  [class.is-invalid]="f['phone'].touched && f['phone'].invalid"
                  placeholder="e.g. +91 98300 12345" />
                <div *ngIf="f['phone'].touched && f['phone'].invalid" class="form-error">
                  Valid 10-digit phone number is required.
                </div>
              </div>
            </div>

            <div class="form-row-2">
              <!-- Email -->
              <div class="form-group">
                <label class="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  formControlName="email"
                  class="form-input"
                  placeholder="e.g. sneha@example.com" />
              </div>

              <!-- Dining Occasion -->
              <div class="form-group">
                <label class="form-label">Dining Occasion</label>
                <select formControlName="occasion" class="form-select">
                  <option value="Casual">Casual Dining / Biryani Feast 🍲</option>
                  <option value="Birthday">Birthday Celebration 🎂</option>
                  <option value="Anniversary">Anniversary Celebration 🥂</option>
                  <option value="Family Dining">Family Gathering 👨‍👩‍👧‍👦</option>
                  <option value="Date Night">Date Night ✨</option>
                  <option value="Business">Business Dinner 💼</option>
                </select>
              </div>
            </div>

            <!-- Special Requests -->
            <div class="form-group">
              <label class="form-label">Special Requests or Dietary Notes (Optional)</label>
              <textarea
                formControlName="specialRequest"
                class="form-textarea"
                rows="2"
                placeholder="e.g. Need high chair for child, window seat if possible, vegetarian menu alongside biryani..."></textarea>
            </div>

            <!-- Reservation Policy Consent -->
            <div class="policy-box">
              <label class="policy-checkbox-label">
                <input type="checkbox" formControlName="agreePolicy" class="policy-check" />
                <span>
                  I understand that tables are held for 15 minutes past reservation time. No booking fees required.
                </span>
              </label>
            </div>

            <!-- Submission Error Alert -->
            <div *ngIf="submissionError()" class="submission-error-alert animate-fade-in">
              <span>⚠️ {{ submissionError() }}</span>
            </div>

            <!-- Final Submit Actions -->
            <div class="step-actions">
              <button type="button" class="btn-back" (click)="goToStep(2)">Back</button>
              <button
                type="submit"
                class="btn-submit-booking"
                [disabled]="bookingForm.invalid || isSubmitting()">
                <span *ngIf="!isSubmitting()">Confirm & Reserve Table 🎉</span>
                <span *ngIf="isSubmitting()">Securing Reservation...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-page {
      min-height: calc(100vh - 140px);
      padding: 2rem 1rem 4rem;
      background: var(--bg-app);
      display: flex;
      justify-content: center;
    }
    .booking-container {
      width: 100%;
      max-width: 820px;
    }

    /* Stepper Bar */
    .stepper-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding: 0 1rem;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
    }
    .step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--bg-surface-secondary);
      border: 1.5px solid var(--border-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }
    .step-label {
      font-size: 0.8125rem;
      font-weight: 600;
    }
    @media (max-width: 500px) {
      .step-label {
        display: none;
      }
    }
    .step-item.active .step-circle {
      background: var(--color-primary-50);
      border-color: var(--color-primary-600);
      color: var(--color-primary-700);
    }
    .step-item.current .step-circle {
      background: var(--color-primary-600);
      border-color: var(--color-primary-600);
      color: #fff;
      box-shadow: 0 0 10px var(--color-primary-glow);
    }
    .step-item.current .step-label {
      color: var(--text-main);
      font-weight: 700;
    }
    .step-line {
      flex: 1;
      height: 2px;
      background: var(--border-light);
      margin: 0 12px;
      transition: background 0.2s ease;
    }
    .step-line.active {
      background: var(--color-primary-500);
    }

    /* Header */
    .booking-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .header-pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--color-primary-600);
      background: var(--color-primary-50);
      padding: 3px 12px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    html.dark .header-pill {
      background: rgba(234, 88, 12, 0.2);
    }
    .booking-title {
      font-family: var(--font-brand);
      font-size: clamp(1.6rem, 3.5vw, 2.2rem);
      font-weight: 900;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .booking-sub {
      font-size: 0.9rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }

    /* Step Card */
    .step-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 2rem;
      box-shadow: var(--shadow-lg);
    }
    @media (max-width: 600px) {
      .step-card {
        padding: 1.25rem;
      }
    }
    .step-heading {
      font-family: var(--font-brand);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 1.25rem;
    }
    .step-head-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 1.5rem;
    }
    .step-sub {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .btn-text {
      background: none;
      border: none;
      color: var(--color-primary-600);
      font-weight: 700;
      font-size: 0.8125rem;
      cursor: pointer;
      padding: 4px 8px;
    }

    /* Form Fields */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 1.5rem;
      margin-bottom: 1.75rem;
    }
    @media (max-width: 700px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .field-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .field-input {
      padding: 0.75rem;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      background: var(--bg-surface-secondary);
      color: var(--text-main);
      font-size: 0.95rem;
      outline: none;
      transition: all 0.15s ease;
    }
    .field-input:focus {
      border-color: var(--color-primary-500);
      background: var(--bg-surface);
      box-shadow: 0 0 0 3px var(--color-primary-glow);
    }
    .field-hint {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    /* Guest count pill selectors */
    .guests-selector-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .guest-pill {
      padding: 0.55rem 0.85rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-medium);
      background: var(--bg-surface-secondary);
      color: var(--text-secondary);
      font-size: 0.825rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .guest-pill:hover {
      border-color: var(--color-primary-400);
      color: var(--text-main);
    }
    .guest-pill.selected {
      background: var(--color-primary-600);
      border-color: var(--color-primary-600);
      color: #fff;
      box-shadow: 0 2px 8px var(--color-primary-glow);
    }

    /* Slots */
    .slots-section {
      border-top: 1px solid var(--border-subtle);
      padding-top: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .slots-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 8px;
    }
    .duration-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--color-primary-700);
      background: var(--color-primary-50);
      padding: 2px 8px;
      border-radius: 999px;
    }
    .slot-group {
      margin-bottom: 1.25rem;
    }
    .period-title {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 8px;
    }
    .slot-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.65rem 0.5rem;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border-medium);
      background: var(--bg-surface);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .slot-btn:hover:not(:disabled) {
      border-color: var(--color-primary-500);
      background: var(--bg-surface-secondary);
    }
    .slot-btn.selected {
      border-color: var(--color-primary-600);
      background: var(--color-primary-50);
      box-shadow: 0 0 0 2px var(--color-primary-600);
    }
    html.dark .slot-btn.selected {
      background: rgba(234, 88, 12, 0.2);
    }
    .slot-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      background: var(--bg-surface-secondary);
    }
    .slot-time {
      font-size: 0.875rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .slot-status {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--status-available-text);
      margin-top: 2px;
    }
    .slot-status.full {
      color: var(--text-muted);
    }

    /* Table Choices Grid */
    .recommendation-info-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.75rem 1rem;
      background: var(--color-primary-50);
      border: 1px solid var(--color-primary-200);
      border-radius: var(--radius-md);
      font-size: 0.825rem;
      color: var(--color-primary-900);
      margin-bottom: 1.5rem;
    }
    html.dark .recommendation-info-box {
      background: rgba(234, 88, 12, 0.15);
      border-color: rgba(234, 88, 12, 0.3);
      color: #fed7aa;
    }
    .rec-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .tables-choice-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .table-choice-card {
      border: 2px solid var(--border-medium);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      background: var(--bg-surface);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
    }
    .table-choice-card:hover {
      border-color: var(--color-primary-400);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .table-choice-card.selected {
      border-color: var(--color-primary-600);
      background: var(--color-primary-50);
      box-shadow: 0 0 0 1px var(--color-primary-600), var(--shadow-md);
    }
    html.dark .table-choice-card.selected {
      background: rgba(234, 88, 12, 0.15);
    }
    .table-choice-card.is-recommended {
      border-color: #f59e0b;
    }
    .rec-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .recommended-badge {
      font-size: 0.68rem;
      font-weight: 800;
      color: #78350f;
      background: #fde68a;
      padding: 2px 6px;
      border-radius: 999px;
    }
    .zone-badge {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--bg-surface-secondary);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .table-card-main {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .table-number-box {
      width: 54px;
      height: 54px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .t-label {
      font-size: 0.62rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
    }
    .t-num {
      font-family: var(--font-brand);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .table-specs {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .spec-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      color: var(--text-secondary);
    }
    .spec-row strong {
      color: var(--text-main);
    }
    .match-reason {
      font-size: 0.72rem;
      color: var(--color-primary-700);
      font-weight: 600;
      margin-top: 2px;
    }
    .table-select-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-subtle);
      padding-top: 8px;
    }
    .radio-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--border-medium);
      display: inline-block;
      position: relative;
    }
    .radio-circle.checked {
      border-color: var(--color-primary-600);
    }
    .radio-circle.checked::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-primary-600);
      top: 2px;
      left: 2px;
    }

    /* No Tables / Waitlist */
    .no-tables-box {
      text-align: center;
      padding: 3rem 1.5rem;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-lg);
      margin-bottom: 1.5rem;
    }
    .no-t-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.75rem;
    }
    .no-tables-box h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .no-tables-box p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }
    .no-tables-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-alt-time {
      padding: 0.65rem 1.25rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      color: var(--text-main);
      font-weight: 700;
      border-radius: var(--radius-md);
      cursor: pointer;
    }
    .btn-waitlist {
      padding: 0.65rem 1.25rem;
      background: #f59e0b;
      color: #fff;
      font-weight: 700;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
    }

    /* Summary pill in Step 3 */
    .booking-summary-pill {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      padding: 1rem 1.25rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      margin-bottom: 1.75rem;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .summary-item span {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .summary-item strong {
      font-size: 0.875rem;
      color: var(--text-main);
    }

    /* Step 3 Form */
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    @media (max-width: 600px) {
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 1rem;
    }
    .form-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .form-input, .form-select, .form-textarea {
      padding: 0.75rem;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      background: var(--bg-surface-secondary);
      color: var(--text-main);
      font-size: 0.9rem;
      outline: none;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--color-primary-500);
      background: var(--bg-surface);
      box-shadow: 0 0 0 3px var(--color-primary-glow);
    }
    .form-input.is-invalid {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .form-error {
      font-size: 0.72rem;
      color: #ef4444;
      font-weight: 600;
    }
    .policy-box {
      margin: 1.25rem 0;
    }
    .policy-checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.4;
      cursor: pointer;
    }
    .policy-check {
      margin-top: 2px;
      accent-color: var(--color-primary-600);
    }
    .submission-error-alert {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }

    /* Actions */
    .step-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 1.5rem;
      border-top: 1px solid var(--border-subtle);
      padding-top: 1.25rem;
    }
    .btn-next {
      padding: 0.8rem 1.6rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 800;
      font-size: 0.95rem;
      border-radius: var(--radius-full);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px var(--color-primary-glow);
      transition: all 0.15s ease;
    }
    .btn-next:hover:not(:disabled) {
      background: var(--color-primary-700);
      transform: translateY(-1px);
    }
    .btn-next:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-back {
      padding: 0.8rem 1.4rem;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-medium);
      color: var(--text-secondary);
      font-weight: 700;
      font-size: 0.9rem;
      border-radius: var(--radius-full);
      cursor: pointer;
    }
    .btn-submit-booking {
      padding: 0.85rem 2rem;
      background: linear-gradient(135deg, #f97316, #c2410c);
      color: #fff;
      font-family: var(--font-brand);
      font-size: 1.05rem;
      font-weight: 800;
      border-radius: var(--radius-full);
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(234, 88, 12, 0.45);
      transition: all 0.2s ease;
    }
    .btn-submit-booking:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(234, 88, 12, 0.6);
    }
    .btn-submit-booking:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class BookTableComponent implements OnInit {
  authService = inject(AuthService);
  tableService = inject(TableService);
  firebaseService = inject(FirebaseService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  currentStep = signal<number>(1);
  todayDate = new Date().toISOString().split('T')[0];
  maxDate = this.calculateMaxAdvanceDate();
  defaultDuration = environment.restaurant.reservationDurationMinutes || 90;

  selectedDate: string = this.todayDate;
  selectedGuests: number = 4;
  selectedTime: string = '19:30';
  selectedTableId: string = '';

  isSubmitting = signal<boolean>(false);
  submissionError = signal<string | null>(null);

  // Reactive booking form
  bookingForm: FormGroup = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s-]{10,14}$/)]],
    email: ['', [Validators.email]],
    occasion: ['Casual'],
    specialRequest: [''],
    agreePolicy: [true, [Validators.requiredTrue]]
  });

  get f() {
    return this.bookingForm.controls;
  }

  ngOnInit(): void {
    // Check query params if navigated from quick booking on home page
    this.route.queryParams.subscribe(params => {
      if (params['date']) this.selectedDate = params['date'];
      if (params['guests']) this.selectedGuests = Number(params['guests']);
      if (params['time']) this.selectedTime = params['time'];
    });

    // Pre-fill user data if authenticated
    const user = this.authService.currentUser();
    if (user) {
      this.bookingForm.patchValue({
        customerName: user.displayName || '',
        phone: user.phoneNumber || '',
        email: user.email || ''
      });
    }
  }

  calculateMaxAdvanceDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + (environment.restaurant.maxAdvanceBookingDays || 30));
    return d.toISOString().split('T')[0];
  }

  setGuests(count: number): void {
    this.selectedGuests = count;
    this.selectedTableId = '';
  }

  onDateOrGuestsChange(): void {
    this.selectedTableId = '';
  }

  selectSlot(time: string): void {
    this.selectedTime = time;
    this.selectedTableId = '';
  }

  goToStep(step: number): void {
    if (step === 2) {
      // Auto-select best matching table if available
      const matches = this.matchingTables();
      if (matches.length > 0 && !this.selectedTableId) {
        this.selectedTableId = matches[0].table.id;
      }
    }
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  selectTable(id: string): void {
    this.selectedTableId = id;
  }

  /**
   * Generates time slots and checks live availability against active reservations
   */
  private generateSlots(times: string[], period: 'Lunch' | 'Dinner'): TimeSlotOption[] {
    const allTables = this.tableService.tables();
    const duration = this.defaultDuration;

    return times.map(time => {
      const endTime = this.firebaseService.calculateEndTime(time, duration);
      // Count tables that can hold party and don't have overlapping bookings
      const availableTablesForSlot = allTables.filter(table => {
        if (table.capacity < this.selectedGuests) return false;
        // Check conflict
        const hasConflict = this.firebaseService.checkTimeConflict(table.id, this.selectedDate, time, endTime);
        return !hasConflict;
      });

      return {
        time,
        label: this.formatTime12(time),
        period,
        isAvailable: availableTablesForSlot.length > 0,
        availableTableCount: availableTablesForSlot.length
      };
    });
  }

  lunchSlots = computed(() => {
    // Recompute when reservations or tables signal updates
    this.firebaseService.reservationsSignal();
    return this.generateSlots(['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'], 'Lunch');
  });

  dinnerSlots = computed(() => {
    this.firebaseService.reservationsSignal();
    return this.generateSlots(['18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'], 'Dinner');
  });

  /**
   * Computes available tables for the chosen date, time, and guest count,
   * sorted by minimum excess capacity (smallest best fit).
   */
  matchingTables = computed(() => {
    // Reactive dependencies
    const allTables = this.tableService.tables();
    this.firebaseService.reservationsSignal();

    const guests = this.selectedGuests;
    const date = this.selectedDate;
    const time = this.selectedTime;
    const duration = this.defaultDuration;
    const endTime = this.firebaseService.calculateEndTime(time, duration);

    // Filter tables with enough capacity and without overlapping active reservations
    const available = allTables.filter(table => {
      if (table.capacity < guests) return false;
      const isConflict = this.firebaseService.checkTimeConflict(table.id, date, time, endTime);
      return !isConflict;
    });

    const scored = available.map(table => {
      const excess = table.capacity - guests;
      let reason = '';
      if (excess === 0) {
        reason = `Perfect exact fit for ${table.capacity} guests.`;
      } else if (excess <= 2) {
        reason = `Comfortable seating (${table.capacity} capacity).`;
      } else {
        reason = `Spacious seating (${table.capacity} capacity).`;
      }

      return {
        table,
        score: excess,
        isBestMatch: false,
        matchReason: reason
      };
    });

    // Sort by smallest excess seats first (tightest best fit)
    scored.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.table.tableNumber.localeCompare(b.table.tableNumber);
    });

    if (scored.length > 0) {
      scored[0].isBestMatch = true;
      scored[0].matchReason = `⭐ Best Match: Closest fit (${scored[0].table.capacity} seats for ${guests} guests).`;
    }

    return scored;
  });

  getSelectedTableNumber(): string {
    const table = this.tableService.getTableById(this.selectedTableId);
    return table ? table.tableNumber : 'Unassigned';
  }

  getSelectedTableZone(): string {
    const table = this.tableService.getTableById(this.selectedTableId);
    return table ? table.zone : 'Main Dining';
  }

  formatTime12(time24: string): string {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  joinWaitlist(): void {
    this.toastService.info('Waitlist', 'Adding to waitlist for ' + this.selectedDate + ' at ' + this.formatTime12(this.selectedTime));
    this.router.navigate(['/restaurant']);
  }

  /**
   * Final Submission via transactional booking mechanism
   */
  async onSubmitBooking(): Promise<void> {
    if (this.bookingForm.invalid || !this.selectedTableId) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set(null);

    // Generate unique idempotency key to prevent accidental repeated clicks
    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const currentUser = this.authService.currentUser();
    const customerUid = currentUser ? currentUser.uid : 'guest-' + Date.now();

    const result = await this.firebaseService.bookTableTransaction({
      customerName: this.bookingForm.value.customerName,
      phone: this.bookingForm.value.phone,
      email: this.bookingForm.value.email,
      guests: this.selectedGuests,
      date: this.selectedDate,
      time: this.selectedTime,
      tableId: this.selectedTableId,
      specialRequest: this.bookingForm.value.specialRequest,
      occasion: this.bookingForm.value.occasion,
      customerUid,
      idempotencyKey
    });

    this.isSubmitting.set(false);

    if (result.success && result.reservation) {
      localStorage.setItem('dineflow_last_booking_id', result.reservation.id);
      localStorage.setItem('dineflow_customer_phone', result.reservation.phone);

      this.toastService.success(
        'Booking Confirmed! 🎉',
        `Reference: ${result.reservation.referenceCode} at Table ${result.reservation.tableNumber}`
      );
      // Navigate to booking confirmation screen
      this.router.navigate(['/booking-confirmation', result.reservation.id], {
        state: { reservation: result.reservation }
      });
    } else {
      this.submissionError.set(result.error || 'Could not complete reservation. Please try again.');
    }
  }
}
