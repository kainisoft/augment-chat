import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

/**
 * Authentication reducer
 * Handles state changes for authentication-related actions
 */
export const authReducer = createReducer(
  initialAuthState,

  // Login Actions
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    isAuthenticated: true,
    user: response.user,
    token: response.token,
    refreshToken: response.refreshToken,
    loading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error,
  })),

  // Registration Actions
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    isAuthenticated: true,
    user: response.user,
    token: response.token,
    refreshToken: response.refreshToken,
    loading: false,
    error: null,
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error,
  })),

  // Logout Actions
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.logoutSuccess, () => ({
    ...initialAuthState,
  })),

  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Token Management Actions
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.refreshTokenSuccess, (state, { response }) => ({
    ...state,
    token: response.token,
    refreshToken: response.refreshToken,
    loading: false,
    error: null,
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error,
  })),

  // User Profile Actions
  on(AuthActions.updateUserProfile, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.updateUserProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),

  on(AuthActions.updateUserProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Session Management Actions
  on(AuthActions.setAuthenticatedUser, (state, { user, token, refreshToken }) => ({
    ...state,
    isAuthenticated: true,
    user,
    token,
    refreshToken,
    loading: false,
    error: null,
  })),

  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null,
  })),

  on(AuthActions.setLoading, (state, { loading }) => ({
    ...state,
    loading,
  })),

  // Password Reset Actions
  on(AuthActions.requestPasswordReset, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.requestPasswordResetSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),

  on(AuthActions.requestPasswordResetFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.resetPassword, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.resetPasswordSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),

  on(AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
