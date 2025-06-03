# Hybrid Architecture Client Integration Guide

## Overview

This document provides detailed specifications for client integration with the Hybrid API Gateway Architecture, which consists of an Apollo Federation Gateway (port 4000) for queries/mutations and a WebSocket Gateway (port 4001) for real-time subscriptions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────--────┐
│                        Client Application                     │
│                                                               │
│  ┌─────────────────┐              ┌─────────────────────────┐ │
│  │   HTTP Client   │              │   WebSocket Client      │ │
│  │                 │              │                         │ │
│  │ Apollo Client   │              │ GraphQL WS Client       │ │
│  │ (Queries/Muts)  │              │ (Subscriptions)         │ │
│  └─────────┬───────┘              └─────────┬───────────────┘ │
└────────────┼────────────────────────────────┼─────────────────┘
             │                                │
             │ HTTP/HTTPS                     │ WebSocket/WSS
             │                                │
   ┌─────────▼─────────┐              ┌───────▼─────────┐
   │ Apollo Federation │              │ WebSocket       │
   │    Gateway        │              │   Gateway       │
   │                   │              │                 │
   │ Port: 4000        │              │ Port: 4001      │
   │ Queries/Mutations │              │ Subscriptions   │
   └───────────────────┘              └─────────────────┘
```

## Client Connection Management

### Dual Connection Strategy

Clients must maintain two separate connections:

1. **HTTP Connection**: Apollo Client connecting to Apollo Federation Gateway (port 4000)
2. **WebSocket Connection**: GraphQL WebSocket client connecting to WebSocket Gateway (port 4001)

### Connection Configuration

#### Apollo Client Configuration (HTTP)
```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // Apollo Federation Gateway
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
```

#### WebSocket Client Configuration
```typescript
import { createClient } from 'graphql-ws';
import { Client } from 'graphql-ws';

const wsClient: Client = createClient({
  url: 'ws://localhost:4001/graphql', // WebSocket Gateway
  connectionParams: () => {
    const token = localStorage.getItem('authToken');
    return {
      authorization: token ? `Bearer ${token}` : "",
    };
  },
  on: {
    connected: () => console.log('WebSocket connected'),
    closed: () => console.log('WebSocket disconnected'),
    error: (error) => console.error('WebSocket error:', error),
  },
  retryAttempts: 5,
  retryWait: async function waitForRetry(retries) {
    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
  },
});
```

### Unified GraphQL Client Wrapper

Create a unified client that automatically routes operations to the appropriate gateway:

```typescript
export class HybridGraphQLClient {
  private apolloClient: ApolloClient<any>;
  private wsClient: Client;

  constructor(apolloClient: ApolloClient<any>, wsClient: Client) {
    this.apolloClient = apolloClient;
    this.wsClient = wsClient;
  }

  // Route queries and mutations to Apollo Federation Gateway
  async query(options: QueryOptions) {
    return this.apolloClient.query(options);
  }

  async mutate(options: MutationOptions) {
    return this.apolloClient.mutate(options);
  }

  // Route subscriptions to WebSocket Gateway
  subscribe(options: SubscriptionOptions) {
    return this.wsClient.subscribe(options, {
      next: options.next,
      error: options.error,
      complete: options.complete,
    });
  }

  // Cleanup method
  dispose() {
    this.wsClient.dispose();
    this.apolloClient.stop();
  }
}
```

## Authentication Strategy

### JWT Token Management

Both gateways use the same JWT token for authentication:

```typescript
class AuthManager {
  private token: string | null = null;
  private refreshToken: string | null = null;

  setTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('authToken');
  }

  async refreshTokenIfNeeded(): Promise<string | null> {
    // Implement token refresh logic
    // Update both HTTP and WebSocket connections
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
}
```

### WebSocket Authentication Handling

```typescript
const wsClient = createClient({
  url: 'ws://localhost:4001/graphql',
  connectionParams: () => ({
    authorization: `Bearer ${authManager.getToken()}`,
  }),
  on: {
    error: async (error) => {
      if (error.message.includes('Unauthorized')) {
        // Attempt token refresh
        const newToken = await authManager.refreshTokenIfNeeded();
        if (newToken) {
          // Reconnect with new token
          wsClient.dispose();
          // Create new connection with refreshed token
        }
      }
    },
  },
});
```

## Operation Routing

### Automatic Operation Detection

```typescript
import { getOperationAST, OperationDefinitionNode } from 'graphql';

function getOperationType(query: DocumentNode): string {
  const operationAST = getOperationAST(query);
  return operationAST?.operation || 'query';
}

