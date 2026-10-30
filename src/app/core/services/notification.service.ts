import { Injectable, signal, computed } from '@angular/core';
import { AppNotification } from '../models/notification.model';
import { INITIAL_NOTIFICATIONS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<AppNotification[]>(INITIAL_NOTIFICATIONS);

  unreadCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  addNotification(title: string, message: string, type: 'reservation' | 'table' | 'system' | 'vip'): void {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      time: 'Just now',
      type,
      read: false
    };
    this.notifications.update(current => [newNotif, ...current]);
  }

  markAsRead(id: string): void {
    this.notifications.update(current =>
      current.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead(): void {
    this.notifications.update(current =>
      current.map(n => ({ ...n, read: true }))
    );
  }

  clearAll(): void {
    this.notifications.set([]);
  }
}
