import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { LoggingModule, LogLevel } from '@app/logging';
import { RedisModule } from '@app/redis';
import { CacheModule as RedisCacheModule } from '@app/redis/cache';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import {
  UserServiceHealthController,
  UserServiceHealthService,
} from './health/health.controller';
import { UserGraphQLModule } from './graphql/graphql.module';
import { UserDatabaseModule } from './database/user-database.module';
import { UserCqrsModule } from './user-cqrs.module';
import { CacheModule } from './cache/cache.module';
import { KafkaModule } from './kafka/kafka.module';

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
  ],
  controllers: [UserServiceController, UserServiceHealthController],
  providers: [UserServiceService, UserServiceHealthService],
})
export class UserServiceModule {}
