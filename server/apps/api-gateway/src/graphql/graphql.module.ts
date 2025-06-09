import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ServiceRegistryService } from '../services/service-registry.service';
import { ServiceDiscoveryModule } from '../services/service-discovery.module';
import { CircuitBreakerService } from '../services/circuit-breaker.service';

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
    ServiceDiscoveryModule,
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

        // Log service configuration for debugging
        loggingService.debug(
          'Federated services configuration',
          'GraphQLFederationSetup',
          {
            userService: userServiceUrl,
            chatService: chatServiceUrl,
            pollInterval: 30000,
          },
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
            // Configure service communication with enhanced monitoring
            buildService({ name, url }: { name: string; url: string }) {
              // Log service discovery integration
              loggingService.log(
                `Building service data source with discovery: ${name}`,
                'ServiceDiscoveryIntegration',
                { service: name, url },
              );

              return new RemoteGraphQLDataSource({
                url,
                willSendRequest({ request, context }) {
                  // Ensure request.http exists
                  if (!request.http) {
                    return;
                  }

                  // Pass authentication headers to downstream services
                  const authHeader = context?.req?.headers?.authorization;
                  if (authHeader && typeof authHeader === 'string') {
                    request.http.headers.set('authorization', authHeader);
                  }

                  // Pass other relevant headers
                  const userAgent = context?.req?.headers?.['user-agent'];
                  if (userAgent && typeof userAgent === 'string') {
                    request.http.headers.set('user-agent', userAgent);
                  }

                  // Add service identification headers
                  request.http.headers.set('x-gateway-service', name);
                  request.http.headers.set(
                    'x-request-id',
                    `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  );

                  loggingService.debug(
                    `Sending request to ${name} service`,
                    'FederationRequest',
                    {
                      service: name,
                      url,
                      hasAuth: !!authHeader,
                    },
                  );
                },
              });
            },
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
          // Error formatting for GraphQL operations
          formatError: (error: any) => {
            loggingService.error(
              `GraphQL Error: ${error?.message || 'Unknown error'}`,
              error?.stack || 'No stack trace available',
              'GraphQLError',
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

            // In development, return full error details
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
