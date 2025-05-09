import {
  Redis,
  Cluster,
  ClusterOptions,
  RedisOptions as IoRedisOptions,
} from 'ioredis';
import { Logger } from '@nestjs/common';
import { RedisOptions } from '../interfaces/redis-options.interface';

const logger = new Logger('RedisProvider');

/**
 * Create a Redis client based on the provided options
 * @param options Redis connection options
 * @returns Redis client instance
 */
export function createRedisClient(options: RedisOptions): Redis | Cluster {
  const { nodes, clusterOptions, singleNodeOptions } = options;

  try {
    // Create a cluster client if nodes are provided
    if (nodes && nodes.length > 0) {
      logger.log(`Creating Redis Cluster client with ${nodes.length} nodes`);

      const clusterConfig: ClusterOptions = {
        redisOptions: {
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            logger.log(
              `Retrying Redis connection in ${delay}ms (attempt ${times})`,
            );
            return delay;
          },
          ...singleNodeOptions,
        },
        ...clusterOptions,
      };

      return new Cluster(nodes, clusterConfig);
    }

    // Create a single node client
    logger.log('Creating single Redis client');

    const singleNodeConfig: IoRedisOptions = {
      host: options.host || 'localhost',
      port: options.port || 6379,
      password: options.password,
      db: options.db || 0,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        logger.log(
          `Retrying Redis connection in ${delay}ms (attempt ${times})`,
        );
        return delay;
      },
      ...singleNodeOptions,
    };

    return new Redis(singleNodeConfig);
  } catch (error) {
    logger.error(
      `Failed to create Redis client: ${error.message}`,
      error.stack,
    );
    throw error;
  }
}
