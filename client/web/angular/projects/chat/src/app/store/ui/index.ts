/**
 * UI Store Barrel Exports
 * 
 * Provides clean, tree-shakable exports for all UI-related store items.
 * Use named imports to maintain optimal bundle size.
 */

// Actions - Export as namespace to maintain organization
export * as UiActions from './ui.actions';

// Selectors - Export individual selectors for tree-shaking
export {
  selectUiState,
  selectThemeConfig,
  selectThemeMode,
  selectIsDarkMode,
  selectPrimaryColor,
  selectAccentColor,
  selectLayoutConfig,
  selectSidebarOpen,
  selectSidebarMode,
  selectLayoutVariant,
  selectCompactMode,
  selectSidebarWidth,
  selectIsMobile,
  selectIsTablet,
  selectIsDesktop,
  selectNotifications,
  selectActiveNotifications,
  selectPersistentNotifications,
  selectNotificationCount,
  selectModalState,
  selectModalOpen,
  selectModalType,
  selectModalData,
  selectDrawerState,
  selectDrawerOpen,
  selectDrawerType,
  selectDrawerData,
  selectLoadingStates,
  selectGlobalLoading,
  selectAuthLoading,
  selectChatLoading,
  selectUserLoading,
  selectAnyLoading,
  selectSearchState,
  selectSearchActive,
  selectSearchQuery,
  selectSearchFilters,
  selectSearchSuggestions,
  selectRecentSearches,
  selectIsOnline,
  selectLastActivity,
  selectUIError,
  selectHasUIError,
  selectThemeUIState,
  selectLayoutUIState,
  selectNotificationUIState,
  selectLoadingUIState,
  selectSearchUIState,
  selectPrefersReducedMotion,
  selectPrefersHighContrast
} from './ui.selectors';

// State types - Export for type safety
export type {
  UiState,
  ThemeConfig,
  LayoutConfig,
  UINotification,
  LoadingStates,
  ModalState,
  DrawerState,
  SearchState
} from './ui.state';

// Reducer - Export for store configuration
export { uiReducer } from './ui.reducer';

// Effects - Export for store configuration
export { UiEffects } from './ui.effects';
