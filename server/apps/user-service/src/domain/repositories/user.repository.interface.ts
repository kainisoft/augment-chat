import { BaseWriteRepository } from '@app/database/repositories/base-write.repository';
import { User } from '../models/user.entity';
import { UserId, Username, AuthId } from '../models/value-objects';

/**
 * User Repository Interface
 *
 * Repository interface for User entity.
 * Follows the repository pattern from Domain-Driven Design.
 */
export interface UserRepository extends BaseWriteRepository<User, UserId> {
  /**
   * Find a user by username
   * @param username - The username
   * @returns The user or null if not found
   */
  findByUsername(username: Username): Promise<User | null>;

  /**
   * Find a user by authentication ID
   * @param authId - The authentication ID
   * @returns The user or null if not found
   */
  findByAuthId(authId: AuthId): Promise<User | null>;

  /**
   * Check if a username exists
   * @param username - The username to check
   * @returns True if the username exists, false otherwise
   */
  usernameExists(username: Username): Promise<boolean>;

  /**
   * Update user status
   * @param id - The user ID
   * @param status - The new status
   * @returns The updated user
   */
  updateStatus(id: UserId, status: string): Promise<User>;
}
