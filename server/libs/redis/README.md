# Redis Library

This library provides a Redis client for the chat application, supporting both single-node and cluster configurations.

## Features

- **Redis Cluster Support**: Connect to a Redis Cluster for high availability and scalability
- **Connection Pooling**: Efficiently manage Redis connections
- **Type-Safe Interface**: Strongly typed methods for Redis operations
- **Health Checks**: Monitor Redis connectivity and performance
- **Error Handling**: Comprehensive error handling and logging

## Installation

### 1. Install Dependencies

```bash
pnpm add ioredis @types/ioredis
```

### 2. Import the Redis Module

```typescript
import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';

@Module({
  imports: [
    RedisModule.register({
      // Single node configuration
      host: 'localhost',
      port: 6379,
      
      // OR cluster configuration
      nodes: [
        { host: 'localhost', port: 6379 },
        { host: 'localhost', port: 6380 },
        { host: 'localhost', port: 6381 },
      ],
      
      // Optional settings
      password: 'password',
      db: 0,
      keyPrefix: 'app:',
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

## Usage

### Basic Operations

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/redis';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async setValue(key: string, value: string): Promise<void> {
    await this.redisService.set(key, value);
  }

  async getValue(key: string): Promise<string | null> {
    return this.redisService.get(key);
  }

  async deleteValue(key: string): Promise<void> {
    await this.redisService.del(key);
  }
}
```

### Health Checks

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@app/redis';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly redisHealthIndicator: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.redisHealthIndicator.isHealthy('redis'),
    ]);
  }
}
```

## Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `host` | string | Redis host for single node connection | 'localhost' |
| `port` | number | Redis port for single node connection | 6379 |
| `nodes` | RedisNode[] | Redis cluster nodes | undefined |
| `password` | string | Redis password | undefined |
| `db` | number | Redis database index | 0 |
| `keyPrefix` | string | Key prefix for all Redis operations | undefined |
| `isGlobal` | boolean | Whether to register the module globally | false |
| `clusterOptions` | ClusterOptions | Redis cluster options | undefined |
| `singleNodeOptions` | RedisOptions | Single node Redis options | undefined |

## Advanced Usage

### Custom Redis Commands

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/redis';

@Injectable()
export class CustomRedisService {
  constructor(private readonly redisService: RedisService) {}

  async executeCustomCommand(command: string, ...args: any[]): Promise<any> {
    const client = this.redisService.getClient();
    return client.call(command, ...args);
  }
}
```
