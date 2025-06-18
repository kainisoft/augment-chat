import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.state';

/**
 * User Selectors
 * Provides memoized selectors for user state
 */

// Feature selector for user state
export const selectUserState = createFeatureSelector<UserState>('user');

// Basic selectors
export const selectUserProfile = createSelector(
  selectUserState,
  (state) => state.profile
);

export const selectUserPreferences = createSelector(
  selectUserState,
  (state) => state.preferences
);

export const selectUserContacts = createSelector(
  selectUserState,
  (state) => state.contacts
);

export const selectBlockedUsers = createSelector(
  selectUserState,
  (state) => state.blockedUsers
);

export const selectFavoriteContacts = createSelector(
  selectUserState,
  (state) => state.favoriteContacts
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state) => state.loading
);

export const selectUserError = createSelector(
  selectUserState,
  (state) => state.error
);

// Computed selectors
export const selectOnlineContacts = createSelector(
  selectUserContacts,
  (contacts) => contacts.filter(contact => contact.isOnline)
);

export const selectOfflineContacts = createSelector(
  selectUserContacts,
  (contacts) => contacts.filter(contact => !contact.isOnline)
);

export const selectFavoriteContactsList = createSelector(
  selectUserContacts,
  selectFavoriteContacts,
  (contacts, favoriteIds) => 
    contacts.filter(contact => favoriteIds.includes(contact.id))
);

export const selectContactsCount = createSelector(
  selectUserContacts,
  (contacts) => contacts.length
);

export const selectOnlineContactsCount = createSelector(
  selectOnlineContacts,
  (contacts) => contacts.length
);

// Preference selectors
export const selectThemePreference = createSelector(
  selectUserPreferences,
  (preferences) => preferences.theme
);

export const selectLanguagePreference = createSelector(
  selectUserPreferences,
  (preferences) => preferences.language
);

export const selectNotificationPreferences = createSelector(
  selectUserPreferences,
  (preferences) => preferences.notifications
);

export const selectPrivacySettings = createSelector(
  selectUserPreferences,
  (preferences) => preferences.privacy
);

export const selectChatSettings = createSelector(
  selectUserPreferences,
  (preferences) => preferences.chatSettings
);

// Profile selectors
export const selectUserDisplayName = createSelector(
  selectUserProfile,
  (profile) => {
    if (!profile) return null;
    
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    
    if (profile.firstName) {
      return profile.firstName;
    }
    
    return profile.username;
  }
);

export const selectUserInitials = createSelector(
  selectUserProfile,
  (profile) => {
    if (!profile) return '';
    
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }
    
    if (profile.firstName) {
      return profile.firstName.charAt(0).toUpperCase();
    }
    
    return profile.username.charAt(0).toUpperCase();
  }
);

export const selectUserAvatar = createSelector(
  selectUserProfile,
  (profile) => profile?.avatar
);

export const selectUserStatus = createSelector(
  selectUserProfile,
  (profile) => profile?.status
);

export const selectIsUserOnline = createSelector(
  selectUserProfile,
  (profile) => profile?.isOnline ?? false
);

// Contact utility selectors
export const selectContactById = (contactId: string) =>
  createSelector(
    selectUserContacts,
    (contacts) => contacts.find(contact => contact.id === contactId)
  );

export const selectIsContactFavorite = (contactId: string) =>
  createSelector(
    selectFavoriteContacts,
    (favoriteIds) => favoriteIds.includes(contactId)
  );

export const selectIsUserBlocked = (userId: string) =>
  createSelector(
    selectBlockedUsers,
    (blockedIds) => blockedIds.includes(userId)
  );

// Combined selectors for UI components
export const selectUserUIState = createSelector(
  selectUserProfile,
  selectUserLoading,
  selectUserError,
  (profile, loading, error) => ({
    profile,
    loading,
    error,
  })
);

export const selectContactsUIState = createSelector(
  selectUserContacts,
  selectOnlineContacts,
  selectFavoriteContactsList,
  selectUserLoading,
  selectUserError,
  (contacts, onlineContacts, favoriteContacts, loading, error) => ({
    contacts,
    onlineContacts,
    favoriteContacts,
    loading,
    error,
  })
);
