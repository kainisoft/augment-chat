/**
 * User model with signals support
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  lastSeen: number;
  preferences: UserPreferences;
}

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  desktop: boolean;
  mentions: boolean;
  directMessages: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowDirectMessages: boolean;
  showReadReceipts: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}