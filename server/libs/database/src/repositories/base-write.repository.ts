import { AbstractBaseRepository, BaseRepository } from './base.repository';

/**
 * Base Write Repository Interface
 *
 * Extends the base repository with write operations.
 * Used for command operations in CQRS.
 *
 * @typeParam T - The entity type
 * @typeParam TId - The entity ID type
 */
export interface BaseWriteRepository<T, TId> extends BaseRepository<T, TId> {
  /**
   * Save an entity (create or update)
   * @param entity - The entity to save
   */
  save(entity: T): Promise<void>;

  /**
   * Delete an entity
   * @param id - The entity ID
   */
  delete(id: TId): Promise<void>;

  /**
   * Create a new entity
   * @param entity - The entity to create
   * @returns The created entity
   */
  create(entity: T): Promise<T>;

  /**
   * Update an existing entity
   * @param id - The entity ID
   * @param entity - The entity with updated values
   * @returns The updated entity
   */
  update(id: TId, entity: Partial<T>): Promise<T>;
}

/**
 * Abstract Base Write Repository
 *
 * Abstract implementation of the BaseWriteRepository interface.
 * Provides default implementations for some methods.
 *
 * @typeParam T - The entity type
 * @typeParam TId - The entity ID type
 */
export abstract class AbstractBaseWriteRepository<T, TId>
  extends AbstractBaseRepository<T, TId>
  implements BaseWriteRepository<T, TId>
{
  /**
   * Save an entity (create or update)
   * @param entity - The entity to save
   */
  abstract save(entity: T): Promise<void>;

  /**
   * Delete an entity
   * @param id - The entity ID
   */
  abstract delete(id: TId): Promise<void>;

  /**
   * Create a new entity
   * @param entity - The entity to create
   * @returns The created entity
   */
  abstract create(entity: T): Promise<T>;

  /**
   * Update an existing entity
   * @param id - The entity ID
   * @param entity - The entity with updated values
   * @returns The updated entity
   */
  abstract update(id: TId, entity: Partial<T>): Promise<T>;
}
