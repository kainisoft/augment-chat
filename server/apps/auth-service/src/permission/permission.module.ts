import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/redis';
import { CacheModule as RedisCacheModule } from '@app/redis/cache';
import { RedisRepositoryFactory } from '@app/redis/repositories/redis-repository.factory';
import { LoggingModule } from '@app/logging';
import { PermissionCacheService } from './permission-cache.service';

/**
 * Permission Module
 *
 * Module for permission-related services in the Auth Service.
 * This module provides the PermissionCacheService for caching user permissions
 * and follows the standardized caching pattern across services.
 */
@Module({
  imports: [RedisModule, RedisCacheModule, LoggingModule, ConfigModule],
  providers: [PermissionCacheService, RedisRepositoryFactory],
  exports: [PermissionCacheService],
})
export class PermissionModule {}
