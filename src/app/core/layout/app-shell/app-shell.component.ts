import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';
import { NewReservationModalComponent } from '../../../shared/components/new-reservation-modal/new-reservation-modal.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    TopbarComponent,
    ToastContainerComponent,
    NewReservationModalComponent
  ],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <app-sidebar
        [isCollapsed]="isSidebarCollapsed()"
        [isMobileOpen]="isMobileSidebarOpen()"
        (toggleCollapse)="toggleSidebar()"
        (closeMobile)="isMobileSidebarOpen.set(false)">
      </app-sidebar>

      <!-- Main Column -->
      <div class="main-column">
        <!-- Top Navigation Bar -->
        <app-topbar
          (toggleMobile)="isMobileSidebarOpen.set(!isMobileSidebarOpen())"
          (openNewReservation)="isNewResModalOpen.set(true)">
        </app-topbar>

        <!-- Routed Page Content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Global Reactive Toast Notifications -->
      <app-toast-container></app-toast-container>

      <!-- Global New Reservation Modal -->
      <app-new-reservation-modal
        [isOpen]="isNewResModalOpen()"
        (close)="isNewResModalOpen.set(false)"
        (reservationCreated)="onReservationCreated()">
      </app-new-reservation-modal>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-app);
      position: relative;
    }
    .main-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }
    .page-content {
      flex: 1;
      padding: 1.5rem;
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
    }
    @media (max-width: 768px) {
      .page-content {
        padding: 1rem;
      }
    }
  `]
})
export class AppShellComponent {
  isSidebarCollapsed = signal(false);
  isMobileSidebarOpen = signal(false);
  isNewResModalOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(val => !val);
  }

  onReservationCreated(): void {
    this.isNewResModalOpen.set(false);
  }
}
