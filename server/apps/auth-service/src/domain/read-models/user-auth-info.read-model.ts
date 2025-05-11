/**
 * User Auth Info Read Model
 *
 * Read model for user authentication information
 */
export interface UserAuthInfoReadModel {
  id: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
