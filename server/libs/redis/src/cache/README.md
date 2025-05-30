# Redis Cache Module

## Overview

The Redis Cache Module provides a standardized approach to caching in our microservices architecture. It offers type-safe caching operations, consistent patterns for cache invalidation, and integration with our logging system.

## Features

- **Type-safe caching**: Use Redis repositories for type-safe caching operations
- **Decorator-based caching**: Use the `@Cache` decorator for method-level caching
- **Cache invalidation**: Standardized patterns for cache invalidation
- **TTL management**: Configurable TTL for cache entries
- **Logging integration**: Comprehensive logging for cache operations
- **Error handling**: Consistent error handling for cache operations

## Installation

The Redis Cache Module is included in the Redis library. To use it, import the `CacheModule` from `@app/redis/cache`:

```typescript
import { CacheModule } from '@app/redis/cache';
```

## Usage

### Module Registration

Register the Cache Module in your application module:

```typescript
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default
      prefix: 'my-service:cache',
      enableLogs: true,
    }),
  ],
})
export class AppModule {}
```

### Using the Cache Decorator

Use the `@Cache` decorator to cache method results:

```typescript
@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_DECORATOR) private readonly Cache: Function,
  ) {}

  // Cache the result of this method for 60 seconds
  @Cache(60, 'users')
  async getUserById(id: string): Promise<User> {
    // This will only be executed on cache miss
    return this.userRepository.findOne(id);
  }
}
```

### Using Redis Repositories

Create type-safe Redis repositories for caching:

```typescript
@Injectable()
export class UserCacheService {
  private readonly userRepository;

  constructor(
    private readonly repositoryFactory: RedisRepositoryFactory,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext(UserCacheService.name);
    this.userRepository = this.repositoryFactory.create<User, string>('user');
  }

  async cacheUser(userId: string, user: User, ttl: number = 3600): Promise<User> {
    try {
      const result = await this.userRepository.save(userId, user, ttl);
      
      this.loggingService.debug(`Cached user: ${userId}`, 'cacheUser', {
        userId,
        ttl,
      });
      
      return result;
    } catch (error) {
      this.loggingService.error(`Failed to cache user: ${userId}`, 'cacheUser', {
        userId,
        error,
      });
      return user; // Return the original user even if caching fails
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findById(userId);
    } catch (error) {
      this.loggingService.error(`Failed to get user from cache: ${userId}`, 'getUser', {
        userId,
        error,
      });
      return null;
    }
  }
}
```

### Cache Invalidation

Use the `CacheInvalidationService` for cache invalidation:

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.update(id, data);

    // Invalidate specific cache key
    await this.cacheInvalidation.invalidateKey(`users:${id}`);

    // Or invalidate all user-related caches
    await this.cacheInvalidation.invalidateByPrefix('users');

    return user;
  }
}
```

## Best Practices

1. **Use Redis repositories for type-safe caching**: This provides better type safety and consistency.
2. **Document cache strategies**: Add comprehensive JSDoc comments to cache methods.
3. **Standardize cache invalidation**: Create consistent patterns for cache invalidation.
4. **Improve error handling**: Use structured logging for cache errors.
5. **Use appropriate TTL values**: Configure TTL based on data volatility.
6. **Consider cache key generation**: Use consistent patterns for cache key generation.
7. **Monitor cache hit rates**: Log cache hits and misses for performance monitoring.
8. **Handle cache failures gracefully**: Always have a fallback when cache operations fail.

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `ttl` | Default TTL in seconds | 60 |
| `prefix` | Cache key prefix | '' |
| `enableLogs` | Whether to log cache operations | false |
| `isGlobal` | Whether to register the module globally | false |

## Related Documentation

- [Redis Module](../README.md)
- [Session Module](../session/README.md)
- [Redis Repository](../repositories/README.md)
