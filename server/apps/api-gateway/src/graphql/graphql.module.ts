import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';

/**
 * Apollo Federation GraphQL Module
 *
 * This module configures Apollo Federation Gateway to combine schemas from
 * User Service and Chat Service into a unified GraphQL API.
 *
 * Phase 2, Step 1: Basic Apollo Federation setup without service integration
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

        // For Phase 2, Step 1: Use a minimal static schema since no services are integrated yet
        // This allows the Apollo Federation Gateway to start successfully
        loggingService.log(
          'Phase 2, Step 1: Starting Apollo Federation Gateway with minimal schema (no service integration)',
          'GraphQLFederationSetup',
        );

        return {
          gateway: {
            // Phase 2, Step 1: Minimal static supergraph SDL
            supergraphSdl: `
              schema
                @link(url: "https://specs.apollo.dev/link/v1.0")
                @link(url: "https://specs.apollo.dev/join/v0.3", for: EXECUTION)
              {
                query: Query
              }

              directive @join__enumValue(graph: join__Graph!) on ENUM_VALUE
              directive @join__field(graph: join__Graph, requires: join__FieldSet, provides: join__FieldSet, type: String, external: Boolean, override: String, usedOverridden: Boolean) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION
              directive @join__graph(name: String!, url: String!) on ENUM_VALUE
              directive @join__implements(graph: join__Graph!, interface: String!) on OBJECT | INTERFACE
              directive @join__type(graph: join__Graph!, key: join__FieldSet, extension: Boolean, resolvable: Boolean, isInterfaceObject: Boolean) on OBJECT | INTERFACE | UNION | ENUM | INPUT_OBJECT | SCALAR
              directive @join__unionMember(graph: join__Graph!, member: String!) on UNION
              directive @link(url: String, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA

              scalar join__FieldSet
              enum join__Graph {
                PLACEHOLDER @join__graph(name: "placeholder", url: "http://localhost:9999/placeholder")
              }
              scalar link__Import
              enum link__Purpose {
                SECURITY
                EXECUTION
              }

              type Query @join__type(graph: PLACEHOLDER) {
                _service: _Service!
                hello: String! @join__field(graph: PLACEHOLDER)
                gatewayStatus: String! @join__field(graph: PLACEHOLDER)
              }

              type _Service @join__type(graph: PLACEHOLDER) {
                sdl: String @join__field(graph: PLACEHOLDER)
              }
            `,
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
