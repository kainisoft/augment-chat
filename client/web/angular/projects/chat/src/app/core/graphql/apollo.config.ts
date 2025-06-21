import { inject, Injectable } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createHttpLink } from '@apollo/client/link/http';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { environment } from '@environments/environment';

export interface GraphQLConfig {
  httpUri: string;
  wsUri: string;
  enableSubscriptions: boolean;
  enableErrorLogging: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApolloConfigService {
  private readonly config: GraphQLConfig = {
    httpUri: environment.api.graphqlUrl,
    wsUri: environment.api.websocketUrl,
    enableSubscriptions: environment.graphql.enableSubscriptions,
    enableErrorLogging: environment.graphql.enableErrorLogging,
  };

  createApolloOptions(): ApolloClientOptions<any> {
    // HTTP Link for queries and mutations
    const httpLink = createHttpLink({
      uri: this.config.httpUri,
    });

    // WebSocket Link for subscriptions
    const wsLink = this.config.enableSubscriptions
      ? new GraphQLWsLink(
          createClient({
            url: this.config.wsUri,
            connectionParams: () => {
              // Add authentication headers if needed
              return {
                // Authorization: `Bearer ${token}`,
              };
            },
          })
        )
      : null;

    // Split link to route operations to appropriate transport
    const splitLink = wsLink
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'subscription'
            );
          },
          wsLink,
          httpLink
        )
      : httpLink;

    // Authentication link
    const authLink = setContext((_, { headers }) => {
      // Get authentication token from storage
      const token = this.getAuthToken();
      
      return {
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
    });

    // Error handling link
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (this.config.enableErrorLogging) {
        if (graphQLErrors) {
          graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(
              `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
          });
        }

        if (networkError) {
          console.error(`Network error: ${networkError}`);
        }
      }

      // Handle authentication errors
      if (networkError && 'statusCode' in networkError && networkError.statusCode === 401) {
        // Handle token refresh or redirect to login
        this.handleAuthError();
      }
    });

    // Create cache
    const cache = new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Configure cache policies for chat-specific queries
            conversations: {
              merge(existing = [], incoming) {
                return [...existing, ...incoming];
              },
            },
            messages: {
              merge(existing = [], incoming) {
                return [...existing, ...incoming];
              },
            },
          },
        },
        Conversation: {
          fields: {
            messages: {
              merge(existing = [], incoming) {
                return [...existing, ...incoming];
              },
            },
          },
        },
      },
    });

    return {
      link: errorLink.concat(authLink.concat(splitLink)),
      cache,
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all',
          fetchPolicy: 'cache-and-network',
        },
        query: {
          errorPolicy: 'all',
          fetchPolicy: 'cache-first',
        },
        mutate: {
          errorPolicy: 'all',
        },
      },
      connectToDevTools: environment.graphql.enableDevTools,
    };
  }

  private getAuthToken(): string | null {
    // TODO: Implement token retrieval from storage
    // This will be implemented when authentication is added
    return null;
  }

  private handleAuthError(): void {
    // TODO: Implement authentication error handling
    // This will be implemented when authentication is added
    console.warn('Authentication error detected - implement token refresh or redirect');
  }

  updateConfig(newConfig: Partial<GraphQLConfig>): void {
    Object.assign(this.config, newConfig);
  }

  getConfig(): GraphQLConfig {
    return { ...this.config };
  }
}
