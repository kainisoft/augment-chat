import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { RedisHashRepository } from './redis-hash.repository';

/**
 * Redis Hash Repository Factory
 *
 * This service provides a factory for creating Redis hash repositories for different entity types.
 */
@Injectable()
export class RedisHashRepositoryFactory {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Create a new Redis hash repository for a specific entity type
   * @param prefix Key prefix for all Redis operations
   * @returns A new Redis hash repository instance
   */
  create<T extends Record<string, any>>(
    prefix: string,
  ): RedisHashRepository<T> {
    return new RedisHashRepository<T>(this.redisService.getClient(), prefix);
  }
}
