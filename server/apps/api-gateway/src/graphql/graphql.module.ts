import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';
import { IntrospectAndCompose } from '@apollo/gateway';

/**
 * Apollo Federation GraphQL Module
 *
 * This module configures Apollo Federation Gateway to combine schemas from
 * User Service and Chat Service into a unified GraphQL API.
 *
 * Phase 2, Step 2: Service Integration and Schema Composition
 * - Dynamic service discovery with IntrospectAndCompose
 * - User Service and Chat Service integration
 * - Cross-service entity resolution
 */
@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      useFactory: (
        configService: ConfigService,
        loggingService: LoggingService,
      ) => {
        loggingService.setContext('ApiGatewayGraphQLModule');

        // Get service URLs from environment
        const userServiceUrl = configService.get<string>(
          'USER_SERVICE_GRAPHQL_URL',
          'http://localhost:4002/graphql',
        );
        const chatServiceUrl = configService.get<string>(
          'CHAT_SERVICE_GRAPHQL_URL',
          'http://localhost:4003/graphql',
        );

        loggingService.log(
          `Configuring Apollo Federation Gateway with services: User Service (${userServiceUrl}), Chat Service (${chatServiceUrl})`,
          'GraphQLFederationSetup',
        );

        // Phase 2, Step 2: Dynamic service discovery with IntrospectAndCompose
        loggingService.log(
          'Phase 2, Step 2: Starting Apollo Federation Gateway with dynamic service discovery',
          'GraphQLFederationSetup',
        );

        return {
          gateway: {
            // Phase 2, Step 2: Dynamic schema composition from services
            supergraphSdl: new IntrospectAndCompose({
              subgraphs: [
                {
                  name: 'user-service',
                  url: userServiceUrl,
                },
                {
                  name: 'chat-service',
                  url: chatServiceUrl,
                },
              ],
              // Add polling interval for schema updates
              pollIntervalInMs: 30000, // 30 seconds
              // Add introspection headers if needed
              introspectionHeaders: {
                'User-Agent': 'Apollo-Gateway/2.0',
              },
            }),
          },
          server: {
            // Enable GraphQL Playground in development
            playground: configService.get<string>('NODE_ENV') !== 'production',
            introspection: true,
            // Configure CORS
            cors: {
              origin: configService
                .get<string>('CORS_ORIGIN', 'http://localhost:3000')
                .split(','),
              credentials: true,
            },
          },
          // Error formatting
          formatError: (error: any) => {
            loggingService.error(
              `GraphQL Error: ${error.message}`,
              'GraphQLError',
            );

            // Don't expose internal errors in production
            if (
              configService.get<string>('NODE_ENV') === 'production' &&
              error.extensions?.code === 'INTERNAL_SERVER_ERROR'
            ) {
              return {
                message: 'Internal server error',
                extensions: {
                  code: 'INTERNAL_SERVER_ERROR',
                },
              };
            }

            return error;
          },
        };
      },
      inject: [ConfigService, LoggingService],
    }),
  ],
  exports: [GraphQLModule],
})
export class ApiGatewayGraphQLModule {}
