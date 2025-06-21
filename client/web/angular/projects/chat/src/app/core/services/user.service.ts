import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  Contact,
  UserPreferences,
  UserProfile
} from '@store/user';

/**
 * User Service
 * Handles HTTP requests for user-related operations
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = environment.authServiceUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get current user profile
   */
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/user/profile`);
  }

  /**
   * Update user profile
   */
  updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/user/profile`, profile);
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.apiUrl}/user/preferences`);
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.patch<UserPreferences>(`${this.apiUrl}/user/preferences`, preferences);
  }

  /**
   * Get user contacts
   */
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/user/contacts`);
  }

  /**
   * Add a new contact
   */
  addContact(userId: string): Observable<Contact> {
    return this.http.post<Contact>(`${this.apiUrl}/user/contacts`, { userId });
  }

  /**
   * Remove a contact
   */
  removeContact(contactId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/contacts/${contactId}`);
  }

  /**
   * Toggle favorite status of a contact
   */
  toggleFavoriteContact(contactId: string): Observable<{ isFavorite: boolean }> {
    return this.http.patch<{ isFavorite: boolean }>(`${this.apiUrl}/user/contacts/${contactId}/favorite`, {});
  }

  /**
   * Block a user
   */
  blockUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/user/blocked`, { userId });
  }

  /**
   * Unblock a user
   */
  unblockUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/blocked/${userId}`);
  }

  /**
   * Get blocked users
   */
  getBlockedUsers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/user/blocked`);
  }

  /**
   * Search users
   */
  searchUsers(query: string): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/user/search`, {
      params: { q: query }
    });
  }

  /**
   * Update user status
   */
  updateUserStatus(status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/user/status`, { status });
  }

  /**
   * Update user online status
   */
  updateOnlineStatus(isOnline: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/user/online-status`, { isOnline });
  }

  /**
   * Upload user avatar
   */
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/user/avatar`, formData);
  }

  /**
   * Delete user avatar
   */
  deleteAvatar(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/avatar`);
  }
}
