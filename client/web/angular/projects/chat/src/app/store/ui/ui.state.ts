/**
 * Sidebar configuration interface (UI-only state)
 */
export interface SidebarConfig {
  isOpen: boolean;
  mode: 'side' | 'over' | 'push';
  width: number;
}

/**
 * Notification interface
 */
export interface UINotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: {
    label: string;
    action: string;
    primary?: boolean;
  }[];
  createdAt: Date;
}

/**
 * Loading states interface
 */
export interface LoadingStates {
  global: boolean;
  auth: boolean;
  chat: boolean;
  user: boolean;
  conversations: boolean;
  messages: boolean;
  search: boolean;
}

/**
 * Modal state interface
 */
export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: any;
  options: {
    disableClose?: boolean;
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
  };
}

/**
 * Drawer state interface
 */
export interface DrawerState {
  isOpen: boolean;
  type: 'settings' | 'profile' | 'search' | 'notifications' | null;
  data: any;
  position: 'start' | 'end';
}

/**
 * Search state interface
 */
export interface SearchState {
  isActive: boolean;
  query: string;
  filters: {
    type?: 'messages' | 'conversations' | 'users';
    dateRange?: {
      start: Date;
      end: Date;
    };
    conversationId?: string;
  };
  suggestions: string[];
  recentSearches: string[];
}

/**
 * UI state interface
 */
export interface UiState {
  sidebar: SidebarConfig;
  notifications: UINotification[];
  loading: LoadingStates;
  modal: ModalState;
  drawer: DrawerState;
  search: SearchState;
  isOnline: boolean;
  lastActivity: Date | null;
  error: string | null;
}

/**
 * Initial UI state
 */
export const initialUiState: UiState = {
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
  isOnline: navigator.onLine,
  lastActivity: new Date(),
  error: null,
};
