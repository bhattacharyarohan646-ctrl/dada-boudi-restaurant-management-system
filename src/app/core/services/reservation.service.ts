import { Injectable, signal, computed, inject } from '@angular/core';
import { Reservation, ReservationStatus } from '../models/reservation.model';
import { INITIAL_RESERVATIONS } from '../mock/mock-data';
import { TableService } from './table.service';
import { CustomerService } from './customer.service';
import { ToastService } from './toast.service';
import { NotificationService } from './notification.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private tableService = inject(TableService);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private notificationService = inject(NotificationService);
  private firebaseService = inject(FirebaseService);

  // Authoritative shared signal connected directly to Cloud Firestore / Live Sync
  reservations = this.firebaseService.reservationsSignal;

  // Computeds
  todayReservations = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.reservations().filter(r => r.date === today);
  });

  todayReservationsCount = computed(() => this.todayReservations().length);

  confirmedCount = computed(() =>
    this.reservations().filter(r => r.status === 'confirmed').length
  );

  pendingCount = computed(() =>
    this.reservations().filter(r => r.status === 'pending').length
  );

  completedCount = computed(() =>
    this.reservations().filter(r => r.status === 'completed').length
  );

  cancelledCount = computed(() =>
    this.reservations().filter(r => r.status === 'cancelled').length
  );

  getReservationById(id: string): Reservation | undefined {
    return this.reservations().find(r => r.id === id);
  }

  getReservationForTable(tableId: string): Reservation | undefined {
    return this.reservations().find(r =>
      r.tableId === tableId && (r.status === 'confirmed' || r.status === 'pending' || r.status === 'seated')
    );
  }

  /**
   * Admin / Host creation of reservation
   */
  createReservation(data: {
    customerName: string;
    phone: string;
    email: string;
    guests: number;
    date: string;
    time: string;
    tableId: string;
    specialRequest?: string;
    occasion?: 'Birthday' | 'Anniversary' | 'Business' | 'Casual' | 'Date Night' | 'Celebration' | 'Family Dining';
  }): Reservation {
    const table = this.tableService.getTableById(data.tableId);
    const tableNumber = table ? table.tableNumber : 'Unassigned';

    // Synchronous representation for immediate return
    const newRes: Reservation = {
      id: 'res-' + Date.now(),
      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      guests: Number(data.guests),
      date: data.date,
      time: data.time,
      tableId: data.tableId,
      tableNumber,
      status: 'confirmed',
      specialRequest: data.specialRequest?.trim() || '',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      occasion: data.occasion || 'Casual'
    };

    // Use transactional booking mechanism
    this.firebaseService.bookTableTransaction({
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      guests: data.guests,
      date: data.date,
      time: data.time,
      tableId: data.tableId,
      specialRequest: data.specialRequest,
      occasion: data.occasion
    }).then(res => {
      if (!res.success && res.error) {
        this.toastService.error('Booking Conflict', res.error);
      }
    });

    this.notificationService.addNotification(
      'New Reservation Confirmed',
      `${newRes.customerName} (${newRes.guests} guests) booked ${tableNumber} at ${newRes.time}.`,
      'reservation'
    );

    this.toastService.success(
      'Reservation Confirmed! 🎉',
      `Booking created for ${newRes.customerName} at Table ${tableNumber}.`
    );

    return newRes;
  }

  cancelReservation(id: string): void {
    const res = this.getReservationById(id);
    if (!res) return;

    this.firebaseService.cancelReservation(id);

    this.notificationService.addNotification(
      'Reservation Cancelled',
      `Reservation for ${res.customerName} at ${res.tableNumber} was cancelled.`,
      'reservation'
    );

    this.toastService.warning(
      'Reservation Cancelled',
      `Table ${res.tableNumber} has been released and is now Available.`
    );
  }

  seatGuest(id: string): void {
    const res = this.getReservationById(id);
    if (!res) return;

    this.firebaseService.updateReservationStatus(id, 'seated');
    if (res.tableId) {
      this.tableService.updateTableStatus(res.tableId, 'occupied', res.id);
    }

    this.customerService.incrementCustomerVisits(res.customerName);

    this.toastService.success(
      'Guests Seated',
      `${res.customerName} seated at Table ${res.tableNumber}.`
    );
  }

  completeReservation(id: string): void {
    const res = this.getReservationById(id);
    if (!res) return;

    this.firebaseService.updateReservationStatus(id, 'completed');
    if (res.tableId) {
      this.tableService.updateTableStatus(res.tableId, 'cleaning');
    }

    this.toastService.info(
      'Dining Completed',
      `Table ${res.tableNumber} marked for cleaning.`
    );
  }

  updateReservation(id: string, updates: Partial<Reservation>): void {
    this.reservations.update(list =>
      list.map(r => r.id === id ? { ...r, ...updates } : r)
    );
    this.toastService.success('Reservation Updated', 'Changes have been saved.');
  }

  resetToDefault(): void {
    this.reservations.set(INITIAL_RESERVATIONS);
    this.toastService.info('Data Reset', 'Reservations restored to default state.');
  }
}
