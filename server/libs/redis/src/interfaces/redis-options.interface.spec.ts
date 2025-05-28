import {
  RedisOptions,
  RedisClusterOptions,
  RedisSingleNodeOptions,
} from './redis-options.interface';

describe('RedisOptions Interface', () => {
  describe('Type Safety Tests', () => {
    it('should accept valid cluster configuration', () => {
      const clusterOptions: RedisOptions = {
        nodes: [
          { host: 'localhost', port: 6379 },
          { host: 'localhost', port: 6380 },
        ],
        password: 'secret',
        isGlobal: true,
      };

      expect(clusterOptions).toBeDefined();
      expect('nodes' in clusterOptions).toBe(true);
    });

    it('should accept valid single-node configuration', () => {
      const singleNodeOptions: RedisOptions = {
        host: 'localhost',
        port: 6379,
        password: 'secret',
        isGlobal: true,
      };

      expect(singleNodeOptions).toBeDefined();
      expect('host' in singleNodeOptions).toBe(true);
    });

    it('should accept single-node configuration with required host only', () => {
      const minimalSingleNodeOptions: RedisOptions = {
        host: 'localhost',
      };

      expect(minimalSingleNodeOptions).toBeDefined();
      expect('host' in minimalSingleNodeOptions).toBe(true);
    });

    it('should accept cluster configuration with required nodes only', () => {
      const minimalClusterOptions: RedisOptions = {
        nodes: [{ host: 'localhost', port: 6379 }],
      };

      expect(minimalClusterOptions).toBeDefined();
      expect('nodes' in minimalClusterOptions).toBe(true);
    });
  });

  describe('RedisClusterOptions Type', () => {
    it('should accept valid cluster options', () => {
      const clusterOptions: RedisClusterOptions = {
        nodes: [
          { host: 'redis-1', port: 6379 },
          { host: 'redis-2', port: 6380 },
          { host: 'redis-3', port: 6381 },
        ],
        clusterOptions: {
          enableReadyCheck: true,
          redisOptions: {
            connectTimeout: 10000,
          },
        },
        password: 'cluster-secret',
        db: 0,
        isGlobal: true,
        keyPrefix: 'app:',
      };

      expect(clusterOptions).toBeDefined();
      expect(clusterOptions.nodes).toHaveLength(3);
    });
  });

  describe('RedisSingleNodeOptions Type', () => {
    it('should accept valid single-node options', () => {
      const singleNodeOptions: RedisSingleNodeOptions = {
        host: 'redis.example.com',
        port: 6379,
        password: 'single-secret',
        db: 1,
        isGlobal: false,
        keyPrefix: 'test:',
        singleNodeOptions: {
          connectTimeout: 10000,
          lazyConnect: true,
        },
      };

      expect(singleNodeOptions).toBeDefined();
      expect(singleNodeOptions.host).toBe('redis.example.com');
    });

    it('should require host property', () => {
      // This test verifies that TypeScript compilation would fail
      // if host is not provided for single-node configuration
      const singleNodeOptions: RedisSingleNodeOptions = {
        host: 'required-host', // This must be present
        password: 'secret',
      };

      expect(singleNodeOptions.host).toBe('required-host');
    });
  });

  describe('Mutual Exclusivity', () => {
    it('should demonstrate cluster options exclude single-node properties', () => {
      const clusterOptions: RedisClusterOptions = {
        nodes: [{ host: 'localhost', port: 6379 }],
        // host: 'localhost', // This would cause TypeScript error
        // port: 6379,        // This would cause TypeScript error
      };

      expect(clusterOptions).toBeDefined();
      expect('nodes' in clusterOptions).toBe(true);
      expect('host' in clusterOptions).toBe(false);
    });

    it('should demonstrate single-node options exclude cluster properties', () => {
      const singleNodeOptions: RedisSingleNodeOptions = {
        host: 'localhost',
        port: 6379,
        // nodes: [],           // This would cause TypeScript error
        // clusterOptions: {},  // This would cause TypeScript error
      };

      expect(singleNodeOptions).toBeDefined();
      expect('host' in singleNodeOptions).toBe(true);
      expect('nodes' in singleNodeOptions).toBe(false);
    });
  });
});
