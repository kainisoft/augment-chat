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

### Using Session Management

```typescript
import { Module, Injectable } from '@nestjs/common';
import { RedisModule, SessionModule, RedisSessionStore } from '@app/redis';

// Import the session module
@Module({
  imports: [
    RedisModule.register({
      host: 'localhost',
      port: 6379,
      isGlobal: true,
    }),
    SessionModule.register({
      ttl: 3600, // 1 hour
      prefix: 'app:session',
      encrypt: true,
      encryptionKey: process.env.SESSION_ENCRYPTION_KEY,
      isGlobal: true,
    }),
  ],
})
export class AppModule {}

// Use the session store in a service
@Injectable()
export class AuthService {
  constructor(
    private readonly sessionStore: RedisSessionStore,
  ) {}

  async login(userId: string, userData: any): Promise<string> {
    // Create a new session
    const sessionId = await this.sessionStore.create({
      userId,
      data: {
        ...userData,
        roles: ['user'],
        permissions: ['read', 'write'],
      },
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    return sessionId;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    // Get session data
    const session = await this.sessionStore.get(sessionId);

    if (!session) {
      return false;
    }

    // Check if user is still active
    const isActive = await this.userService.isActive(session.userId);

    if (!isActive) {
      // Delete the session if user is not active
      await this.sessionStore.delete(sessionId);
      return false;
    }

    return true;
  }

  async logout(sessionId: string): Promise<boolean> {
    // Delete the session
    return this.sessionStore.delete(sessionId);
  }

  async logoutAll(userId: string): Promise<number> {
    // Delete all sessions for a user
    return this.sessionStore.deleteByUserId(userId);
  }
}
```

### Using Pub/Sub for Real-time Communication

```typescript
import { Module, Injectable } from '@nestjs/common';
import {
  RedisModule,
  PubSubModule,
  RedisEventPublisher,
  RedisEventSubscriber,
  BaseEvent,
  Event
} from '@app/redis';

// Define typed events
@Event({ type: 'message.created' })
class MessageCreatedEvent implements BaseEvent {
  type: string;
  timestamp: number;

  constructor(
    public readonly messageId: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly content: string,
  ) {
    this.timestamp = Date.now();
  }
}

@Event({ type: 'user.status.changed' })
class UserStatusChangedEvent implements BaseEvent {
  type: string;
  timestamp: number;

  constructor(
    public readonly userId: string,
    public readonly status: 'online' | 'offline' | 'away',
    public readonly lastSeen?: number,
  ) {
    this.timestamp = Date.now();
  }
}

// Import the PubSub module
@Module({
  imports: [
    RedisModule.register({
      host: 'localhost',
      port: 6379,
      isGlobal: true,
    }),
    PubSubModule.register({
      publisher: {
        channelPrefix: 'chat',
        enableLogs: true,
      },
      subscriber: {
        channelPrefix: 'chat',
        enableLogs: true,
        maxRetries: 3,
      },
      isGlobal: true,
    }),
  ],
})
export class AppModule {}

// Publisher service
@Injectable()
export class ChatService {
  constructor(
    private readonly eventPublisher: RedisEventPublisher,
  ) {}

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<string> {
    // Save message to database
    const messageId = await this.messageRepository.create({
      conversationId,
      senderId,
      content,
    });

    // Publish message created event
    await this.eventPublisher.publish(
      `conversation.${conversationId}`,
      new MessageCreatedEvent(messageId, conversationId, senderId, content),
    );

    return messageId;
  }

  async updateUserStatus(userId: string, status: 'online' | 'offline' | 'away'): Promise<void> {
    // Update user status in database
    await this.userRepository.updateStatus(userId, status);

    // Publish user status changed event
    await this.eventPublisher.publish(
      'user.status',
      new UserStatusChangedEvent(userId, status, Date.now()),
    );
  }
}

// Subscriber service
@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private readonly eventSubscriber: RedisEventSubscriber,
  ) {}

  async onModuleInit() {
    // Subscribe to all conversation channels
    await this.eventSubscriber.psubscribe<MessageCreatedEvent>(
      'conversation.*',
      this.handleMessageCreated.bind(this),
    );

    // Subscribe to user status channel
    await this.eventSubscriber.subscribe<UserStatusChangedEvent>(
      'user.status',
      this.handleUserStatusChanged.bind(this),
    );
  }

  private async handleMessageCreated(event: MessageCreatedEvent): Promise<void> {
    // Get conversation participants
    const participants = await this.conversationRepository.getParticipants(event.conversationId);

    // Send notifications to all participants except the sender
    for (const userId of participants) {
      if (userId !== event.senderId) {
        await this.sendNotification(userId, {
          type: 'new_message',
          title: 'New Message',
          body: `You have a new message in conversation ${event.conversationId}`,
          data: {
            messageId: event.messageId,
            conversationId: event.conversationId,
            senderId: event.senderId,
          },
        });
      }
    }
  }

  private async handleUserStatusChanged(event: UserStatusChangedEvent): Promise<void> {
    // Update user status in cache
    await this.userStatusCache.set(event.userId, event.status);

    // Notify friends about status change
    const friends = await this.userRepository.getFriends(event.userId);

    for (const friendId of friends) {
      await this.sendStatusUpdate(friendId, {
        userId: event.userId,
        status: event.status,
        lastSeen: event.lastSeen,
      });
    }
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
