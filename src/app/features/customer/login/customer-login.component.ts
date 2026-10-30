import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FirebaseService } from '../../../core/services/firebase.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="login-page animate-fade-in">
      <div class="login-card-container">
        <!-- Brand Crest & Header -->
        <div class="login-header">
          <div class="brand-crest">
            <span class="crest-icon">🍲</span>
          </div>
          <h1 class="login-title">Welcome to {{ restaurantName }}</h1>
          <p class="login-subtitle">
            Sign in to reserve your table, view live booking status, and receive real-time notifications.
          </p>
        </div>

        <!-- Connection Mode Banner -->
        <div class="mode-badge" [class.live]="firebaseService.isLiveFirebase()">
          <span class="dot"></span>
          <span>{{ firebaseService.isLiveFirebase() ? 'Cloud Firestore & Firebase Auth Connected' : 'Reactive Synchronized Mode (Ready for Firebase)' }}</span>
        </div>

        <!-- Error Alert if any -->
        <div *ngIf="authService.authError()" class="alert-error animate-fade-in">
          <span>⚠️ {{ authService.authError() }}</span>
        </div>

        <!-- Primary Google Sign-In Area -->
        <div class="auth-box">
          <button
            type="button"
            class="btn-google-signin"
            [disabled]="authService.isAuthLoading()"
            (click)="onGoogleSignIn()">
            <!-- Google G Logo SVG -->
            <svg class="google-logo" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span *ngIf="!authService.isAuthLoading()">Continue with Google</span>
            <span *ngIf="authService.isAuthLoading()">Connecting to Google...</span>
          </button>

          <p class="auth-security-note">
            🔒 Secure OAuth 2.0 flow. We never ask for or store your Google password.
          </p>
        </div>

        <!-- Phone Number Registration / Completion Section (if authenticated but phone missing) -->
        <div *ngIf="authService.isAuthenticated() && !authService.currentUser()?.phoneNumber" class="phone-step-card animate-fade-in">
          <div class="phone-step-head">
            <span class="step-badge">Required Step</span>
            <h3>Add Your Contact Phone</h3>
            <p>Google sign-in does not share your phone number. We require this for table verification and SMS/WhatsApp booking confirmation.</p>
          </div>

          <form [formGroup]="phoneForm" (ngSubmit)="onSavePhone()" class="phone-form">
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <div class="input-with-prefix">
                <span class="prefix">+91</span>
                <input
                  type="tel"
                  formControlName="phone"
                  class="phone-input"
                  placeholder="98300 12345"
                  maxlength="10" />
              </div>
              <div *ngIf="phoneForm.get('phone')?.touched && phoneForm.get('phone')?.invalid" class="form-error">
                Please enter a valid 10-digit Indian mobile number.
              </div>
            </div>

            <button type="submit" class="btn-save-phone" [disabled]="phoneForm.invalid">
              Save & Continue to Booking →
            </button>
          </form>
        </div>

        <!-- Already Signed In Summary -->
        <div *ngIf="authService.isAuthenticated() && authService.currentUser()?.phoneNumber" class="signed-in-box animate-fade-in">
          <div class="user-pill-row">
            <img
              *ngIf="authService.currentUser()?.photoURL; else defaultPhoto"
              [src]="authService.currentUser()?.photoURL"
              alt="Avatar"
              class="signed-avatar" />
            <ng-template #defaultPhoto>
              <div class="signed-avatar initials">
                {{ (authService.currentUser()?.displayName || 'C').substring(0, 2).toUpperCase() }}
              </div>
            </ng-template>

            <div class="signed-meta">
              <strong>{{ authService.currentUser()?.displayName }}</strong>
              <span>{{ authService.currentUser()?.email }}</span>
              <span class="phone-tag">📞 {{ authService.currentUser()?.phoneNumber }}</span>
            </div>
          </div>

          <div class="signed-actions">
            <button type="button" class="btn-proceed" (click)="proceedToTarget()">
              Continue to Reservation →
            </button>
            <button type="button" class="btn-signout" (click)="authService.signOut()">
              Sign Out
            </button>
          </div>
        </div>

        <!-- Operational Role Switcher (For Pair Testing & Demonstration) -->
        <div class="test-roles-section">
          <span class="test-roles-title">Staff / Admin Testing Shortcuts</span>
          <p class="test-roles-sub">Quickly switch role to verify laptop admin and host table capabilities:</p>
          <div class="role-buttons-grid">
            <button type="button" class="btn-role role-customer" (click)="signInAs('customer')">
              🧑 Customer Mode
            </button>
            <button type="button" class="btn-role role-staff" (click)="signInAs('staff')">
              🧑‍🍳 Staff / Host
            </button>
            <button type="button" class="btn-role role-admin" (click)="signInAs('admin')">
              💻 Admin Dashboard
            </button>
          </div>
        </div>

        <!-- Firebase Google Auth Setup Instructions Drawer / Callout -->
        <div class="setup-help-box">
          <div class="help-header" (click)="showSetupGuide.set(!showSetupGuide())">
            <span class="help-icon">ℹ️</span>
            <strong>Firebase & Google Sign-In Setup Guide</strong>
            <span class="help-toggle">{{ showSetupGuide() ? '▲' : '▼' }}</span>
          </div>

          <div *ngIf="showSetupGuide()" class="help-content animate-fade-in">
            <ol class="setup-steps">
              <li>
                <strong>Create / Open Firebase Project</strong>: Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener">Firebase Console</a>.
              </li>
              <li>
                <strong>Enable Google Auth</strong>: Navigate to <em>Build → Authentication → Sign-in method</em>, click <strong>Google</strong> and toggle <strong>Enable</strong>.
              </li>
              <li>
                <strong>Add Authorized Domains</strong>: In <em>Authentication → Settings → Authorized domains</em>, ensure <code>localhost</code> and your development domain are listed.
              </li>
              <li>
                <strong>Copy Credentials</strong>: In <em>Project Settings → General → Your apps (Web)</em>, copy your <code>firebaseConfig</code> into <code>src/environments/environment.ts</code>.
              </li>
              <li>
                <strong>Deploy Security Rules</strong>: Use <code>firebase deploy --only firestore:rules</code> to publish the included <code>firestore.rules</code>.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - 140px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      background: var(--bg-app);
    }
    .login-card-container {
      width: 100%;
      max-width: 480px;
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 2.25rem 2rem;
      box-shadow: var(--shadow-xl);
    }
    .login-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .brand-crest {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      background: linear-gradient(135deg, #f97316, #c2410c);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);
      margin-bottom: 1rem;
    }
    .crest-icon {
      font-size: 1.75rem;
    }
    .login-title {
      font-family: var(--font-brand);
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 0.5rem;
      line-height: 1.25;
    }
    .login-subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0;
    }

    .mode-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .mode-badge.live {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
      color: #065f46;
    }
    .mode-badge .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #f59e0b;
    }
    .mode-badge.live .dot {
      background: #10b981;
    }

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      margin-bottom: 1.25rem;
      line-height: 1.4;
    }

    .auth-box {
      margin-bottom: 1.75rem;
    }
    .btn-google-signin {
      width: 100%;
      height: 48px;
      background: var(--bg-surface);
      border: 1.5px solid var(--border-medium);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    .btn-google-signin:hover:not(:disabled) {
      background: var(--bg-surface-secondary);
      border-color: #f97316;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }
    .btn-google-signin:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .auth-security-note {
      font-size: 0.72rem;
      color: var(--text-muted);
      text-align: center;
      margin-top: 10px;
    }

    /* Phone number step */
    .phone-step-card {
      background: var(--color-primary-50);
      border: 1px solid var(--color-primary-200);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    html.dark .phone-step-card {
      background: rgba(234, 88, 12, 0.1);
      border-color: rgba(234, 88, 12, 0.25);
    }
    .step-badge {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      background: var(--color-primary-600);
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .phone-step-head h3 {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 4px;
    }
    .phone-step-head p {
      font-size: 0.78rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin-bottom: 1rem;
    }
    .input-with-prefix {
      display: flex;
      align-items: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .prefix {
      padding: 0.6rem 0.75rem;
      background: var(--bg-surface-secondary);
      border-right: 1px solid var(--border-medium);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-secondary);
    }
    .phone-input {
      flex: 1;
      border: none;
      padding: 0.6rem 0.75rem;
      font-size: 0.95rem;
      color: var(--text-main);
      background: transparent;
      outline: none;
      letter-spacing: 0.05em;
    }
    .btn-save-phone {
      width: 100%;
      margin-top: 10px;
      padding: 0.65rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 700;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
    }
    .btn-save-phone:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Signed in summary */
    .signed-in-box {
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .user-pill-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1rem;
    }
    .signed-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
    }
    .signed-avatar.initials {
      background: var(--color-primary-600);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1rem;
    }
    .signed-meta {
      display: flex;
      flex-direction: column;
    }
    .signed-meta strong {
      font-size: 0.95rem;
      color: var(--text-main);
    }
    .signed-meta span {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .phone-tag {
      font-size: 0.75rem;
      color: var(--color-primary-600) !important;
      font-weight: 700;
      margin-top: 2px;
    }
    .signed-actions {
      display: flex;
      gap: 10px;
    }
    .btn-proceed {
      flex: 1;
      padding: 0.65rem;
      background: var(--color-primary-600);
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
    }
    .btn-signout {
      padding: 0.65rem 1rem;
      background: transparent;
      border: 1px solid var(--border-medium);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.825rem;
      border-radius: var(--radius-md);
      cursor: pointer;
    }

    /* Operational role switcher */
    .test-roles-section {
      border-top: 1px solid var(--border-subtle);
      padding-top: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .test-roles-title {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .test-roles-sub {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: 10px;
    }
    .role-buttons-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .btn-role {
      padding: 0.5rem 0.25rem;
      font-size: 0.72rem;
      font-weight: 700;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
      background: var(--bg-surface-secondary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
    }
    .btn-role:hover {
      background: var(--color-primary-50);
      color: var(--color-primary-700);
      border-color: var(--color-primary-300);
    }

    /* Setup help */
    .setup-help-box {
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .help-header {
      padding: 0.65rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      cursor: pointer;
      color: var(--text-secondary);
    }
    .help-header strong {
      flex: 1;
      color: var(--text-main);
    }
    .help-toggle {
      font-size: 0.65rem;
      color: var(--text-muted);
    }
    .help-content {
      padding: 0.85rem 1rem 1rem;
      border-top: 1px solid var(--border-subtle);
      font-size: 0.78rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .setup-steps {
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 0;
    }
    .setup-steps a {
      color: var(--color-primary-600);
      font-weight: 600;
    }
    .setup-steps code {
      background: rgba(0, 0, 0, 0.05);
      padding: 1px 4px;
      border-radius: 4px;
    }
  `]
})
export class CustomerLoginComponent implements OnInit {
  authService = inject(AuthService);
  firebaseService = inject(FirebaseService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  restaurantName = environment.restaurant.name;
  returnUrl: string = '/book-table';
  showSetupGuide = signal<boolean>(false);

  phoneForm: FormGroup = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]]
  });

  ngOnInit(): void {
    const returnParam = this.route.snapshot.queryParams['returnUrl'];
    if (returnParam) {
      this.returnUrl = returnParam;
    }
  }

  async onGoogleSignIn(): Promise<void> {
    const res = await this.authService.signInWithGoogle(this.returnUrl);
    if (res.success && res.user && !res.user.phoneNumber) {
      // Stay on screen to collect phone number
      this.toastService.info('Almost Done', 'Please enter your phone number to complete verification.');
    }
  }

  async onSavePhone(): Promise<void> {
    if (this.phoneForm.invalid) return;
    const phone = '+91 ' + this.phoneForm.value.phone.trim();
    await this.authService.updatePhoneNumber(phone);
    this.proceedToTarget();
  }

  proceedToTarget(): void {
    this.router.navigateByUrl(this.returnUrl);
  }

  signInAs(role: 'customer' | 'staff' | 'admin'): void {
    const target = role === 'admin' ? '/dashboard' : role === 'staff' ? '/staff/dashboard' : this.returnUrl;
    this.authService.signInAsRole(role, target);
  }
}
