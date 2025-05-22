/**
 * User Auth Info Read Model
 *
 * Read model for user authentication information
 */
export interface UserAuthInfoReadModel {
  id: string;
  email: string;
  password: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}
