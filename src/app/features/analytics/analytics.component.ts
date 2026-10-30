import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../../core/services/table.service';
import { ReservationService } from '../../core/services/reservation.service';
import { CustomerService } from '../../core/services/customer.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page animate-fade-in">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Operational Analytics & Insights</h1>
          <p class="page-subtitle">Shift performance, table utilization, throughput and peak reservation metrics</p>
        </div>

        <div class="date-range-badge">
          <span>📅 Current Shift: Dinner (September 29, 2026)</span>
        </div>
      </div>

      <!-- Key KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card card">
          <div class="kpi-top">
            <span class="kpi-label">Average Occupancy</span>
            <span class="kpi-tag tag-green">↑ 14% vs avg</span>
          </div>
          <div class="kpi-value">{{ tableService.occupancyRate() }}%</div>
          <span class="kpi-sub">Total 24 active tables</span>
        </div>

        <div class="kpi-card card">
          <div class="kpi-top">
            <span class="kpi-label">Total Covers (Guests)</span>
            <span class="kpi-tag tag-orange">Target 120</span>
          </div>
          <div class="kpi-value">{{ totalCovers }}</div>
          <span class="kpi-sub">Across all dinner seatings</span>
        </div>

        <div class="kpi-card card">
          <div class="kpi-top">
            <span class="kpi-label">Average Table Turnover</span>
            <span class="kpi-tag tag-blue">Optimal</span>
          </div>
          <div class="kpi-value">72 min</div>
          <span class="kpi-sub">Avg dining duration</span>
        </div>

        <div class="kpi-card card">
          <div class="kpi-top">
            <span class="kpi-label">Cancellation Rate</span>
            <span class="kpi-tag tag-slate">Low (industry 12%)</span>
          </div>
          <div class="kpi-value">{{ cancellationRate }}%</div>
          <span class="kpi-sub">{{ resService.cancelledCount() }} bookings cancelled</span>
        </div>
      </div>

      <!-- Charts Row 1: Peak Hours + Status Distribution -->
      <div class="charts-grid-2">
        <!-- Peak Reservation Hours Bar Chart -->
        <div class="chart-card card">
          <div class="card-head">
            <div>
              <h3 class="card-title">Hourly Booking Distribution</h3>
              <p class="card-subtitle">Peak dinner covers between 19:30 and 21:00</p>
            </div>
            <span class="badge-peak">🔥 Peak: 20:00</span>
          </div>

          <div class="bar-chart-container">
            @for (slot of hourlyData; track slot.hour) {
              <div class="bar-col">
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [class.bar-peak]="slot.isPeak"
                    [style.height.%]="slot.percentage">
                    <span class="bar-val-pop">{{ slot.count }}</span>
                  </div>
                </div>
                <span class="bar-label">{{ slot.hour }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Reservation Status Breakdown -->
        <div class="chart-card card">
          <div class="card-head">
            <div>
              <h3 class="card-title">Reservation Status Distribution</h3>
              <p class="card-subtitle">Breakdown of current shift booking statuses</p>
            </div>
          </div>

          <div class="donut-layout">
            <div class="visual-progress-list">
              <div class="status-metric-row">
                <div class="stat-info">
                  <span class="stat-dot dot-confirmed"></span>
                  <span class="stat-name">Confirmed Bookings</span>
                </div>
                <div class="stat-val-group">
                  <strong>{{ resService.confirmedCount() }}</strong>
                  <span class="stat-percent">({{ getStatusPercentage('confirmed') }}%)</span>
                </div>
              </div>

              <div class="status-metric-row">
                <div class="stat-info">
                  <span class="stat-dot dot-pending"></span>
                  <span class="stat-name">Pending Confirmation</span>
                </div>
                <div class="stat-val-group">
                  <strong>{{ resService.pendingCount() }}</strong>
                  <span class="stat-percent">({{ getStatusPercentage('pending') }}%)</span>
                </div>
              </div>

              <div class="status-metric-row">
                <div class="stat-info">
                  <span class="stat-dot dot-completed"></span>
                  <span class="stat-name">Completed Diners</span>
                </div>
                <div class="stat-val-group">
                  <strong>{{ resService.completedCount() }}</strong>
                  <span class="stat-percent">({{ getStatusPercentage('completed') }}%)</span>
                </div>
              </div>

              <div class="status-metric-row">
                <div class="stat-info">
                  <span class="stat-dot dot-cancelled"></span>
                  <span class="stat-name">Cancelled</span>
                </div>
                <div class="stat-val-group">
                  <strong>{{ resService.cancelledCount() }}</strong>
                  <span class="stat-percent">({{ getStatusPercentage('cancelled') }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row 2: Most Popular Tables + Zone Utilization -->
      <div class="charts-grid-2">
        <!-- Most Popular Tables Ranking -->
        <div class="chart-card card">
          <div class="card-head">
            <div>
              <h3 class="card-title">Top 5 Most Popular Tables</h3>
              <p class="card-subtitle">Highest booking frequency & revenue turnover</p>
            </div>
          </div>

          <div class="ranking-list">
            @for (tbl of topTables; track tbl.tableNumber; let i = $index) {
              <div class="ranking-item">
                <div class="rank-pos">#{{ i + 1 }}</div>
                <div class="rank-info">
                  <div class="rank-title-row">
                    <strong>Table {{ tbl.tableNumber }}</strong>
                    <span class="rank-zone">{{ tbl.zone }} • {{ tbl.capacity }} Seats</span>
                  </div>
                  <div class="rank-bar-bg">
                    <div class="rank-bar-fill" [style.width.%]="tbl.percent"></div>
                  </div>
                </div>
                <div class="rank-stat">
                  <strong>{{ tbl.bookings }} bookings</strong>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Zone Occupancy Heatmap -->
        <div class="chart-card card">
          <div class="card-head">
            <div>
              <h3 class="card-title">Zone Occupancy & Demand</h3>
              <p class="card-subtitle">Seating load distributed across restaurant areas</p>
            </div>
          </div>

          <div class="zone-occupancy-list">
            <div class="zone-card">
              <div class="zc-header">
                <strong>🪟 Window Seating</strong>
                <span>75% Capacity</span>
              </div>
              <div class="zc-bar"><div class="zc-fill" style="width: 75%"></div></div>
            </div>

            <div class="zone-card">
              <div class="zc-header">
                <strong>🍽️ Main Dining Hall</strong>
                <span>68% Capacity</span>
              </div>
              <div class="zc-bar"><div class="zc-fill" style="width: 68%"></div></div>
            </div>

            <div class="zone-card">
              <div class="zc-header">
                <strong>🍸 Bar & Lounge</strong>
                <span>50% Capacity</span>
              </div>
              <div class="zc-bar"><div class="zc-fill" style="width: 50%"></div></div>
            </div>

            <div class="zone-card">
              <div class="zc-header">
                <strong>🌿 Outdoor Garden Patio</strong>
                <span>65% Capacity</span>
              </div>
              <div class="zc-bar"><div class="zc-fill" style="width: 65%"></div></div>
            </div>

            <div class="zone-card">
              <div class="zc-header">
                <strong>👑 Private Dining Chambers</strong>
                <span>80% Capacity</span>
              </div>
              <div class="zc-bar"><div class="zc-fill" style="width: 80%"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
    .date-range-badge {
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }
    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .kpi-grid { grid-template-columns: 1fr; }
    }
    .kpi-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
    }
    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .kpi-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .kpi-tag {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .tag-green { background: #ecfdf5; color: #065f46; }
    .tag-orange { background: #fff7ed; color: #c2410c; }
    .tag-blue { background: #eff6ff; color: #1e40af; }
    .tag-slate { background: #f1f5f9; color: #334155; }
    html.dark .tag-green { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    html.dark .tag-orange { background: rgba(234, 88, 12, 0.2); color: #fb923c; }
    html.dark .tag-blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    html.dark .tag-slate { background: rgba(100, 116, 139, 0.2); color: #94a3b8; }
    .kpi-value {
      font-family: var(--font-brand);
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0.25rem 0;
    }
    .kpi-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .charts-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .charts-grid-2 { grid-template-columns: 1fr; }
    }
    .chart-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .card-title {
      font-family: var(--font-brand);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .card-subtitle {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .badge-peak {
      font-size: 0.75rem;
      font-weight: 700;
      background: #fef2f2;
      color: #b91c1c;
      padding: 3px 8px;
      border-radius: var(--radius-full);
      border: 1px solid #fecaca;
    }
    html.dark .badge-peak {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .bar-chart-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 180px;
      padding-top: 20px;
      gap: 8px;
    }
    .bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }
    .bar-track {
      flex: 1;
      width: 100%;
      max-width: 32px;
      display: flex;
      align-items: flex-end;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-sm);
    }
    .bar-fill {
      width: 100%;
      background: var(--color-primary-400);
      border-radius: var(--radius-sm);
      transition: height 0.4s ease;
      position: relative;
    }
    .bar-fill.bar-peak {
      background: var(--color-primary-600);
    }
    .bar-val-pop {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .bar-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 8px;
      font-weight: 600;
    }
    .donut-layout {
      display: flex;
      align-items: center;
      flex: 1;
    }
    .visual-progress-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .status-metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }
    .stat-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .stat-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-confirmed { background: var(--status-reserved); }
    .dot-pending { background: var(--status-cleaning); }
    .dot-completed { background: var(--status-available); }
    .dot-cancelled { background: var(--status-cancelled); }
    .stat-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .stat-val-group {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .stat-val-group strong {
      font-size: 1rem;
      color: var(--text-main);
    }
    .stat-percent {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .ranking-list {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }
    .ranking-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .rank-pos {
      font-family: var(--font-brand);
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--color-primary-600);
      width: 28px;
    }
    .rank-info {
      flex: 1;
    }
    .rank-title-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .rank-title-row strong {
      font-size: 0.875rem;
      color: var(--text-main);
    }
    .rank-zone {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .rank-bar-bg {
      height: 6px;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .rank-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600));
      border-radius: var(--radius-full);
    }
    .rank-stat {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .zone-occupancy-list {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }
    .zone-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .zc-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
    }
    .zc-header strong {
      color: var(--text-main);
    }
    .zc-header span {
      color: var(--color-primary-600);
      font-weight: 700;
    }
    .zc-bar {
      height: 8px;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .zc-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: var(--radius-full);
    }
  `]
})
export class AnalyticsComponent {
  tableService = inject(TableService);
  resService = inject(ReservationService);
  customerService = inject(CustomerService);

  get totalCovers(): number {
    return this.resService.reservations().reduce((sum, r) => sum + r.guests, 0);
  }

  get cancellationRate(): number {
    const total = this.resService.reservations().length;
    if (total === 0) return 0;
    return Math.round((this.resService.cancelledCount() / total) * 100);
  }

  getStatusPercentage(status: string): number {
    const total = this.resService.reservations().length;
    if (total === 0) return 0;
    const count = this.resService.reservations().filter(r => r.status === status).length;
    return Math.round((count / total) * 100);
  }

  hourlyData = [
    { hour: '18:00', count: 3, percentage: 35, isPeak: false },
    { hour: '18:30', count: 5, percentage: 55, isPeak: false },
    { hour: '19:00', count: 8, percentage: 80, isPeak: false },
    { hour: '19:30', count: 9, percentage: 90, isPeak: false },
    { hour: '20:00', count: 12, percentage: 100, isPeak: true },
    { hour: '20:30', count: 10, percentage: 88, isPeak: false },
    { hour: '21:00', count: 7, percentage: 65, isPeak: false },
    { hour: '21:30', count: 4, percentage: 40, isPeak: false }
  ];

  topTables = [
    { tableNumber: 'T12', zone: 'Main Dining', capacity: 4, bookings: 14, percent: 95 },
    { tableNumber: 'T03', zone: 'Window', capacity: 4, bookings: 12, percent: 82 },
    { tableNumber: 'T21', zone: 'Private Dining', capacity: 8, bookings: 11, percent: 76 },
    { tableNumber: 'T06', zone: 'Main Dining', capacity: 6, bookings: 9, percent: 62 },
    { tableNumber: 'T18', zone: 'Outdoor Patio', capacity: 6, bookings: 8, percent: 55 }
  ];
}
