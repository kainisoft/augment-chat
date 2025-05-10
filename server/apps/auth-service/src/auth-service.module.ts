import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from '@app/common';
import { LoggingModule, LogLevel } from '@app/logging';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { SessionModule } from '@app/redis/session';
import { CacheModule } from '@app/redis/cache';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import {
  AuthServiceHealthController,
  AuthServiceHealthService,
} from './health/health.controller';
import { RepositoryProviders } from './infrastructure/repositories';
import { TokenService } from './token/token.service';
import { SessionService } from './session/session.service';
import { RateLimitService, RateLimitGuard } from './rate-limit';
import { PermissionCacheService } from './permission/permission-cache.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Import ConfigModule for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Import CommonModule
    CommonModule,

    // Import DatabaseModule for database access
    DatabaseModule.forAuth(),

    // Import AuthModule for authentication endpoints
    AuthModule,

    // Import LoggingModule with Auth Service specific configuration
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
          service: 'auth-service',
          level,
          kafka: {
            brokers: configService
              .get<string>('KAFKA_BROKERS', 'kafka:29092')
              .split(','),
            topic: configService.get<string>('KAFKA_LOGS_TOPIC', 'logs'),
            clientId: 'auth-service',
          },
          console: configService.get<string>('LOG_CONSOLE', 'true') === 'true',
          redactFields: ['password', 'token', 'secret', 'authorization'],
        };
      },
      inject: [ConfigService],
    }),

    // Import Redis Module for Redis connection
    RedisModule.register({
      isGlobal: true,
      // Use environment variables for Redis configuration
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: 'auth:',
    }),

    // Import Session Module for session management
    SessionModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.SESSION_TTL || '3600', 10), // 1 hour default
      prefix: 'auth:session',
      encrypt: process.env.SESSION_ENCRYPT === 'true',
      encryptionKey: process.env.SESSION_ENCRYPTION_KEY,
      enableLogs: process.env.SESSION_LOGS === 'true',
    }),

    // Import Cache Module for caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default
      prefix: 'auth:cache',
      enableLogs: process.env.CACHE_LOGS === 'true',
    }),

    // Import JWT Module for token generation and validation
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'change-me-in-production',
        ),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
  ],
  controllers: [AuthServiceController, AuthServiceHealthController],
  providers: [
    AuthServiceService,
    AuthServiceHealthService,
    ...RepositoryProviders,
    // Add Redis-based services
    TokenService,
    SessionService,
    RateLimitService,
    RateLimitGuard,
    PermissionCacheService,
  ],
})
export class AuthServiceModule {}
