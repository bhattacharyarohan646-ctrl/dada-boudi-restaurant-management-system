import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <span class="badge-dot"></span>
      <span>{{ label || status }}</span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status: string = 'available';
  @Input() label?: string;

  get badgeClass(): string {
    const s = this.status.toLowerCase();
    switch (s) {
      case 'available':
      case 'confirmed':
        return 'badge-available';
      case 'reserved':
      case 'pending':
        return 'badge-reserved';
      case 'occupied':
        return 'badge-occupied';
      case 'cleaning':
        return 'badge-cleaning';
      case 'cancelled':
        return 'badge-cancelled';
      case 'vip':
        return 'badge-vip';
      default:
        return 'badge-cancelled';
    }
  }
}
