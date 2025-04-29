/**
 * Base Repository Interface
 *
 * Generic base repository interface with common methods for both read and write operations.
 * This follows the Repository pattern from Domain-Driven Design.
 *
 * @typeParam T - The entity type
 * @typeParam TId - The entity ID type
 */
export interface BaseRepository<T, TId> {
  /**
   * Find an entity by its ID
   * @param id - The entity ID
   * @returns The entity or null if not found
   */
  findById(id: TId): Promise<T | null>;

  /**
   * Check if an entity exists
   * @param id - The entity ID
   * @returns True if the entity exists, false otherwise
   */
  exists(id: TId): Promise<boolean>;

  /**
   * Count entities matching a filter
   * @param filter - Optional filter criteria
   * @returns The count of matching entities
   */
  count(filter?: any): Promise<number>;
}

/**
 * Abstract Base Repository
 *
 * Abstract implementation of the BaseRepository interface.
 * Provides default implementations for some methods.
 *
 * @typeParam T - The entity type
 * @typeParam TId - The entity ID type
 */
export abstract class AbstractBaseRepository<T, TId>
  implements BaseRepository<T, TId>
{
  /**
   * Find an entity by its ID
   * @param id - The entity ID
   * @returns The entity or null if not found
   */
  abstract findById(id: TId): Promise<T | null>;

  /**
   * Check if an entity exists
   * @param id - The entity ID
   * @returns True if the entity exists, false otherwise
   */
  async exists(id: TId): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  /**
   * Count entities matching a filter
   * @param filter - Optional filter criteria
   * @returns The count of matching entities
   */
  abstract count(filter?: any): Promise<number>;
}
