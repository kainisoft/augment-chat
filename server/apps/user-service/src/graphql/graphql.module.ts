import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { resolvers } from './resolvers';
import { LoggingService } from '@app/logging';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (loggingService: LoggingService) => {
        loggingService.setContext('GraphQLModule');

        return {
          // Use code-first approach
          autoSchemaFile: true, // Generate schema in memory instead of file
          sortSchema: true,
          debug: process.env.GRAPHQL_DEBUG === 'true',
          playground: process.env.GRAPHQL_PLAYGROUND === 'true',
          introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
          context: ({ req, connection }) => ({
            req,
            connection,
          }),
          formatError: (error) => {
            // Log the error
            loggingService.error(
              `GraphQL Error: ${error.message}`,
              'GraphQLError',
            );

            // Log path if available
            if (error.path) {
              loggingService.debug(
                `Error path: ${error.path.join('.')}`,
                'GraphQLError',
              );
            }

            // Log error code if available
            if (error.extensions?.code) {
              loggingService.debug(
                `Error code: ${String(error.extensions.code)}`,
                'GraphQLError',
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
        };
      },
      inject: [LoggingService],
    }),
  ],
  providers: [...resolvers],
  exports: [GraphQLModule],
})
export class UserGraphQLModule {}