export class SmartGraphQLClient {
  async execute(query: DocumentNode, variables?: any) {
    const operationType = getOperationType(query);
    
    switch (operationType) {
      case 'query':
      case 'mutation':
        return this.apolloClient.query({ query, variables });
      
      case 'subscription':
        return this.wsClient.subscribe({ query, variables });
      
      default:
        throw new Error(`Unknown operation type: ${operationType}`);
    }
  }
}
```

### React Hook Integration

```typescript
import { useQuery, useMutation } from '@apollo/client';
import { useSubscription } from './useWebSocketSubscription';

// Custom hook for hybrid client
export function useHybridQuery(query: DocumentNode, options?: QueryHookOptions) {
  return useQuery(query, options); // Routes to Apollo Client
}

export function useHybridMutation(mutation: DocumentNode) {
  return useMutation(mutation); // Routes to Apollo Client
}

export function useHybridSubscription(subscription: DocumentNode, options?: SubscriptionHookOptions) {
  return useWebSocketSubscription(subscription, options); // Routes to WebSocket Client
}
```

## Error Handling and Resilience

### Connection Failure Handling

```typescript
class ConnectionManager {
  private httpHealthy = true;
  private wsHealthy = true;

  async checkHttpHealth(): Promise<boolean> {
    try {
      await this.apolloClient.query({
        query: gql`query { __typename }`,
        fetchPolicy: 'network-only',
      });
      this.httpHealthy = true;
      return true;
    } catch (error) {
      this.httpHealthy = false;
      return false;
    }
  }

  checkWebSocketHealth(): boolean {
    return this.wsClient.getState() === 'connected';
  }

  async handleConnectionFailure(type: 'http' | 'websocket') {
    if (type === 'http') {
      // Implement HTTP reconnection logic
      await this.reconnectHttp();
    } else {
      // WebSocket reconnection is handled automatically by graphql-ws
      console.log('WebSocket reconnection in progress...');
    }
  }
}
```

### Graceful Degradation

```typescript
export class ResilientGraphQLClient {
  async executeWithFallback(operation: DocumentNode, variables?: any) {
    const operationType = getOperationType(operation);
    
    try {
      return await this.execute(operation, variables);
    } catch (error) {
      if (operationType === 'subscription') {
        // For subscriptions, implement polling fallback
        return this.pollForUpdates(operation, variables);
      }
      throw error;
    }
  }

  private async pollForUpdates(subscription: DocumentNode, variables?: any) {
    // Convert subscription to polling query
    // This is a fallback when WebSocket connection fails
  }
}
```

## Performance Optimization

### Connection Pooling

```typescript
class ConnectionPool {
  private static instance: ConnectionPool;
  private apolloClient: ApolloClient<any>;
  private wsClient: Client;

  static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  getApolloClient(): ApolloClient<any> {
    if (!this.apolloClient) {
      this.apolloClient = this.createApolloClient();
    }
    return this.apolloClient;
  }

  getWebSocketClient(): Client {
    if (!this.wsClient) {
      this.wsClient = this.createWebSocketClient();
    }
    return this.wsClient;
  }
}
```

### Subscription Management

```typescript
class SubscriptionManager {
  private activeSubscriptions = new Map<string, any>();

  subscribe(key: string, subscription: DocumentNode, variables?: any) {
    // Prevent duplicate subscriptions
    if (this.activeSubscriptions.has(key)) {
      return this.activeSubscriptions.get(key);
    }

    const sub = this.wsClient.subscribe({ query: subscription, variables });
    this.activeSubscriptions.set(key, sub);
    return sub;
  }

  unsubscribe(key: string) {
    const sub = this.activeSubscriptions.get(key);
    if (sub) {
      sub.unsubscribe();
      this.activeSubscriptions.delete(key);
    }
  }

  unsubscribeAll() {
    this.activeSubscriptions.forEach(sub => sub.unsubscribe());
    this.activeSubscriptions.clear();
  }
}
```

## Testing Strategy

### Unit Tests
- Test operation routing logic
- Test authentication token management
- Test error handling and fallback mechanisms

### Integration Tests
- Test dual connection establishment
- Test authentication across both gateways
- Test subscription and query coordination

### End-to-End Tests
- Test complete user workflows with both gateways
- Test connection failure and recovery scenarios
- Test performance under load

## Migration Guide

### From Single GraphQL Endpoint

1. **Update Apollo Client configuration** to point to Apollo Federation Gateway
2. **Add WebSocket client** for subscriptions
3. **Update subscription usage** to use WebSocket client
4. **Implement unified client wrapper** for seamless operation routing
5. **Update authentication** to work with both connections
6. **Test thoroughly** with both connection types

### Backward Compatibility

The hybrid architecture maintains backward compatibility for existing queries and mutations while adding new subscription capabilities through the WebSocket Gateway.
