/**
 * User interface for authentication state
 */
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  isVerified?: boolean;
}

/**
 * Authentication state interface
 * Manages user authentication status, tokens, and user data
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  expiresIn: number | null;
  tokenType: string;
  loading: boolean;
  error: string | null;
  lastActivity: number | null;
}

/**
 * Initial authentication state
 */
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  sessionId: null,
  expiresIn: null,
  tokenType: 'Bearer',
  loading: false,
  error: null,
  lastActivity: null,
};

/**
 * Login request interface - matches backend LoginDto
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request interface - matches backend RegisterDto
 */
export interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * Authentication response interface - matches backend AuthResponseDto
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  sessionId: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Token refresh request interface - matches backend RefreshTokenDto
 */
export interface TokenRefreshRequest {
  refreshToken: string;
}

/**
 * Token refresh response interface
 */
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Forgot password request interface - matches backend ForgotPasswordDto
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request interface - matches backend ResetPasswordDto
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Logout response interface - matches backend LogoutResponseDto
 */
export interface LogoutResponse {
  message: string;
  success: boolean;
}
