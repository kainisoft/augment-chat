# Redis Library

This library provides a Redis client for the chat application, supporting both single-node and cluster configurations.

## Features

- **Redis Cluster Support**: Connect to a Redis Cluster for high availability and scalability
- **Connection Pooling**: Efficiently manage Redis connections
- **Type-Safe Interface**: Strongly typed methods for Redis operations
- **Health Checks**: Monitor Redis connectivity and performance
- **Error Handling**: Comprehensive error handling and logging

## Installation

### 1. Install Dependencies

```bash
pnpm add ioredis @types/ioredis
```

### 2. Import the Redis Module

```typescript
import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';

@Module({
  imports: [
    RedisModule.register({
      // Single node configuration
      host: 'localhost',
      port: 6379,

      // OR cluster configuration
      nodes: [
        { host: 'localhost', port: 6379 },
        { host: 'localhost', port: 6380 },
        { host: 'localhost', port: 6381 },
      ],

      // Optional settings
      password: 'password',
      db: 0,
      keyPrefix: 'app:',
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

## Usage

### Basic Operations

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/redis';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async setValue(key: string, value: string): Promise<void> {
    await this.redisService.set(key, value);
  }

  async getValue(key: string): Promise<string | null> {
    return this.redisService.get(key);
  }

  async deleteValue(key: string): Promise<void> {
    await this.redisService.del(key);
  }
}
```

### Health Checks

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@app/redis';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly redisHealthIndicator: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.redisHealthIndicator.check('redis'),
    ]);
  }
}
```

## Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `host` | string | Redis host for single node connection | 'localhost' |
| `port` | number | Redis port for single node connection | 6379 |
| `nodes` | RedisNode[] | Redis cluster nodes | undefined |
| `password` | string | Redis password | undefined |
| `db` | number | Redis database index | 0 |
| `keyPrefix` | string | Key prefix for all Redis operations | undefined |
| `isGlobal` | boolean | Whether to register the module globally | false |
| `clusterOptions` | ClusterOptions | Redis cluster options | undefined |
| `singleNodeOptions` | RedisOptions | Single node Redis options | undefined |

## Advanced Usage

### Using Cache Decorators

```typescript
import { Module, Injectable, Controller, Get } from '@nestjs/common';
import { RedisModule, CacheModule } from '@app/redis';

// Import the Cache decorator from the module
@Module({
  imports: [
    RedisModule.register({
      host: 'localhost',
      port: 6379,
      isGlobal: true,
    }),
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      prefix: 'api',
      enableLogs: true,
      isGlobal: true,
    }),
  ],
})
export class AppModule {}

// Use the Cache decorator in a service
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

### Using Cache Invalidation

```typescript
import { Injectable } from '@nestjs/common';
import { CacheInvalidationService, CacheInvalidationStrategy } from '@app/redis';

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

### Using Distributed Locks

```typescript
import { Injectable } from '@nestjs/common';
import { DistributedLockService } from '@app/redis';

@Injectable()
export class PaymentService {
  constructor(
    private readonly lockService: DistributedLockService,
  ) {}

  async processPayment(orderId: string): Promise<PaymentResult> {
    // Execute with a lock to prevent concurrent processing
    return this.lockService.withLock(
      `payment:${orderId}`,
      async () => {
        // This code is guaranteed to run exclusively
        // No other instance can acquire the same lock
        return this.paymentProcessor.process(orderId);
      },
      { ttl: 60, maxRetries: 5 }
    );
  }
}
```

### Using Redis Repositories

```typescript
import { Injectable } from '@nestjs/common';
import { RedisRepositoryFactory, RedisHashRepositoryFactory } from '@app/redis';

// Define your entity type
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

@Injectable()
export class UserCacheService {
  private readonly userRepository;
  private readonly userPreferencesRepository;

  constructor(
    private readonly repositoryFactory: RedisRepositoryFactory,
    private readonly hashRepositoryFactory: RedisHashRepositoryFactory,
  ) {
    // Create a repository for User entities with 'user' prefix
    this.userRepository = this.repositoryFactory.create<User, string>('user');

    // Create a hash repository for user preferences
    this.userPreferencesRepository = this.hashRepositoryFactory.create<Record<string, any>>('user:preferences');
  }

  // Store a user in Redis
  async cacheUser(user: User, ttl: number = 3600): Promise<User> {
    return this.userRepository.save(user.id, user, ttl);
  }

  // Get a user from Redis
  async getCachedUser(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  // Delete a user from Redis
  async removeCachedUser(userId: string): Promise<boolean> {
    return this.userRepository.delete(userId);
  }

  // Store user preferences as a Redis hash
  async saveUserPreferences(userId: string, preferences: Record<string, any>): Promise<boolean> {
    return this.userPreferencesRepository.setAll(userId, preferences);
  }

  // Get user preferences from Redis
  async getUserPreferences(userId: string): Promise<Record<string, any> | null> {
    return this.userPreferencesRepository.getAll(userId);
  }

  // Update a specific preference
  async updateUserPreference(userId: string, key: string, value: any): Promise<boolean> {
    return this.userPreferencesRepository.setField(userId, key, value);
  }
}
```

### Custom Redis Commands

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/redis';

@Injectable()
export class CustomRedisService {
  constructor(private readonly redisService: RedisService) {}

  async executeCustomCommand(command: string, ...args: any[]): Promise<any> {
    const client = this.redisService.getClient();
    return client.call(command, ...args);
  }
}
```
