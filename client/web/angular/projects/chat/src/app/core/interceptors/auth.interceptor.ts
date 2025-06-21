import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TokenStorageService, AuthService } from '@core/services';
import { environment } from '@environments/environment';
import { AuthActions } from '@store/auth';

/**
 * JWT Authentication Interceptor
 * 
 * Automatically attaches JWT tokens to HTTP requests and handles token refresh
 * when receiving 401 Unauthorized responses from the backend.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenStorage: TokenStorageService,
    private authService: AuthService,
    private store: Store
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token attachment for auth endpoints to avoid circular calls
    if (this.isAuthEndpoint(req.url)) {
      return next.handle(req);
    }

    // Add token to request if available
    const authReq = this.addTokenToRequest(req);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isAuthEndpoint(req.url)) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Add JWT token to request headers
   */
  private addTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.tokenStorage.getAccessToken();
    
    if (token && !this.tokenStorage.isTokenExpired()) {
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }

    return req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Handle 401 Unauthorized errors by attempting token refresh
   */
  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenStorage.getRefreshToken();
      
      if (refreshToken) {
        return this.authService.refreshToken({ refreshToken }).pipe(
          switchMap((tokenResponse) => {
            this.isRefreshing = false;
            
            // Store new tokens
            this.tokenStorage.setAccessToken(tokenResponse.accessToken);
            this.tokenStorage.setRefreshToken(tokenResponse.refreshToken);
            this.tokenStorage.setTokenExpiry(tokenResponse.expiresIn);
            
            // Update store with new tokens
            this.store.dispatch(AuthActions.refreshTokenSuccess({
              accessToken: tokenResponse.accessToken,
              refreshToken: tokenResponse.refreshToken,
              expiresIn: tokenResponse.expiresIn,
              tokenType: tokenResponse.tokenType,
            }));

            this.refreshTokenSubject.next(tokenResponse.accessToken);
            
            // Retry original request with new token
            return next.handle(this.addTokenToRequest(req));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            
            // Refresh failed, logout user
            this.store.dispatch(AuthActions.logout());
            this.tokenStorage.clearAuthData();
            
            return throwError(() => error);
          })
        );
      } else {
        // No refresh token available, logout user
        this.isRefreshing = false;
        this.store.dispatch(AuthActions.logout());
        this.tokenStorage.clearAuthData();
        
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Token refresh is already in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => next.handle(this.addTokenToRequest(req)))
      );
    }
  }

  /**
   * Check if the request URL is an authentication endpoint
   */
  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
      '/auth/forgot-password',
      '/auth/reset-password',
    ];

    return authEndpoints.some(endpoint => url.includes(endpoint));
  }
}
