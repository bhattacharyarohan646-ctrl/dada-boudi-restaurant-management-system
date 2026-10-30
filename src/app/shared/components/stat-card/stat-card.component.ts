import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card stat-card card-hover">
      <div class="stat-top">
        <span class="stat-title">{{ title }}</span>
        <div class="stat-icon-wrap" [ngClass]="iconColorClass">
          <ng-content select="[icon]"></ng-content>
        </div>
      </div>
      <div class="stat-body">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-footer">
          <span class="stat-trend" *ngIf="trend" [ngClass]="trendPositive ? 'trend-up' : 'trend-down'">
            {{ trendPositive ? '↑' : '↓' }} {{ trend }}
          </span>
          <span class="stat-subtitle">{{ subtitle }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 1.25rem 1.375rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }
    .stat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .stat-title {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stat-icon-wrap {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .icon-orange {
      background: var(--color-primary-50);
      color: var(--color-primary-600);
    }
    html.dark .icon-orange {
      background: rgba(234, 88, 12, 0.2);
      color: var(--color-primary-400);
    }
    .icon-green {
      background: var(--status-available-bg);
      color: var(--status-available);
    }
    .icon-amber {
      background: var(--status-reserved-bg);
      color: var(--status-reserved);
    }
    .icon-blue {
      background: var(--status-cleaning-bg);
      color: var(--status-cleaning);
    }
    .stat-value {
      font-family: var(--font-brand);
      font-size: 2.125rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.1;
      margin-bottom: 0.5rem;
    }
    .stat-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
    }
    .stat-trend {
      font-weight: 700;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
    }
    .trend-up {
      color: #10b981;
      background: rgba(16, 185, 129, 0.12);
    }
    .trend-down {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.12);
    }
    .stat-subtitle {
      color: var(--text-muted);
    }
  `]
})
export class StatCardComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) value: string | number = '';
  @Input() trend?: string;
  @Input() trendPositive: boolean = true;
  @Input() subtitle: string = '';
  @Input() iconColor: 'orange' | 'green' | 'amber' | 'blue' = 'orange';

  get iconColorClass(): string {
    return `icon-${this.iconColor}`;
  }
}
