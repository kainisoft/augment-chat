/**
 * User contact interface
 */
export interface Contact {
  id: string;
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  status?: string;
  isFavorite: boolean;
  isBlocked: boolean;
  createdAt: Date;
}

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sound: boolean;
  desktop: boolean;
  mentions: boolean;
  directMessages: boolean;
  groupMessages: boolean;
}

/**
 * User privacy settings
 */
export interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowDirectMessages: 'everyone' | 'contacts' | 'nobody';
  allowGroupInvites: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  typingIndicators: boolean;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  chatSettings: {
    enterToSend: boolean;
    showEmojis: boolean;
    autoDownloadMedia: boolean;
    compactMode: boolean;
  };
}

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  status?: string;
  isOnline: boolean;
  lastSeen?: Date;
  phoneNumber?: string;
  website?: string;
  location?: string;
  birthDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User state interface
 */
export interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  contacts: Contact[];
  blockedUsers: string[];
  favoriteContacts: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Initial user state
 */
export const initialUserState: UserState = {
  profile: null,
  preferences: {
    theme: 'auto',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    notifications: {
      email: true,
      push: true,
      sound: true,
      desktop: true,
      mentions: true,
      directMessages: true,
      groupMessages: true,
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      allowDirectMessages: 'everyone',
      allowGroupInvites: 'contacts',
      readReceipts: true,
      typingIndicators: true,
    },
    chatSettings: {
      enterToSend: true,
      showEmojis: true,
      autoDownloadMedia: true,
      compactMode: false,
    },
  },
  contacts: [],
  blockedUsers: [],
  favoriteContacts: [],
  loading: false,
  error: null,
};
