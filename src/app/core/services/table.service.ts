import { Injectable, signal, computed, inject } from '@angular/core';
import { RestaurantTable, TableStatus, TableMatchRecommendation } from '../models/table.model';
import { INITIAL_TABLES } from '../mock/mock-data';
import { ToastService } from './toast.service';
import { NotificationService } from './notification.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private toastService = inject(ToastService);
  private notificationService = inject(NotificationService);
  private firebaseService = inject(FirebaseService);

  // Authoritative shared signal from Firebase / Live Sync
  tables = this.firebaseService.tablesSignal;

  // Computed statistics
  totalTables = computed(() => this.tables().length);

  availableTables = computed(() =>
    this.tables().filter(t => t.status === 'available')
  );

  reservedTables = computed(() =>
    this.tables().filter(t => t.status === 'reserved')
  );

  occupiedTables = computed(() =>
    this.tables().filter(t => t.status === 'occupied')
  );

  cleaningTables = computed(() =>
    this.tables().filter(t => t.status === 'cleaning')
  );

  availableCount = computed(() => this.availableTables().length);
  reservedCount = computed(() => this.reservedTables().length);
  occupiedCount = computed(() => this.occupiedTables().length);
  cleaningCount = computed(() => this.cleaningTables().length);

  occupancyRate = computed(() => {
    const total = this.totalTables();
    if (total === 0) return 0;
    const inUse = this.occupiedCount() + this.reservedCount();
    return Math.round((inUse / total) * 100);
  });

  getTableById(id: string): RestaurantTable | undefined {
    return this.tables().find(t => t.id === id);
  }

  getTableByNumber(tableNumber: string): RestaurantTable | undefined {
    return this.tables().find(t => t.tableNumber.toLowerCase() === tableNumber.toLowerCase());
  }

  /**
   * Smart Table Recommendation Algorithm
   * Filters available tables where capacity >= guest count.
   * Sorts by minimum excess capacity (smallest best fit).
   * Flags the optimal match as 'isBestMatch'.
   */
  recommendTables(guests: number): TableMatchRecommendation[] {
    if (guests <= 0) return [];

    const available = this.tables().filter(t => t.status === 'available');

    // Filter tables that can hold the party
    const candidates = available.filter(t => t.capacity >= guests);

    // Map each candidate with a fitness score
    // Lower score is better: difference between capacity and guests
    const scoredCandidates = candidates.map(table => {
      const excessSeats = table.capacity - guests;
      let reason = '';
      if (excessSeats === 0) {
        reason = `Perfect fit! Exact ${table.capacity} seats.`;
      } else if (excessSeats <= 2) {
        reason = `Comfortable match (${table.capacity} seats for ${guests} guests).`;
      } else {
        reason = `Spacious table (${table.capacity} seats).`;
      }

      return {
        table,
        score: excessSeats,
        isBestMatch: false,
        matchReason: reason
      };
    });

    // Sort by smallest excess seats first, then by table number
    scoredCandidates.sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      return a.table.tableNumber.localeCompare(b.table.tableNumber);
    });

    // Mark the first candidate as the Best Match
    if (scoredCandidates.length > 0) {
      scoredCandidates[0].isBestMatch = true;
      scoredCandidates[0].matchReason = `⭐ Best Match: Closest fit (${scoredCandidates[0].table.capacity} seats for ${guests} guests).`;
    }

    return scoredCandidates;
  }

  updateTableStatus(tableId: string, newStatus: TableStatus, reservationId?: string): void {
    const table = this.getTableById(tableId);
    if (!table) return;

    const oldStatus = table.status;
    this.firebaseService.updateTableStatus(tableId, newStatus, reservationId);

    this.notificationService.addNotification(
      `Table ${table.tableNumber} Status Changed`,
      `Status transitioned from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}.`,
      'table'
    );

    this.toastService.info(
      `Table ${table.tableNumber} Updated`,
      `Status changed to ${newStatus.toUpperCase()}`
    );
  }

  addTable(tableData: Omit<RestaurantTable, 'id'>): void {
    const id = 'tbl-' + Date.now();
    const newTable: RestaurantTable = {
      ...tableData,
      id
    };

    this.tables.update(list => [...list, newTable]);
    this.toastService.success('Table Added', `Table ${newTable.tableNumber} created successfully.`);
  }

  updateTable(tableId: string, updates: Partial<RestaurantTable>): void {
    this.tables.update(list =>
      list.map(t => (t.id === tableId ? { ...t, ...updates } : t))
    );
    this.toastService.success('Table Updated', 'Table configuration saved.');
  }

  deleteTable(tableId: string): void {
    const table = this.getTableById(tableId);
    if (!table) return;

    this.tables.update(list => list.filter(t => t.id !== tableId));
    this.toastService.warning('Table Removed', `Table ${table.tableNumber} was deleted.`);
  }

  resetToDefault(): void {
    this.tables.set(INITIAL_TABLES);
    this.toastService.info('Data Reset', 'Tables restored to initial state.');
  }
}
