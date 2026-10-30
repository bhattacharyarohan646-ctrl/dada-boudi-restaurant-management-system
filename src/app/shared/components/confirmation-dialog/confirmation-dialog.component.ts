import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-box card animate-fade-in" role="dialog" aria-modal="true">
        <div class="dialog-icon-circle" [ngClass]="isDanger ? 'circle-danger' : 'circle-warning'">
          <span>{{ isDanger ? '⚠️' : '❓' }}</span>
        </div>

        <h3 class="dialog-title">{{ title }}</h3>
        <p class="dialog-message">{{ message }}</p>

        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" (click)="cancel.emit()">
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="btn"
            [ngClass]="isDanger ? 'btn-danger' : 'btn-primary'"
            (click)="confirm.emit()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-box {
      width: 100%;
      max-width: 420px;
      padding: 1.75rem;
      text-align: center;
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
    }
    .dialog-icon-circle {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      margin: 0 auto 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .circle-danger {
      background: #fee2e2;
      color: #ef4444;
    }
    html.dark .circle-danger {
      background: rgba(239, 68, 68, 0.2);
    }
    .circle-warning {
      background: #fef3c7;
      color: #d97706;
    }
    .dialog-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .dialog-message {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin-bottom: 1.5rem;
    }
    .dialog-actions {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
    }
    .dialog-actions button {
      min-width: 110px;
    }
  `]
})
export class ConfirmationDialogComponent {
  @Input() isOpen = false;
  @Input({ required: true }) title = 'Are you sure?';
  @Input({ required: true }) message = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isDanger = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancel.emit();
    }
  }
}
