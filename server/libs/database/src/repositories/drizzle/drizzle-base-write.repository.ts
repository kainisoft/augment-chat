import { AbstractBaseWriteRepository } from '../base-write.repository';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { SQL, eq } from 'drizzle-orm';

/**
 * Abstract Drizzle Write Repository
 *
 * Base implementation of the write repository pattern using Drizzle ORM.
 *
 * @typeParam T - The entity type
 * @typeParam TId - The entity ID type
 * @typeParam TTable - The Drizzle table type
 */
export abstract class AbstractDrizzleWriteRepository<
  T,
  TId,
  TTable extends Record<string, any>,
> extends AbstractBaseWriteRepository<T, TId> {
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
      .from(this.table)
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
      .from(this.table);

    if (filter) {
      query.where(filter);
    }

    const result = await query;
    return Number(result[0]?.count || 0);
  }

  /**
   * Save an entity (create or update)
   * @param entity - The entity to save
   */
  async save(entity: T): Promise<void> {
    const id = this.getEntityId(entity);
    const exists = await this.exists(id);

    if (exists) {
      await this.update(id, entity);
    } else {
      await this.create(entity);
    }
  }

  /**
   * Create a new entity
   * @param entity - The entity to create
   * @returns The created entity
   */
  async create(entity: T): Promise<T> {
    const data = this.mapToPersistence(entity);

    const result = await this.drizzle.db
      .insert(this.table)
      .values(data)
      .returning();

    return this.mapToDomain(result[0]);
  }

  /**
   * Update an existing entity
   * @param id - The entity ID
   * @param entity - The entity with updated values
   * @returns The updated entity
   */
  async update(id: TId, entity: Partial<T> | T): Promise<T> {
    const idValue = this.getIdValue(id);
    const data = this.mapToPersistence(entity as T);

    const result = await this.drizzle.db
      .update(this.table)
      .set(data)
      .where(eq(this.idField, idValue))
      .returning();

    return this.mapToDomain(result[0]);
  }

  /**
   * Delete an entity
   * @param id - The entity ID
   */
  async delete(id: TId): Promise<void> {
    const idValue = this.getIdValue(id);

    await this.drizzle.db.delete(this.table).where(eq(this.idField, idValue));
  }

  /**
   * Convert an ID to its database value
   * @param id - The entity ID
   * @returns The database ID value
   */
  protected abstract getIdValue(id: TId): string | number;

  /**
   * Get the ID from an entity
   * @param entity - The entity
   * @returns The entity ID
   */
  protected abstract getEntityId(entity: T): TId;

  /**
   * Map a domain entity to a database record
   * @param entity - The domain entity
   * @returns The database record
   */
  protected abstract mapToPersistence(entity: T): Record<string, any>;

  /**
   * Map a database record to a domain entity
   * @param data - The database record
   * @returns The domain entity
   */
  protected abstract mapToDomain(data: Record<string, any>): T;
}
