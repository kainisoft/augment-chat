# Redis Implementation Code Examples

This document provides code examples for the Redis cluster implementation in the chat application. These examples demonstrate how to implement the Redis library and integrate it with the microservices.

## Table of Contents
1. [Redis Module Implementation](#redis-module-implementation)
2. [Redis Service Implementation](#redis-service-implementation)
3. [Redis Client Provider](#redis-client-provider)
4. [Redis Options Interface](#redis-options-interface)
5. [Redis Health Indicator](#redis-health-indicator)
6. [Caching Strategies](#caching-strategies)
7. [Service Integration Examples](#service-integration-examples)

## Redis Module Implementation

```typescript
// libs/redis/src/redis.module.ts
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_OPTIONS, REDIS_CLIENT } from './constants/redis.constants';
import { RedisOptions } from './interfaces/redis-options.interface';
import { createRedisClient } from './providers/redis-client.provider';
import { RedisHealthIndicator } from './health/redis-health.indicator';

@Module({})
export class RedisModule {
  /**
   * Register Redis module with options
   * @param options Redis connection options
   * @returns Dynamic module
   */
  static register(options: RedisOptions): DynamicModule {
    const redisOptionsProvider: Provider = {
      provide: REDIS_OPTIONS,
      useValue: options,
    };

    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: createRedisClient,
      inject: [REDIS_OPTIONS],
    };

    return {
      module: RedisModule,
      providers: [
        redisOptionsProvider,
        redisClientProvider,
        RedisService,
        RedisHealthIndicator,
      ],
      exports: [RedisService, RedisHealthIndicator],
      global: options.isGlobal,
    };
  }
}
```

## Redis Service Implementation

```typescript
// libs/redis/src/redis.service.ts
import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { REDIS_CLIENT } from './constants/redis.constants';
import { Redis, Cluster } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis | Cluster,
  ) {
    this.logger.log('Redis service initialized');
  }

  /**
   * Get the Redis client instance
   * @returns Redis client
   */
  getClient(): Redis | Cluster {
    return this.redisClient;
  }

  /**
   * Set a key-value pair in Redis
   * @param key Key
   * @param value Value
   * @param ttl Time to live in seconds (optional)
   * @returns Promise resolving to 'OK' if successful
   */
  async set(key: string, value: string | number | Buffer, ttl?: number): Promise<'OK'> {
    try {
      if (ttl) {
        return await this.redisClient.set(key, value, 'EX', ttl);
      }
      return await this.redisClient.set(key, value);
    } catch (error) {
      this.logger.error(`Error setting key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a value by key from Redis
   * @param key Key
   * @returns Promise resolving to the value or null if not found
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   * @param key Key
   * @returns Promise resolving to the number of keys removed
   */
  async del(key: string | string[]): Promise<number> {
    try {
      return await this.redisClient.del(Array.isArray(key) ? key : [key]);
    } catch (error) {
      this.logger.error(`Error deleting key(s) ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Clean up resources when the module is destroyed
   */
  async onModuleDestroy() {
    try {
      await this.redisClient.quit();
      this.logger.log('Redis client disconnected');
    } catch (error) {
      this.logger.error(`Error disconnecting Redis client: ${error.message}`, error.stack);
    }
  }
}
```

## Redis Client Provider

```typescript
// libs/redis/src/providers/redis-client.provider.ts
import { Redis, Cluster, ClusterOptions, RedisOptions as IoRedisOptions } from 'ioredis';
import { Logger } from '@nestjs/common';
import { RedisOptions } from '../interfaces/redis-options.interface';

const logger = new Logger('RedisProvider');

/**
 * Create a Redis client based on the provided options
 * @param options Redis connection options
 * @returns Redis client instance
 */
export function createRedisClient(options: RedisOptions): Redis | Cluster {
  const { nodes, clusterOptions, singleNodeOptions } = options;

  try {
    // Create a cluster client if nodes are provided
    if (nodes && nodes.length > 0) {
      logger.log(`Creating Redis Cluster client with ${nodes.length} nodes`);
      
      const clusterConfig: ClusterOptions = {
        redisOptions: {
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            logger.log(`Retrying Redis connection in ${delay}ms (attempt ${times})`);
            return delay;
          },
          ...singleNodeOptions,
        },
        ...clusterOptions,
      };
      
      return new Cluster(nodes, clusterConfig);
    }
    
    // Create a single node client
    logger.log('Creating single Redis client');
    
    const singleNodeConfig: IoRedisOptions = {
      host: options.host || 'localhost',
      port: options.port || 6379,
      password: options.password,
      db: options.db || 0,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        logger.log(`Retrying Redis connection in ${delay}ms (attempt ${times})`);
        return delay;
      },
      ...singleNodeOptions,
    };
    
    return new Redis(singleNodeConfig);
  } catch (error) {
    logger.error(`Failed to create Redis client: ${error.message}`, error.stack);
    throw error;
  }
}
```

## Redis Options Interface

```typescript
// libs/redis/src/interfaces/redis-options.interface.ts
import { ClusterOptions, RedisOptions as IoRedisOptions } from 'ioredis';

/**
 * Redis connection node
 */
export interface RedisNode {
  host: string;
  port: number;
}

/**
 * Redis module options
 */
export interface RedisOptions {
  /**
   * Redis cluster nodes
   * If provided, a cluster client will be created
   */
  nodes?: RedisNode[];
  
  /**
   * Redis cluster options
   * Only used if nodes are provided
   */
  clusterOptions?: ClusterOptions;
  
  /**
   * Redis host for single node connection
   * Only used if nodes are not provided
   * @default 'localhost'
   */
  host?: string;
  
  /**
   * Redis port for single node connection
   * Only used if nodes are not provided
   * @default 6379
   */
  port?: number;
  
  /**
   * Redis password
   */
  password?: string;
  
  /**
   * Redis database index
   * @default 0
   */
  db?: number;
  
  /**
   * Single node Redis options
   */
  singleNodeOptions?: IoRedisOptions;
  
  /**
   * Whether to register the module globally
   * @default false
   */
  isGlobal?: boolean;
  
  /**
   * Key prefix for all Redis operations
   */
  keyPrefix?: string;
}
```

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-07-20
- **Last Updated**: 2023-07-20
- **Version**: 1.0.0
