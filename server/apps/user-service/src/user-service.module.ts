import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Shared Libraries
import { CommonModule } from '@app/common';
import { LoggingModule, LogLevel } from '@app/logging';
import { RedisModule } from '@app/redis';
import { CacheModule as RedisCacheModule } from '@app/redis/cache';
import { MetricsModule } from '@app/metrics';

// Service Controllers and Services
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import {
  UserServiceHealthController,
  UserServiceHealthService,
} from './health/health.controller';

// Feature Modules
import { UserGraphQLModule } from './graphql/graphql.module';
import { UserDatabaseModule } from './database/user-database.module';
import { UserCqrsModule } from './user-cqrs.module';
import { CacheModule } from './cache/cache.module';
import { KafkaModule } from './kafka/kafka.module';

/**
 * User Service Module
 *
 * This is the main module for the User Service microservice. It orchestrates
 * all the feature modules and provides the core functionality for user management
 * within the chat application ecosystem.
 *
 * ## Service Overview
 *
 * The User Service is responsible for:
 * - User profile management (creation, updates, deletion)
 * - User search and discovery functionality
 * - User status management (active, inactive, etc.)
 * - GraphQL API for user operations
 * - Event publishing for inter-service communication
 *
 * ## Architecture
 *
 * The service follows a modular architecture with clear separation of concerns:
 *
 * ### Core Infrastructure
 * - **Configuration**: Environment-based configuration management
 * - **Logging**: Structured logging with Kafka integration
 * - **Database**: PostgreSQL with Drizzle ORM
 * - **Caching**: Redis-based caching for performance optimization
 * - **Messaging**: Kafka for event-driven communication
 *
 * ### Feature Modules
 * - **CQRS Module**: Command Query Responsibility Segregation implementation
 * - **GraphQL Module**: GraphQL API endpoints and resolvers
 * - **Cache Module**: Service-specific caching strategies
 * - **Kafka Module**: Event publishing and consumption
 *
 * ## Module Dependencies
 *
 * ### Shared Libraries
 * - `@app/common`: Common utilities and patterns
 * - `@app/logging`: Structured logging infrastructure
 * - `@app/redis`: Redis connection and utilities
 *
 * ### Infrastructure Modules
 * - **ConfigModule**: Environment variable management
 * - **LoggingModule**: Service-specific logging configuration
 * - **RedisModule**: Redis connection with user-specific prefix
 * - **RedisCacheModule**: Cache configuration and management
 *
 * ### Feature Modules
 * - **UserDatabaseModule**: Database connectivity and schema
 * - **UserCqrsModule**: CQRS pattern implementation
 * - **UserGraphQLModule**: GraphQL API implementation
 * - **CacheModule**: User-specific caching strategies
 * - **KafkaModule**: Event communication patterns
 *
 * ## Configuration Strategy
 *
 * The module uses environment-based configuration with sensible defaults:
 * - **Logging**: Configurable log levels with Kafka integration
 * - **Redis**: Service-specific key prefixes for isolation
 * - **Caching**: TTL-based caching with performance optimization
 * - **Database**: Connection pooling and query optimization
 *
 * ## Performance Considerations
 *
 * - **Caching**: Multi-layer caching strategy (Redis + application-level)
 * - **Database**: Read/write repository separation for optimal performance
 * - **Events**: Asynchronous event publishing to prevent blocking
 * - **Connection Pooling**: Efficient resource utilization
 *
 * ## Monitoring and Observability
 *
 * - **Structured Logging**: Consistent log format across all operations
 * - **Health Checks**: Comprehensive health monitoring endpoints
 * - **Metrics**: Performance and business metrics collection
 * - **Tracing**: Request correlation and distributed tracing
 *
 * ## Security
 *
 * - **Input Validation**: Comprehensive validation at API boundaries
 * - **Error Handling**: Secure error responses without information leakage
 * - **Logging**: Sensitive data redaction in logs
 * - **Authentication**: Integration with auth-service for user verification
 *
 * @see {@link UserCqrsModule} for CQRS implementation details
 * @see {@link UserGraphQLModule} for GraphQL API documentation
 * @see {@link CacheModule} for caching strategies
 * @see {@link KafkaModule} for event communication patterns
 */
@Module({
  imports: [
    // Import ConfigModule for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Import CommonModule
    CommonModule,

    // Import UserDatabaseModule for database access
    UserDatabaseModule,

    // Import LoggingModule with User Service specific configuration
    LoggingModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Get log level from environment or use default
        const logLevelStr = configService.get<string>('LOG_LEVEL', 'info');
        // Map string to LogLevel enum
        const level =
          logLevelStr === 'error'
            ? LogLevel.ERROR
            : logLevelStr === 'warn'
              ? LogLevel.WARN
              : logLevelStr === 'debug'
                ? LogLevel.DEBUG
                : logLevelStr === 'verbose'
                  ? LogLevel.VERBOSE
                  : LogLevel.INFO;

        return {
          service: 'user-service',
          level,
          kafka: {
            brokers: configService
              .get<string>('KAFKA_BROKERS', 'kafka:29092')
              .split(','),
            topic: configService.get<string>('KAFKA_LOGS_TOPIC', 'logs'),
            clientId: 'user-service',
          },
          console: configService.get<string>('LOG_CONSOLE', 'true') === 'true',
          redactFields: ['password', 'token', 'secret', 'authorization'],
        };
      },
      inject: [ConfigService],
    }),

    // Import Redis Module for Redis connection
    RedisModule.registerDefault({
      isGlobal: true,
      keyPrefix: 'user:',
    }),

    // Import Cache Module for caching
    RedisCacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default
      prefix: 'user:cache',
      enableLogs: process.env.CACHE_LOGS === 'true',
    }),

    // Import User Cache Module
    CacheModule,

    // Import CQRS Module
    UserCqrsModule,

    // Import GraphQL Module
    UserGraphQLModule,

    // Import Kafka Module for event communication
    KafkaModule,

    // Import MetricsModule for comprehensive monitoring
    MetricsModule.forRoot({
      serviceName: 'User Service',
      enablePerformanceMonitoring: true,
      enableHealthMetrics: true,
      enableBusinessMetrics: true,
      collectionInterval: 60000, // 1 minute
    }),
  ],
  controllers: [
    // Main service controller
    UserServiceController,

    // Health monitoring controller
    UserServiceHealthController,
  ],
  providers: [
    // Core service providers
    UserServiceService,

    // Health monitoring service
    UserServiceHealthService,
  ],
  exports: [
    // Export core services for potential use by other modules
    UserServiceService,
  ],
})
export class UserServiceModule {}
