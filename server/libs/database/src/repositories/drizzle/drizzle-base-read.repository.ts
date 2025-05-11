import { AbstractBaseReadRepository } from '../base-read.repository';
import { QueryOptions } from '../base-read.repository';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { SQL, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

/**
 * Abstract Drizzle Read Repository
 *
 * Base implementation of the read repository pattern using Drizzle ORM.
 *
 * @typeParam T - The entity or DTO type
 * @typeParam TId - The entity ID type
 * @typeParam TTable - The Drizzle table type
 */
export abstract class AbstractDrizzleReadRepository<
  T,
  TId,
  TTable extends Record<string, any>,
> extends AbstractBaseReadRepository<T, TId> {
  /**
   * Constructor
   * @param drizzle - The Drizzle service
   * @param table - The Drizzle table
   * @param idField - The ID field in the table
   * @param searchFields - Fields to search in when using the search method
   */
  constructor(
    protected readonly drizzle: DrizzleService,
    protected readonly table: TTable,
    protected readonly idField: any,
    protected readonly searchFields: any[] = [],
  ) {
    super();
  }

  /**
   * Find an entity by its ID
   * @param id - The entity ID
   * @returns The entity or null if not found
   */
  async findById(id: TId): Promise<T | null> {
    const idValue = this.getIdValue(id);

    const result = await this.drizzle.db
      .select()
      .from(this.table as any)
      .where(eq(this.idField, idValue))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDto(result[0]);
  }

  /**
   * Find all entities
   * @param options - Query options
   * @returns Array of entities
   */
  async findAll(options?: QueryOptions): Promise<T[]> {
    const query = this.drizzle.db.select().from(this.table);

    this.applyQueryOptions(query, options);

    const result = await query;
    return result.map((item) => this.mapToDto(item));
  }

  /**
   * Find entities by a field value
   * @param field - The field name
   * @param value - The field value
   * @param options - Query options
   * @returns Array of matching entities
   */
  async findBy(
    field: string,
    value: any,
    options?: QueryOptions,
  ): Promise<T[]> {
    const query = this.drizzle.db
      .select()
      .from(this.table as any)
      .where(eq(this.table[field], value));

    this.applyQueryOptions(query, options);

    const result = await query;
    return result.map((item) => this.mapToDto(item));
  }

  /**
   * Search entities by a search term
   * @param term - The search term
   * @param options - Query options
   * @returns Array of matching entities
   */
  async search(term: string, options?: QueryOptions): Promise<T[]> {
    if (!this.searchFields.length) {
      throw new Error('No search fields defined');
    }

    const searchConditions = this.searchFields.map((field) =>
      ilike(field, `%${term}%`),
    );

    const query = this.drizzle.db
      .select()
      .from(this.table as any)
      .where(or(...searchConditions));

    this.applyQueryOptions(query, options);

    const result = await query;
    return result.map((item) => this.mapToDto(item));
  }

  /**
   * Count entities matching a filter
   * @param filter - Optional filter condition
   * @returns The count of matching entities
   */
  async count(filter?: SQL<unknown>): Promise<number> {
    const query = this.drizzle.db
      .select({ count: sql`count(*)` })
      .from(this.table as any);

    if (filter) {
      query.where(filter);
    }

    const result = await query;
    return Number(result[0]?.count || 0);
  }

  /**
   * Apply query options to a query
   * @param query - The query to modify
   * @param options - The query options
   */
  protected applyQueryOptions(query: any, options?: QueryOptions): void {
    if (!options) return;

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    if (options.orderBy) {
      const direction = options.orderDirection === 'desc' ? desc : asc;
      query.orderBy(direction(this.table[options.orderBy]));
    }
  }

  /**
   * Convert an ID to its database value
   * @param id - The entity ID
   * @returns The database ID value
   */
  protected abstract getIdValue(id: TId): string | number;

  /**
   * Map a database record to a DTO
   * @param data - The database record
   * @returns The DTO
   */
  protected abstract mapToDto(data: Record<string, any>): T;
}
