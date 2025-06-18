/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  customColors?: Record<string, string>;
}

/**
 * Layout configuration interface
 */
export interface LayoutConfig {
  sidebarOpen: boolean;
  sidebarMode: 'side' | 'over' | 'push';
  sidebarWidth: number;
  layoutVariant: 'default' | 'compact' | 'dense' | 'comfortable';
  showHeader: boolean;
  showFooter: boolean;
  compactMode: boolean;
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
  theme: ThemeConfig;
  layout: LayoutConfig;
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
  theme: {
    mode: 'auto',
    primaryColor: '#1976d2',
    accentColor: '#ff4081',
  },
  layout: {
    sidebarOpen: true,
    sidebarMode: 'side',
    sidebarWidth: 280,
    layoutVariant: 'default',
    showHeader: true,
    showFooter: false,
    compactMode: false,
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
