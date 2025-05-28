import {
  Redis,
  Cluster,
  ClusterOptions,
  RedisOptions as IoRedisOptions,
} from 'ioredis';
import { Logger } from '@nestjs/common';
import {
  RedisOptions,
  RedisClusterOptions,
} from '../interfaces/redis-options.interface';

const logger = new Logger('RedisProvider');

/**
 * Type guard to check if options are for Redis cluster
 * @param options Redis connection options
 * @returns True if options are for cluster configuration
 */
function isClusterOptions(
  options: RedisOptions,
): options is RedisClusterOptions {
  return 'nodes' in options && Array.isArray(options.nodes);
}

/**
 * Create a Redis client based on the provided options
 * @param options Redis connection options
 * @returns Redis client instance
 */
export function createRedisClient(options: RedisOptions): Redis | Cluster {
  try {
    // Create a cluster client if nodes are provided
    if (isClusterOptions(options)) {
      logger.log(
        `Creating Redis Cluster client with ${options.nodes.length} nodes`,
      );

      const clusterConfig: ClusterOptions = {
        redisOptions: {
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            logger.log(
              `Retrying Redis connection in ${delay}ms (attempt ${times})`,
            );
            return delay;
          },
          ...options.singleNodeOptions,
        },
        ...options.clusterOptions,
      };

      return new Cluster(options.nodes, clusterConfig);
    }

    // Create a single node client
    logger.log('Creating single Redis client');

    const singleNodeConfig: IoRedisOptions = {
      host: options.host,
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
      ...options.singleNodeOptions,
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
