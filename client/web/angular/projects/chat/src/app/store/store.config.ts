import { isDevMode } from '@angular/core';
import { ActionReducer, MetaReducer, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { AppState, initialAppState } from './app.state';
import { authReducer } from './auth/auth.reducer';
import { userReducer } from './user/user.reducer';
import { chatReducer } from './chat/chat.reducer';
import { uiReducer } from './ui/ui.reducer';

import { AuthEffects } from './auth/auth.effects';
import { UserEffects } from './user/user.effects';
import { ChatEffects } from './chat/chat.effects';
import { UiEffects } from './ui/ui.effects';

/**
 * Root reducers configuration
 * Maps each feature state to its corresponding reducer
 */
export const appReducers = {
  auth: authReducer,
  user: userReducer,
  chat: chatReducer,
  ui: uiReducer,
};

/**
 * Local storage synchronization configuration
 * Persists specific state slices to localStorage
 */
export function localStorageSyncReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return (state, action) => {
    // Apply the reducer first
    const nextState = reducer(state, action);

    // Persist specific state slices to localStorage
    if (nextState) {
      try {
        // Persist auth state (tokens and authentication status)
        const authToPersist = {
          accessToken: nextState.auth.accessToken,
          refreshToken: nextState.auth.refreshToken,
          sessionId: nextState.auth.sessionId,
          expiresIn: nextState.auth.expiresIn,
          tokenType: nextState.auth.tokenType,
          isAuthenticated: nextState.auth.isAuthenticated,
        };
        localStorage.setItem('chat_auth_state', JSON.stringify(authToPersist));

        // Persist user preferences
        if (nextState.user.preferences) {
          localStorage.setItem('chat_user_preferences', JSON.stringify(nextState.user.preferences));
        }

        // Persist UI sidebar state
        const uiToPersist = {
          sidebar: nextState.ui.sidebar,
        };
        localStorage.setItem('chat_ui_state', JSON.stringify(uiToPersist));
      } catch (error) {
        console.warn('Failed to persist state to localStorage:', error);
      }
    }

    return nextState;
  };
}

/**
 * Rehydrate state from localStorage
 * Restores persisted state on application startup
 */
export function rehydrateState(): Partial<AppState> {
  try {
    const rehydratedState: Partial<AppState> = {};

    // Rehydrate auth state
    const authState = localStorage.getItem('chat_auth_state');
    if (authState) {
      const parsedAuth = JSON.parse(authState);
      rehydratedState.auth = {
        ...initialAppState.auth,
        ...parsedAuth,
      };
    }

    // Rehydrate user preferences
    const userPreferences = localStorage.getItem('chat_user_preferences');
    if (userPreferences) {
      const parsedPreferences = JSON.parse(userPreferences);
      rehydratedState.user = {
        ...initialAppState.user,
        preferences: parsedPreferences,
      };
    }

    // Rehydrate UI state
    const uiState = localStorage.getItem('chat_ui_state');
    if (uiState) {
      const parsedUi = JSON.parse(uiState);
      rehydratedState.ui = {
        ...initialAppState.ui,
        ...parsedUi,
      };
    }

    return rehydratedState;
  } catch (error) {
    console.warn('Failed to rehydrate state from localStorage:', error);
    return {};
  }
}

/**
 * Meta reducers for development and production
 * Includes localStorage sync and development-only features
 */
export const metaReducers: MetaReducer<AppState>[] = [localStorageSyncReducer];

if (isDevMode()) {
  // Add development-only meta reducers here if needed
}

/**
 * Store providers configuration
 * Provides NgRx store, effects, and devtools for dependency injection
 */
export const storeProviders = [
  // Provide the store with reducers and meta reducers
  provideStore(appReducers, {
    metaReducers,
    initialState: rehydrateState(),
    runtimeChecks: {
      strictStateImmutability: true,
      strictActionImmutability: true,
      strictStateSerializability: false, // Disabled due to Set in onlineUsers
      strictActionSerializability: true,
      strictActionWithinNgZone: true,
      strictActionTypeUniqueness: true,
    },
  }),

  // Provide effects
  provideEffects([AuthEffects, UserEffects, ChatEffects, UiEffects]),

  // Provide store devtools for development
  provideStoreDevtools({
    maxAge: 25,
    logOnly: !isDevMode(),
    autoPause: true,
    trace: false,
    traceLimit: 75,
    connectInZone: true,
    name: 'Angular Chat App',
    serialize: {
      options: {
        undefined: true,
        function: true,
        symbol: true,
        map: true,
        set: true,
      },
    },
  }),
];
