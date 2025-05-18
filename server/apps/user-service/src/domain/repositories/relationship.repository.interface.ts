import { BaseWriteRepository } from '@app/database/repositories/base-write.repository';
import { Relationship } from '../models/relationship.entity';
import { UserId } from '../models/value-objects/user-id.value-object';
import { RelationshipType } from '../models/value-objects/relationship-type.value-object';

/**
 * Relationship Repository Interface
 *
 * Repository interface for Relationship entity.
 * Follows the repository pattern from Domain-Driven Design.
 */
export interface RelationshipRepository
  extends BaseWriteRepository<Relationship, string> {
  /**
   * Find a relationship between two users
   * @param userId - The user ID
   * @param targetId - The target user ID
   * @returns The relationship or null if not found
   */
  findByUsers(userId: UserId, targetId: UserId): Promise<Relationship | null>;

  /**
   * Find all relationships for a user
   * @param userId - The user ID
   * @param type - Optional relationship type filter
   * @returns Array of relationships
   */
  findAllByUser(
    userId: UserId,
    type?: RelationshipType,
  ): Promise<Relationship[]>;

  /**
   * Check if a relationship exists between two users
   * @param userId - The user ID
   * @param targetId - The target user ID
   * @returns True if the relationship exists, false otherwise
   */
  relationshipExists(userId: UserId, targetId: UserId): Promise<boolean>;
}
