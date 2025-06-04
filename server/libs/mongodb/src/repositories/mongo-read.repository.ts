import { ObjectId, Collection, Filter, Document, WithId } from 'mongodb';
import {
  AbstractMongoRepository,
  MongoQueryOptions,
} from './mongo-base.repository';

/**
 * Pagination Result Interface
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Search Options Interface
 */
export interface SearchOptions extends MongoQueryOptions {
  searchFields?: string[];
  caseSensitive?: boolean;
}

/**
 * Abstract MongoDB Read Repository
 *
 * Extends the base repository with read-only operations and search capabilities.
 * Follows the same patterns as our Drizzle-based read repositories.
 *
 * @typeParam T - The entity type
 * @typeParam TId - The entity ID type
 * @typeParam TDocument - The MongoDB document type
 */
export abstract class AbstractMongoReadRepository<
  T,
  TId,
  TDocument extends Document = Document,
> extends AbstractMongoRepository<T, TId, TDocument> {
  /**
   * Constructor
   * @param collection - The MongoDB collection
   * @param collectionName - The name of the collection (for logging)
   * @param searchFields - Default fields to search in when using text search
   */
  constructor(
    collection: Collection<TDocument>,
    collectionName: string,
    protected readonly searchFields: string[] = [],
  ) {
    super(collection, collectionName);
  }

  /**
   * Find entities with pagination
   * @param filter - MongoDB filter
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param options - Additional query options
   * @returns Paginated result
   */
  async findWithPagination(
    filter: Filter<TDocument> = {},
    page: number = 1,
    limit: number = 10,
    options?: MongoQueryOptions,
  ): Promise<PaginationResult<T>> {
    // Ensure page and limit are positive
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit)); // Cap at 100 items per page

    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.collection.countDocuments(filter);

    // Get paginated data
    const findOptions = this.applyQueryOptions({
      ...options,
      skip,
      limit,
    });

    const cursor = this.collection.find(filter, findOptions);
    const documents = await cursor.toArray();

    const data = documents.map((doc) => this.mapToDomain(doc));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Search entities by text
   * @param searchTerm - The search term
   * @param options - Search options
   * @returns Array of matching entities
   */
  async search(searchTerm: string, options?: SearchOptions): Promise<T[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const searchFields = options?.searchFields || this.searchFields;

    if (searchFields.length === 0) {
      throw new Error('No search fields defined for text search');
    }

    // Build text search filter
    const searchConditions = searchFields.map((field) => {
      const regex = options?.caseSensitive
        ? new RegExp(searchTerm, 'g')
        : new RegExp(searchTerm, 'gi');

      return { [field]: { $regex: regex } };
    });

    const filter = { $or: searchConditions } as Filter<TDocument>;

    return this.findBy(filter, options);
  }

  /**
   * Search entities with pagination
   * @param searchTerm - The search term
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param options - Search options
   * @returns Paginated search result
   */
  async searchWithPagination(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
    options?: SearchOptions,
  ): Promise<PaginationResult<T>> {
    if (!searchTerm.trim()) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const searchFields = options?.searchFields || this.searchFields;

    if (searchFields.length === 0) {
      throw new Error('No search fields defined for text search');
    }

    // Build text search filter
    const searchConditions = searchFields.map((field) => {
      const regex = options?.caseSensitive
        ? new RegExp(searchTerm, 'g')
        : new RegExp(searchTerm, 'gi');

      return { [field]: { $regex: regex } };
    });

    const filter = { $or: searchConditions } as Filter<TDocument>;

    return this.findWithPagination(filter, page, limit, options);
  }

  /**
   * Find entities by multiple IDs
   * @param ids - Array of entity IDs
   * @returns Array of found entities
   */
  async findByIds(ids: TId[]): Promise<T[]> {
    if (ids.length === 0) {
      return [];
    }

    const objectIds = ids.map((id) => this.toObjectId(id));

    const filter = { _id: { $in: objectIds } } as Filter<TDocument>;

    return this.findBy(filter);
  }

  /**
   * Find entities within a date range
   * @param field - The date field name
   * @param startDate - Start date
   * @param endDate - End date
   * @param options - Query options
   * @returns Array of entities within the date range
   */
  async findByDateRange(
    field: string,
    startDate: Date,
    endDate: Date,
    options?: MongoQueryOptions,
  ): Promise<T[]> {
    const filter = {
      [field]: {
        $gte: startDate,
        $lte: endDate,
      },
    } as Filter<TDocument>;

    return this.findBy(filter, options);
  }

  /**
   * Find the most recent entities
   * @param field - The date field to sort by
   * @param limit - Number of entities to return
   * @returns Array of most recent entities
   */
  async findRecent(
    field: string = 'createdAt',
    limit: number = 10,
  ): Promise<T[]> {
    const options: MongoQueryOptions = {
      sort: { [field]: -1 },
      limit,
    };

    return this.findAll(options);
  }

  /**
   * Find entities and group by a field
   * @param groupField - The field to group by
   * @param filter - Optional filter
   * @returns Grouped results
   */
  async groupBy(
    groupField: string,
    filter: Filter<TDocument> = {},
  ): Promise<Array<{ _id: any; count: number; items: T[] }>> {
    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: `$${groupField}`,
          count: { $sum: 1 },
          items: { $push: '$$ROOT' },
        },
      },
      { $sort: { count: -1 } },
    ];

    const results = await this.collection.aggregate(pipeline).toArray();

    return results.map((result) => ({
      _id: result._id,
      count: result.count,
      items: result.items.map((item: WithId<TDocument>) =>
        this.mapToDomain(item),
      ),
    }));
  }

  /**
   * Get aggregated statistics
   * @param field - The numeric field to aggregate
   * @param filter - Optional filter
   * @returns Aggregation statistics
   */
  async getStats(
    field: string,
    filter: Filter<TDocument> = {},
  ): Promise<{
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  }> {
    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          sum: { $sum: `$${field}` },
          avg: { $avg: `$${field}` },
          min: { $min: `$${field}` },
          max: { $max: `$${field}` },
        },
      },
    ];

    const results = await this.collection.aggregate(pipeline).toArray();

    if (results.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    }

    const result = results[0];
    return {
      count: result.count || 0,
      sum: result.sum || 0,
      avg: result.avg || 0,
      min: result.min || 0,
      max: result.max || 0,
    };
  }

  /**
   * Check if any entity exists matching the filter
   * @param filter - MongoDB filter
   * @returns True if any entity exists
   */
  async existsBy(filter: Filter<TDocument>): Promise<boolean> {
    const count = await this.collection.countDocuments(filter, { limit: 1 });
    return count > 0;
  }
}
