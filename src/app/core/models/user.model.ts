export type UserRole = 'customer' | 'staff' | 'admin';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  role: UserRole;
  createdAt?: string;
  lastLoginAt?: string;
}
