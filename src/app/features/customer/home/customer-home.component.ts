import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { DADA_BOUDI_MENU, MenuItem } from '../../../core/models/menu.model';
import { TableService } from '../../../core/services/table.service';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="home-page animate-fade-in">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-container">
          <div class="hero-badge">
            <span class="star-icon">👑</span>
            <span>Barrackpore's Culinary Pride Since 1958</span>
          </div>

          <h1 class="hero-title">
            Taste the Legend.<br />
            <span class="gradient-text">Dada Boudi Biryani</span>
          </h1>

          <p class="hero-lead">
            Home to the iconic Kolkata-style Mutton Biryani with fragrant saffron basmati rice,
            melt-in-mouth tender mutton, and golden spiced potatoes cooked in pure desi ghee.
          </p>

          <div class="hero-cta-group">
            <a routerLink="/book-table" class="btn-hero-primary">
              <span>📅</span>
              <span>Reserve a Table</span>
            </a>
            <a routerLink="/menu" class="btn-hero-secondary">
              <span>📖</span>
              <span>Explore Signature Menu</span>
            </a>
          </div>

          <!-- Quick Highlights Row -->
          <div class="hero-stats-row">
            <div class="hero-stat">
              <strong>4.8 ★</strong>
              <span>18,000+ Reviews</span>
            </div>
            <div class="stat-sep">|</div>
            <div class="hero-stat">
              <strong>68+ Years</strong>
              <span>Generational Recipe</span>
            </div>
            <div class="stat-sep">|</div>
            <div class="hero-stat">
              <strong>100%</strong>
              <span>Guaranteed Seating</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Fast Booking Bar -->
      <section class="quick-booking-section">
        <div class="quick-booking-card">
          <div class="booking-prompt-header">
            <h3>⚡ Fast Table Reservation</h3>
            <span class="live-tag">
              <span class="pulse-dot"></span> {{ tableService.availableCount() }} Tables Open Right Now
            </span>
          </div>

          <div class="booking-inputs-grid">
            <div class="input-cell">
              <label>Select Date</label>
              <input type="date" [(ngModel)]="quickDate" [min]="todayDate" class="q-input" />
            </div>

            <div class="input-cell">
              <label>Number of Guests</label>
              <select [(ngModel)]="quickGuests" class="q-input">
                <option [value]="2">2 Guests (Couple / Pair)</option>
                <option [value]="4">4 Guests (Family Table)</option>
                <option [value]="6">6 Guests (Group)</option>
                <option [value]="8">8 Guests (Large Party)</option>
                <option [value]="10">10+ Guests (Royal Banquet)</option>
              </select>
            </div>

            <div class="input-cell">
              <label>Service Slot</label>
              <select [(ngModel)]="quickTime" class="q-input">
                <option value="13:00">1:00 PM (Lunch Special)</option>
                <option value="14:00">2:00 PM (Afternoon Dum)</option>
                <option value="19:30">7:30 PM (Dinner Service)</option>
                <option value="20:30">8:30 PM (Peak Dinner)</option>
                <option value="21:30">9:30 PM (Late Dining)</option>
              </select>
            </div>

            <div class="input-cell btn-cell">
              <button type="button" class="btn-check-availability" (click)="onQuickBook()">
                <span>Find Table</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Signature Dishes Showcase -->
      <section class="dishes-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-pill">Taste of Bengal & Awadh</span>
            <h2 class="section-title">Barrackpore's Must-Try Classics</h2>
            <p class="section-subtitle">Crafted daily using traditional dum techniques, royal spices, and uncompromised ingredients.</p>
          </div>

          <div class="dishes-grid">
            @for (item of signatureDishes; track item.id) {
              <div class="dish-card">
                <div class="dish-image-wrap">
                  <img [src]="item.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600'" [alt]="item.name" class="dish-img" loading="lazy" />
                  <span class="dish-badge" *ngIf="item.isBestseller">⭐ Bestseller</span>
                  <span class="veg-nonveg-badge" [class.veg]="item.isVegetarian">
                    {{ item.isVegetarian ? '🟢 Veg' : '🔴 Non-Veg' }}
                  </span>
                </div>

                <div class="dish-body">
                  <div class="dish-title-row">
                    <h3 class="dish-name">{{ item.name }}</h3>
                    <span class="dish-price">₹{{ item.price }}</span>
                  </div>
                  <p class="dish-bengali" *ngIf="item.bengaliName">{{ item.bengaliName }}</p>
                  <p class="dish-desc">{{ item.description }}</p>

                  <div class="dish-footer">
                    <a routerLink="/book-table" class="dish-cta-btn">Book Table to Savor</a>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="menu-cta-row">
            <a routerLink="/menu" class="btn-view-full-menu">View Complete Restaurant Menu (16+ Items) →</a>
          </div>
        </div>
      </section>

      <!-- Heritage / Story Section -->
      <section class="heritage-section">
        <div class="section-container heritage-grid">
          <div class="heritage-content">
            <span class="section-pill">Our Legacy</span>
            <h2 class="heritage-title">The Legend of Barrackpore Biryani</h2>
            <p class="heritage-text">
              Founded in 1958 near the Barrackpore railway station, <strong>Dada Boudi Restaurant</strong> transformed Bengal's biryani scene. Known across West Bengal for serving gigantic, succulent pieces of tender mutton simmered with aromatic long-grain rice, aromatic saffron ghee, and the nostalgic Kolkata spiced aloo.
            </p>
            <p class="heritage-text">
              Every handi is dum-cooked with a generational secret blend of 32 whole spices, kewra water, and pure desi ghee—ensuring every grain carries an unmistakable royal aroma that draws food lovers from miles away.
            </p>

            <div class="features-list">
              <div class="feature-item">
                <span class="f-icon">✨</span>
                <div>
                  <strong>No More Waiting in Sun</strong>
                  <p>Reserve online via DineFlow and walk directly to your designated table.</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="f-icon">🥩</span>
                <div>
                  <strong>Prime Quality Meat Only</strong>
                  <p>Only tender, government-inspected fresh mutton cuts selected daily.</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="f-icon">❄️</span>
                <div>
                  <strong>Family AC Dining Halls</strong>
                  <p>Spacious, clean, fully air-conditioned family & private dining zones.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="heritage-visual">
            <div class="visual-card">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=700&auto=format&fit=crop&q=80"
                alt="Dada Boudi Ambience and Food"
                class="heritage-img" />
              <div class="experience-card">
                <span class="exp-icon">🏆</span>
                <div>
                  <h4>65+ Years of Trust</h4>
                  <p>Over 1.2 Million Happy Diners Served</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Customer Testimonials -->
      <section class="reviews-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-pill">Real Diner Experiences</span>
            <h2 class="section-title">What Biryani Connoisseurs Say</h2>
          </div>

          <div class="reviews-grid">
            <div class="review-card">
              <div class="stars">★★★★★</div>
              <p class="review-quote">
                "The mutton is so tender it falls right off the bone with a spoon! The potato is heavenly and soaked in flavors. Booking our table online saved us an hour of waiting outside in Barrackpore."
              </p>
              <div class="reviewer-meta">
                <strong>Anirban Chatterjee</strong>
                <span>Food Critic & Kolkata Resident</span>
              </div>
            </div>

            <div class="review-card">
              <div class="stars">★★★★★</div>
              <p class="review-quote">
                "Dada Boudi Special Mutton Biryani paired with Mutton Chaap is Bengal's ultimate comfort meal. DineFlow booking was completely frictionless on mobile phone!"
              </p>
              <div class="reviewer-meta">
                <strong>Debjani Mukherjee</strong>
                <span>Family Dinner Host</span>
              </div>
            </div>

            <div class="review-card">
              <div class="stars">★★★★★</div>
              <p class="review-quote">
                "The atmosphere is lively and hygienic. Their Firni in clay pot at the end is the perfect royal finish. Highly recommend reserving your table in advance."
              </p>
              <div class="reviewer-meta">
                <strong>Subhashis Roy</strong>
                <span>Regular Patron</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Booking CTA Banner -->
      <section class="banner-cta">
        <div class="banner-inner">
          <div class="banner-text">
            <h2>Ready for an Unforgettable Feast?</h2>
            <p>Tables fill up quickly for lunch and dinner shifts. Reserve your spot now.</p>
          </div>
          <a routerLink="/book-table" class="btn-banner-book">
            <span>Book Your Table Now →</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      background: #0f172a url('https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1600&auto=format&fit=crop&q=80') center/cover no-repeat;
      color: #fff;
      padding: 5rem 1.5rem 6rem;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(124, 45, 18, 0.88) 100%);
      z-index: 1;
    }
    .hero-container {
      position: relative;
      z-index: 2;
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(254, 215, 170, 0.15);
      border: 1px solid rgba(254, 215, 170, 0.35);
      border-radius: 999px;
      font-size: 0.825rem;
      font-weight: 700;
      color: #fdba74;
      margin-bottom: 1.5rem;
      backdrop-filter: blur(8px);
    }
    .hero-title {
      font-family: var(--font-brand);
      font-size: clamp(2.2rem, 5vw, 3.8rem);
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -0.02em;
      margin-bottom: 1.25rem;
    }
    .gradient-text {
      background: linear-gradient(135deg, #fb923c, #f59e0b, #fed7aa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-lead {
      font-size: clamp(1rem, 2vw, 1.2rem);
      color: #cbd5e1;
      max-width: 720px;
      line-height: 1.6;
      margin-bottom: 2.25rem;
    }
    .hero-cta-group {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 2.75rem;
      width: 100%;
    }
    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0.85rem 1.85rem;
      background: linear-gradient(135deg, #f97316, #c2410c);
      color: #fff;
      font-size: 1.05rem;
      font-weight: 800;
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: 0 6px 20px rgba(234, 88, 12, 0.45);
      transition: all 0.2s ease;
    }
    .btn-hero-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(234, 88, 12, 0.6);
    }
    .btn-hero-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0.85rem 1.65rem;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 1rem;
      font-weight: 700;
      border-radius: var(--radius-full);
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(8px);
      transition: all 0.2s ease;
    }
    .btn-hero-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .hero-stats-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
      justify-content: center;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero-stat strong {
      font-size: 1.25rem;
      font-weight: 800;
      color: #fde68a;
    }
    .hero-stat span {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .stat-sep {
      color: rgba(255, 255, 255, 0.2);
    }

    /* Quick Booking Section */
    .quick-booking-section {
      max-width: 1200px;
      margin: -2.5rem auto 3rem;
      padding: 0 1.25rem;
      position: relative;
      z-index: 10;
      width: 100%;
    }
    .quick-booking-card {
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      padding: 1.75rem 2rem;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border-light);
    }
    .booking-prompt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 10px;
    }
    .booking-prompt-header h3 {
      font-family: var(--font-brand);
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .live-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--status-available-text);
      background: var(--status-available-bg);
      padding: 3px 10px;
      border-radius: 999px;
      border: 1px solid var(--status-available-border);
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--status-available);
    }
    .booking-inputs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr) auto;
      gap: 1rem;
      align-items: flex-end;
    }
    @media (max-width: 860px) {
      .booking-inputs-grid {
        grid-template-columns: 1fr 1fr;
      }
      .btn-cell {
        grid-column: span 2;
      }
    }
    @media (max-width: 520px) {
      .booking-inputs-grid {
        grid-template-columns: 1fr;
      }
      .btn-cell {
        grid-column: span 1;
      }
    }
    .input-cell {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .input-cell label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .q-input {
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      background: var(--bg-surface-secondary);
      color: var(--text-main);
      font-size: 0.875rem;
      outline: none;
      transition: all var(--transition-fast);
      width: 100%;
    }
    .q-input:focus {
      border-color: var(--color-primary-500);
      background: var(--bg-surface);
      box-shadow: 0 0 0 3px var(--color-primary-glow);
    }
    .btn-check-availability {
      padding: 0.7rem 1.4rem;
      background: var(--color-primary-600);
      color: #fff;
      font-size: 0.9rem;
      font-weight: 700;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 42px;
      transition: background 0.15s ease;
    }
    .btn-check-availability:hover {
      background: var(--color-primary-700);
    }

    /* Common section container & header */
    .section-container {
      max-width: 1250px;
      margin: 0 auto;
      padding: 4rem 1.25rem;
      width: 100%;
    }
    .section-header {
      text-align: center;
      max-width: 680px;
      margin: 0 auto 3rem;
    }
    .section-pill {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-primary-600);
      background: var(--color-primary-50);
      padding: 3px 12px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.5rem;
    }
    html.dark .section-pill {
      background: rgba(234, 88, 12, 0.2);
      color: var(--color-primary-400);
    }
    .section-title {
      font-family: var(--font-brand);
      font-size: clamp(1.8rem, 3.5vw, 2.5rem);
      font-weight: 900;
      color: var(--text-main);
      line-height: 1.2;
      margin-bottom: 0.75rem;
    }
    .section-subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.55;
    }

    /* Dishes Grid */
    .dishes-section {
      background: var(--bg-surface-secondary);
    }
    .dishes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.75rem;
      margin-bottom: 2.5rem;
    }
    .dish-card {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .dish-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
    .dish-image-wrap {
      position: relative;
      height: 200px;
      width: 100%;
      overflow: hidden;
    }
    .dish-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .dish-card:hover .dish-img {
      transform: scale(1.05);
    }
    .dish-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #ea580c;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }
    .veg-nonveg-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }
    .dish-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .dish-title-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 4px;
    }
    .dish-name {
      font-family: var(--font-brand);
      font-size: 1.1rem;
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
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 8px;
      font-weight: 500;
    }
    .dish-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin-bottom: 1.25rem;
      flex: 1;
    }
    .dish-footer {
      border-top: 1px solid var(--border-subtle);
      padding-top: 0.85rem;
    }
    .dish-cta-btn {
      display: block;
      width: 100%;
      text-align: center;
      padding: 0.55rem;
      background: var(--bg-surface-secondary);
      color: var(--color-primary-700);
      font-weight: 700;
      font-size: 0.825rem;
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: all 0.15s ease;
      border: 1px solid var(--border-light);
    }
    .dish-cta-btn:hover {
      background: var(--color-primary-600);
      color: #fff;
      border-color: var(--color-primary-600);
    }
    .menu-cta-row {
      text-align: center;
    }
    .btn-view-full-menu {
      display: inline-block;
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--color-primary-600);
      text-decoration: none;
      padding: 0.5rem 1rem;
    }
    .btn-view-full-menu:hover {
      text-decoration: underline;
    }

    /* Heritage Section */
    .heritage-section {
      background: var(--bg-app);
    }
    .heritage-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 3.5rem;
      align-items: center;
    }
    @media (max-width: 900px) {
      .heritage-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
    }
    .heritage-title {
      font-family: var(--font-brand);
      font-size: clamp(1.8rem, 3.2vw, 2.4rem);
      font-weight: 900;
      color: var(--text-main);
      margin-bottom: 1.25rem;
    }
    .heritage-text {
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.65;
      margin-bottom: 1rem;
    }
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-top: 2rem;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .f-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--color-primary-50);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    html.dark .f-icon {
      background: rgba(234, 88, 12, 0.2);
    }
    .feature-item strong {
      display: block;
      font-size: 0.95rem;
      color: var(--text-main);
      margin-bottom: 2px;
    }
    .feature-item p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .heritage-visual {
      position: relative;
    }
    .visual-card {
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-xl);
    }
    .heritage-img {
      width: 100%;
      height: 420px;
      object-fit: cover;
      display: block;
    }
    .experience-card {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: rgba(15, 23, 42, 0.9);
      color: #fff;
      padding: 1.25rem;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: 14px;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .exp-icon {
      font-size: 2rem;
    }
    .experience-card h4 {
      font-family: var(--font-brand);
      font-size: 1.1rem;
      font-weight: 800;
      color: #fed7aa;
      margin: 0;
    }
    .experience-card p {
      font-size: 0.8rem;
      color: #cbd5e1;
      margin: 2px 0 0;
    }

    /* Reviews Section */
    .reviews-section {
      background: var(--bg-surface-secondary);
    }
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .review-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
    }
    .stars {
      color: #f59e0b;
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
      letter-spacing: 2px;
    }
    .review-quote {
      font-size: 0.925rem;
      color: var(--text-secondary);
      line-height: 1.6;
      font-style: italic;
      margin-bottom: 1.25rem;
    }
    .reviewer-meta strong {
      display: block;
      font-size: 0.9rem;
      color: var(--text-main);
    }
    .reviewer-meta span {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    /* Banner CTA */
    .banner-cta {
      background: linear-gradient(135deg, #9a3412, #c2410c, #ea580c);
      color: #fff;
      padding: 3.5rem 1.5rem;
    }
    .banner-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .banner-text h2 {
      font-family: var(--font-brand);
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 900;
      margin-bottom: 0.5rem;
    }
    .banner-text p {
      font-size: 1rem;
      color: #fed7aa;
      margin: 0;
    }
    .btn-banner-book {
      display: inline-block;
      padding: 0.85rem 2rem;
      background: #fff;
      color: #c2410c;
      font-family: var(--font-brand);
      font-size: 1rem;
      font-weight: 800;
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }
    .btn-banner-book:hover {
      transform: scale(1.03);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class CustomerHomeComponent {
  tableService = inject(TableService);
  private router = inject(Router);

  restaurantName = environment.restaurant.name;
  signatureDishes: MenuItem[] = DADA_BOUDI_MENU.slice(0, 4);

  todayDate = new Date().toISOString().split('T')[0];
  quickDate = this.todayDate;
  quickGuests = 4;
  quickTime = '19:30';

  onQuickBook(): void {
    this.router.navigate(['/book-table'], {
      queryParams: {
        date: this.quickDate,
        guests: this.quickGuests,
        time: this.quickTime
      }
    });
  }
}
