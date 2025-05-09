import { ClusterOptions, RedisOptions as IoRedisOptions } from 'ioredis';

/**
 * Redis connection node
 */
export interface RedisNode {
  host: string;
  port: number;
}

/**
 * Redis module options
 */
export interface RedisOptions {
  /**
   * Redis cluster nodes
   * If provided, a cluster client will be created
   */
  nodes?: RedisNode[];

  /**
   * Redis cluster options
   * Only used if nodes are provided
   */
  clusterOptions?: ClusterOptions;

  /**
   * Redis host for single node connection
   * Only used if nodes are not provided
   * @default 'localhost'
   */
  host?: string;

  /**
   * Redis port for single node connection
   * Only used if nodes are not provided
   * @default 6379
   */
  port?: number;

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
   * Single node Redis options
   */
  singleNodeOptions?: IoRedisOptions;

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
