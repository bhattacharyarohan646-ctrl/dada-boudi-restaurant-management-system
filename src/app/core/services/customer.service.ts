import { Injectable, signal, computed, inject } from '@angular/core';
import { Customer } from '../models/customer.model';
import { INITIAL_CUSTOMERS } from '../mock/mock-data';
import { ToastService } from './toast.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private toastService = inject(ToastService);
  private firebaseService = inject(FirebaseService);

  customers = this.firebaseService.customersSignal;

  totalCustomers = computed(() => this.customers().length);
  vipCustomers = computed(() => this.customers().filter(c => c.isVip));
  vipCount = computed(() => this.vipCustomers().length);

  getCustomerById(id: string): Customer | undefined {
    return this.customers().find(c => c.id === id);
  }

  getCustomerByName(name: string): Customer | undefined {
    return this.customers().find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  addCustomer(customerData: Omit<Customer, 'id' | 'totalReservations' | 'totalVisits' | 'lastVisit'>): Customer {
    const existing = this.getCustomerByName(customerData.name);
    if (existing) {
      return existing;
    }

    const newCustomer: Customer = {
      ...customerData,
      id: 'cust-' + Date.now(),
      totalReservations: 1,
      totalVisits: 0,
      lastVisit: new Date().toISOString().split('T')[0]
    };

    this.customers.update(list => [newCustomer, ...list]);
    return newCustomer;
  }

  incrementCustomerVisits(name: string): void {
    this.customers.update(list =>
      list.map(c => {
        if (c.name.toLowerCase() === name.toLowerCase()) {
          const totalVisits = c.totalVisits + 1;
          const isVip = totalVisits >= 5 || c.isVip;
          return {
            ...c,
            totalVisits,
            totalReservations: c.totalReservations + 1,
            lastVisit: new Date().toISOString().split('T')[0],
            isVip
          };
        }
        return c;
      })
    );
  }

  updateCustomer(id: string, updates: Partial<Customer>): void {
    this.customers.update(list =>
      list.map(c => c.id === id ? { ...c, ...updates } : c)
    );
    this.toastService.success('Profile Saved', 'Customer details have been updated.');
  }
}
