/**
 * UI Store Barrel Exports
 * 
 * Provides clean, tree-shakable exports for all UI-related store items.
 * Use named imports to maintain optimal bundle size.
 */

// Actions - Export as namespace to maintain organization
export {
  toggleSidebar,
  setSidebarOpen,
  setSidebarMode,
  updateSidebarConfig,
  showNotification,
  hideNotification,
  clearAllNotifications,
  updateNotification,
  setGlobalLoading,
  setAuthLoading,
  setChatLoading,
  setUserLoading,
  setConversationsLoading,
  setMessagesLoading,
  setSearchLoading,
  openModal,
  closeModal,
  updateModalData,
  openDrawer,
  closeDrawer,
  toggleDrawer,
  activateSearch,
  deactivateSearch,
  setSearchQuery,
  setSearchFilters,
  addSearchSuggestion,
  clearSearchSuggestions,
  addRecentSearch,
  clearRecentSearches,
  setOnlineStatus,
  updateLastActivity,
  setUIError,
  clearUIError,
  setBreakpoint,
  setIsMobile
} from './ui.actions';

// Selectors - Export individual selectors for tree-shaking
export {
  selectUiState,
  selectSidebarConfig,
  selectSidebarOpen,
  selectSidebarMode,
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
  selectSidebarUIState,
  selectNotificationUIState,
  selectLoadingUIState,
  selectSearchUIState,
  selectPrefersReducedMotion,
  selectPrefersHighContrast
} from './ui.selectors';

// State types - Export for type safety
export type {
  UiState,
  SidebarConfig,
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
