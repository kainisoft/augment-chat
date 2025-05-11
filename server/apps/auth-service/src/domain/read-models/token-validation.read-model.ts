/**
 * Token Validation Read Model
 *
 * Read model for token validation results
 */
export interface TokenValidationReadModel {
  valid: boolean;
  userId?: string;
  sessionId?: string;
  email?: string;
  isVerified?: boolean;
  isActive?: boolean;
  expiresAt?: Date;
  error?: string;
}
