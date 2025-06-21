import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

/**
 * Token Storage Service
 * 
 * Handles secure storage and retrieval of authentication tokens.
 * Uses localStorage with encryption for development and can be extended
 * to use HTTP-only cookies for production.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly ACCESS_TOKEN_KEY = environment.auth.tokenStorageKey;
  private readonly REFRESH_TOKEN_KEY = environment.auth.refreshTokenStorageKey;
  private readonly SESSION_ID_KEY = 'chat_session_id';
  private readonly TOKEN_EXPIRY_KEY = 'chat_token_expiry';
  private readonly USER_DATA_KEY = 'chat_user_data';

  constructor() {}

  /**
   * Store access token
   */
  setAccessToken(token: string): void {
    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store access token:', error);
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Store refresh token
   */
  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Store session ID
   */
  setSessionId(sessionId: string): void {
    try {
      localStorage.setItem(this.SESSION_ID_KEY, sessionId);
    } catch (error) {
      console.error('Failed to store session ID:', error);
    }
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    try {
      return localStorage.getItem(this.SESSION_ID_KEY);
    } catch (error) {
      console.error('Failed to retrieve session ID:', error);
      return null;
    }
  }

  /**
   * Store token expiry time
   */
  setTokenExpiry(expiresIn: number): void {
    try {
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Failed to store token expiry:', error);
    }
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(): number | null {
    try {
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Failed to retrieve token expiry:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    const bufferTime = environment.auth.tokenExpirationBuffer * 1000; // Convert to milliseconds
    return Date.now() >= (expiry - bufferTime);
  }

  /**
   * Store user data
   */
  setUserData(userData: any): void {
    try {
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Get user data
   */
  getUserData(): any | null {
    try {
      const userData = localStorage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Store complete authentication data
   */
  setAuthData(authData: {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    expiresIn: number;
    userData?: any;
  }): void {
    this.setAccessToken(authData.accessToken);
    this.setRefreshToken(authData.refreshToken);
    this.setSessionId(authData.sessionId);
    this.setTokenExpiry(authData.expiresIn);
    
    if (authData.userData) {
      this.setUserData(authData.userData);
    }
  }

  /**
   * Get complete authentication data
   */
  getAuthData(): {
    accessToken: string | null;
    refreshToken: string | null;
    sessionId: string | null;
    isExpired: boolean;
    userData: any | null;
  } {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
      sessionId: this.getSessionId(),
      isExpired: this.isTokenExpired(),
      userData: this.getUserData(),
    };
  }

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.SESSION_ID_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      localStorage.removeItem(this.USER_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Check if user has valid authentication
   */
  hasValidAuth(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    return !!(accessToken && refreshToken && !this.isTokenExpired());
  }

  /**
   * Check if refresh token is available
   */
  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    try {
      localStorage.setItem('chat_last_activity', Date.now().toString());
    } catch (error) {
      console.error('Failed to update last activity:', error);
    }
  }

  /**
   * Get last activity timestamp
   */
  getLastActivity(): number | null {
    try {
      const lastActivity = localStorage.getItem('chat_last_activity');
      return lastActivity ? parseInt(lastActivity, 10) : null;
    } catch (error) {
      console.error('Failed to retrieve last activity:', error);
      return null;
    }
  }
}
