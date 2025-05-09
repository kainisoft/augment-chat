import { Injectable, Inject } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { REDIS_CLIENT } from '../constants/redis.constants';
import { Redis, Cluster } from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis | Cluster,
  ) {
    super();
  }

  /**
   * Check Redis health
   * @param key Health check key
   * @returns Health indicator result
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const startTime = Date.now();

      // Ping Redis to check connectivity
      const pingResult = await this.redisClient.ping();
      const responseTime = Date.now() - startTime;

      const isHealthy = pingResult === 'PONG';

      const result = this.getStatus(key, isHealthy, {
        responseTime,
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Redis health check failed', result);
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: error.message,
      });

      throw new HealthCheckError('Redis health check failed', result);
    }
  }
}
