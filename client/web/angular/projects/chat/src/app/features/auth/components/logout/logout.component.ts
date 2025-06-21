import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { AuthActions, selectAuthLoading, selectIsAuthenticated } from '@store/auth';
import { TokenStorageService } from '@core/services/token-storage.service';

/**
 * Logout Component
 *
 * Handles user logout process with proper token cleanup and state management
 */
@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './logout.component.html'
})
export class LogoutComponent implements OnInit, OnDestroy {
  loading$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private store: Store,
    private tokenStorage: TokenStorageService
  ) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit(): void {
    // Start logout process immediately
    this.performLogout();

    // Listen for authentication state changes
    this.isAuthenticated$
      .pipe(
        takeUntil(this.destroy$),
        filter(isAuthenticated => !isAuthenticated)
      )
      .subscribe(() => {
        // User is now logged out, redirect to login
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { message: 'You have been logged out successfully' }
          });
        }, 1500);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Perform logout process
   */
  private performLogout(): void {
    // Clear tokens immediately for security
    this.tokenStorage.clearAuthData();

    // Dispatch logout action to handle server-side logout and state cleanup
    this.store.dispatch(AuthActions.logout());
  }
}
