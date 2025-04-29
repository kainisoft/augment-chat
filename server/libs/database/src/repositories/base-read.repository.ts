import { AbstractBaseRepository, BaseRepository } from './base.repository';

/**
 * Query Options Interface
 *
 * Options for query operations.
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Base Read Repository Interface
 *
 * Extends the base repository with read operations.
 * Used for query operations in CQRS.
 *
 * @typeParam T - The entity or DTO type
 * @typeParam TId - The entity ID type
 */
export interface BaseReadRepository<T, TId> extends BaseRepository<T, TId> {
  /**
   * Find all entities
   * @param options - Query options
   * @returns Array of entities
   */
  findAll(options?: QueryOptions): Promise<T[]>;

  /**
   * Find entities by a field value
   * @param field - The field name
   * @param value - The field value
   * @param options - Query options
   * @returns Array of matching entities
   */
  findBy(field: string, value: any, options?: QueryOptions): Promise<T[]>;

  /**
   * Search entities by a search term
   * @param term - The search term
   * @param options - Query options
   * @returns Array of matching entities
   */
  search(term: string, options?: QueryOptions): Promise<T[]>;
}

/**
 * Abstract Base Read Repository
 *
 * Abstract implementation of the BaseReadRepository interface.
 * Provides default implementations for some methods.
 *
 * @typeParam T - The entity or DTO type
 * @typeParam TId - The entity ID type
 */
export abstract class AbstractBaseReadRepository<T, TId>
  extends AbstractBaseRepository<T, TId>
  implements BaseReadRepository<T, TId>
{
  /**
   * Find all entities
   * @param options - Query options
   * @returns Array of entities
   */
  abstract findAll(options?: QueryOptions): Promise<T[]>;

  /**
   * Find entities by a field value
   * @param field - The field name
   * @param value - The field value
   * @param options - Query options
   * @returns Array of matching entities
   */
  abstract findBy(
    field: string,
    value: any,
    options?: QueryOptions,
  ): Promise<T[]>;

  /**
   * Search entities by a search term
   * @param term - The search term
   * @param options - Query options
   * @returns Array of matching entities
   */
  abstract search(term: string, options?: QueryOptions): Promise<T[]>;
}
