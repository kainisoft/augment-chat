import { AuthState, initialAuthState } from './auth/auth.state';
import { ChatState } from './chat/chat.state';
import { UiState } from './ui/ui.state';
import { UserState } from './user/user.state';

/**
 * Root application state interface
 * Combines all feature states into a single application state
 */
export interface AppState {
  auth: AuthState;
  user: UserState;
  chat: ChatState;
  ui: UiState;
}

/**
 * Initial application state
 * Provides default values for all feature states
 */
export const initialAppState: AppState = {
  auth: initialAuthState,
  user: {
    profile: null,
    preferences: {
      theme: 'auto',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h',
      notifications: {
        email: true,
        push: true,
        sound: true,
        desktop: true,
        mentions: true,
        directMessages: true,
        groupMessages: true,
      },
      privacy: {
        showOnlineStatus: true,
        showLastSeen: true,
        allowDirectMessages: 'everyone',
        allowGroupInvites: 'contacts',
        readReceipts: true,
        typingIndicators: true,
      },
      chatSettings: {
        enterToSend: true,
        showEmojis: true,
        autoDownloadMedia: true,
        compactMode: false,
      },
    },
    contacts: [],
    blockedUsers: [],
    favoriteContacts: [],
    loading: false,
    error: null,
  },
  chat: {
    conversations: [],
    activeConversationId: null,
    messages: {},
    typingUsers: {},
    onlineUsers: new Set(),
    messageDrafts: {},
    searchResults: null,
    loading: false,
    error: null,
  },
  ui: {
    sidebar: {
      isOpen: true,
      mode: 'side',
      width: 280,
    },
    notifications: [],
    loading: {
      global: false,
      auth: false,
      chat: false,
      user: false,
      conversations: false,
      messages: false,
      search: false,
    },
    modal: {
      isOpen: false,
      type: null,
      data: null,
      options: {},
    },
    drawer: {
      isOpen: false,
      type: null,
      data: null,
      position: 'end',
    },
    search: {
      isActive: false,
      query: '',
      filters: {},
      suggestions: [],
      recentSearches: [],
    },
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastActivity: new Date(),
    error: null,
  },
};
