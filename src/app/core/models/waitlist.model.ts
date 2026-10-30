export type WaitlistStatus = 'waiting' | 'seated' | 'cancelled';
export type WaitlistPriority = 'Normal' | 'VIP' | 'High';

export interface WaitlistEntry {
  id: string;
  customerName: string;
  phone: string;
  guests: number;
  preferredTime: string;
  waitingTimeMinutes: number;
  priority: WaitlistPriority;
  status: WaitlistStatus;
  addedAt: string;
  notes?: string;
  assignedTableId?: string;
  assignedTableNumber?: string;
}
