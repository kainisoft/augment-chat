import { WritableSignal } from '@angular/core';
import { User } from './user.model';
import { Message } from './message.model';
import { Conversation } from './conversation.model';

/**
 * Application state structure
 */
export interface AppState {
  auth: AuthState;
  chat: ChatState;
  ui: UIState;
  notifications: NotificationState;
  settings: SettingsState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  typingUsers: Record<string, string[]>;
  connectionStatus: ConnectionStatus;
  messageCache: MessageCache;
}

export interface UIState {
  theme: string;
  sidebarOpen: boolean;
  modalStack: Modal[];
  toasts: Toast[];
  loading: Record<string, boolean>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
}

export interface SettingsState {
  user: UserSettings;
  app: AppSettings;
  privacy: PrivacySettings;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface MessageCache {
  [conversationId: string]: {
    messages: Message[];
    lastFetched: number;
    hasMore: boolean;
  };
}

export interface Modal {
  id: string;
  component: string;
  data?: unknown;
  options?: ModalOptions;
}

export interface ModalOptions {
  closable?: boolean;
  backdrop?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: () => void;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: unknown;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  desktop: boolean;
}

export interface UserSettings {
  theme: string;
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

export interface AppSettings {
  autoSave: boolean;
  debugMode: boolean;
  analytics: boolean;
}

export interface PrivacySettings {
  shareData: boolean;
  trackingConsent: boolean;
  cookieConsent: boolean;
}

/**
 * Signal-based state slices
 */
export interface SignalState {
  user: WritableSignal<User | null>;
  conversations: WritableSignal<Conversation[]>;
  activeConversation: WritableSignal<Conversation | null>;
  messages: WritableSignal<Message[]>;
  typingUsers: WritableSignal<User[]>;
  connectionStatus: WritableSignal<ConnectionStatus>;
}