/**
 * User interface for authentication state
 */
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Authentication state interface
 * Manages user authentication status, tokens, and user data
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial authentication state
 */
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};

/**
 * Login request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Registration request interface
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Token refresh response interface
 */
export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
}
