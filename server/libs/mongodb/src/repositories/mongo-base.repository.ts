import {
  ObjectId,
  Collection,
  Filter,
  FindOptions,
  Document,
  WithId,
} from 'mongodb';

/**
 * Query Options for MongoDB operations
 */
export interface MongoQueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 1 | 0>;
}

/**
 * Abstract MongoDB Base Repository
 *
 * Base implementation of the repository pattern using native MongoDB driver.
 * Follows the same patterns as our Drizzle-based repositories for consistency.
 *
 * @typeParam T - The entity type
 * @typeParam TId - The entity ID type
 * @typeParam TDocument - The MongoDB document type
 */
export abstract class AbstractMongoRepository<
  T,
  TId,
  TDocument extends Document = Document,
> {
  /**
   * Constructor
   * @param collection - The MongoDB collection
   * @param collectionName - The name of the collection (for logging)
   */
  constructor(
    protected readonly collection: Collection<TDocument>,
    protected readonly collectionName: string,
  ) {}

  /**
   * Map a MongoDB document to a domain entity
   * @param document - The MongoDB document
   * @returns The domain entity
   */
  abstract mapToDomain(document: WithId<TDocument>): T;

  /**
   * Map a domain entity to a MongoDB document
   * @param entity - The domain entity
   * @returns The MongoDB document
   */
  abstract mapToPersistence(entity: T): Omit<TDocument, '_id'>;

  /**
   * Get the entity ID from an entity
   * @param entity - The entity
   * @returns The entity ID
   */
  abstract getEntityId(entity: T): TId;

  /**
   * Convert an ID to ObjectId if needed
   * @param id - The ID value
   * @returns ObjectId or the original value
   */
  protected toObjectId(id: TId): ObjectId | TId {
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      return new ObjectId(id);
    }
    return id;
  }

  /**
   * Convert ObjectId to string if needed
   * @param id - The ObjectId or string
   * @returns String representation
   */
  protected fromObjectId(id: ObjectId | string): string {
    return id instanceof ObjectId ? id.toString() : id;
  }

  /**
   * Check if an entity exists by ID
   * @param id - The entity ID
   * @returns True if the entity exists
   */
  async exists(id: TId): Promise<boolean> {
    const objectId = this.toObjectId(id);
    const count = await this.collection.countDocuments({
      _id: objectId,
    } as Filter<TDocument>);
    return count > 0;
  }

  /**
   * Find an entity by its ID
   * @param id - The entity ID
   * @returns The entity or null if not found
   */
  async findById(id: TId): Promise<T | null> {
    const objectId = this.toObjectId(id);
    const document = await this.collection.findOne({
      _id: objectId,
    } as Filter<TDocument>);

    if (!document) {
      return null;
    }

    return this.mapToDomain(document);
  }

  /**
   * Find all entities
   * @param options - Query options
   * @returns Array of entities
   */
  async findAll(options?: MongoQueryOptions): Promise<T[]> {
    const findOptions: FindOptions<TDocument> = {};

    if (options?.limit) findOptions.limit = options.limit;
    if (options?.skip) findOptions.skip = options.skip;
    if (options?.sort) findOptions.sort = options.sort;
    if (options?.projection) findOptions.projection = options.projection;

    const cursor = this.collection.find({}, findOptions);
    const documents = await cursor.toArray();

    return documents.map((doc) => this.mapToDomain(doc));
  }

  /**
   * Find entities by filter
   * @param filter - MongoDB filter
   * @param options - Query options
   * @returns Array of matching entities
   */
  async findBy(
    filter: Filter<TDocument>,
    options?: MongoQueryOptions,
  ): Promise<T[]> {
    const findOptions: FindOptions<TDocument> = {};

    if (options?.limit) findOptions.limit = options.limit;
    if (options?.skip) findOptions.skip = options.skip;
    if (options?.sort) findOptions.sort = options.sort;
    if (options?.projection) findOptions.projection = options.projection;

    const cursor = this.collection.find(filter, findOptions);
    const documents = await cursor.toArray();

    return documents.map((doc) => this.mapToDomain(doc));
  }

  /**
   * Find one entity by filter
   * @param filter - MongoDB filter
   * @returns The entity or null if not found
   */
  async findOne(filter: Filter<TDocument>): Promise<T | null> {
    const document = await this.collection.findOne(filter);

    if (!document) {
      return null;
    }

    return this.mapToDomain(document);
  }

  /**
   * Count entities matching a filter
   * @param filter - Optional filter condition
   * @returns The count of matching entities
   */
  async count(filter?: Filter<TDocument>): Promise<number> {
    return await this.collection.countDocuments(filter || {});
  }

  /**
   * Apply query options to a MongoDB find operation
   * @param options - Query options
   * @returns MongoDB find options
   */
  protected applyQueryOptions(
    options?: MongoQueryOptions,
  ): FindOptions<TDocument> {
    const findOptions: FindOptions<TDocument> = {};

    if (options?.limit) findOptions.limit = options.limit;
    if (options?.skip) findOptions.skip = options.skip;
    if (options?.sort) findOptions.sort = options.sort;
    if (options?.projection) findOptions.projection = options.projection;

    return findOptions;
  }
}
