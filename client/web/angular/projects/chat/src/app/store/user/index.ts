/**
 * User Store Barrel Exports
 * 
 * Provides clean, tree-shakable exports for all user-related store items.
 * Use named imports to maintain optimal bundle size.
 */

// Actions - Export as namespace to maintain organization
export * as UserActions from './user.actions';

// Selectors - Export individual selectors for tree-shaking
export {
  selectUserState,
  selectUserProfile,
  selectUserPreferences,
  selectUserContacts,
  selectBlockedUsers,
  selectFavoriteContacts,
  selectUserLoading,
  selectUserError,
  selectOnlineContacts,
  selectOfflineContacts,
  selectFavoriteContactsList,
  selectContactsCount,
  selectOnlineContactsCount,
  selectThemePreference,
  selectLanguagePreference,
  selectNotificationPreferences,
  selectPrivacySettings,
  selectChatSettings,
  selectUserDisplayName,
  selectUserInitials,
  selectUserAvatar,
  selectUserStatus,
  selectIsUserOnline,
  selectContactById,
  selectIsContactFavorite,
  selectIsUserBlocked,
  selectUserUIState,
  selectContactsUIState
} from './user.selectors';

// State types - Export for type safety
export type {
  UserState,
  UserProfile,
  UserPreferences,
  Contact,
  NotificationPreferences,
  PrivacySettings
} from './user.state';

// Reducer - Export for store configuration
export { userReducer } from './user.reducer';

// Effects - Export for store configuration
export { UserEffects } from './user.effects';
