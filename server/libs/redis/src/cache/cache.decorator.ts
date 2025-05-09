import { Logger } from '@nestjs/common';
import { RedisService } from '../redis.service';

/**
 * Cache options for the @Cache decorator
 */
export interface CacheOptions {
  /**
   * TTL in seconds
   * @default 60
   */
  ttl?: number;

  /**
   * Cache key prefix
   * @default ''
   */
  prefix?: string;

  /**
   * Function to generate the cache key
   * If not provided, the key will be generated from the method name and arguments
   * @param args Method arguments
   * @returns Cache key
   */
  keyGenerator?: (...args: any[]) => string;

  /**
   * Whether to use JSON.stringify for serialization
   * @default true
   */
  useJsonStringify?: boolean;

  /**
   * Whether to log cache hits and misses
   * @default false
   */
  enableLogs?: boolean;
}

/**
 * Default cache options
 */
const defaultCacheOptions: CacheOptions = {
  ttl: 60,
  prefix: '',
  useJsonStringify: true,
  enableLogs: false,
};

/**
 * Cache decorator factory
 * @param redisService Redis service
 * @param options Cache options
 * @returns Method decorator
 */
export function createCacheDecorator(
  redisService: RedisService,
  options: CacheOptions = {},
) {
  const logger = new Logger('CacheDecorator');
  const mergedOptions = { ...defaultCacheOptions, ...options };

  /**
   * Cache decorator
   * @param ttl TTL in seconds (overrides the default)
   * @param keyPrefix Key prefix (overrides the default)
   * @returns Method decorator
   */
  return function Cache(ttl?: number, keyPrefix?: string) {
    const methodOptions = {
      ...mergedOptions,
      ttl: ttl ?? mergedOptions.ttl,
      prefix: keyPrefix ?? mergedOptions.prefix,
    };

    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        // Generate cache key
        const cacheKey = getCacheKey(
          methodOptions,
          target.constructor.name,
          propertyKey,
          args,
        );

        try {
          // Try to get from cache
          const cachedValue = await redisService.get(cacheKey);

          if (cachedValue) {
            // Cache hit
            if (methodOptions.enableLogs) {
              logger.log(`Cache hit: ${cacheKey}`);
            }

            return deserializeValue(cachedValue, methodOptions);
          }

          // Cache miss, execute original method
          if (methodOptions.enableLogs) {
            logger.log(`Cache miss: ${cacheKey}`);
          }

          const result = await originalMethod.apply(this, args);

          // Cache the result
          if (result !== undefined && result !== null) {
            const serializedValue = serializeValue(result, methodOptions);
            await redisService.set(
              cacheKey,
              serializedValue,
              methodOptions.ttl,
            );

            if (methodOptions.enableLogs) {
              logger.log(`Cached: ${cacheKey} (TTL: ${methodOptions.ttl}s)`);
            }
          }

          return result;
        } catch (error: unknown) {
          // In case of error, fall back to the original method
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          logger.error(`Cache error for ${cacheKey}: ${errorMessage}`);

          return originalMethod.apply(this, args);
        }
      };

      return descriptor;
    };
  };
}

/**
 * Generate a cache key from method name and arguments
 * @param options Cache options
 * @param className Class name
 * @param methodName Method name
 * @param args Method arguments
 * @returns Cache key
 */
function getCacheKey(
  options: CacheOptions,
  className: string,
  methodName: string,
  args: any[],
): string {
  if (options.keyGenerator) {
    return `${options.prefix}:${options.keyGenerator(...args)}`;
  }

  // Default key generation strategy
  const argsHash = args.length > 0 ? hashArguments(args) : '';

  return `${options.prefix}:${className}:${methodName}${argsHash ? `:${argsHash}` : ''}`;
}

/**
 * Create a hash from method arguments
 * @param args Method arguments
 * @returns Arguments hash
 */
function hashArguments(args: any[]): string {
  try {
    return JSON.stringify(args)
      .replace(/[{}"\\]/g, '')
      .replace(/[,:]/g, '_')
      .substring(0, 64);
  } catch {
    // If JSON.stringify fails, use a simpler approach
    return args
      .map((arg) => String(arg))
      .join('_')
      .substring(0, 64);
  }
}

/**
 * Serialize a value for caching
 * @param value Value to serialize
 * @param options Cache options
 * @returns Serialized value
 */
function serializeValue(value: any, options: CacheOptions): string {
  if (options.useJsonStringify) {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Deserialize a cached value
 * @param cachedValue Cached value
 * @param options Cache options
 * @returns Deserialized value
 */
function deserializeValue(cachedValue: string, options: CacheOptions): any {
  if (options.useJsonStringify) {
    try {
      return JSON.parse(cachedValue);
    } catch {
      return cachedValue;
    }
  }

  return cachedValue;
}
