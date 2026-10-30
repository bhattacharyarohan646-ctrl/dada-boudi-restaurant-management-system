import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="'toast-' + toast.type">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <span>✓</span> }
              @case ('warning') { <span>⚠</span> }
              @case ('error') { <span>✕</span> }
              @default { <span>ℹ</span> }
            }
          </div>
          <div class="toast-content">
            <h4 class="toast-title">{{ toast.title }}</h4>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button type="button" class="toast-close" (click)="toastService.remove(toast.id)" aria-label="Dismiss toast">
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      width: calc(100% - 48px);
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border-light);
      animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s ease;
    }
    @keyframes toastSlideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .toast-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      flex-shrink: 0;
    }
    .toast-success {
      border-left: 4px solid var(--status-available);
    }
    .toast-success .toast-icon {
      background: var(--status-available-bg);
      color: var(--status-available);
    }
    .toast-warning {
      border-left: 4px solid var(--status-reserved);
    }
    .toast-warning .toast-icon {
      background: var(--status-reserved-bg);
      color: var(--status-reserved);
    }
    .toast-error {
      border-left: 4px solid var(--status-occupied);
    }
    .toast-error .toast-icon {
      background: var(--status-occupied-bg);
      color: var(--status-occupied);
    }
    .toast-info {
      border-left: 4px solid var(--color-primary-600);
    }
    .toast-info .toast-icon {
      background: var(--color-primary-50);
      color: var(--color-primary-600);
    }
    .toast-content {
      flex: 1;
      min-width: 0;
    }
    .toast-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 2px;
    }
    .toast-message {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.35;
    }
    .toast-close {
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.15s ease;
    }
    .toast-close:hover {
      color: var(--text-main);
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
