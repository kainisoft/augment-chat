import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { resolvers } from './resolvers';
import { LoggingService } from '@app/logging';
import { ChatDatabaseModule } from '../database/chat-database.module';

/**
 * Chat Service GraphQL Module
 *
 * This module configures Apollo Federation for the Chat Service, providing
 * GraphQL API endpoints for messaging, conversations, and real-time features.
 *
 * Follows the 'gold standard' patterns established in user-service:
 * - Apollo Federation Driver for microservice integration
 * - Comprehensive error handling and logging
 * - Environment-based configuration
 * - Type-safe schema generation
 */
@Module({
  imports: [
    // Import database module for data access
    ChatDatabaseModule,

    // Configure GraphQL with Apollo Server
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (loggingService: LoggingService) => {
        loggingService.setContext('ChatGraphQLModule');

        loggingService.log(
          'Configuring Chat Service GraphQL module with Apollo Federation',
          'GraphQLModuleSetup',
        );

        return {
          // Auto-generate schema from decorators
          autoSchemaFile: true,
          sortSchema: true,

          // Environment-based configuration
          debug: process.env.GRAPHQL_DEBUG === 'true',
          playground: process.env.GRAPHQL_PLAYGROUND === 'true',
          introspection: process.env.GRAPHQL_INTROSPECTION === 'true',

          // Context configuration for authentication and request handling
          context: ({ req, connection }) => ({
            req,
            connection,
          }),

          // Comprehensive error formatting with logging
          formatError: (error) => {
            // Log the error with context
            loggingService.error(
              `GraphQL Error: ${error.message}`,
              'ChatGraphQLError',
            );

            // Log error path if available
            if (error.path) {
              loggingService.debug(
                `Error path: ${error.path.join('.')}`,
                'ChatGraphQLError',
              );
            }

            // Log error code if available
            if (error.extensions?.code) {
              loggingService.debug(
                `Error code: ${String(error.extensions.code)}`,
                'ChatGraphQLError',
              );
            }

            // Don't expose internal server errors to clients in production
            if (
              process.env.NODE_ENV === 'production' &&
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

          // Enable subscriptions for real-time features
          subscriptions: {
            'graphql-ws': true,
            'subscriptions-transport-ws': true,
          },
        };
      },
      inject: [LoggingService],
    }),
  ],
  providers: [...resolvers],
  exports: [GraphQLModule],
})
export class ChatGraphQLModule {}
