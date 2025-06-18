import { createAction, props } from '@ngrx/store';
import { 
  ThemeConfig, 
  LayoutConfig, 
  UINotification, 
  ModalState, 
  DrawerState, 
  SearchState 
} from './ui.state';

/**
 * Theme Actions
 */
export const setThemeMode = createAction(
  '[UI] Set Theme Mode',
  props<{ mode: 'light' | 'dark' | 'auto' }>()
);

export const setThemeColors = createAction(
  '[UI] Set Theme Colors',
  props<{ primaryColor: string; accentColor: string }>()
);

export const updateThemeConfig = createAction(
  '[UI] Update Theme Config',
  props<{ theme: Partial<ThemeConfig> }>()
);

export const resetTheme = createAction('[UI] Reset Theme');

/**
 * Layout Actions
 */
export const toggleSidebar = createAction('[UI] Toggle Sidebar');

export const setSidebarOpen = createAction(
  '[UI] Set Sidebar Open',
  props<{ open: boolean }>()
);

export const setSidebarMode = createAction(
  '[UI] Set Sidebar Mode',
  props<{ mode: 'side' | 'over' | 'push' }>()
);

export const setLayoutVariant = createAction(
  '[UI] Set Layout Variant',
  props<{ variant: 'default' | 'compact' | 'dense' | 'comfortable' }>()
);

export const updateLayoutConfig = createAction(
  '[UI] Update Layout Config',
  props<{ layout: Partial<LayoutConfig> }>()
);

export const toggleCompactMode = createAction('[UI] Toggle Compact Mode');

/**
 * Notification Actions
 */
export const showNotification = createAction(
  '[UI] Show Notification',
  props<{ notification: Omit<UINotification, 'id' | 'createdAt'> }>()
);

export const hideNotification = createAction(
  '[UI] Hide Notification',
  props<{ id: string }>()
);

export const clearAllNotifications = createAction('[UI] Clear All Notifications');

export const updateNotification = createAction(
  '[UI] Update Notification',
  props<{ id: string; updates: Partial<UINotification> }>()
);

/**
 * Loading Actions
 */
export const setGlobalLoading = createAction(
  '[UI] Set Global Loading',
  props<{ loading: boolean }>()
);

export const setAuthLoading = createAction(
  '[UI] Set Auth Loading',
  props<{ loading: boolean }>()
);

export const setChatLoading = createAction(
  '[UI] Set Chat Loading',
  props<{ loading: boolean }>()
);

export const setUserLoading = createAction(
  '[UI] Set User Loading',
  props<{ loading: boolean }>()
);

export const setConversationsLoading = createAction(
  '[UI] Set Conversations Loading',
  props<{ loading: boolean }>()
);

export const setMessagesLoading = createAction(
  '[UI] Set Messages Loading',
  props<{ loading: boolean }>()
);

export const setSearchLoading = createAction(
  '[UI] Set Search Loading',
  props<{ loading: boolean }>()
);

/**
 * Modal Actions
 */
export const openModal = createAction(
  '[UI] Open Modal',
  props<{
    modalType: string;
    data?: any;
    options?: {
      disableClose?: boolean;
      width?: string;
      height?: string;
      maxWidth?: string;
      maxHeight?: string;
    }
  }>()
);

export const closeModal = createAction('[UI] Close Modal');

export const updateModalData = createAction(
  '[UI] Update Modal Data',
  props<{ data: any }>()
);

/**
 * Drawer Actions
 */
export const openDrawer = createAction(
  '[UI] Open Drawer',
  props<{
    drawerType: 'settings' | 'profile' | 'search' | 'notifications';
    data?: any;
    position?: 'start' | 'end'
  }>()
);

export const closeDrawer = createAction('[UI] Close Drawer');

export const toggleDrawer = createAction(
  '[UI] Toggle Drawer',
  props<{ drawerType: 'settings' | 'profile' | 'search' | 'notifications' }>()
);

/**
 * Search Actions
 */
export const activateSearch = createAction('[UI] Activate Search');

export const deactivateSearch = createAction('[UI] Deactivate Search');

export const setSearchQuery = createAction(
  '[UI] Set Search Query',
  props<{ query: string }>()
);

export const setSearchFilters = createAction(
  '[UI] Set Search Filters',
  props<{ filters: Partial<SearchState['filters']> }>()
);

export const addSearchSuggestion = createAction(
  '[UI] Add Search Suggestion',
  props<{ suggestion: string }>()
);

export const clearSearchSuggestions = createAction('[UI] Clear Search Suggestions');

export const addRecentSearch = createAction(
  '[UI] Add Recent Search',
  props<{ query: string }>()
);

export const clearRecentSearches = createAction('[UI] Clear Recent Searches');

/**
 * Connection Actions
 */
export const setOnlineStatus = createAction(
  '[UI] Set Online Status',
  props<{ isOnline: boolean }>()
);

export const updateLastActivity = createAction('[UI] Update Last Activity');

/**
 * Error Actions
 */
export const setUIError = createAction(
  '[UI] Set UI Error',
  props<{ error: string }>()
);

export const clearUIError = createAction('[UI] Clear UI Error');

/**
 * Responsive Actions
 */
export const setBreakpoint = createAction(
  '[UI] Set Breakpoint',
  props<{ breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }>()
);

export const setIsMobile = createAction(
  '[UI] Set Is Mobile',
  props<{ isMobile: boolean }>()
);

/**
 * Accessibility Actions
 */
export const setHighContrast = createAction(
  '[UI] Set High Contrast',
  props<{ enabled: boolean }>()
);

export const setReducedMotion = createAction(
  '[UI] Set Reduced Motion',
  props<{ enabled: boolean }>()
);

export const setFontSize = createAction(
  '[UI] Set Font Size',
  props<{ size: 'small' | 'medium' | 'large' | 'extra-large' }>()
);
