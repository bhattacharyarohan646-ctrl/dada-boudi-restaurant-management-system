import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(title: string, message: string, type: ToastType = 'info', duration: number = 3800): void {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newToast: ToastMessage = { id, title, message, type, duration };

    this.toasts.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(title: string, message: string): void {
    this.show(title, message, 'success');
  }

  warning(title: string, message: string): void {
    this.show(title, message, 'warning');
  }

  error(title: string, message: string): void {
    this.show(title, message, 'error');
  }

  info(title: string, message: string): void {
    this.show(title, message, 'info');
  }

  remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
