export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalReservations: number;
  totalVisits: number;
  lastVisit: string;
  isVip: boolean;
  favoriteTable: string;
  preferredTime: string;
  dietaryRestrictions?: string[];
  notes?: string;
  tags?: string[];
}
