import { Injectable, signal, computed, inject } from '@angular/core';
import { WaitlistEntry, WaitlistPriority } from '../models/waitlist.model';
import { INITIAL_WAITLIST } from '../mock/mock-data';
import { TableService } from './table.service';
import { ToastService } from './toast.service';
import { NotificationService } from './notification.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class WaitlistService {
  private tableService = inject(TableService);
  private toastService = inject(ToastService);
  private notificationService = inject(NotificationService);
  private firebaseService = inject(FirebaseService);

  waitlist = this.firebaseService.waitlistSignal;

  activeWaitlist = computed(() =>
    this.waitlist().filter(w => w.status === 'waiting')
  );

  waitingCount = computed(() => this.activeWaitlist().length);

  getEntryById(id: string): WaitlistEntry | undefined {
    return this.waitlist().find(w => w.id === id);
  }

  addEntry(data: {
    customerName: string;
    phone: string;
    guests: number;
    preferredTime: string;
    priority: WaitlistPriority;
    notes?: string;
  }): WaitlistEntry {
    const newEntry: WaitlistEntry = {
      id: 'wait-' + Date.now(),
      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
      guests: Number(data.guests),
      preferredTime: data.preferredTime,
      waitingTimeMinutes: 0,
      priority: data.priority,
      status: 'waiting',
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: data.notes?.trim()
    };

    this.waitlist.update(list => [newEntry, ...list]);

    this.notificationService.addNotification(
      'Added to Waitlist',
      `${newEntry.customerName} (${newEntry.guests} guests, ${newEntry.priority} priority) joined waitlist.`,
      'system'
    );

    this.toastService.info(
      'Waitlist Updated',
      `${newEntry.customerName} added to waitlist queue.`
    );

    return newEntry;
  }

  assignTable(waitlistId: string, tableId: string): void {
    const entry = this.getEntryById(waitlistId);
    const table = this.tableService.getTableById(tableId);

    if (!entry || !table) return;

    if (table.capacity < entry.guests) {
      this.toastService.warning('Capacity Mismatch', `Table ${table.tableNumber} holds ${table.capacity} guests, but party has ${entry.guests}.`);
      return;
    }

    this.waitlist.update(list =>
      list.map(w => w.id === waitlistId ? {
        ...w,
        status: 'seated',
        assignedTableId: tableId,
        assignedTableNumber: table.tableNumber
      } : w)
    );

    this.tableService.updateTableStatus(tableId, 'occupied');

    this.toastService.success(
      'Table Assigned! 🍽️',
      `${entry.customerName} is now seated at Table ${table.tableNumber}.`
    );
  }

  cancelWaitlist(id: string): void {
    const entry = this.getEntryById(id);
    this.waitlist.update(list =>
      list.map(w => w.id === id ? { ...w, status: 'cancelled' } : w)
    );
    if (entry) {
      this.toastService.warning('Waitlist Cancelled', `${entry.customerName} removed from waitlist.`);
    }
  }
}
