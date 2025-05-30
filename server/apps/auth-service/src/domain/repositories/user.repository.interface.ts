import { BaseWriteRepository } from '@app/database/repositories/base-write.repository';
import { UserId, Email } from '@app/domain';
import { User } from '../models/user.entity';

/**
 * User Repository Interface
 *
 * Repository interface for User entity.
 */
export interface UserRepository extends BaseWriteRepository<User, UserId> {
  /**
   * Find a user by email
   * @param email - The user email
   * @returns The user or null if not found
   */
  findByEmail(email: Email): Promise<User | null>;
}
