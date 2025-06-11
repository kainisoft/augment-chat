import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { ConfigService } from '@nestjs/config';
import { LoggingService, LoggingModule } from '@app/logging';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { UserContextService } from '@app/security';
import Redis from 'ioredis';
import { join } from 'path';

/**
 * WebSocket GraphQL Module
 *
 * This module configures GraphQL Yoga for WebSocket subscriptions and real-time features.
 * It provides a dedicated gateway for subscriptions separate from the Apollo Federation Gateway.
 *
 * Phase 3: WebSocket Gateway Implementation
 * - GraphQL Yoga with subscription support
 * - WebSocket subscriptions
 * - Redis PubSub for scalable message distribution
 * - JWT authentication for WebSocket connections
 */
@Module({
  imports: [
    LoggingModule,
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: (
        configService: ConfigService,
        loggingService: LoggingService,
        userContextService: UserContextService,
      ) => {
        loggingService.setContext('WebSocketGraphQLModule');

        loggingService.log(
          'Phase 3: Starting WebSocket Gateway with GraphQL Yoga',
          'WebSocketSetup',
        );

        return {
          // Use schema-first approach
          typePaths: [
            join(process.cwd(), 'apps/websocket-gateway/src/**/*.graphql'),
          ],

          // Configure GraphQL endpoint path
          path: '/graphql',

          // Enable playground for development
          playground: configService.get<string>('NODE_ENV') !== 'production',

          // Enable introspection
          introspection: true,

          // Configure subscriptions with WebSocket support
          subscriptions: {
            'graphql-ws': {
              onConnect: async (context: any) => {
                loggingService.debug(
                  'WebSocket connection attempt',
                  'WebSocketAuth',
                );

                try {
                  // Extract user from connection parameters
                  const user =
                    await userContextService.extractUserFromConnectionParams(
                      context.connectionParams,
                    );

                  if (user) {
                    loggingService.log(
                      'WebSocket connection authenticated',
                      'WebSocketAuth',
                      { userId: user.sub, sessionId: user.sessionId },
                    );
                    return { user };
                  } else {
                    // For development, allow connections without authentication
                    if (configService.get<string>('NODE_ENV') === 'development') {
                      const devUser = { id: 'dev-user', email: 'dev@example.com' };
                      loggingService.log(
                        'WebSocket connection allowed (development mode)',
                        'WebSocketAuth',
                        { userId: devUser.id },
                      );
                      return { user: devUser };
                    } else {
                      loggingService.warn(
                        'WebSocket connection rejected: No authentication',
                        'WebSocketAuth',
                      );
                      throw new Error('Authentication required');
                    }
                  }
                } catch (error) {
                  loggingService.error(
                    'WebSocket authentication failed',
                    error instanceof Error ? error.stack : 'Unknown error',
                    'WebSocketAuth',
                  );
                  throw new Error('Authentication failed');
                }
              },
              onDisconnect: (context: any) => {
                const userId =
                  context?.user?.sub || context?.user?.id || 'unknown';
                loggingService.log(
                  'WebSocket connection closed',
                  'WebSocketLifecycle',
                  { userId },
                );
              },
            },
          },

          // Configure context for resolvers
          context: async ({ connectionParams, req }) => {
            const graphqlContext =
              await userContextService.createGraphQLContext(
                req,
                connectionParams,
              );

            return {
              req,
              user: graphqlContext.user || connectionParams?.user || { id: 'dev-user' },
              requestId: graphqlContext.requestId,
              timestamp: graphqlContext.timestamp,
              isDevelopment:
                configService.get<string>('NODE_ENV') === 'development',
            };
          },

          // Configure CORS for WebSocket connections
          cors: {
            origin: configService
              .get<string>('CORS_ORIGIN', 'http://localhost:3000')
              .split(','),
            credentials: true,
          },

          // Error formatting for GraphQL operations
          formatError: (error: any) => {
            loggingService.error(
              `WebSocket GraphQL Error: ${error?.message || 'Unknown error'}`,
              error?.stack || 'No stack trace available',
              'WebSocketGraphQLError',
            );

            // Don't expose internal errors in production
            if (configService.get<string>('NODE_ENV') === 'production') {
              return {
                message: 'Internal server error',
                extensions: {
                  code: 'INTERNAL_SERVER_ERROR',
                  timestamp: new Date().toISOString(),
                },
              };
            }

            return error;
          },
        };
      },
      inject: [ConfigService, LoggingService, UserContextService],
    }),
  ],
  providers: [
    // Provide PubSub instance for injection in resolvers
    {
      provide: 'PUB_SUB',
      useFactory: (configService: ConfigService) => {
        const redisConfig = {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        };

        const publisher = new Redis(redisConfig);
        const subscriber = new Redis(redisConfig);

        return new RedisPubSub({
          publisher,
          subscriber,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['PUB_SUB'],
})
export class WebSocketGraphQLModule {}
