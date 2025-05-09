import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { AbstractRedisRepository } from './abstract-redis.repository';

/**
 * Generic Redis Repository Implementation
 *
 * This class extends the AbstractRedisRepository and provides a concrete implementation
 * for storing and retrieving entities in Redis.
 */
class GenericRedisRepository<T, ID> extends AbstractRedisRepository<T, ID> {}

/**
 * Redis Repository Factory
 *
 * This service provides a factory for creating Redis repositories for different entity types.
 */
@Injectable()
export class RedisRepositoryFactory {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Create a new Redis repository for a specific entity type
   * @param prefix Key prefix for all Redis operations
   * @returns A new Redis repository instance
   */
  create<T, ID>(prefix: string): AbstractRedisRepository<T, ID> {
    return new GenericRedisRepository<T, ID>(
      this.redisService.getClient(),
      prefix,
    );
  }
}
