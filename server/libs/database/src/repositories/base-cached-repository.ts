import { LoggingService, ErrorLoggerService } from '@app/logging';

/**
 * Base Cached Repository
 *
 * Abstract base class that provides standardized cache integration patterns
 * for repositories. This class ensures consistent error handling, logging,
 * and cache invalidation across all repositories that use caching.
 */
export abstract class BaseCachedRepository<TEntity, TId> {
  protected constructor(
    protected readonly loggingService: LoggingService,
    protected readonly errorLogger: ErrorLoggerService,
  ) {}

  /**
   * Execute a cache operation with standardized error handling
   *
   * @param operation - The cache operation to execute
   * @param operationName - Name of the operation for logging
   * @param context - Additional context for logging
   * @param fallbackValue - Value to return if cache operation fails
   * @returns The result of the cache operation or the fallback value
   */
  protected async executeCacheOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    context: Record<string, any> = {},
    fallbackValue: T | null = null,
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Cache operation failed: ${operationName}`,
        {
          source: this.constructor.name,
          method: operationName,
          ...context,
        },
      );
      return fallbackValue;
    }
  }

  /**
   * Execute a database operation with cache integration
   *
   * @param databaseOperation - The database operation to execute
   * @param cacheOperation - Optional cache operation to execute after database operation
   * @param operationName - Name of the operation for logging
   * @param context - Additional context for logging
   * @returns The result of the database operation
   */
  protected async executeWithCache<T>(
    databaseOperation: () => Promise<T>,
    cacheOperation?: (result: T) => Promise<void>,
    operationName: string = 'executeWithCache',
    context: Record<string, any> = {},
  ): Promise<T> {
    try {
      // Execute the database operation
      const result = await databaseOperation();

      // If cache operation is provided and result is not null/undefined, execute it
      if (cacheOperation && result != null) {
        await this.executeCacheOperation(
          () => cacheOperation(result),
          `cache_${operationName}`,
          context,
        );
      }

      return result;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Database operation failed: ${operationName}`,
        {
          source: this.constructor.name,
          method: operationName,
          ...context,
        },
      );
      throw error;
    }
  }

  /**
   * Try to get data from cache first, then fallback to database
   *
   * @param cacheOperation - The cache operation to try first
   * @param databaseOperation - The database operation to fallback to
   * @param cacheAfterDatabase - Optional cache operation to execute after database operation
   * @param operationName - Name of the operation for logging
   * @param context - Additional context for logging
   * @returns The result from cache or database
   */
  protected async getCachedOrFetch<T>(
    cacheOperation: () => Promise<T | null>,
    databaseOperation: () => Promise<T | null>,
    cacheAfterDatabase?: (result: T) => Promise<void>,
    operationName: string = 'getCachedOrFetch',
    context: Record<string, any> = {},
  ): Promise<T | null> {
    // Try cache first
    const cachedResult = await this.executeCacheOperation(
      cacheOperation,
      `cache_get_${operationName}`,
      context,
    );

    if (cachedResult) {
      this.loggingService.debug(
        `Retrieved data from cache: ${operationName}`,
        operationName,
        { ...context, source: 'cache' },
      );
      return cachedResult;
    }

    // Fallback to database
    const databaseResult = await databaseOperation();

    if (databaseResult && cacheAfterDatabase) {
      // Cache the result from database
      await this.executeCacheOperation(
        () => cacheAfterDatabase(databaseResult),
        `cache_set_${operationName}`,
        context,
      );
    }

    if (databaseResult) {
      this.loggingService.debug(
        `Retrieved data from database: ${operationName}`,
        operationName,
        { ...context, source: 'database' },
      );
    }

    return databaseResult;
  }

  /**
   * Execute an update operation with cache invalidation
   *
   * @param updateOperation - The update operation to execute
   * @param invalidateOperation - The cache invalidation operation
   * @param operationName - Name of the operation for logging
   * @param context - Additional context for logging
   * @returns The result of the update operation
   */
  protected async updateWithCacheInvalidation<T>(
    updateOperation: () => Promise<T>,
    invalidateOperation: () => Promise<void>,
    operationName: string = 'updateWithCacheInvalidation',
    context: Record<string, any> = {},
  ): Promise<T> {
    try {
      // Execute the update operation
      const result = await updateOperation();

      // Invalidate cache
      await this.executeCacheOperation(
        invalidateOperation,
        `invalidate_${operationName}`,
        context,
      );

      this.loggingService.debug(
        `Updated data and invalidated cache: ${operationName}`,
        operationName,
        context,
      );

      return result;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Update operation failed: ${operationName}`,
        {
          source: this.constructor.name,
          method: operationName,
          ...context,
        },
      );
      throw error;
    }
  }

  /**
   * Execute a delete operation with cache invalidation
   *
   * @param deleteOperation - The delete operation to execute
   * @param invalidateOperation - The cache invalidation operation
   * @param operationName - Name of the operation for logging
   * @param context - Additional context for logging
   * @returns The result of the delete operation
   */
  protected async deleteWithCacheInvalidation<T>(
    deleteOperation: () => Promise<T>,
    invalidateOperation: () => Promise<void>,
    operationName: string = 'deleteWithCacheInvalidation',
    context: Record<string, any> = {},
  ): Promise<T> {
    try {
      // Execute the delete operation
      const result = await deleteOperation();

      // Invalidate cache
      await this.executeCacheOperation(
        invalidateOperation,
        `invalidate_${operationName}`,
        context,
      );

      this.loggingService.debug(
        `Deleted data and invalidated cache: ${operationName}`,
        operationName,
        context,
      );

      return result;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Delete operation failed: ${operationName}`,
        {
          source: this.constructor.name,
          method: operationName,
          ...context,
        },
      );
      throw error;
    }
  }
}
