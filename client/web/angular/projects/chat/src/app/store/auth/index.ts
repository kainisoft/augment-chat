/**
 * Auth Store Barrel Exports
 * 
 * Provides clean, tree-shakable exports for all auth-related store items.
 * Use named imports to maintain optimal bundle size.
 */

// Actions - Export as namespace to maintain organization
export * as AuthActions from './auth.actions';

// Selectors - Export individual selectors for tree-shaking
export {
  selectAuthState,
  selectIsAuthenticated,
  selectIsAuthenticatedWithToken,
  selectCurrentUser,
  selectAuthLoading,
  selectAuthError,
  selectAccessToken,
  selectRefreshToken,
  selectSessionId,
  selectTokenExpiry,
  selectTokenType,
  selectLastActivity,
  selectUserDisplayName,
  selectUserInitials,
  selectIsUserOnline,
  selectUserAvatar,
  selectUserId,
  selectUserEmail,
  selectUserUsername,
  selectHasValidToken,
  selectHasAuthError,
  selectIsAuthLoading,
  selectAuthUIState,
  selectUserProfileData
} from './auth.selectors';

// State types - Export for type safety
export type {
  AuthState,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LogoutResponse
} from './auth.state';

// Reducer - Export for store configuration
export { authReducer } from './auth.reducer';

// Effects - Export for store configuration
export { AuthEffects } from './auth.effects';
