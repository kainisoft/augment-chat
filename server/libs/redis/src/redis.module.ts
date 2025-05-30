import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_OPTIONS, REDIS_CLIENT } from './constants/redis.constants';
import { RedisOptions } from './interfaces/redis-options.interface';
import { createRedisClient } from './providers/redis-client.provider';
import { RedisHealthIndicator } from './health/redis-health.indicator';
import { RedisRepositoryFactory } from './repositories/redis-repository.factory';
import { RedisHashRepositoryFactory } from './repositories/redis-hash-repository.factory';

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
        RedisRepositoryFactory,
        RedisHashRepositoryFactory,
      ],
      exports: [
        RedisService,
        RedisHealthIndicator,
        RedisRepositoryFactory,
        RedisHashRepositoryFactory,
      ],
      global: options.isGlobal,
    };
  }

  static registerDefault(
    options: Pick<RedisOptions, 'isGlobal' | 'keyPrefix' | 'password'> = {},
  ): DynamicModule {
    return this.register({
      nodes: [
        {
          host: process.env.REDIS_NODE_1 || 'redis-node-1',
          port: +(process.env.REDIS_NODE_1_PORT || 6379),
        },
        {
          host: process.env.REDIS_NODE_2 || 'redis-node-2',
          port: +(process.env.REDIS_NODE_2_PORT || 6380),
        },
        {
          host: process.env.REDIS_NODE_3 || 'redis-node-3',
          port: +(process.env.REDIS_NODE_3_PORT || 6381),
        },
      ],
      ...options,
    });
  }
}
