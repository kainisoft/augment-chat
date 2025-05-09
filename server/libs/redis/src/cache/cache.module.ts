import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import { createCacheDecorator, CacheOptions } from './cache.decorator';
import { CACHE_DECORATOR, CACHE_OPTIONS } from './cache.constants';

/**
 * Cache module options
 */
export interface CacheModuleOptions extends CacheOptions {
  /**
   * Whether to register the module globally
   * @default false
   */
  isGlobal?: boolean;
}

/**
 * Cache Module
 *
 * This module provides caching functionality using Redis.
 */
@Module({})
export class CacheModule {
  /**
   * Register the cache module
   * @param options Cache module options
   * @returns Dynamic module
   */
  static register(options: CacheModuleOptions = {}): DynamicModule {
    const cacheOptionsProvider: Provider = {
      provide: CACHE_OPTIONS,
      useValue: options,
    };

    const cacheDecoratorProvider: Provider = {
      provide: CACHE_DECORATOR,
      useFactory: (redisService: RedisService, options: CacheOptions) => {
        return createCacheDecorator(redisService, options);
      },
      inject: [RedisService, CACHE_OPTIONS],
    };

    return {
      module: CacheModule,
      providers: [
        cacheOptionsProvider,
        cacheDecoratorProvider,
        CacheInvalidationService,
      ],
      exports: [cacheDecoratorProvider, CacheInvalidationService],
      global: options.isGlobal,
    };
  }
}
