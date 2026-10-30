import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private readonly STORAGE_KEY = 'restaurant_name';
  restaurantName = signal<string>('Dada Boudi Resturent');

  constructor() {
    const savedName = localStorage.getItem(this.STORAGE_KEY);
    if (savedName) {
      this.restaurantName.set(savedName);
    } else {
      localStorage.setItem(this.STORAGE_KEY, 'Dada Boudi Resturent');
    }

    effect(() => {
      const name = this.restaurantName();
      localStorage.setItem(this.STORAGE_KEY, name);
      document.title = `${name} — Smart Restaurant Reservation & Table Management System`;
    });
  }

  updateRestaurantName(name: string): void {
    if (name && name.trim()) {
      this.restaurantName.set(name.trim());
    }
  }
}
