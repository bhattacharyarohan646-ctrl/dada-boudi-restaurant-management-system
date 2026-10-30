import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DADA_BOUDI_MENU, MenuItem } from '../../../core/models/menu.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="menu-page animate-fade-in">
      <!-- Menu Header -->
      <section class="menu-hero">
        <div class="menu-hero-container">
          <span class="menu-badge">Dada Boudi Restaurant • Barrackpore</span>
          <h1 class="menu-title">Royal Mughlai & Biryani Menu</h1>
          <p class="menu-sub">
            Prepared fresh daily with long-grain fragrant Basmati, tender premium cuts, and the secret 1958 Awadhi-Bengal spice blend.
          </p>
        </div>
      </section>

      <div class="menu-container">
        <!-- Controls: Search & Category Chips -->
        <div class="menu-controls-card">
          <!-- Search & Veg Toggle Row -->
          <div class="controls-top-row">
            <div class="search-wrap">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                class="search-input"
                placeholder="Search dishes (e.g. Mutton Biryani, Chaap, Firni)..."
                [(ngModel)]="searchQuery" />
            </div>

            <!-- Veg / Non-Veg Toggle -->
            <div class="veg-toggle-group">
              <button
                type="button"
                class="veg-pill"
                [class.active]="dietFilter() === 'all'"
                (click)="dietFilter.set('all')">
                All Items
              </button>
              <button
                type="button"
                class="veg-pill veg-only"
                [class.active]="dietFilter() === 'veg'"
                (click)="dietFilter.set('veg')">
                🟢 Veg Only
              </button>
              <button
                type="button"
                class="veg-pill nonveg-only"
                [class.active]="dietFilter() === 'nonveg'"
                (click)="dietFilter.set('nonveg')">
                🔴 Non-Veg Only
              </button>
            </div>
          </div>

          <!-- Category Pills -->
          <div class="categories-bar">
            @for (cat of categories; track cat) {
              <button
                type="button"
                class="cat-chip"
                [class.active]="selectedCategory() === cat"
                (click)="selectedCategory.set(cat)">
                {{ cat }}
              </button>
            }
          </div>
        </div>

        <!-- Dishes Grid -->
        <div *ngIf="filteredDishes().length > 0; else noDishes" class="menu-grid">
          @for (item of filteredDishes(); track item.id) {
            <div class="menu-card">
              <div class="card-img-wrap" *ngIf="item.imageUrl">
                <img [src]="item.imageUrl" [alt]="item.name" class="card-img" loading="lazy" />
                <span *ngIf="item.isBestseller" class="badge-bestseller">⭐ Bestseller</span>
                <span class="badge-diet" [class.veg]="item.isVegetarian">
                  {{ item.isVegetarian ? '🟢 Pure Veg' : '🔴 Non-Veg' }}
                </span>
              </div>

              <div class="card-content">
                <div class="card-title-row">
                  <h3 class="dish-title">{{ item.name }}</h3>
                  <span class="dish-price">₹{{ item.price }}</span>
                </div>

                <span *ngIf="item.bengaliName" class="dish-bengali">{{ item.bengaliName }}</span>

                <p class="dish-desc">{{ item.description }}</p>

                <div class="card-footer">
                  <span class="cat-tag">{{ item.category }}</span>
                  <a routerLink="/book-table" class="btn-order-dine">Book Table</a>
                </div>
              </div>
            </div>
          }
        </div>

        <ng-template #noDishes>
          <div class="no-dishes-box">
            <span class="no-icon">🍲</span>
            <h3>No Dishes Match Your Search</h3>
            <p>Try searching for other authentic items like "Biryani", "Chaap", "Rezala", or reset filters.</p>
            <button type="button" class="btn-reset" (click)="resetFilters()">Reset Filters</button>
          </div>
        </ng-template>

        <!-- CTA Floating Bar -->
        <div class="menu-bottom-cta">
          <div>
            <strong>Craving Dada Boudi Biryani?</strong>
            <p>Reserve your table now to enjoy piping-hot dum biryani right as you sit down.</p>
          </div>
          <a routerLink="/book-table" class="btn-cta-reserve">
            <span>📅 Reserve a Table</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-page {
      min-height: calc(100vh - 140px);
      background: var(--bg-app);
      padding-bottom: 4rem;
    }
    .menu-hero {
      background: linear-gradient(135deg, #111827 0%, #7c2d12 100%);
      color: #fff;
      padding: 3.5rem 1.25rem 2.5rem;
      text-align: center;
    }
    .menu-hero-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .menu-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #fdba74;
      background: rgba(254, 215, 170, 0.15);
      border: 1px solid rgba(254, 215, 170, 0.3);
      padding: 3px 12px;
      border-radius: 999px;
      margin-bottom: 0.75rem;
    }
    .menu-title {
      font-family: var(--font-brand);
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 900;
      margin-bottom: 0.5rem;
    }
    .menu-sub {
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.5;
    }

    .menu-container {
      max-width: 1250px;
      margin: -1.5rem auto 0;
      padding: 0 1.25rem;
    }

    /* Controls */
    .menu-controls-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--shadow-lg);
      margin-bottom: 2rem;
    }
    .controls-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 260px;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      color: var(--text-muted);
    }
    .search-input {
      width: 100%;
      padding: 0.65rem 1rem 0.65rem 2.25rem;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-full);
      background: var(--bg-surface-secondary);
      color: var(--text-main);
      font-size: 0.875rem;
      outline: none;
    }
    .search-input:focus {
      border-color: var(--color-primary-500);
      background: var(--bg-surface);
      box-shadow: 0 0 0 3px var(--color-primary-glow);
    }

    .veg-toggle-group {
      display: flex;
      gap: 6px;
    }
    .veg-pill {
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-medium);
      background: var(--bg-surface-secondary);
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-secondary);
      cursor: pointer;
    }
    .veg-pill.active {
      background: var(--color-primary-600);
      border-color: var(--color-primary-600);
      color: #fff;
    }

    .categories-bar {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .cat-chip {
      padding: 0.45rem 0.95rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      background: var(--bg-surface-secondary);
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .cat-chip:hover {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
    }
    .cat-chip.active {
      background: var(--color-primary-600);
      color: #fff;
      border-color: var(--color-primary-600);
    }

    /* Menu Grid */
    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .menu-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .menu-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .card-img-wrap {
      position: relative;
      height: 180px;
      width: 100%;
      background: #1e293b;
    }
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .badge-bestseller {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #ea580c;
      color: #fff;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .badge-diet {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }
    .card-content {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .card-title-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 2px;
    }
    .dish-title {
      font-family: var(--font-brand);
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .dish-price {
      font-family: var(--font-brand);
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-primary-600);
      flex-shrink: 0;
    }
    .dish-bengali {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .dish-desc {
      font-size: 0.825rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin-bottom: 1rem;
      flex: 1;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 0.75rem;
    }
    .cat-tag {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .btn-order-dine {
      padding: 0.4rem 0.85rem;
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      border-radius: var(--radius-sm);
      font-size: 0.78rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-order-dine:hover {
      background: var(--color-primary-600);
      color: #fff;
    }

    /* No dishes */
    .no-dishes-box {
      text-align: center;
      padding: 4rem 1rem;
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-light);
    }
    .no-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.75rem;
    }
    .no-dishes-box h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .no-dishes-box p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 1.25rem;
    }
    .btn-reset {
      padding: 0.6rem 1.25rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 700;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
    }

    /* Bottom CTA */
    .menu-bottom-cta {
      background: linear-gradient(135deg, #7c2d12, #c2410c);
      color: #fff;
      padding: 1.75rem 2rem;
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .menu-bottom-cta strong {
      font-family: var(--font-brand);
      font-size: 1.2rem;
      display: block;
      margin-bottom: 4px;
    }
    .menu-bottom-cta p {
      font-size: 0.85rem;
      color: #fed7aa;
      margin: 0;
    }
    .btn-cta-reserve {
      padding: 0.75rem 1.6rem;
      background: #fff;
      color: #c2410c;
      font-weight: 800;
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class CustomerMenuComponent {
  searchQuery: string = '';
  selectedCategory = signal<string>('All');
  dietFilter = signal<'all' | 'veg' | 'nonveg'>('all');

  categories = [
    'All',
    'Biryani Specials',
    'Mughlai Curries & Chaap',
    'Tandoor & Starters',
    'Breads & Accompaniments',
    'Desserts & Beverages'
  ];

  allDishes: MenuItem[] = DADA_BOUDI_MENU;

  filteredDishes = computed(() => {
    let list = this.allDishes;

    // Filter by Category
    const cat = this.selectedCategory();
    if (cat !== 'All') {
      list = list.filter(item => item.category === cat);
    }

    // Filter by Veg / Non-Veg
    const diet = this.dietFilter();
    if (diet === 'veg') {
      list = list.filter(item => item.isVegetarian);
    } else if (diet === 'nonveg') {
      list = list.filter(item => !item.isVegetarian);
    }

    // Filter by Search Query
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.bengaliName && item.bengaliName.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q)
      );
    }

    return list;
  });

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory.set('All');
    this.dietFilter.set('all');
  }
}
