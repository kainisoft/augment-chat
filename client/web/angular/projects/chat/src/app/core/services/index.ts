/**
 * Core Services Barrel Exports
 * 
 * Provides clean, tree-shakable exports for all core services.
 * Use named imports to maintain optimal bundle size.
 */

// Authentication & Security Services
export { AuthService } from './auth.service';
export { TokenStorageService } from './token-storage.service';

// Chat & Communication Services
export { ChatService } from './chat.service';
export { WebSocketService } from './websocket.service';

// User & Profile Services
export { UserService } from './user.service';

// UI & Theme Services
export { ThemeService } from './theme.service';
export { BreakpointService } from './breakpoint.service';
export { IconService } from './icon.service';
export { NavigationService } from './navigation.service';

// Re-export types that might be needed
export type { Theme } from './theme.service';
export type { WebSocketConfig, WebSocketMessage } from './websocket.service';
export type { NavigationItem } from './navigation.service';
