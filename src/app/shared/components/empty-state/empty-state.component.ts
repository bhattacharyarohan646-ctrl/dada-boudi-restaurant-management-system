import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-box">
      <div class="empty-icon-circle">
        <span>{{ icon }}</span>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <div *ngIf="actionLabel" class="empty-actions">
        <button class="btn btn-primary" (click)="actionClicked.emit()">
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      border: 2px dashed var(--border-light);
      border-radius: var(--radius-lg);
      background: var(--bg-surface-secondary);
      margin: 1.5rem 0;
    }
    .empty-icon-circle {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: var(--bg-surface-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 1rem;
      color: var(--text-muted);
    }
    .empty-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.35rem;
    }
    .empty-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      max-width: 380px;
      line-height: 1.45;
      margin-bottom: 1.25rem;
    }
    .empty-actions {
      display: flex;
      gap: 0.75rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = '🍽️';
  @Input({ required: true }) title: string = '';
  @Input() description: string = '';
  @Input() actionLabel?: string;
  @Output() actionClicked = new EventEmitter<void>();
}
