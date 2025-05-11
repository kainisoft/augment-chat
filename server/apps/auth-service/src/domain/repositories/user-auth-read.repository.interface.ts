import { BaseReadRepository } from '@app/database/repositories/base-read.repository';
import { UserAuthInfoReadModel } from '../read-models/user-auth-info.read-model';

/**
 * User Auth Read Repository Interface
 *
 * Repository interface for reading user authentication data
 */
export interface UserAuthReadRepository
  extends BaseReadRepository<UserAuthInfoReadModel, string> {
  /**
   * Find a user by email
   * @param email - The user email
   * @returns The user auth info or null if not found
   */
  findByEmail(email: string): Promise<UserAuthInfoReadModel | null>;
}
