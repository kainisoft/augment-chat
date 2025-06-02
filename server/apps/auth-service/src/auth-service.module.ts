import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Shared Libraries
import { CommonModule } from '@app/common';
import { LoggingModule, LogLevel } from '@app/logging';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { SessionModule as RedisSessionModule } from '@app/redis/session';
import { CacheModule as RedisCacheModule } from '@app/redis/cache';
import { SecurityModule } from '@app/security';

// Service Controllers and Services
import {
  AuthServiceHealthController,
  AuthServiceHealthService,
} from './health/health.controller';

// Infrastructure Modules
import { RepositoryModule } from './infrastructure/repositories/repository.module';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { PresentationModule } from './presentation/presentation.module';
import { CacheModule } from './cache/cache.module';
import { KafkaModule } from './kafka/kafka.module';
import { TokenModule } from './token/token.module';
import { SessionModule } from './session/session.module';
import { PermissionModule } from './permission/permission.module';
import { AccountLockoutModule } from './domain/services/account-lockout.module';

/**
 * Auth Service Module
 *
 * This is the main module for the Auth Service microservice. It orchestrates
 * all authentication and authorization functionality within the chat application
 * ecosystem, providing secure user authentication, session management, and
 * access control mechanisms.
 *
 * ## Service Overview
 *
 * The Auth Service is responsible for:
 * - User authentication (login, logout, token validation)
 * - Session management and refresh token handling
 * - Password management (reset, change, validation)
 * - Account security (lockout, rate limiting, 2FA)
 * - Permission and role-based access control
 * - Security event logging and monitoring
 * - Integration with other services for user verification
 *
 * ## Architecture
 *
 * The service follows a modular architecture with clear separation of concerns:
 *
 * ### Core Infrastructure
 * - **Configuration**: Environment-based configuration management
 * - **Logging**: Structured logging with security event tracking
 * - **Database**: PostgreSQL with Drizzle ORM for user credentials
 * - **Caching**: Redis-based caching for sessions and tokens
 * - **Messaging**: Kafka for authentication event publishing
 *
 * ### Security Infrastructure
 * - **IAM Module**: Identity and Access Management with JWT
 * - **Session Management**: Redis-based session storage with encryption
 * - **Rate Limiting**: Protection against brute force attacks
 * - **Account Lockout**: Automatic account protection mechanisms
 * - **Permission System**: Role-based access control
 *
 * ### Feature Modules
 * - **Auth Module**: Core authentication logic and endpoints
 * - **Token Module**: JWT and refresh token management
 * - **Session Module**: User session lifecycle management
 * - **Presentation Module**: REST API endpoints and validation
 * - **Cache Module**: Service-specific caching strategies
 * - **Kafka Module**: Security event publishing and consumption
 *
 * ## Module Dependencies
 *
 * ### Shared Libraries
 * - `@app/common`: Common utilities and patterns
 * - `@app/logging`: Structured logging infrastructure
 * - `@app/database`: Database connectivity and ORM
 * - `@app/redis`: Redis connection and utilities
 * - `@app/iam`: Identity and Access Management framework
 *
 * ### Infrastructure Modules
 * - **ConfigModule**: Environment variable management
 * - **LoggingModule**: Service-specific logging with security focus
 * - **DatabaseModule**: Database connectivity for auth data
 * - **RedisModule**: Redis connection with auth-specific prefix
 * - **RedisSessionModule**: Session storage and management
 * - **RedisCacheModule**: Cache configuration and management
 * - **SecurityModule**: JWT and authentication framework
 *
 * ### Feature Modules
 * - **AuthModule**: Core authentication functionality
 * - **PresentationModule**: REST API layer
 * - **RepositoryModule**: Data access layer
 * - **TokenModule**: Token management and validation
 * - **SessionModule**: Session lifecycle management
 * - **PermissionModule**: Access control and permissions
 * - **AccountLockoutModule**: Security protection mechanisms
 * - **CacheModule**: Auth-specific caching strategies
 * - **KafkaModule**: Event communication patterns
 *
 * ## Security Considerations
 *
 * The Auth Service implements comprehensive security measures:
 *
 * ### Authentication Security
 * - **Password Hashing**: bcrypt with configurable rounds
 * - **JWT Security**: Signed tokens with configurable expiration
 * - **Refresh Tokens**: Secure token rotation mechanism
 * - **Session Security**: Encrypted session storage
 *
 * ### Attack Protection
 * - **Rate Limiting**: Configurable limits on authentication attempts
 * - **Account Lockout**: Automatic lockout after failed attempts
 * - **Brute Force Protection**: Progressive delays and monitoring
 * - **Input Validation**: Comprehensive validation at all entry points
 *
 * ### Monitoring and Auditing
 * - **Security Logging**: Detailed logs of all authentication events
 * - **Failed Attempt Tracking**: Monitoring and alerting on suspicious activity
 * - **Session Monitoring**: Tracking active sessions and anomalies
 * - **Event Publishing**: Real-time security event notifications
 *
 * ## Configuration Strategy
 *
 * The module uses environment-based configuration with security defaults:
 * - **JWT Configuration**: Configurable secrets and expiration times
 * - **Session Configuration**: TTL, encryption, and storage options
 * - **Rate Limiting**: Configurable thresholds and time windows
 * - **Logging**: Security-focused log levels and redaction
 *
 * ## Performance Considerations
 *
 * - **Caching**: Multi-layer caching for tokens and session data
 * - **Connection Pooling**: Efficient database resource utilization
 * - **Async Processing**: Non-blocking security event processing
 * - **Redis Optimization**: Efficient session and cache management
 *
 * ## Integration Patterns
 *
 * - **Event Publishing**: Authentication events for other services
 * - **Service Communication**: Secure inter-service authentication
 * - **Health Monitoring**: Comprehensive health check endpoints
 * - **Metrics Collection**: Security and performance metrics
 *
 * @see {@link AuthModule} for core authentication functionality
 * @see {@link SecurityModule} for identity and access management
 * @see {@link SessionModule} for session management
 * @see {@link TokenModule} for token handling
 * @see {@link PermissionModule} for access control
 */
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
    RedisModule.registerDefault({
      isGlobal: true,
      keyPrefix: 'auth:',
    }),

    // Import Session Module for session management
    RedisSessionModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.SESSION_TTL || '3600', 10), // 1 hour default
      prefix: 'auth:session',
      encrypt: process.env.SESSION_ENCRYPT === 'true',
      encryptionKey: process.env.SESSION_ENCRYPTION_KEY,
      enableLogs: process.env.SESSION_LOGS === 'true',
    }),

    // Import Cache Module for caching
    RedisCacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default
      prefix: 'auth:cache',
      enableLogs: process.env.CACHE_LOGS === 'true',
    }),

    // Infrastructure modules
    RepositoryModule,

    // Feature modules
    AuthModule,
    PresentationModule,
    CacheModule,
    KafkaModule,
    TokenModule,
    SessionModule,
    PermissionModule,
    AccountLockoutModule,

    // Import Security Module for authentication and authorization
    SecurityModule.register(
      {
        jwtModuleOptions: {
          secret: process.env.JWT_SECRET || 'change-me-in-production',
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN || '15m',
          },
        },
        isGlobal: true,
      },
      {
        isGlobal: true,
        maxAttempts: 5,
        windowSeconds: 60,
        blockSeconds: 300,
      },
    ),
  ],
  controllers: [
    // Health monitoring controller
    AuthServiceHealthController,
  ],
  providers: [
    // Health monitoring service
    AuthServiceHealthService,
  ],
})
export class AuthServiceModule {}
