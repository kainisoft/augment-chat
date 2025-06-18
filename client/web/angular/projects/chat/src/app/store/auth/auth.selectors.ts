import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

/**
 * Authentication Selectors
 * Provides memoized selectors for authentication state
 */

// Feature selector for auth state
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Basic selectors
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectAuthToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectRefreshToken = createSelector(
  selectAuthState,
  (state) => state.refreshToken
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

// Computed selectors
export const selectUserDisplayName = createSelector(
  selectCurrentUser,
  (user) => {
    if (!user) return null;
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.firstName) {
      return user.firstName;
    }
    
    return user.username;
  }
);

export const selectUserInitials = createSelector(
  selectCurrentUser,
  (user) => {
    if (!user) return '';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    
    return user.username.charAt(0).toUpperCase();
  }
);

export const selectIsUserOnline = createSelector(
  selectCurrentUser,
  (user) => user?.isOnline ?? false
);

export const selectUserAvatar = createSelector(
  selectCurrentUser,
  (user) => user?.avatar
);

export const selectUserId = createSelector(
  selectCurrentUser,
  (user) => user?.id
);

export const selectUserEmail = createSelector(
  selectCurrentUser,
  (user) => user?.email
);

export const selectUserUsername = createSelector(
  selectCurrentUser,
  (user) => user?.username
);

// Authentication status selectors
export const selectHasValidToken = createSelector(
  selectAuthToken,
  selectRefreshToken,
  (token, refreshToken) => !!(token && refreshToken)
);

export const selectIsAuthenticatedWithToken = createSelector(
  selectIsAuthenticated,
  selectHasValidToken,
  (isAuthenticated, hasValidToken) => isAuthenticated && hasValidToken
);

// Error and loading state selectors
export const selectHasAuthError = createSelector(
  selectAuthError,
  (error) => !!error
);

export const selectIsAuthLoading = createSelector(
  selectAuthLoading,
  (loading) => loading
);

// Combined selectors for UI components
export const selectAuthUIState = createSelector(
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectCurrentUser,
  (isAuthenticated, loading, error, user) => ({
    isAuthenticated,
    loading,
    error,
    user,
  })
);

export const selectUserProfileData = createSelector(
  selectCurrentUser,
  selectUserDisplayName,
  selectUserInitials,
  selectUserAvatar,
  (user, displayName, initials, avatar) => ({
    user,
    displayName,
    initials,
    avatar,
  })
);
