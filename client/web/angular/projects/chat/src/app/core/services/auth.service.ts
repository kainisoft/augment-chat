import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LogoutResponse,
  User
} from '@store/auth';

/**
 * Authentication Service
 * Handles HTTP requests for authentication operations
 * Integrates with NestJS backend auth service
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.authServiceUrl;

  constructor(private http: HttpClient) {}

  /**
   * Login user with credentials
   * Calls POST /auth/login endpoint
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Register new user
   * Calls POST /auth/register endpoint
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Logout current user
   * Calls POST /auth/logout endpoint
   */
  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Refresh authentication token
   * Calls POST /auth/refresh endpoint
   */
  refreshToken(refreshTokenData: TokenRefreshRequest): Observable<TokenRefreshResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, refreshTokenData)
      .pipe(
        map(response => ({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn,
          tokenType: response.tokenType
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Request password reset
   * Calls POST /auth/forgot-password endpoint
   */
  requestPasswordReset(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/forgot-password`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Reset password with token
   * Calls POST /auth/reset-password endpoint
   */
  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/reset-password`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Verify authentication token
   * This would typically be handled by the JWT interceptor
   * and backend token validation
   */
  verifyToken(): Observable<boolean> {
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/auth/verify`)
      .pipe(
        map(response => response.valid),
        catchError(() => throwError(() => new Error('Token verification failed')))
      );
  }

  /**
   * Get current user profile
   * This would typically call the user service GraphQL endpoint
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad Request';
          break;
        case 401:
          errorMessage = 'Invalid credentials or session expired';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflict - resource already exists';
          break;
        case 429:
          errorMessage = 'Too many requests - please try again later';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = error.error?.message || `Server Error: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
