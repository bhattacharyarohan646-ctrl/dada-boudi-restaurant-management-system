export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'reservation' | 'table' | 'system' | 'vip';
  read: boolean;
  link?: string;
}
