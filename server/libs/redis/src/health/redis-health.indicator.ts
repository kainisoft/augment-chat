import { Injectable, Inject, Logger } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { REDIS_CLIENT } from '../constants/redis.constants';
import { Redis, Cluster } from 'ioredis';

@Injectable()
export class RedisHealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis | Cluster,
  ) {}

  /**
   * Check Redis health
   * @param key Health check key
   * @returns Health indicator result
   */
  async check(key: string): Promise<HealthIndicatorResult> {
    try {
      const startTime = Date.now();

      // Ping Redis to check connectivity
      const pingResult = await this.redisClient.ping();
      const responseTime = Date.now() - startTime;

      const isHealthy = pingResult === 'PONG';

      if (isHealthy) {
        return {
          [key]: {
            status: 'up',
            responseTime,
          },
        };
      }

      this.logger.warn(
        `Redis health check failed: Unexpected ping response: ${pingResult}`,
      );
      return {
        [key]: {
          status: 'down',
          responseTime,
          message: 'Unexpected ping response',
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Redis health check failed: ${errorMessage}`);

      return {
        [key]: {
          status: 'down',
          message: errorMessage,
        },
      };
    }
  }
}
