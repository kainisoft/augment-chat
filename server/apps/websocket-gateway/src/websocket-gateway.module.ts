import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggingModule, LogLevel } from '@app/logging';
import { SecurityModule } from '@app/security';
import { WebSocketGraphQLModule } from './graphql/graphql.module';
import { ChatSubscriptionResolver } from './resolvers/chat.resolver';
import { UserPresenceResolver } from './resolvers/user.resolver';
import { QueryResolver } from './resolvers/query.resolver';
import { HealthController } from './health/health.controller';
import { WebsocketGatewayController } from './websocket-gateway.controller';
import { WebsocketGatewayService } from './websocket-gateway.service';

/**
 * WebSocket Gateway Module
 *
 * Main module for the WebSocket Gateway service that handles real-time
 * GraphQL subscriptions and WebSocket connections.
 *
 * Phase 3: WebSocket Gateway Implementation
 * - GraphQL Yoga with subscription support
 * - Chat and User presence subscriptions
 * - Redis PubSub integration
 * - Health monitoring
 */
@Module({
  imports: [
    // Configuration management
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Shared infrastructure modules
    LoggingModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
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
          service: 'websocket-gateway',
          level,
          kafka: {
            brokers: configService
              .get<string>('KAFKA_BROKERS', 'kafka:29092')
              .split(','),
            topic: configService.get<string>('KAFKA_LOGS_TOPIC', 'logs'),
            clientId: 'websocket-gateway',
          },
          console: configService.get<string>('LOG_CONSOLE', 'true') === 'true',
          redactFields: ['password', 'token', 'secret', 'authorization'],
        };
      },
      inject: [ConfigService],
    }),

    // Security module for authentication
    SecurityModule.registerAuthGuard({
      isGlobal: true,
      jwtModuleOptions: {
        secret: process.env.JWT_SECRET || 'websocket-gateway-secret-key',
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        },
      },
    }),

    // GraphQL WebSocket module
    WebSocketGraphQLModule,
  ],
  controllers: [HealthController, WebsocketGatewayController],
  providers: [
    WebsocketGatewayService,
    QueryResolver,
    ChatSubscriptionResolver,
    UserPresenceResolver,
  ],
  exports: [
    WebsocketGatewayService,
    QueryResolver,
    ChatSubscriptionResolver,
    UserPresenceResolver,
  ],
})
export class WebsocketGatewayModule {}
