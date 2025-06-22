import { createReducer, on } from '@ngrx/store';
import { initialUiState } from './ui.state';
import * as UiActions from './ui.actions';

/**
 * UI reducer
 * Handles state changes for UI-related actions
 */
export const uiReducer = createReducer(
  initialUiState,

  // Sidebar Actions
  on(UiActions.toggleSidebar, (state) => ({
    ...state,
    sidebar: {
      ...state.sidebar,
      isOpen: !state.sidebar.isOpen,
    },
  })),

  on(UiActions.setSidebarOpen, (state, { open }) => ({
    ...state,
    sidebar: {
      ...state.sidebar,
      isOpen: open,
    },
  })),

  on(UiActions.setSidebarMode, (state, { mode }) => ({
    ...state,
    sidebar: {
      ...state.sidebar,
      mode,
    },
  })),

  on(UiActions.updateSidebarConfig, (state, { sidebar }) => ({
    ...state,
    sidebar: {
      ...state.sidebar,
      ...sidebar,
    },
  })),

  // Notification Actions
  on(UiActions.showNotification, (state, { notification }) => ({
    ...state,
    notifications: [
      ...state.notifications,
      {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      },
    ],
  })),

  on(UiActions.hideNotification, (state, { id }) => ({
    ...state,
    notifications: state.notifications.filter(notification => notification.id !== id),
  })),

  on(UiActions.clearAllNotifications, (state) => ({
    ...state,
    notifications: [],
  })),

  on(UiActions.updateNotification, (state, { id, updates }) => ({
    ...state,
    notifications: state.notifications.map(notification =>
      notification.id === id ? { ...notification, ...updates } : notification
    ),
  })),

  // Loading Actions
  on(UiActions.setGlobalLoading, (state, { loading }) => ({
    ...state,
    loading: {
      ...state.loading,
      global: loading,
    },
  })),

  on(UiActions.setAuthLoading, (state, { loading }) => ({
    ...state,
    loading: {
      ...state.loading,
      auth: loading,
    },
  })),

  on(UiActions.setChatLoading, (state, { loading }) => ({
    ...state,
    loading: {
      ...state.loading,
      chat: loading,
    },
  })),

  on(UiActions.setUserLoading, (state, { loading }) => ({
    ...state,
    loading: {
      ...state.loading,
      user: loading,
    },
  })),

  on(UiActions.setConversationsLoading, (state, { loading }) => ({
    ...state,
    loading: {
      ...state.loading,
      conversations: loading,
    },
  })),

  on(UiActions.setMessagesLoading, (state, { loading }) => ({
    ...state,
    loading: {
      ...state.loading,
      messages: loading,
    },
  })),

  on(UiActions.setSearchLoading, (state, { loading }) => ({
    ...state,
    loading: {
      ...state.loading,
      search: loading,
    },
  })),

  // Modal Actions
  on(UiActions.openModal, (state, { modalType, data, options }) => ({
    ...state,
    modal: {
      isOpen: true,
      type: modalType,
      data: data || null,
      options: options || {},
    },
  })),

  on(UiActions.closeModal, (state) => ({
    ...state,
    modal: {
      isOpen: false,
      type: null,
      data: null,
      options: {},
    },
  })),

  on(UiActions.updateModalData, (state, { data }) => ({
    ...state,
    modal: {
      ...state.modal,
      data,
    },
  })),

  // Drawer Actions
  on(UiActions.openDrawer, (state, { drawerType, data, position }) => ({
    ...state,
    drawer: {
      isOpen: true,
      type: drawerType,
      data: data || null,
      position: (position || 'end') as 'start' | 'end',
    },
  })),

  on(UiActions.closeDrawer, (state) => ({
    ...state,
    drawer: {
      isOpen: false,
      type: null,
      data: null,
      position: 'end' as 'start' | 'end',
    },
  })),

  on(UiActions.toggleDrawer, (state, { drawerType }) => ({
    ...state,
    drawer: {
      ...state.drawer,
      isOpen: state.drawer.type === drawerType ? !state.drawer.isOpen : true,
      type: state.drawer.type === drawerType && state.drawer.isOpen ? null : drawerType,
    },
  })),

  // Search Actions
  on(UiActions.activateSearch, (state) => ({
    ...state,
    search: {
      ...state.search,
      isActive: true,
    },
  })),

  on(UiActions.deactivateSearch, (state) => ({
    ...state,
    search: {
      ...state.search,
      isActive: false,
      query: '',
      filters: {},
    },
  })),

  on(UiActions.setSearchQuery, (state, { query }) => ({
    ...state,
    search: {
      ...state.search,
      query,
    },
  })),

  on(UiActions.setSearchFilters, (state, { filters }) => ({
    ...state,
    search: {
      ...state.search,
      filters: {
        ...state.search.filters,
        ...filters,
      },
    },
  })),

  on(UiActions.addSearchSuggestion, (state, { suggestion }) => ({
    ...state,
    search: {
      ...state.search,
      suggestions: [
        suggestion,
        ...state.search.suggestions.filter(s => s !== suggestion),
      ].slice(0, 10), // Keep only 10 suggestions
    },
  })),

  on(UiActions.clearSearchSuggestions, (state) => ({
    ...state,
    search: {
      ...state.search,
      suggestions: [],
    },
  })),

  on(UiActions.addRecentSearch, (state, { query }) => ({
    ...state,
    search: {
      ...state.search,
      recentSearches: [
        query,
        ...state.search.recentSearches.filter(s => s !== query),
      ].slice(0, 10), // Keep only 10 recent searches
    },
  })),

  on(UiActions.clearRecentSearches, (state) => ({
    ...state,
    search: {
      ...state.search,
      recentSearches: [],
    },
  })),

  // Connection Actions
  on(UiActions.setOnlineStatus, (state, { isOnline }) => ({
    ...state,
    isOnline,
  })),

  on(UiActions.updateLastActivity, (state) => ({
    ...state,
    lastActivity: new Date(),
  })),

  // Error Actions
  on(UiActions.setUIError, (state, { error }) => ({
    ...state,
    error,
  })),

  on(UiActions.clearUIError, (state) => ({
    ...state,
    error: null,
  }))
);
