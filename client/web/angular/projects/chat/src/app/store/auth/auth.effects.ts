import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';

/**
 * Authentication Effects
 * Handles side effects for authentication actions
 */
@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
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
   * Navigates to dashboard after successful login
   */
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
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
   * Navigates to dashboard after successful registration
   */
  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => {
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
   * Navigates to login page and clears local storage
   */
  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          localStorage.removeItem('auth');
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
      switchMap(() =>
        this.authService.refreshToken().pipe(
          map((response) => AuthActions.refreshTokenSuccess({ response })),
          catchError((error) =>
            of(AuthActions.refreshTokenFailure({ error: error.message || 'Token refresh failed' }))
          )
        )
      )
    )
  );

  /**
   * Token refresh failure effect
   * Redirects to login on token refresh failure
   */
  refreshTokenFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.refreshTokenFailure),
        tap(() => {
          localStorage.removeItem('auth');
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
        this.authService.updateProfile(user).pipe(
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
      switchMap(({ email }) =>
        this.authService.requestPasswordReset(email).pipe(
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
      switchMap(({ token, newPassword }) =>
        this.authService.resetPassword(token, newPassword).pipe(
          map(() => AuthActions.resetPasswordSuccess()),
          catchError((error) =>
            of(AuthActions.resetPasswordFailure({ error: error.message || 'Password reset failed' }))
          )
        )
      )
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
