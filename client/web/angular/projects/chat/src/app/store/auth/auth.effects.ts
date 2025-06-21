import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';

/**
 * Authentication Effects
 * Handles side effects for authentication actions
 */
@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private tokenStorage = inject(TokenStorageService);
  private router = inject(Router);

  /**
   * Login effect
   * Handles user login and navigation on success
   */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message || 'Login failed' }))
          )
        )
      )
    )
  );

  /**
   * Login success effect
   * Stores tokens and navigates to dashboard after successful login
   */
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          // Store authentication data
          this.tokenStorage.setAuthData({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            sessionId: response.sessionId,
            expiresIn: response.expiresIn,
            userData: {
              id: response.userId,
              email: response.email,
            },
          });

          this.router.navigate(['/chat']);
        })
      ),
    { dispatch: false }
  );

  /**
   * Registration effect
   * Handles user registration
   */
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ userData }) =>
        this.authService.register(userData).pipe(
          map((response) => AuthActions.registerSuccess({ response })),
          catchError((error) =>
            of(AuthActions.registerFailure({ error: error.message || 'Registration failed' }))
          )
        )
      )
    )
  );

  /**
   * Registration success effect
   * Stores tokens and navigates to dashboard after successful registration
   */
  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ response }) => {
          // Store authentication data
          this.tokenStorage.setAuthData({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            sessionId: response.sessionId,
            expiresIn: response.expiresIn,
            userData: {
              id: response.userId,
              email: response.email,
            },
          });

          this.router.navigate(['/chat']);
        })
      ),
    { dispatch: false }
  );

  /**
   * Logout effect
   * Handles user logout
   */
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error) =>
            of(AuthActions.logoutFailure({ error: error.message || 'Logout failed' }))
          )
        )
      )
    )
  );

  /**
   * Logout success effect
   * Clears tokens and navigates to login page
   */
  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.tokenStorage.clearAuthData();
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  /**
   * Token refresh effect
   * Handles automatic token refresh
   */
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() => {
        const refreshToken = this.tokenStorage.getRefreshToken();
        if (!refreshToken) {
          return of(AuthActions.refreshTokenFailure({ error: 'No refresh token available' }));
        }

        return this.authService.refreshToken({ refreshToken }).pipe(
          map((response) => AuthActions.refreshTokenSuccess({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            expiresIn: response.expiresIn,
            tokenType: response.tokenType,
          })),
          catchError((error) =>
            of(AuthActions.refreshTokenFailure({ error: error.message || 'Token refresh failed' }))
          )
        );
      })
    )
  );

  /**
   * Token refresh failure effect
   * Clears tokens and redirects to login on token refresh failure
   */
  refreshTokenFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.refreshTokenFailure),
        tap(() => {
          this.tokenStorage.clearAuthData();
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  /**
   * Update user profile effect
   * Handles user profile updates
   */
  updateUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateUserProfile),
      switchMap(({ user }) =>
        this.authService.getCurrentUser().pipe(
          map((updatedUser) => AuthActions.updateUserProfileSuccess({ user: updatedUser })),
          catchError((error) =>
            of(AuthActions.updateUserProfileFailure({ error: error.message || 'Profile update failed' }))
          )
        )
      )
    )
  );

  /**
   * Password reset request effect
   * Handles password reset requests
   */
  requestPasswordReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.requestPasswordReset),
      switchMap(({ request }) =>
        this.authService.requestPasswordReset(request).pipe(
          map(() => AuthActions.requestPasswordResetSuccess()),
          catchError((error) =>
            of(AuthActions.requestPasswordResetFailure({ error: error.message || 'Password reset request failed' }))
          )
        )
      )
    )
  );

  /**
   * Password reset effect
   * Handles password reset with token
   */
  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      switchMap(({ request }) =>
        this.authService.resetPassword(request).pipe(
          map(() => AuthActions.resetPasswordSuccess()),
          catchError((error) =>
            of(AuthActions.resetPasswordFailure({ error: error.message || 'Password reset failed' }))
          )
        )
      )
    )
  );

  /**
   * Initialize auth effect
   * Checks for existing tokens on app startup
   */
  initializeAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initializeAuth),
      switchMap(() => {
        const authData = this.tokenStorage.getAuthData();

        if (authData.accessToken && !authData.isExpired) {
          // Valid token exists, set authenticated user
          return of(AuthActions.setAuthenticatedUser({
            user: authData.userData || { id: '', email: '' },
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken || '',
            sessionId: authData.sessionId || '',
            expiresIn: 900, // Default expiry
            tokenType: 'Bearer',
          }));
        } else if (authData.refreshToken) {
          // Try to refresh token
          return of(AuthActions.refreshToken());
        } else {
          // No valid auth data
          return of(AuthActions.logoutSuccess());
        }
      })
    )
  );

  /**
   * Password reset success effect
   * Navigates to login page after successful password reset
   */
  resetPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.resetPasswordSuccess),
        tap(() => {
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );
}
