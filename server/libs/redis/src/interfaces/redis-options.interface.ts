import { ClusterOptions, RedisOptions as IoRedisOptions } from 'ioredis';

/**
 * Redis connection node
 */
export interface RedisNode {
  host: string;
  port: number;
}

/**
 * Base Redis options shared between cluster and single-node configurations
 */
interface BaseRedisOptions {
  /**
   * Redis password
   */
  password?: string;

  /**
   * Redis database index
   * @default 0
   */
  db?: number;

  /**
   * Whether to register the module globally
   * @default false
   */
  isGlobal?: boolean;

  /**
   * Key prefix for all Redis operations
   */
  keyPrefix?: string;
}

/**
 * Redis cluster configuration options
 * Used when connecting to a Redis cluster
 */
export interface RedisClusterOptions extends BaseRedisOptions {
  /**
   * Redis cluster nodes
   * Required for cluster configuration
   */
  nodes: RedisNode[];

  /**
   * Redis cluster options
   * Additional configuration for cluster connections
   */
  clusterOptions?: ClusterOptions;

  /**
   * Single node Redis options
   * Applied to each node in the cluster
   */
  singleNodeOptions?: IoRedisOptions;

  // Explicitly exclude single-node properties
  host?: never;
  port?: never;
}

/**
 * Redis single-node configuration options
 * Used when connecting to a single Redis instance
 */
export interface RedisSingleNodeOptions extends BaseRedisOptions {
  /**
   * Redis host for single node connection
   * Required for single-node configuration
   * @default 'localhost'
   */
  host: string;

  /**
   * Redis port for single node connection
   * @default 6379
   */
  port?: number;

  /**
   * Single node Redis options
   * Additional configuration for single-node connections
   */
  singleNodeOptions?: IoRedisOptions;

  // Explicitly exclude cluster properties
  nodes?: never;
  clusterOptions?: never;
}

/**
 * Redis module options
 *
 * This type enforces that either cluster configuration (nodes) or
 * single-node configuration (host) must be provided, but not both.
 *
 * @example Cluster configuration
 * ```typescript
 * const clusterOptions: RedisOptions = {
 *   nodes: [
 *     { host: 'localhost', port: 6379 },
 *     { host: 'localhost', port: 6380 },
 *   ],
 *   password: 'secret',
 *   isGlobal: true,
 * };
 * ```
 *
 * @example Single-node configuration
 * ```typescript
 * const singleNodeOptions: RedisOptions = {
 *   host: 'localhost',
 *   port: 6379,
 *   password: 'secret',
 *   isGlobal: true,
 * };
 * ```
 */
export type RedisOptions = RedisClusterOptions | RedisSingleNodeOptions;
