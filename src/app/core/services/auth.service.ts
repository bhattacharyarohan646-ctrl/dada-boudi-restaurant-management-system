import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { AppUser, UserRole } from '../models/user.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseService = inject(FirebaseService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Reactive state
  currentUser = signal<AppUser | null>(null);
  isAuthLoading = signal<boolean>(true);
  authError = signal<string | null>(null);

  // Computeds
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isStaff = computed(() => this.currentUser()?.role === 'staff' || this.isAdmin());

  private readonly USER_STORAGE_KEY = 'dineflow_current_user';

  constructor() {
    this.restoreUserSession();
    this.listenToFirebaseAuth();
  }

  private restoreUserSession(): void {
    try {
      const stored = localStorage.getItem(this.USER_STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as AppUser;
        this.currentUser.set(user);
      }
    } catch (e) {
      console.warn('Could not restore user from storage:', e);
    } finally {
      this.isAuthLoading.set(false);
    }
  }

  private listenToFirebaseAuth(): void {
    if (this.firebaseService.auth) {
      onAuthStateChanged(this.firebaseService.auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const appUser = await this.mapFirebaseUserToAppUser(fbUser);
          this.setCurrentUser(appUser);
        } else {
          // If signed out in Firebase and was not a local demo session
          if (this.firebaseService.isLiveFirebase()) {
            this.setCurrentUser(null);
          }
        }
        this.isAuthLoading.set(false);
      });
    }
  }

  private async mapFirebaseUserToAppUser(fbUser: FirebaseUser): Promise<AppUser> {
    let role: UserRole = 'customer';
    let phoneNumber = fbUser.phoneNumber || undefined;

    // Fetch custom profile / role from Firestore if available
    if (this.firebaseService.firestore) {
      try {
        const userDocRef = doc(this.firebaseService.firestore, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          role = data['role'] || 'customer';
          if (data['phoneNumber']) phoneNumber = data['phoneNumber'];
        } else {
          // Create user record in Firestore
          await setDoc(userDocRef, {
            uid: fbUser.uid,
            displayName: fbUser.displayName,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            role: 'customer',
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Could not read user profile from Firestore:', err);
      }
    }

    return {
      uid: fbUser.uid,
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
      email: fbUser.email || null,
      photoURL: fbUser.photoURL || null,
      phoneNumber: phoneNumber || null,
      role
    };
  }

  /**
   * Real Google Sign-In using Firebase Authentication
   */
  async signInWithGoogle(returnUrl?: string): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    this.isAuthLoading.set(true);
    this.authError.set(null);

    // 1. Live Firebase Mode
    if (this.firebaseService.isLiveFirebase() && this.firebaseService.auth) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(this.firebaseService.auth, provider);
        const appUser = await this.mapFirebaseUserToAppUser(result.user);
        this.setCurrentUser(appUser);
        this.toastService.success('Welcome! 👋', `Signed in as ${appUser.displayName}`);

        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        }
        return { success: true, user: appUser };
      } catch (err: any) {
        console.error('Firebase Google Sign-In Error:', err);
        const errorMsg = this.formatFirebaseError(err);
        this.authError.set(errorMsg);
        this.toastService.error('Sign-In Failed', errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        this.isAuthLoading.set(false);
      }
    }

    // 2. Local Synchronized / Demo Mode:
    // If user hasn't added real Firebase credentials yet, explain clearly and allow local profile sign-in
    console.info('Using local reactive auth (Firebase config contains placeholders).');
    const demoUser: AppUser = {
      uid: 'customer-' + Date.now(),
      displayName: 'Sneha Roy',
      email: 'sneha.roy@example.com',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      phoneNumber: '+91 98300 45678',
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    this.setCurrentUser(demoUser);
    this.isAuthLoading.set(false);
    this.toastService.success('Signed In (Local Sync)', `Welcome ${demoUser.displayName}!`);

    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    }
    return { success: true, user: demoUser };
  }

  /**
   * Fast Sign-In for Admin / Staff preview
   */
  signInAsRole(role: UserRole, returnUrl?: string): void {
    const roleUser: AppUser = {
      uid: `${role}-uid-1`,
      displayName: role === 'admin' ? 'Aditi Roy (Admin)' : 'Rajesh Sen (Staff)',
      email: `${role}@dadaboudirestaurant.in`,
      role,
      phoneNumber: '+91 98301 99999',
      createdAt: new Date().toISOString()
    };
    this.setCurrentUser(roleUser);
    this.toastService.info('Role Switched', `Logged in as ${role.toUpperCase()}`);
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    }
  }

  /**
   * Updates customer contact phone number
   */
  async updatePhoneNumber(phone: string): Promise<void> {
    const current = this.currentUser();
    if (!current) return;

    const updated: AppUser = {
      ...current,
      phoneNumber: phone.trim()
    };
    this.setCurrentUser(updated);

    if (this.firebaseService.isLiveFirebase() && this.firebaseService.firestore) {
      try {
        await updateDoc(doc(this.firebaseService.firestore, 'users', current.uid), {
          phoneNumber: phone.trim()
        });
      } catch (e) {
        console.error('Error updating phone in Firestore:', e);
      }
    }
    this.toastService.success('Contact Saved', 'Phone number updated successfully.');
  }

  /**
   * Signs the user out
   */
  async signOut(): Promise<void> {
    if (this.firebaseService.isLiveFirebase() && this.firebaseService.auth) {
      try {
        await firebaseSignOut(this.firebaseService.auth);
      } catch (err) {
        console.error('Firebase signout error:', err);
      }
    }
    this.setCurrentUser(null);
    this.toastService.info('Signed Out', 'You have been signed out successfully.');
    this.router.navigate(['/']);
  }

  private setCurrentUser(user: AppUser | null): void {
    this.currentUser.set(user);
    if (user) {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_STORAGE_KEY);
    }
  }

  private formatFirebaseError(err: any): string {
    const code = err.code || '';
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completion. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Browser blocked the Google sign-in popup. Please allow popups for this site.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.';
      default:
        return err.message || 'Google authentication failed. Please try again.';
    }
  }
}
