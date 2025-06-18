import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  TokenRefreshResponse, 
  User 
} from '../../store/auth/auth.state';

/**
 * Authentication Service
 * Handles HTTP requests for authentication operations
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.authServiceUrl;

  constructor(private http: HttpClient) {}

  /**
   * Login user with credentials
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, userData);
  }

  /**
   * Logout current user
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {});
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<TokenRefreshResponse> {
    return this.http.post<TokenRefreshResponse>(`${this.apiUrl}/auth/refresh`, {});
  }

  /**
   * Update user profile
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/auth/profile`, userData);
  }

  /**
   * Request password reset
   */
  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/password-reset/request`, { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/password-reset/confirm`, {
      token,
      newPassword,
    });
  }

  /**
   * Verify authentication token
   */
  verifyToken(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/verify`);
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }
}
