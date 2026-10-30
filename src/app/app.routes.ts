import { Routes } from '@angular/router';
import { CustomerLayoutComponent } from './features/customer/layout/customer-layout.component';
import { StaffLayoutComponent } from './features/staff/staff-layout.component';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 1. Customer-Facing Website (Mobile-First Experience)
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/customer/home/customer-home.component').then(m => m.CustomerHomeComponent),
        title: 'Dada Boudi Restaurant — Legendary Biryani in Barrackpore'
      },
      {
        path: 'login',
        loadComponent: () => import('./features/customer/login/customer-login.component').then(m => m.CustomerLoginComponent),
        title: 'Google Sign In — Dada Boudi Restaurant'
      },
      {
        path: 'book-table',
        loadComponent: () => import('./features/customer/book-table/book-table.component').then(m => m.BookTableComponent),
        title: 'Book a Table — Dada Boudi Restaurant'
      },
      {
        path: 'my-bookings',
        loadComponent: () => import('./features/customer/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
        canActivate: [authGuard],
        title: 'My Reservations — Dada Boudi Restaurant'
      },
      {
        path: 'booking-confirmation/:id',
        loadComponent: () => import('./features/customer/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
        title: 'Booking Confirmed — Dada Boudi Restaurant'
      },
      {
        path: 'restaurant',
        loadComponent: () => import('./features/customer/restaurant/restaurant-info.component').then(m => m.RestaurantInfoComponent),
        title: 'About & Location — Dada Boudi Restaurant'
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/customer/menu/customer-menu.component').then(m => m.CustomerMenuComponent),
        title: 'Signature Biryani Menu — Dada Boudi Restaurant'
      }
    ]
  },

  // 2. Staff / Host Interface (Fast Operations & Turnovers)
  {
    path: 'staff',
    component: StaffLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/staff/dashboard/staff-dashboard.component').then(m => m.StaffDashboardComponent),
        title: 'Staff Host Station — Dada Boudi Restaurant'
      },
      {
        path: 'arrivals',
        loadComponent: () => import('./features/staff/arrivals/staff-arrivals.component').then(m => m.StaffArrivalsComponent),
        title: 'Guest Arrivals Timeline — Dada Boudi Restaurant'
      },
      {
        path: 'tables',
        loadComponent: () => import('./features/staff/tables/staff-tables.component').then(m => m.StaffTablesComponent),
        title: 'Table Turnover Desk — Dada Boudi Restaurant'
      }
    ]
  },

  // 3. Admin Dashboard (Laptop / Desktop Suite - Preserving All Existing Features)
  {
    path: 'admin',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard — Dada Boudi Restaurant'
      },
      {
        path: 'tables',
        loadComponent: () => import('./features/tables/tables.component').then(m => m.TablesComponent),
        title: 'Table Layout & Management — Dada Boudi Restaurant'
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/reservations/reservations.component').then(m => m.ReservationsComponent),
        title: 'Reservations Management — Dada Boudi Restaurant'
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent),
        title: 'Customers Directory — Dada Boudi Restaurant'
      },
      {
        path: 'waitlist',
        loadComponent: () => import('./features/waitlist/waitlist.component').then(m => m.WaitlistComponent),
        title: 'Live Waitlist — Dada Boudi Restaurant'
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
        title: 'Analytics & Insights — Dada Boudi Restaurant'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings — Dada Boudi Restaurant'
      }
    ]
  },

  // 4. Wildcard Catch-All Redirect
  {
    path: '**',
    redirectTo: ''
  }
];
