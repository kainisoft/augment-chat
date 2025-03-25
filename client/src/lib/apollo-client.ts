import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';
import { useAuthStore } from '@/stores/auth.store';

// Get URLs from environment variables
const httpUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql/subscriptions';

// Auth Link
const authLink = setContext((_, { headers }) => {
  // Get token from Zustand store
  const token = useAuthStore.getState().token;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// HTTP Link
const httpLink = new HttpLink({
  uri: httpUrl,
});

// WebSocket Link with auth token
const wsLink = typeof window !== 'undefined'
  ? new GraphQLWsLink(
      createClient({
        url: wsUrl,
        connectionParams: () => ({
          token: useAuthStore.getState().token,
        }),
      })
    )
  : null;

// Split link based on operation type
const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      from([authLink, httpLink])
    )
  : from([authLink, httpLink]);

// Create Apollo Client instance
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
