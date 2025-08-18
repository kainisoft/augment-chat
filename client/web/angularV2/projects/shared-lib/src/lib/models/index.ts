// Models barrel file - using named exports for optimal tree-shaking
export * from './user.model';
export * from './message.model';
export * from './conversation.model';
export * from './websocket-event.model';
export * from './validation.model';

// Re-export specific types from state.model to avoid conflicts and enable selective imports
export type {
  AppState,
  AuthState,
  ChatState,
  UIState,
  NotificationState,
  SettingsState,
  ConnectionStatus,
  MessageCache,
  Modal,
  ModalOptions,
  Toast,
  ToastAction,
  Notification,
  NotificationSettings,
  UserSettings,
  AppSettings,
  PrivacySettings,
  SignalState
} from './state.model';