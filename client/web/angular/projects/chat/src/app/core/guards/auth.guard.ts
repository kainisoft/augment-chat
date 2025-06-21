import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, tap } from 'rxjs/operators';
import { selectIsAuthenticatedWithToken } from '../../store/auth/auth.selectors';

/**
 * Authentication Guard
 * 
 * Protects routes that require user authentication.
 * Redirects unauthenticated users to the login page.
 */
export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticatedWithToken).pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
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
