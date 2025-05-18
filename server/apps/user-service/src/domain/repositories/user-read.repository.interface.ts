import {
  BaseReadRepository,
  QueryOptions,
} from '@app/database/repositories/base-read.repository';
import { UserProfileReadModel } from '../read-models/user-profile.read-model';

/**
 * User Read Repository Interface
 *
 * Repository interface for reading user profile data.
 * Used for query operations in CQRS.
 */
export interface UserReadRepository
  extends BaseReadRepository<UserProfileReadModel, string> {
  /**
   * Find a user by username
   * @param username - The username
   * @returns The user profile or null if not found
   */
  findByUsername(username: string): Promise<UserProfileReadModel | null>;

  /**
   * Find a user by authentication ID
   * @param authId - The authentication ID
   * @returns The user profile or null if not found
   */
  findByAuthId(authId: string): Promise<UserProfileReadModel | null>;

  /**
   * Search users by username or display name
   * @param searchTerm - The search term
   * @param options - Query options
   * @returns Array of matching user profiles
   */
  searchUsers(
    searchTerm: string,
    options?: QueryOptions,
  ): Promise<UserProfileReadModel[]>;

  /**
   * Get users by status
   * @param status - The user status
   * @param options - Query options
   * @returns Array of user profiles with the specified status
   */
  getUsersByStatus(
    status: string,
    options?: QueryOptions,
  ): Promise<UserProfileReadModel[]>;
}
