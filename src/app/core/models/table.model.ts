export type TableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning';
export type TableZone = 'Window' | 'Main Dining' | 'Bar Area' | 'Outdoor Patio' | 'Private Dining';
export type TableShape = 'round' | 'square' | 'rectangle';

export interface RestaurantTable {
  id: string;
  tableNumber: string; // e.g. T01, T12
  capacity: number; // e.g. 2, 4, 6, 8
  status: TableStatus;
  zone: TableZone;
  shape: TableShape;
  currentReservationId?: string;
  notes?: string;
  gridRow: number;
  gridCol: number;
  minimumSpend?: number;
}

export interface TableMatchRecommendation {
  table: RestaurantTable;
  score: number; // calculated match score
  isBestMatch: boolean;
  matchReason: string;
}
