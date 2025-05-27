import { AbstractBaseRepository } from '../base.repository';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { SQL, eq } from 'drizzle-orm';
import { PgTable, TableConfig } from 'drizzle-orm/pg-core';

/**
 * Abstract Drizzle Base Repository
 *
 * Base implementation of the repository pattern using Drizzle ORM.
 *
 * @typeParam T - The entity type
 * @typeParam TId - The entity ID type
 * @typeParam TTable - The Drizzle table type
 */
export abstract class AbstractDrizzleRepository<
  T,
  TId,
  TTable extends PgTable<TableConfig>,
> extends AbstractBaseRepository<T, TId> {
  /**
   * Constructor
   * @param drizzle - The Drizzle service
   * @param table - The Drizzle table
   * @param idField - The ID field in the table
   */
  constructor(
    protected readonly drizzle: DrizzleService,
    protected readonly table: TTable,
    protected readonly idField: any,
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

    return this.mapToDomain(result[0]);
  }

  /**
   * Count entities matching a filter
   * @param filter - Optional filter condition
   * @returns The count of matching entities
   */
  async count(filter?: SQL<unknown>): Promise<number> {
    const query = this.drizzle.db
      .select({ count: this.drizzle.sql`count(*)` })
      .from(this.table as any);

    if (filter) {
      query.where(filter);
    }

    const result = await query;
    return Number(result[0]?.count || 0);
  }

  /**
   * Convert an ID to its database value
   * @param id - The entity ID
   * @returns The database ID value
   */
  protected abstract getIdValue(id: TId): string | number;

  /**
   * Map a database record to a domain entity
   * @param data - The database record
   * @returns The domain entity
   */
  protected abstract mapToDomain(data: Record<string, any>): T;
}
