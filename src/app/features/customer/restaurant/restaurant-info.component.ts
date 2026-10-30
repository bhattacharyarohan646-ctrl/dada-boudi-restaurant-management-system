import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-restaurant-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="info-page animate-fade-in">
      <!-- Hero -->
      <section class="info-hero">
        <div class="hero-inner">
          <span class="hero-badge">About & Heritage</span>
          <h1 class="hero-title">{{ restaurant.name }}</h1>
          <p class="hero-sub">The heart of Barrackpore’s royal Mughlai & Biryani traditions since 1958.</p>
        </div>
      </section>

      <div class="info-container">
        <!-- Story & Location Grid -->
        <div class="content-grid">
          <!-- Left Column: Story & Zones -->
          <div class="main-column">
            <!-- Heritage Card -->
            <div class="info-card">
              <h2 class="card-title">A Legacy of Aromatic Excellence</h2>
              <p class="card-p">
                What began more than six decades ago as a modest eatery near the Barrackpore railway station has blossomed into an iconic landmark destination for biryani enthusiasts across Eastern India.
              </p>
              <p class="card-p">
                Our founders pioneered the now-famous Kolkata-style biryani in North 24 Parganas, ensuring that generous, impeccably spiced mutton pieces are dum-cooked over slow charcoal with fragrant basmati and the beloved spiced potato. Today, <strong>Dada Boudi Restaurant</strong> remains true to its heritage recipes while embracing cutting-edge table management through DineFlow.
              </p>
            </div>

            <!-- Dining Zones -->
            <div class="info-card">
              <h2 class="card-title">Our Dining Spaces & Ambience</h2>
              <div class="zones-grid">
                <div class="zone-box">
                  <span class="z-icon">🪟</span>
                  <div class="z-text">
                    <strong>Window Lounges (T01–T04)</strong>
                    <p>Natural daylight, vibrant street view of Barrackpore, perfect for couples and small parties.</p>
                  </div>
                </div>
                <div class="zone-box">
                  <span class="z-icon">🍽️</span>
                  <div class="z-text">
                    <strong>Main Dining Hall (T05–T12)</strong>
                    <p>Spacious, fully air-conditioned family hall with comfortable cushioned booth seating.</p>
                  </div>
                </div>
                <div class="zone-box">
                  <span class="z-icon">🍸</span>
                  <div class="z-text">
                    <strong>Beverage & Mocktail Lounge (T13–T16)</strong>
                    <p>High tables and casual lounge seating for appetizers and refreshing Gondhoraj lime coolers.</p>
                  </div>
                </div>
                <div class="zone-box">
                  <span class="z-icon">🌿</span>
                  <div class="z-text">
                    <strong>Outdoor Patio (T17–T20)</strong>
                    <p>Open-air dining under garden lanterns for pleasant evening feasts.</p>
                  </div>
                </div>
                <div class="zone-box">
                  <span class="z-icon">👑</span>
                  <div class="z-text">
                    <strong>Royal Private Dining (T21–T24)</strong>
                    <p>Exclusive suites for corporate dinners, birthdays, and banquets up to 10+ guests.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Booking & Seating Policy -->
            <div class="info-card">
              <h2 class="card-title">Reservation & Table Policies</h2>
              <ul class="policy-list">
                <li>
                  <strong>15-Minute Grace Period:</strong> We hold reserved tables for 15 minutes past your booked time. After 15 minutes, unoccupied tables may be released to waiting walk-in guests.
                </li>
                <li>
                  <strong>Zero Booking Fee:</strong> Table reservations are complimentary. No advance deposits or credit card pre-authorizations are required.
                </li>
                <li>
                  <strong>Easy Cancellations:</strong> If your plans change, you can easily cancel your reservation in one click from the <a routerLink="/my-bookings">My Bookings</a> tab so other families can dine.
                </li>
                <li>
                  <strong>Dietary Accommodations:</strong> We accommodate Jain, vegetarian, and allergen requirements upon prior request during booking.
                </li>
              </ul>
            </div>
          </div>

          <!-- Right Column: Location, Hours, Contact -->
          <div class="sidebar-column">
            <!-- Contact & Hours Card -->
            <div class="info-card highlight-card">
              <h3 class="card-subhead">Location & Timings</h3>

              <div class="detail-row">
                <span class="d-icon">📍</span>
                <div>
                  <strong>Address</strong>
                  <p>{{ restaurant.location }}</p>
                </div>
              </div>

              <div class="detail-row">
                <span class="d-icon">🕒</span>
                <div>
                  <strong>Operational Hours</strong>
                  <p>{{ restaurant.openingHours }}</p>
                  <span class="live-status-pill">🟢 Open All 7 Days</span>
                </div>
              </div>

              <div class="detail-row">
                <span class="d-icon">📞</span>
                <div>
                  <strong>Direct Helpdesk</strong>
                  <p>{{ restaurant.phone }}</p>
                </div>
              </div>

              <div class="detail-row">
                <span class="d-icon">✉️</span>
                <div>
                  <strong>Email Inquiries</strong>
                  <p>{{ restaurant.email }}</p>
                </div>
              </div>

              <a routerLink="/book-table" class="btn-sidebar-book">
                Book a Table Now →
              </a>
            </div>

            <!-- FAQs -->
            <div class="info-card">
              <h3 class="card-subhead">Frequently Asked Questions</h3>

              <div class="faq-item">
                <strong>Is car parking available?</strong>
                <p>Yes, municipal and valet parking are available adjacent to Ghoshpara Road.</p>
              </div>

              <div class="faq-item">
                <strong>Can we order takeaway or delivery?</strong>
                <p>Yes, our express counter operates on the ground floor, and online delivery is available across Barrackpore.</p>
              </div>

              <div class="faq-item">
                <strong>What payment methods are accepted?</strong>
                <p>UPI (GPay, PhonePe, Paytm), All Major Credit/Debit Cards, and Cash are accepted.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-page {
      min-height: calc(100vh - 140px);
      background: var(--bg-app);
      padding-bottom: 4rem;
    }
    .info-hero {
      background: linear-gradient(135deg, #1f2937 0%, #7c2d12 100%);
      color: #fff;
      padding: 3.5rem 1.25rem 2.5rem;
      text-align: center;
    }
    .hero-inner {
      max-width: 800px;
      margin: 0 auto;
    }
    .hero-badge {
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
    .hero-title {
      font-family: var(--font-brand);
      font-size: clamp(2rem, 4vw, 2.8rem);
      font-weight: 900;
      margin-bottom: 0.5rem;
    }
    .hero-sub {
      font-size: 0.95rem;
      color: #cbd5e1;
    }

    .info-container {
      max-width: 1250px;
      margin: -1.5rem auto 0;
      padding: 0 1.25rem;
    }
    .content-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 1.75rem;
    }
    @media (max-width: 900px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    .main-column, .sidebar-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
    }
    .card-title {
      font-family: var(--font-brand);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 1rem;
    }
    .card-p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.65;
      margin-bottom: 0.75rem;
    }

    .zones-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .zone-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 0.85rem;
      background: var(--bg-surface-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }
    .z-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .z-text strong {
      display: block;
      font-size: 0.9rem;
      color: var(--text-main);
      margin-bottom: 2px;
    }
    .z-text p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .policy-list {
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.55;
    }
    .policy-list strong {
      color: var(--text-main);
    }
    .policy-list a {
      color: var(--color-primary-600);
      font-weight: 700;
    }

    /* Sidebar Highlight */
    .highlight-card {
      background: var(--bg-surface);
      border: 1.5px solid var(--color-primary-300);
    }
    .card-subhead {
      font-family: var(--font-brand);
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 1.25rem;
    }
    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 1.15rem;
    }
    .d-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .detail-row strong {
      display: block;
      font-size: 0.85rem;
      color: var(--text-main);
    }
    .detail-row p {
      font-size: 0.825rem;
      color: var(--text-secondary);
      margin: 2px 0 0;
      line-height: 1.4;
    }
    .live-status-pill {
      display: inline-block;
      margin-top: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #065f46;
      background: #ecfdf5;
      padding: 2px 8px;
      border-radius: 999px;
    }

    .btn-sidebar-book {
      display: block;
      width: 100%;
      text-align: center;
      padding: 0.8rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 800;
      font-size: 0.95rem;
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: 0 4px 12px var(--color-primary-glow);
      margin-top: 0.5rem;
    }
    .btn-sidebar-book:hover {
      background: var(--color-primary-700);
    }

    .faq-item {
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 0.75rem;
    }
    .faq-item:last-child {
      border: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .faq-item strong {
      display: block;
      font-size: 0.85rem;
      color: var(--text-main);
      margin-bottom: 2px;
    }
    .faq-item p {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }
  `]
})
export class RestaurantInfoComponent {
  restaurant = environment.restaurant;
}
