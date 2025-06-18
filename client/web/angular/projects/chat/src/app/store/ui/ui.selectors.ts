import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.state';

/**
 * UI Selectors
 * Provides memoized selectors for UI state
 */

// Feature selector for UI state
export const selectUiState = createFeatureSelector<UiState>('ui');

// Theme selectors
export const selectThemeConfig = createSelector(
  selectUiState,
  (state) => state.theme
);

export const selectThemeMode = createSelector(
  selectThemeConfig,
  (theme) => theme.mode
);

export const selectPrimaryColor = createSelector(
  selectThemeConfig,
  (theme) => theme.primaryColor
);

export const selectAccentColor = createSelector(
  selectThemeConfig,
  (theme) => theme.accentColor
);

export const selectIsDarkMode = createSelector(
  selectThemeMode,
  (mode) => {
    if (mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return mode === 'dark';
  }
);

// Layout selectors
export const selectLayoutConfig = createSelector(
  selectUiState,
  (state) => state.layout
);

export const selectSidebarOpen = createSelector(
  selectLayoutConfig,
  (layout) => layout.sidebarOpen
);

export const selectSidebarMode = createSelector(
  selectLayoutConfig,
  (layout) => layout.sidebarMode
);

export const selectLayoutVariant = createSelector(
  selectLayoutConfig,
  (layout) => layout.layoutVariant
);

export const selectCompactMode = createSelector(
  selectLayoutConfig,
  (layout) => layout.compactMode
);

export const selectSidebarWidth = createSelector(
  selectLayoutConfig,
  (layout) => layout.sidebarWidth
);

// Notification selectors
export const selectNotifications = createSelector(
  selectUiState,
  (state) => state.notifications
);

export const selectActiveNotifications = createSelector(
  selectNotifications,
  (notifications) => notifications.filter(n => !n.persistent || n.duration)
);

export const selectPersistentNotifications = createSelector(
  selectNotifications,
  (notifications) => notifications.filter(n => n.persistent)
);

export const selectNotificationCount = createSelector(
  selectNotifications,
  (notifications) => notifications.length
);

// Loading selectors
export const selectLoadingStates = createSelector(
  selectUiState,
  (state) => state.loading
);

export const selectGlobalLoading = createSelector(
  selectLoadingStates,
  (loading) => loading.global
);

export const selectAuthLoading = createSelector(
  selectLoadingStates,
  (loading) => loading.auth
);

export const selectChatLoading = createSelector(
  selectLoadingStates,
  (loading) => loading.chat
);

export const selectUserLoading = createSelector(
  selectLoadingStates,
  (loading) => loading.user
);

export const selectAnyLoading = createSelector(
  selectLoadingStates,
  (loading) => Object.values(loading).some(Boolean)
);

// Modal selectors
export const selectModalState = createSelector(
  selectUiState,
  (state) => state.modal
);

export const selectModalOpen = createSelector(
  selectModalState,
  (modal) => modal.isOpen
);

export const selectModalType = createSelector(
  selectModalState,
  (modal) => modal.type
);

export const selectModalData = createSelector(
  selectModalState,
  (modal) => modal.data
);

// Drawer selectors
export const selectDrawerState = createSelector(
  selectUiState,
  (state) => state.drawer
);

export const selectDrawerOpen = createSelector(
  selectDrawerState,
  (drawer) => drawer.isOpen
);

export const selectDrawerType = createSelector(
  selectDrawerState,
  (drawer) => drawer.type
);

export const selectDrawerData = createSelector(
  selectDrawerState,
  (drawer) => drawer.data
);

// Search selectors
export const selectSearchState = createSelector(
  selectUiState,
  (state) => state.search
);

export const selectSearchActive = createSelector(
  selectSearchState,
  (search) => search.isActive
);

export const selectSearchQuery = createSelector(
  selectSearchState,
  (search) => search.query
);

export const selectSearchFilters = createSelector(
  selectSearchState,
  (search) => search.filters
);

export const selectSearchSuggestions = createSelector(
  selectSearchState,
  (search) => search.suggestions
);

export const selectRecentSearches = createSelector(
  selectSearchState,
  (search) => search.recentSearches
);

// Connection selectors
export const selectIsOnline = createSelector(
  selectUiState,
  (state) => state.isOnline
);

export const selectLastActivity = createSelector(
  selectUiState,
  (state) => state.lastActivity
);

// Error selectors
export const selectUIError = createSelector(
  selectUiState,
  (state) => state.error
);

export const selectHasUIError = createSelector(
  selectUIError,
  (error) => !!error
);

// Combined selectors for UI components
export const selectThemeUIState = createSelector(
  selectThemeConfig,
  selectIsDarkMode,
  (theme, isDark) => ({
    theme,
    isDark,
  })
);

export const selectLayoutUIState = createSelector(
  selectLayoutConfig,
  selectSidebarOpen,
  selectCompactMode,
  (layout, sidebarOpen, compactMode) => ({
    layout,
    sidebarOpen,
    compactMode,
  })
);

export const selectNotificationUIState = createSelector(
  selectNotifications,
  selectNotificationCount,
  (notifications, count) => ({
    notifications,
    count,
  })
);

export const selectLoadingUIState = createSelector(
  selectLoadingStates,
  selectAnyLoading,
  (loading, anyLoading) => ({
    loading,
    anyLoading,
  })
);

export const selectSearchUIState = createSelector(
  selectSearchState,
  selectSearchActive,
  selectSearchQuery,
  (search, isActive, query) => ({
    search,
    isActive,
    query,
  })
);

// Responsive selectors
export const selectIsMobile = createSelector(
  selectUiState,
  () => window.innerWidth < 768
);

export const selectIsTablet = createSelector(
  selectUiState,
  () => window.innerWidth >= 768 && window.innerWidth < 1024
);

export const selectIsDesktop = createSelector(
  selectUiState,
  () => window.innerWidth >= 1024
);

// Accessibility selectors
export const selectPrefersReducedMotion = createSelector(
  selectUiState,
  () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

export const selectPrefersHighContrast = createSelector(
  selectUiState,
  () => window.matchMedia('(prefers-contrast: high)').matches
);
