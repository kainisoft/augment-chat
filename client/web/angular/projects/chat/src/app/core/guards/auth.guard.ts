import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticatedWithToken } from '../../store/auth/auth.selectors';
import { TokenStorageService } from '../services/token-storage.service';
import * as AuthActions from '../../store/auth/auth.actions';

/**
 * Authentication Guard
 *
 * Protects routes that require user authentication.
 * Redirects unauthenticated users to the login page.
 * Validates token expiry and triggers refresh if needed.
 */
export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  // Check token storage first
  const authData = tokenStorage.getAuthData();

  if (!authData.accessToken) {
    // No token, redirect to login
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  if (authData.isExpired && !authData.refreshToken) {
    // Token expired and no refresh token, clear storage and redirect
    tokenStorage.clearAuthData();
    store.dispatch(AuthActions.logout());
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  if (authData.isExpired && authData.refreshToken) {
    // Token expired but refresh token available, trigger refresh
    store.dispatch(AuthActions.refreshToken());
  }

  return store.select(selectIsAuthenticatedWithToken).pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        // Update last activity
        tokenStorage.updateLastActivity();
        store.dispatch(AuthActions.updateLastActivity());
        return true;
      }

      // Store the attempted URL for redirecting after login
      const redirectUrl = state.url !== '/auth/logout' ? state.url : '/dashboard';

      // Redirect to login with return URL
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: redirectUrl }
      });

      return false;
    })
  );
};

/**
 * No Authentication Guard
 * 
 * Protects routes that should only be accessible to unauthenticated users.
 * Redirects authenticated users to the dashboard.
 */
export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticatedWithToken).pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }

      // Redirect authenticated users to dashboard
      router.navigate(['/dashboard']);
      return false;
    })
  );
};

/**
 * Role-based Guard
 * 
 * Protects routes based on user roles.
 * Can be used with route data to specify required roles.
 */
export const RoleGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  // Get required roles from route data
  const requiredRoles = route.data?.['roles'] as string[] || [];
  
  if (requiredRoles.length === 0) {
    // No specific roles required, just check authentication
    return store.select(selectIsAuthenticatedWithToken).pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
        return true;
      })
    );
  }

  // TODO: Implement role checking when user roles are available
  // For now, just check authentication
  return store.select(selectIsAuthenticatedWithToken).pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
      
      // TODO: Check if user has required roles
      // const userRoles = selectCurrentUser(store.getState())?.roles || [];
      // const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      // if (!hasRequiredRole) {
      //   router.navigate(['/not-authorized']);
      //   return false;
      // }
      
      return true;
    })
  );
};
