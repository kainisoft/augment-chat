import {
  BaseReadRepository,
  QueryOptions,
} from '@app/database/repositories/base-read.repository';
import { RelationshipReadModel } from '../read-models/relationship.read-model';

/**
 * Relationship Read Repository Interface
 *
 * Repository interface for reading relationship data.
 * Used for query operations in CQRS.
 */
export interface RelationshipReadRepository
  extends BaseReadRepository<RelationshipReadModel, string> {
  /**
   * Find a relationship between two users
   * @param userId - The user ID
   * @param targetId - The target user ID
   * @returns The relationship or null if not found
   */
  findByUsers(
    userId: string,
    targetId: string,
  ): Promise<RelationshipReadModel | null>;

  /**
   * Find all relationships for a user
   * @param userId - The user ID
   * @param type - Optional relationship type filter
   * @param options - Query options
   * @returns Array of relationships
   */
  findAllByUser(
    userId: string,
    type?: string,
    options?: QueryOptions,
  ): Promise<RelationshipReadModel[]>;

  /**
   * Find all relationships where the user is the target
   * @param targetId - The target user ID
   * @param type - Optional relationship type filter
   * @param options - Query options
   * @returns Array of relationships
   */
  findAllByTarget(
    targetId: string,
    type?: string,
    options?: QueryOptions,
  ): Promise<RelationshipReadModel[]>;

  /**
   * Find all friends of a user (accepted friend relationships)
   * @param userId - The user ID
   * @param options - Query options
   * @returns Array of relationships
   */
  findAllFriends(
    userId: string,
    options?: QueryOptions,
  ): Promise<RelationshipReadModel[]>;

  /**
   * Find all blocked users by a user
   * @param userId - The user ID
   * @param options - Query options
   * @returns Array of relationships
   */
  findAllBlocked(
    userId: string,
    options?: QueryOptions,
  ): Promise<RelationshipReadModel[]>;

  /**
   * Find all pending friend requests for a user
   * @param userId - The user ID
   * @param options - Query options
   * @returns Array of relationships
   */
  findAllPendingRequests(
    userId: string,
    options?: QueryOptions,
  ): Promise<RelationshipReadModel[]>;
}
