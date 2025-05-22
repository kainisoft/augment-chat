import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { LoggingModule } from '@app/logging';
import { UserCacheService } from './user-cache.service';

/**
 * Cache Module
 *
 * Module for caching services.
 */
@Module({
  imports: [RedisModule, LoggingModule],
  providers: [UserCacheService],
  exports: [RedisModule, UserCacheService],
})
export class CacheModule {}
