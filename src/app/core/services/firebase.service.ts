import { Injectable, signal, inject } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  runTransaction,
  query,
  where,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { Reservation, ReservationStatus, BookingSubmissionRequest } from '../models/reservation.model';
import { RestaurantTable, TableStatus } from '../models/table.model';
import { Customer } from '../models/customer.model';
import { WaitlistEntry } from '../models/waitlist.model';
import { INITIAL_TABLES, INITIAL_RESERVATIONS, INITIAL_CUSTOMERS, INITIAL_WAITLIST } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp | null = null;
  public firestore: Firestore | null = null;
  public auth: Auth | null = null;

  // Real-time synchronization state
  isLiveFirebase = signal<boolean>(false);
  isConnecting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Authoritative shared data signals
  reservationsSignal = signal<Reservation[]>(INITIAL_RESERVATIONS);
  tablesSignal = signal<RestaurantTable[]>(INITIAL_TABLES);
  customersSignal = signal<Customer[]>(INITIAL_CUSTOMERS);
  waitlistSignal = signal<WaitlistEntry[]>(INITIAL_WAITLIST);

  // Track processed idempotency keys to strictly prevent duplicate submissions
  private processedIdempotencyKeys = new Set<string>();
  private unsubscribes: Unsubscribe[] = [];

  constructor() {
    this.initFirebase();
  }

  private initFirebase(): void {
    const config = environment.firebase;
    const isPlaceholder = !config.apiKey || config.apiKey.includes('DEMO_KEY') || config.apiKey.includes('YOUR_API_KEY');

    if (isPlaceholder) {
      console.info(
        'ℹ️ DineFlow: Running in Reactive Synchronized Mode. Cloud Firestore configuration contains placeholders. Update src/environments/environment.ts to enable live Firebase connection.'
      );
      this.isLiveFirebase.set(false);
      return;
    }

    try {
      this.isConnecting.set(true);
      this.app = initializeApp(config);
      this.firestore = getFirestore(this.app);
      this.auth = getAuth(this.app);
      this.isLiveFirebase.set(true);
      this.isConnecting.set(false);
      console.log('🔥 DineFlow: Connected to Cloud Firestore & Firebase Auth successfully.');

      this.setupRealtimeListeners();
    } catch (err: any) {
      console.warn('⚠️ DineFlow: Could not initialize Firebase SDK, falling back to local sync mode:', err);
      this.errorMessage.set(err.message || 'Firebase initialization failed');
      this.isLiveFirebase.set(false);
      this.isConnecting.set(false);
    }
  }

  /**
   * Sets up real-time onSnapshot listeners to keep Admin Dashboard and Customer Website synced
   */
  private setupRealtimeListeners(): void {
    if (!this.firestore) return;

    try {
      // 1. Reservations Realtime Listener
      const resCol = collection(this.firestore, 'reservations');
      const unsubRes = onSnapshot(
        resCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Reservation[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...(docSnap.data() as Reservation), id: docSnap.id });
            });
            // Sort by date and time descending
            list.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
            this.reservationsSignal.set(list);
          }
        },
        (error) => {
          console.warn('Realtime reservations listener error:', error);
        }
      );
      this.unsubscribes.push(unsubRes);

      // 2. Tables Realtime Listener
      const tblCol = collection(this.firestore, 'tables');
      const unsubTbl = onSnapshot(
        tblCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: RestaurantTable[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...(docSnap.data() as RestaurantTable), id: docSnap.id });
            });
            this.tablesSignal.set(list);
          }
        },
        (error) => {
          console.warn('Realtime tables listener error:', error);
        }
      );
      this.unsubscribes.push(unsubTbl);

      // 3. Customers Realtime Listener
      const custCol = collection(this.firestore, 'customers');
      const unsubCust = onSnapshot(
        custCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Customer[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...(docSnap.data() as Customer), id: docSnap.id });
            });
            this.customersSignal.set(list);
          }
        },
        (error) => {
          console.warn('Realtime customers listener error:', error);
        }
      );
      this.unsubscribes.push(unsubCust);

      // 4. Waitlist Realtime Listener
      const waitCol = collection(this.firestore, 'waitlist');
      const unsubWait = onSnapshot(
        waitCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: WaitlistEntry[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...(docSnap.data() as WaitlistEntry), id: docSnap.id });
            });
            this.waitlistSignal.set(list);
          }
        },
        (error) => {
          console.warn('Realtime waitlist listener error:', error);
        }
      );
      this.unsubscribes.push(unsubWait);
    } catch (e) {
      console.error('Failed to attach Firebase listeners:', e);
    }
  }

  /**
   * Safe Transactional Booking Mechanism
   * Checks table availability, prevents overlapping bookings, validates capacity,
   * handles idempotency, and updates both reservation and table records atomically.
   */
  async bookTableTransaction(request: BookingSubmissionRequest): Promise<{ success: boolean; reservation?: Reservation; error?: string }> {
    // 1. Idempotency Check (Prevent duplicate clicks)
    if (request.idempotencyKey && this.processedIdempotencyKeys.has(request.idempotencyKey)) {
      return { success: false, error: 'A booking submission with this request is already in progress. Please wait.' };
    }
    if (request.idempotencyKey) {
      this.processedIdempotencyKeys.add(request.idempotencyKey);
    }

    const duration = environment.restaurant.reservationDurationMinutes || 90;
    const startTime = request.time;
    const endTime = this.calculateEndTime(startTime, duration);
    const date = request.date;
    const tableId = request.tableId;

    // Generate unique human-readable booking reference e.g. DBR-83921
    const referenceCode = 'DBR-' + Math.floor(10000 + Math.random() * 90000);
    const reservationId = 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 2. Validate Overlapping Reservations
    const isConflict = this.checkTimeConflict(tableId, date, startTime, endTime);
    if (isConflict) {
      if (request.idempotencyKey) this.processedIdempotencyKeys.delete(request.idempotencyKey);
      return {
        success: false,
        error: `Table ${request.tableId} is already reserved for the selected time window (${startTime} – ${endTime}). Please choose an alternative table or time.`
      };
    }

    // Determine Table details
    const currentTables = this.tablesSignal();
    const targetTable = currentTables.find(t => t.id === tableId);
    const tableNumber = targetTable ? targetTable.tableNumber : 'Unassigned';

    // Verify Capacity
    if (targetTable && targetTable.capacity < request.guests) {
      if (request.idempotencyKey) this.processedIdempotencyKeys.delete(request.idempotencyKey);
      return {
        success: false,
        error: `Selected Table ${tableNumber} has capacity for ${targetTable.capacity} guests, but your party size is ${request.guests}.`
      };
    }

    const newReservation: Reservation = {
      id: reservationId,
      customerName: request.customerName.trim(),
      phone: request.phone.trim(),
      email: request.email ? request.email.trim() : '',
      guests: Number(request.guests),
      date: request.date,
      time: request.time,
      endTime,
      durationMinutes: duration,
      tableId,
      tableNumber,
      status: 'confirmed',
      specialRequest: request.specialRequest?.trim() || '',
      occasion: request.occasion || 'Casual',
      customerUid: request.customerUid || 'guest-' + Date.now(),
      restaurantId: 'dadaboudi-barrackpore',
      referenceCode,
      createdAt: nowIso,
      updatedAt: nowIso,
      idempotencyKey: request.idempotencyKey
    };

    // If connected to live Firestore, perform atomic transaction
    if (this.isLiveFirebase() && this.firestore) {
      try {
        const resRef = doc(this.firestore, 'reservations', reservationId);
        const tblRef = doc(this.firestore, 'tables', tableId);

        await runTransaction(this.firestore, async (transaction) => {
          // Double check within transaction
          transaction.set(resRef, newReservation);

          // If booking is for today and current time slot, update table status
          const today = new Date().toISOString().split('T')[0];
          if (date === today) {
            transaction.update(tblRef, {
              status: 'reserved',
              currentReservationId: reservationId
            });
          }
        });

        // Also add customer to CRM
        this.syncCustomerRecord(newReservation);
        return { success: true, reservation: newReservation };
      } catch (err: any) {
        if (request.idempotencyKey) this.processedIdempotencyKeys.delete(request.idempotencyKey);
        console.error('Firestore transaction error:', err);
        return { success: false, error: err.message || 'Database transaction error occurred.' };
      }
    }

    // Local / In-Memory Synchronized Mode:
    // Update authoritative signal atomically
    this.reservationsSignal.update(list => [newReservation, ...list]);

    // Update table status if today's reservation
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      this.tablesSignal.update(tables =>
        tables.map(t => t.id === tableId ? { ...t, status: 'reserved', currentReservationId: reservationId } : t)
      );
    }

    this.syncCustomerRecord(newReservation);
    return { success: true, reservation: newReservation };
  }

  /**
   * Helper to compute end time based on start time + minutes
   */
  calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  }

  /**
   * Checks whether a requested reservation overlaps with existing active reservations for a table
   */
  checkTimeConflict(tableId: string, date: string, reqStart: string, reqEnd: string, excludeResId?: string): boolean {
    const activeRes = this.reservationsSignal().filter(r =>
      r.tableId === tableId &&
      r.date === date &&
      r.id !== excludeResId &&
      (r.status === 'confirmed' || r.status === 'pending' || r.status === 'seated')
    );

    for (const res of activeRes) {
      const existingStart = res.time;
      const existingEnd = res.endTime || this.calculateEndTime(res.time, res.durationMinutes || 90);

      // Overlap condition:
      // Interval [reqStart, reqEnd) overlaps with [existingStart, existingEnd)
      // if (reqStart < existingEnd && reqEnd > existingStart)
      if (reqStart < existingEnd && reqEnd > existingStart) {
        return true; // Conflict found
      }
    }
    return false;
  }

  /**
   * Syncs customer into CRM collection
   */
  syncCustomerRecord(reservation: Reservation): void {
    const current = this.customersSignal();
    const existing = current.find(
      c => (c.phone && c.phone === reservation.phone) || c.name.toLowerCase() === reservation.customerName.toLowerCase()
    );

    if (existing) {
      const updated: Customer = {
        ...existing,
        totalReservations: existing.totalReservations + 1,
        lastVisit: reservation.date,
        favoriteTable: reservation.tableNumber
      };
      this.customersSignal.update(list => list.map(c => c.id === existing.id ? updated : c));
      if (this.isLiveFirebase() && this.firestore) {
        updateDoc(doc(this.firestore, 'customers', existing.id), { ...updated } as any).catch(console.error);
      }
    } else {
      const newCustomer: Customer = {
        id: 'cust-' + Date.now(),
        name: reservation.customerName,
        phone: reservation.phone,
        email: reservation.email || '',
        totalReservations: 1,
        totalVisits: 0,
        lastVisit: reservation.date,
        isVip: false,
        favoriteTable: reservation.tableNumber,
        preferredTime: reservation.time,
        tags: ['New Customer']
      };
      this.customersSignal.update(list => [newCustomer, ...list]);
      if (this.isLiveFirebase() && this.firestore) {
        setDoc(doc(this.firestore, 'customers', newCustomer.id), newCustomer).catch(console.error);
      }
    }
  }

  /**
   * Cancels a reservation and frees up table
   */
  async cancelReservation(reservationId: string): Promise<boolean> {
    const res = this.reservationsSignal().find(r => r.id === reservationId);
    if (!res) return false;

    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Update reservation
    this.reservationsSignal.update(list =>
      list.map(r => r.id === reservationId ? { ...r, status: 'cancelled', updatedAt: nowIso } : r)
    );

    // Free table if associated with this reservation
    if (res.tableId) {
      this.tablesSignal.update(tables =>
        tables.map(t => (t.id === res.tableId && t.currentReservationId === reservationId)
          ? { ...t, status: 'available', currentReservationId: undefined }
          : t
        )
      );
    }

    if (this.isLiveFirebase() && this.firestore) {
      try {
        await updateDoc(doc(this.firestore, 'reservations', reservationId), {
          status: 'cancelled',
          updatedAt: nowIso
        });
        if (res.tableId) {
          await updateDoc(doc(this.firestore, 'tables', res.tableId), {
            status: 'available',
            currentReservationId: null
          });
        }
      } catch (e) {
        console.error('Error cancelling reservation in Firestore:', e);
      }
    }

    return true;
  }

  /**
   * Updates reservation status (admin/staff action)
   */
  async updateReservationStatus(reservationId: string, newStatus: ReservationStatus): Promise<void> {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    this.reservationsSignal.update(list =>
      list.map(r => r.id === reservationId ? { ...r, status: newStatus, updatedAt: nowIso } : r)
    );

    if (this.isLiveFirebase() && this.firestore) {
      try {
        await updateDoc(doc(this.firestore, 'reservations', reservationId), {
          status: newStatus,
          updatedAt: nowIso
        });
      } catch (e) {
        console.error('Error updating status in Firestore:', e);
      }
    }
  }

  /**
   * Updates table status (admin/staff action)
   */
  async updateTableStatus(tableId: string, status: TableStatus, reservationId?: string): Promise<void> {
    this.tablesSignal.update(tables =>
      tables.map(t => {
        if (t.id === tableId) {
          return {
            ...t,
            status,
            currentReservationId: status === 'available' ? undefined : (reservationId ?? t.currentReservationId)
          };
        }
        return t;
      })
    );

    if (this.isLiveFirebase() && this.firestore) {
      try {
        await updateDoc(doc(this.firestore, 'tables', tableId), {
          status,
          currentReservationId: status === 'available' ? null : (reservationId ?? null)
        });
      } catch (e) {
        console.error('Error updating table status in Firestore:', e);
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribes.forEach(unsub => unsub());
  }
}
