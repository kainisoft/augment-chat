import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { CacheModule as RedisCacheModule } from '@app/redis/cache';
import { UserCacheService } from './user-cache.service';

/**
 * Cache Module
 *
 * Module for caching functionality in the User Service.
 */
@Module({
  imports: [RedisModule, RedisCacheModule],
  providers: [UserCacheService],
  exports: [UserCacheService],
})
export class CacheModule {}
