export type ReservationStatus = 'confirmed' | 'pending' | 'seated' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  guests: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (start time)
  endTime?: string; // HH:mm (calculated based on reservation duration)
  durationMinutes?: number;
  tableId: string;
  tableNumber: string;
  status: ReservationStatus;
  specialRequest?: string;
  createdAt: string;
  updatedAt?: string;
  seatingTime?: string;
  notes?: string;
  occasion?: 'Birthday' | 'Anniversary' | 'Business' | 'Casual' | 'Date Night' | 'Celebration' | 'Family Dining';

  // Integration & customer tracking fields
  customerUid?: string;
  restaurantId?: string;
  referenceCode?: string; // e.g. DBR-78491
  idempotencyKey?: string;
}

export interface BookingSubmissionRequest {
  customerName: string;
  phone: string;
  email?: string;
  guests: number;
  date: string;
  time: string;
  tableId: string;
  specialRequest?: string;
  occasion?: 'Birthday' | 'Anniversary' | 'Business' | 'Casual' | 'Date Night' | 'Celebration' | 'Family Dining';
  customerUid?: string;
  idempotencyKey?: string;
}
