/**
 * User Profile Read Model
 *
 * Data Transfer Object (DTO) for user profile information.
 * Used for query operations in CQRS.
 */
export interface UserProfileReadModel {
  id: string;
  authId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
