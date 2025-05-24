import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/redis';
import { CacheModule as RedisCacheModule } from '@app/redis/cache';
import { RedisRepositoryFactory } from '@app/redis/repositories/redis-repository.factory';
import { LoggingModule } from '@app/logging';
import { UserCacheService } from './user-cache.service';

/**
 * Cache Module
 *
 * Module for caching services in the User Service.
 * This module provides the UserCacheService for caching user profile data
 * and follows the standardized caching pattern across services.
 */
@Module({
  imports: [RedisModule, RedisCacheModule, LoggingModule, ConfigModule],
  providers: [UserCacheService, RedisRepositoryFactory],
  exports: [RedisModule, RedisCacheModule, UserCacheService],
})
export class CacheModule {}
