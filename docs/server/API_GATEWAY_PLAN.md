# API Gateway Implementation Plan - Hybrid Architecture

## Overview
This document outlines the implementation plan for a **Hybrid API Gateway Architecture** that provides both GraphQL federation and real-time messaging capabilities. Based on comprehensive analysis and proof of concept validation, this approach combines Apollo Federation for queries/mutations with a dedicated WebSocket Gateway for subscriptions.

## ✅ Architecture Decision Finalized

**DECISION**: Hybrid Architecture approach selected based on GraphQL Federation PoC results.

**Rationale**:
- Apollo Federation does not support GraphQL subscriptions
- GraphQL Yoga Federation requires significant custom development
- Hybrid approach leverages the best of both technologies
- Minimal migration effort from original Apollo Federation plans
- Clear separation of concerns for optimal performance

## Hybrid Architecture Overview

```
                    ┌─────────────────────────────────────────┐
                    │              Load Balancer              │
                    │         (nginx/AWS ALB)                 │
                    └─────────────────┬───────────────────────┘
                                      │
                    ┌─────────────────┴──────────────-─────────┐
                    │                                          │
          ┌─────────▼───────--──┐                    ┌─────────▼─────────┐
          │   Apollo Federation │                    │   WebSocket       │
          │     Gateway         │                    │    Gateway        │
          │                     │                    │                   │
          │ Port: 4000          │                    │ Port: 4001        │
          │ Protocol: HTTP      │                    │ Protocol: WS/WSS  │
          │ Operations:         │                    │ Operations:       │
          │ • Queries           │                    │ • Subscriptions   │
          │ • Mutations         │                    │ • Real-time Events│
          │ • Federation        │                    │ • Live Updates    │
          └─────────┬───────--──┘                    └─────────┬─────────┘
                    │                                          │
        ┌───────────┼────────────┐                             │
        │           │            │                             │
   ┌────▼────┐ ┌────▼────┐ ┌─────▼─────┐                 ┌─────▼─────┐
   │  User   │ │  Chat   │ │  Future   │                 │   Chat    │
   │ Service │ │ Service │ │ Services  │                 │  Service  │
   │         │ │         │ │           │                 │           │
   │Port:4002│ │Port:4003│ │Port:400x  │                 │Port:4003  │
   │GraphQL: │ │GraphQL: │ │GraphQL:   │                 │GraphQL:   │
   │Q & M    │ │Q & M    │ │Q & M      │                 │Subs Only  │
   └─────────┘ └─────────┘ └───────────┘                 └───────────┘
```

## Technology Stack

### Apollo Federation Gateway (Port 4000)
- **Framework**: NestJS with Fastify
- **GraphQL**: Apollo Federation v2 with `@apollo/gateway`
- **Operations**: Queries and Mutations only
- **Authentication**: JWT middleware
- **Caching**: Redis for query caching
- **Monitoring**: Apollo Studio integration

### WebSocket Gateway (Port 4001)
- **Framework**: NestJS with Fastify
- **GraphQL**: GraphQL Yoga with subscription support
- **Operations**: Subscriptions only
- **Real-time**: WebSocket and Server-Sent Events
- **Authentication**: JWT validation for WebSocket connections
- **PubSub**: Redis for subscription broadcasting
- **Monitoring**: Custom metrics for connection management

### Shared Infrastructure
- **Load Balancer**: nginx or AWS Application Load Balancer
- **Authentication**: Shared JWT validation across both gateways
- **Caching**: Redis cluster for session management and PubSub
- **Monitoring**: Unified observability with Prometheus/Grafana
- **Logging**: Centralized logging via Kafka to logging service

## Hybrid Service Architecture

The Hybrid API Gateway Architecture consists of two specialized gateways that work together to provide comprehensive API functionality:

### Apollo Federation Gateway (Primary)
- **GraphQL Federation**: Combines schemas from User Service and Chat Service for queries/mutations
- **Authentication Middleware**: Integrates with Auth Service for JWT validation
- **Request Routing**: Intelligent routing to appropriate microservices
- **Caching Layer**: Redis-based caching for query performance optimization
- **Security**: CORS, rate limiting, and security headers
- **Monitoring**: Apollo Studio integration for schema management

### WebSocket Gateway (Real-time)
- **Subscription Management**: Direct WebSocket connections to services for real-time features
- **Connection Handling**: WebSocket connection lifecycle management
- **Authentication**: JWT validation for WebSocket connections
- **PubSub Integration**: Redis-based message broadcasting
- **Filtering**: Subscription filtering and authorization
- **Monitoring**: Connection metrics and real-time performance tracking

### Shared Components
- **Authentication**: Unified JWT validation across both gateways
- **Logging**: Centralized logging via Kafka to logging service
- **Configuration**: Shared environment and service discovery
- **Health Monitoring**: Unified health checks and service discovery

## Current Implementation Status

### Phase 1: Basic Infrastructure Setup ✅ COMPLETED
- ✅ **Initialize service with NestJS CLI**
  - ✅ Service created at `server/apps/api-gateway/`
  - ✅ Basic NestJS structure in place
- ✅ **Configure Fastify adapter**
  - ✅ Bootstrap service configured with Fastify in `main.ts`
  - ✅ Port 4000 configured for API Gateway
- ✅ **Basic module structure**
  - ✅ Main module with logging integration
  - ✅ Health check endpoints implemented
  - ✅ Shared infrastructure modules integrated

### Phase 2: Apollo Federation Gateway Implementation ⏳ IN PROGRESS
- ✅ **ARCHITECTURE DECISION**: Hybrid approach selected based on PoC validation
- ✅ **APPROACH**: Apollo Federation for queries/mutations (proven, mature)
- ⏳ **STATUS**: Ready for implementation

**Apollo Federation Gateway Setup** (Port 4000):
- ✅ **Apollo Federation packages installation**
  - ✅ Install `@apollo/gateway`, `@apollo/server`, `@nestjs/apollo`
  - ✅ Configure Apollo Federation driver in NestJS
  - ✅ Set up TypeScript types and configurations
- ☐ **Federated gateway configuration**
  - ☐ Configure `IntrospectAndCompose` for service discovery
  - ☐ Set up User Service and Chat Service integration
  - ☐ Configure schema polling and composition
  - ☐ Add error handling for schema composition failures
- ☐ **Service discovery and routing**
  - ☐ Configure service endpoint URLs and health checks
  - ☐ Implement dynamic service discovery
  - ☐ Add service registry integration
  - ☐ Configure load balancing and failover
- ☐ **GraphQL playground and development tools**
  - ☐ Enable GraphQL Playground for development
  - ☐ Configure schema introspection and documentation
  - ☐ Add query examples and testing interface
  - ☐ Set up schema validation and diff detection

**Schema Integration** (Queries and Mutations Only):
- ☐ **User Service integration**
  - ⏳ Enhance User Service GraphQL schema for federation
  - ☐ Verify federation directives (`@key`, `@external`, etc.)
  - ☐ Test user queries and mutations through gateway
  - ☐ Validate cross-service entity resolution
- ☐ **Chat Service integration**
  - ☐ Integrate Chat Service GraphQL schema (queries/mutations only)
  - ☐ Configure Message and Conversation type federation
  - ☐ Set up cross-service references (User in Message)
  - ☐ Test chat queries and mutations through gateway
- ☐ **Schema conflict resolution**
  - ☐ Identify and resolve type conflicts between services
  - ☐ Configure schema merging strategies
  - ☐ Handle overlapping field definitions
  - ☐ Implement comprehensive schema testing

### Phase 3: WebSocket Gateway Implementation ⏳ PENDING
- ✅ **PROOF OF CONCEPT**: Validated in `apps/api-gateway-poc/`
- ⏳ **STATUS**: Ready for production implementation
- 🎯 **GOAL**: Dedicated gateway for real-time subscriptions

**WebSocket Gateway Service Creation** (Port 4001):
- ☐ **Service setup and configuration**
  - ☐ Create `server/apps/websocket-gateway/` service
  - ☐ Configure NestJS with Fastify adapter
  - ☐ Set up GraphQL Yoga with subscription support
  - ☐ Configure WebSocket and Server-Sent Events
- ☐ **GraphQL Yoga subscription setup**
  - ☐ Install `graphql-yoga`, `@graphql-yoga/nestjs`
  - ☐ Configure subscription resolvers and PubSub
  - ☐ Set up WebSocket connection management
  - ☐ Add subscription filtering and authorization
- ☐ **Service integration patterns**
  - ☐ Configure direct connections to Chat Service subscriptions
  - ☐ Set up User Service presence subscription integration
  - ☐ Implement subscription routing and multiplexing
  - ☐ Add cross-service subscription coordination

**Real-time Subscription Features**:
- ☐ **Chat Service subscription integration**
  - ☐ Message received subscriptions (`messageReceived`)
  - ☐ Typing indicator subscriptions (`typingStatus`)
  - ☐ Message status update subscriptions (`messageStatusUpdated`)
  - ☐ Conversation participant subscriptions (`participantJoined`, `participantLeft`)
- ☐ **User Service presence subscriptions**
  - ☐ User online/offline status subscriptions (`userPresenceChanged`)
  - ☐ User activity status subscriptions (`userActivityChanged`)
  - ☐ Friend status update subscriptions (`friendStatusChanged`)
- ☐ **Subscription filtering and authorization**
  - ☐ Conversation-based message filtering
  - ☐ User permission-based subscription access
  - ☐ Rate limiting for subscription connections
  - ☐ Connection authentication and validation

**Connection Management and Performance**:
- ☐ **WebSocket connection lifecycle**
  - ☐ Connection establishment and authentication
  - ☐ Connection health monitoring and heartbeat
  - ☐ Graceful connection termination and cleanup
  - ☐ Connection recovery and reconnection logic
- ☐ **PubSub and message broadcasting**
  - ☐ Redis-based PubSub for scalable message distribution
  - ☐ Message deduplication and ordering
  - ☐ Subscription group management
  - ☐ Message persistence for offline users (optional)
- ☐ **Performance optimization**
  - ☐ Connection pooling and resource management
  - ☐ Subscription batching and debouncing
  - ☐ Memory usage optimization
  - ☐ Metrics collection and monitoring

### Phase 4: Request Routing and Service Proxy ⏳ PENDING
- ☐ **Service discovery implementation**
  - ☐ Configure service registry and discovery
  - ☐ Implement health-based routing
  - ☐ Add service load balancing
- ☐ **Request routing logic**
  - ☐ Implement GraphQL operation routing
  - ☐ Add request forwarding to microservices
  - ☐ Configure timeout and retry policies
- ☐ **Error handling and resilience**
  - ☐ Implement circuit breaker patterns
  - ☐ Add fallback mechanisms
  - ☐ Configure error aggregation and reporting

### Phase 5: Authentication Middleware Integration ⏳ PENDING
- 🎯 **GOAL**: Unified authentication across both gateways
- ⚠️ **CRITICAL**: Must support both HTTP and WebSocket authentication

**Shared Authentication Infrastructure**:
- ☐ **JWT authentication middleware**
  - ☐ Integrate with Auth Service for token validation
  - ☐ Implement JWT middleware for Apollo Federation Gateway
  - ☐ Add JWT validation for WebSocket Gateway connections
  - ☐ Configure shared JWT secret and validation logic
- ☐ **User context injection**
  - ☐ Add user context injection for downstream services
  - ☐ Implement context propagation headers
  - ☐ Configure user context for GraphQL resolvers
  - ☐ Add user context for WebSocket subscriptions
- ☐ **Authorization and permissions**
  - ☐ Implement role-based access control
  - ☐ Add operation-level authorization
  - ☐ Configure subscription-level permissions
  - ☐ Implement resource-based authorization

**WebSocket-Specific Authentication**:
- ☐ **Connection authentication**
  - ☐ JWT validation during WebSocket handshake
  - ☐ Connection parameter authentication
  - ☐ Token refresh handling for long-lived connections
  - ☐ Authentication failure handling and reconnection
- ☐ **Session management**
  - ☐ Integrate with Redis for session storage
  - ☐ Implement session validation and refresh
  - ☐ Add session-based subscription filtering
  - ☐ Configure session cleanup for disconnected clients

### Phase 6: Client Integration and Dual Connection Management ⏳ PENDING
- 🎯 **GOAL**: Enable clients to work with both Apollo Federation and WebSocket gateways
- ⚠️ **COMPLEXITY**: Requires careful connection management and error handling

**Client SDK Development**:
- ☐ **Dual connection management**
  - ☐ Create client SDK for managing both HTTP and WebSocket connections
  - ☐ Implement connection lifecycle management
  - ☐ Add automatic reconnection logic for WebSocket connections
  - ☐ Configure connection health monitoring and heartbeat
- ☐ **Authentication coordination**
  - ☐ Implement unified authentication across both connections
  - ☐ Add JWT token sharing between HTTP and WebSocket
  - ☐ Configure token refresh handling for both connections
  - ☐ Implement authentication failure recovery
- ☐ **Query and subscription routing**
  - ☐ Route queries/mutations to Apollo Federation Gateway (port 4000)
  - ☐ Route subscriptions to WebSocket Gateway (port 4001)
  - ☐ Implement intelligent operation detection and routing
  - ☐ Add fallback mechanisms for connection failures

**Client Integration Patterns**:
- ☐ **React/Web client integration**
  - ☐ Create Apollo Client configuration for federation gateway
  - ☐ Set up GraphQL WebSocket client for subscriptions
  - ☐ Implement unified GraphQL client wrapper
  - ☐ Add error boundary and retry logic
- ☐ **Mobile client integration**
  - ☐ Configure native WebSocket clients for real-time features
  - ☐ Implement background connection management
  - ☐ Add offline support and message queuing
  - ☐ Configure push notification integration
- ☐ **Testing and validation**
  - ☐ Create end-to-end tests for dual connection scenarios
  - ☐ Test connection failure and recovery scenarios
  - ☐ Validate authentication across both gateways
  - ☐ Performance test dual connection overhead

### Phase 7: Security and Production Readiness ⏳ PENDING
- 🎯 **GOAL**: Production-ready security and performance for both gateways
- ⚠️ **CRITICAL**: Must secure both HTTP and WebSocket endpoints

**Security Implementation**:
- ☐ **CORS and security headers**
  - ☐ Configure CORS policies for both gateways
  - ☐ Implement security headers (HSTS, CSP, etc.)
  - ☐ Add request sanitization and validation
  - ☐ Configure WebSocket origin validation
- ☐ **Rate limiting and throttling**
  - ☐ Implement operation-based rate limiting for Apollo Federation
  - ☐ Add connection-based rate limiting for WebSocket Gateway
  - ☐ Configure subscription rate limiting per user
  - ☐ Implement IP-based throttling and DDoS protection
- ☐ **Input validation and sanitization**
  - ☐ Add GraphQL query complexity analysis
  - ☐ Implement query depth limiting
  - ☐ Add input sanitization for all operations
  - ☐ Configure subscription payload validation

**Performance and Caching**:
- ☐ **Apollo Federation Gateway caching**
  - ☐ Implement GraphQL query caching with Redis
  - ☐ Add response caching strategies
  - ☐ Configure cache invalidation policies
  - ☐ Implement query result caching
- ☐ **WebSocket Gateway performance**
  - ☐ Optimize connection pooling and resource usage
  - ☐ Implement subscription batching and debouncing
  - ☐ Add memory usage monitoring and optimization
  - ☐ Configure connection limits and cleanup
- ☐ **Monitoring and observability**
  - ☐ Add comprehensive metrics for both gateways
  - ☐ Implement distributed tracing
  - ☐ Configure alerting and dashboards
  - ☐ Add performance monitoring and profiling

## Detailed Implementation Plan

### Phase 2: Apollo Federation Gateway Implementation (Priority 1)

**Objective**: Set up Apollo Federation Gateway to combine User Service and Chat Service GraphQL schemas for queries and mutations only.

**Duration**: 1-2 weeks

**Prerequisites**:
- ✅ User Service GraphQL API is operational
- ✅ Chat Service GraphQL API is operational (queries/mutations)
- ✅ Both services expose federated schemas with proper directives
- ✅ PoC validation completed

#### Step 1: Apollo Federation Gateway Installation and Configuration

**Dependencies to Install**:
```json
{
  "dependencies": {
    "@apollo/gateway": "^2.5.0",
    "@apollo/server": "^4.9.0",
    "@apollo/server-plugin-landing-page-graphql-playground": "^4.0.0",
    "@apollo/subgraph": "^2.5.0",
    "apollo-server-fastify": "^3.12.0",
    "graphql": "^16.8.0",
    "@nestjs/graphql": "^12.0.0",
    "@nestjs/apollo": "^12.0.0"
  }
}
```

**Implementation Tasks**:
1. **Install Apollo Federation packages**:
   - ☐ Add Apollo Gateway and Federation dependencies
   - ☐ Configure TypeScript types for Apollo Federation
   - ☐ Update package.json with required versions

2. **Create GraphQL Federation Module**:
   - ☐ Create `server/apps/api-gateway/src/graphql/graphql.module.ts`
   - ☐ Configure Apollo Gateway with service discovery
   - ☐ Set up federated schema composition
   - ☐ Add error handling for schema composition failures

3. **Configure Service Discovery**:
   - ☐ Create service registry configuration
   - ☐ Add health check integration for services
   - ☐ Implement dynamic service discovery
   - ☐ Configure service endpoint URLs

**Example Configuration**:
```typescript
// server/apps/api-gateway/src/graphql/graphql.module.ts
@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      useFactory: async (configService: ConfigService) => ({
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: 'user-service',
                url: configService.get('USER_SERVICE_GRAPHQL_URL', 'http://localhost:4002/graphql'),
              },
              {
                name: 'chat-service',
                url: configService.get('CHAT_SERVICE_GRAPHQL_URL', 'http://localhost:4003/graphql'),
              },
            ],
          }),
        },
        server: {
          playground: configService.get('NODE_ENV') !== 'production',
          introspection: true,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class ApiGatewayGraphQLModule {}
```

#### Step 2: Schema Integration and Conflict Resolution

**Implementation Tasks**:
1. **User Service Schema Integration**:
   - ☐ Verify User Service exposes federated schema
   - ☐ Test schema introspection from API Gateway
   - ☐ Validate User type definitions and resolvers
   - ☐ Ensure proper @key directives for federation

2. **Chat Service Schema Integration**:
   - ☐ Verify Chat Service exposes federated schema
   - ☐ Test schema introspection from API Gateway
   - ☐ Validate Message and Conversation type definitions
   - ☐ Ensure proper @key directives for federation

3. **Schema Conflict Resolution**:
   - ☐ Identify and resolve type conflicts between services
   - ☐ Configure schema merging strategies
   - ☐ Handle overlapping field definitions
   - ☐ Implement schema validation and testing

4. **Cross-Service Type References**:
   - ☐ Configure User type extensions in Chat Service
   - ☐ Set up proper entity resolution between services
   - ☐ Implement @requires and @provides directives
   - ☐ Test cross-service query execution

#### Step 3: GraphQL Playground and Development Tools

**Implementation Tasks**:
1. **GraphQL Playground Configuration**:
   - ☐ Enable GraphQL Playground for development
   - ☐ Configure playground with authentication headers
   - ☐ Add example queries and mutations
   - ☐ Set up subscription testing interface

2. **Schema Documentation**:
   - ☐ Add comprehensive schema descriptions
   - ☐ Document query examples for each service
   - ☐ Create schema changelog and versioning
   - ☐ Add deprecation notices for breaking changes

3. **Development Tools**:
   - ☐ Set up schema validation in CI/CD
   - ☐ Add schema diff detection
   - ☐ Configure schema registry (optional)
   - ☐ Implement schema breaking change detection

**Success Criteria**:
- ✅ Unified GraphQL schema accessible at `/graphql`
- ✅ User Service queries and mutations work through gateway
- ✅ Chat Service queries and mutations work through gateway
- ✅ Cross-service queries execute correctly
- ✅ GraphQL Playground functional with combined schema
- ✅ No schema conflicts or composition errors
- ✅ All existing functionality preserved

**Testing Strategy**:
- Unit tests for GraphQL module configuration
- Integration tests for schema composition
- End-to-end tests for cross-service queries
- Performance tests for query execution time

### Phase 3: WebSocket Gateway Implementation (Priority 2)

**Objective**: Create dedicated WebSocket Gateway for real-time subscriptions using GraphQL Yoga.

**Duration**: 2-3 weeks

**Prerequisites**:
- ✅ PoC validation completed in `apps/api-gateway-poc/`
- ✅ Chat Service subscription endpoints ready
- ☐ User Service presence subscription endpoints ready
- ☐ Redis PubSub infrastructure available

#### Step 1: WebSocket Gateway Service Creation

**Service Setup**:
```bash
# Create new WebSocket Gateway service
cd server
nest generate app websocket-gateway
```

**Dependencies to Install**:
```json
{
  "dependencies": {
    "graphql-yoga": "^5.0.0",
    "@graphql-yoga/nestjs": "^3.0.0",
    "graphql-ws": "^5.14.0",
    "ws": "^8.14.0",
    "@types/ws": "^8.5.0",
    "graphql-subscriptions": "^2.0.0",
    "ioredis": "^5.3.0"
  }
}
```

**Implementation Tasks**:
1. **Basic service structure**:
   - ☐ Configure NestJS with Fastify adapter
   - ☐ Set up basic module structure with logging
   - ☐ Configure health check endpoints
   - ☐ Add shared infrastructure modules integration

2. **GraphQL Yoga configuration**:
   - ☐ Create GraphQL Yoga module with subscription support
   - ☐ Configure WebSocket and Server-Sent Events
   - ☐ Set up PubSub with Redis backend
   - ☐ Add subscription authentication middleware

3. **Service integration setup**:
   - ☐ Configure connections to Chat Service subscriptions
   - ☐ Set up User Service presence subscription integration
   - ☐ Implement subscription routing and multiplexing
   - ☐ Add error handling and connection management

**Example WebSocket Gateway Configuration**:
```typescript
// server/apps/websocket-gateway/src/graphql/graphql.module.ts
@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: (configService: ConfigService, pubSub: PubSub) => ({
        subscriptions: {
          'graphql-ws': {
            onConnect: async (context) => {
              // JWT validation for WebSocket connections
              const token = context.connectionParams?.authorization;
              const user = await validateJWT(token);
              return { user };
            },
          },
          'graphql-transport-ws': true,
        },
        context: ({ connectionParams, req }) => ({
          user: connectionParams?.user || req?.user,
          pubSub,
        }),
        plugins: [useGraphQLSSE()],
      }),
      inject: [ConfigService, 'PUB_SUB'],
    }),
  ],
  providers: [
    {
      provide: 'PUB_SUB',
      useFactory: (configService: ConfigService) => {
        const redis = new Redis(configService.get('REDIS_URL'));
        return new RedisPubSub({ publisher: redis, subscriber: redis });
      },
      inject: [ConfigService],
    },
  ],
})
export class WebSocketGraphQLModule {}
```

#### Step 2: Subscription Resolver Implementation

**Chat Service Subscription Integration**:
```typescript
// server/apps/websocket-gateway/src/resolvers/chat.resolver.ts
@Resolver()
export class ChatSubscriptionResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,
    private chatService: ChatServiceClient,
  ) {}

  @Subscription(() => MessageType, {
    filter: (payload, variables, context) => {
      // Filter messages by conversation and user permissions
      return payload.conversationId === variables.conversationId &&
             hasConversationAccess(context.user, variables.conversationId);
    },
  })
  messageReceived(@Args('conversationId') conversationId: string) {
    return this.pubSub.asyncIterator(`messageReceived.${conversationId}`);
  }

  @Subscription(() => TypingIndicatorType, {
    filter: (payload, variables, context) => {
      return payload.conversationId === variables.conversationId &&
             payload.userId !== context.user.id; // Don't send to sender
    },
  })
  typingStatus(@Args('conversationId') conversationId: string) {
    return this.pubSub.asyncIterator(`typingStatus.${conversationId}`);
  }
}
```

**User Service Presence Integration**:
```typescript
// server/apps/websocket-gateway/src/resolvers/user.resolver.ts
@Resolver()
export class UserPresenceResolver {
  @Subscription(() => UserPresenceType, {
    filter: (payload, variables, context) => {
      // Only send presence updates for friends/contacts
      return context.user.contacts.includes(payload.userId);
    },
  })
  userPresenceChanged(@Args('userId') userId?: string) {
    const pattern = userId ? `presence.${userId}` : 'presence.*';
    return this.pubSub.asyncIterator(pattern);
  }
}
```

#### Step 3: Connection Management and Performance

**Implementation Tasks**:
1. **Connection lifecycle management**:
   - ☐ Implement connection establishment with authentication
   - ☐ Add connection health monitoring and heartbeat
   - ☐ Configure graceful connection termination
   - ☐ Implement connection recovery and reconnection logic

2. **Performance optimization**:
   - ☐ Implement connection pooling and resource management
   - ☐ Add subscription batching and debouncing
   - ☐ Configure memory usage monitoring
   - ☐ Implement connection limits and cleanup

3. **Monitoring and metrics**:
   - ☐ Add connection count and health metrics
   - ☐ Implement subscription performance monitoring
   - ☐ Configure alerting for connection issues
   - ☐ Add distributed tracing for subscription events

**Success Criteria**:
- ✅ WebSocket Gateway operational on port 4001
- ✅ Chat message subscriptions working end-to-end
- ✅ User presence subscriptions functional
- ✅ Authentication working for WebSocket connections
- ✅ Subscription filtering and authorization implemented
- ✅ Performance metrics and monitoring in place
- ✅ Connection management and cleanup working properly

### Phase 3: Request Routing and Service Proxy (Priority 2)

**Objective**: Implement intelligent request routing, service discovery, and resilient communication patterns.

**Duration**: 1 week

**Prerequisites**:
- ✅ Phase 2 (GraphQL Federation) completed
- ✅ Service health endpoints operational
- ✅ Basic error handling implemented

#### Step 1: Service Discovery and Health-Based Routing

**Implementation Tasks**:
1. **Service Registry Configuration**:
   - ☐ Create `server/apps/api-gateway/src/services/service-registry.service.ts`
   - ☐ Implement service registration and discovery
   - ☐ Add service health monitoring
   - ☐ Configure service endpoint management

2. **Health-Based Routing**:
   - ☐ Implement health check polling for services
   - ☐ Add automatic service failover
   - ☐ Configure unhealthy service removal
   - ☐ Implement service recovery detection

3. **Load Balancing**:
   - ☐ Implement round-robin load balancing
   - ☐ Add weighted routing based on service health
   - ☐ Configure sticky sessions for stateful operations
   - ☐ Implement circuit breaker patterns

**Example Service Registry**:
```typescript
// server/apps/api-gateway/src/services/service-registry.service.ts
@Injectable()
export class ServiceRegistryService {
  private services = new Map<string, ServiceInstance[]>();

  async registerService(name: string, instance: ServiceInstance): Promise<void> {
    // Implementation for service registration
  }

  async getHealthyServices(name: string): Promise<ServiceInstance[]> {
    // Implementation for health-based service selection
  }

  async routeRequest(serviceName: string, operation: string): Promise<ServiceInstance> {
    // Implementation for intelligent routing
  }
}
```

#### Step 2: Request Routing and Forwarding

**Implementation Tasks**:
1. **GraphQL Operation Routing**:
   - ☐ Implement operation-based routing logic
   - ☐ Add query complexity analysis
   - ☐ Configure operation timeout policies
   - ☐ Implement request batching optimization

2. **Request Forwarding**:
   - ☐ Create HTTP client for service communication
   - ☐ Implement request/response transformation
   - ☐ Add request correlation IDs
   - ☐ Configure request retry mechanisms

3. **Timeout and Retry Policies**:
   - ☐ Configure per-service timeout settings
   - ☐ Implement exponential backoff retry
   - ☐ Add jitter to prevent thundering herd
   - ☐ Configure maximum retry attempts

**Example Routing Configuration**:
```typescript
// server/apps/api-gateway/src/config/routing.config.ts
export const routingConfig = {
  services: {
    'user-service': {
      timeout: 5000,
      retries: 3,
      circuitBreaker: {
        threshold: 5,
        timeout: 30000,
      },
    },
    'chat-service': {
      timeout: 3000,
      retries: 2,
      circuitBreaker: {
        threshold: 3,
        timeout: 20000,
      },
    },
  },
};
```

#### Step 3: Error Handling and Resilience

**Implementation Tasks**:
1. **Circuit Breaker Implementation**:
   - ☐ Create circuit breaker service
   - ☐ Configure failure thresholds
   - ☐ Implement half-open state testing

2. **Fallback Mechanisms**:
   - ☐ Implement cached response fallbacks
   - ☐ Add default response strategies
   - ☐ Configure graceful degradation
   - ☐ Implement partial failure handling

3. **Error Aggregation and Reporting**:
   - ☐ Create unified error response format
   - ☐ Implement error correlation across services
   - ☐ Add error rate monitoring
   - ☐ Configure error alerting

**Success Criteria**:
- ✅ Automatic service discovery and registration
- ✅ Health-based routing with failover
- ✅ Circuit breaker protection for all services
- ✅ Graceful handling of service failures
- ✅ Request correlation and tracing
- ✅ Configurable timeout and retry policies
- ✅ Comprehensive error handling and reporting

### Phase 4: Authentication Middleware Integration (Priority 3)

**Objective**: Integrate with Auth Service for JWT validation, user context injection, and authorization.

**Duration**: 1 week

**Prerequisites**:
- ✅ Phase 3 (Request Routing) completed
- ✅ Auth Service JWT validation operational
- ✅ Security module available

#### Step 1: JWT Authentication Middleware

**Implementation Tasks**:
1. **Auth Service Integration**:
   - ☐ Create `server/apps/api-gateway/src/auth/auth.module.ts`
   - ☐ Integrate with Auth Service for token validation
   - ☐ Implement JWT middleware for GraphQL operations
   - ☐ Add token refresh handling

2. **JWT Middleware Implementation**:
   - ☐ Create JWT validation guard
   - ☐ Implement token extraction from headers
   - ☐ Add token validation with Auth Service
   - ☐ Configure public/protected operation routing

3. **User Context Injection**:
   - ☐ Create user context service
   - ☐ Implement context injection for downstream services
   - ☐ Add user information to GraphQL context
   - ☐ Configure context propagation headers

**Example Auth Module**:
```typescript
// server/apps/api-gateway/src/auth/auth.module.ts
@Module({
  imports: [
    SecurityModule.register({
      jwtModuleOptions: {
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      },
      isGlobal: true,
    }),
  ],
  providers: [AuthGuard, UserContextService],
  exports: [AuthGuard, UserContextService],
})
export class ApiGatewayAuthModule {}
```

#### Step 2: Authorization and Permissions

**Implementation Tasks**:
1. **Role-Based Access Control**:
   - ☐ Implement RBAC for GraphQL operations
   - ☐ Add role validation middleware
   - ☐ Configure operation-level permissions
   - ☐ Implement permission caching

2. **Operation-Level Authorization**:
   - ☐ Create authorization decorators
   - ☐ Implement field-level authorization
   - ☐ Add resource-based permissions
   - ☐ Configure authorization policies

3. **Permission Validation**:
   - ☐ Integrate with Auth Service permissions
   - ☐ Implement permission caching
   - ☐ Add permission refresh mechanisms
   - ☐ Configure permission inheritance

#### Step 3: Session Management Integration

**Implementation Tasks**:
1. **Redis Session Integration**:
   - ☐ Configure Redis for session storage
   - ☐ Implement session validation
   - ☐ Add session refresh handling
   - ☐ Configure session timeout policies

2. **Session Validation and Refresh**:
   - ☐ Implement session validation middleware
   - ☐ Add automatic session refresh
   - ☐ Configure session expiration handling
   - ☐ Implement session invalidation

3. **Session-Based Routing**:
   - ☐ Add session affinity for stateful operations
   - ☐ Implement session-based load balancing
   - ☐ Configure session failover handling
   - ☐ Add session monitoring

**Success Criteria**:
- ✅ JWT authentication for all protected operations
- ✅ User context available in all downstream services
- ✅ Role-based access control implemented
- ✅ Operation-level authorization working
- ✅ Session management integrated
- ✅ Token refresh handling operational
- ✅ Authorization caching for performance

### Phase 5: Real-time Communication (Priority 4)

**Objective**: Implement WebSocket gateway for GraphQL subscriptions and real-time features.

**Duration**: 1 week

**Prerequisites**:
- ✅ Phase 4 (Authentication) completed
- ✅ Chat Service subscriptions operational
- ✅ WebSocket infrastructure available

#### Step 1: WebSocket Gateway Setup

**Implementation Tasks**:
1. **WebSocket Configuration**:
   - ☐ Create `server/apps/api-gateway/src/websocket/websocket.module.ts`
   - ☐ Configure WebSocket support for GraphQL subscriptions
   - ☐ Implement subscription routing to services
   - ☐ Add connection management and authentication

2. **Subscription Federation**:
   - ☐ Set up subscription federation across services
   - ☐ Implement subscription delegation
   - ☐ Configure subscription filtering
   - ☐ Add subscription authorization

3. **Connection Management**:
   - ☐ Implement connection pooling
   - ☐ Add connection health monitoring
   - ☐ Configure connection limits and throttling
   - ☐ Implement connection cleanup

**Example WebSocket Configuration**:
```typescript
// server/apps/api-gateway/src/websocket/websocket.module.ts
@Module({
  imports: [
    GraphQLModule.forRootAsync({
      useFactory: () => ({
        subscriptions: {
          'graphql-ws': {
            onConnect: (context) => {
              // Authentication and authorization
            },
            onDisconnect: (context) => {
              // Cleanup
            },
          },
        },
      }),
    }),
  ],
})
export class WebSocketModule {}
```

#### Step 2: Real-time Message Broadcasting

**Implementation Tasks**:
1. **Subscription Routing**:
   - ☐ Implement subscription routing to Chat Service
   - ☐ Add subscription filtering by user permissions
   - ☐ Configure subscription multiplexing
   - ☐ Implement subscription load balancing

2. **Message Broadcasting**:
   - ☐ Set up real-time message delivery
   - ☐ Implement subscription event aggregation
   - ☐ Add message filtering and authorization
   - ☐ Configure message delivery guarantees

3. **Connection State Management**:
   - ☐ Implement connection state tracking
   - ☐ Add user presence management
   - ☐ Configure connection recovery

**Success Criteria**:
- ✅ WebSocket connections authenticated and authorized
- ✅ GraphQL subscriptions working through gateway
- ✅ Real-time message delivery operational
- ✅ Connection management and cleanup working
- ✅ Subscription filtering and authorization
- ✅ Connection pooling and load balancing

### Phase 6: Security and Production Readiness (Priority 5)

**Objective**: Implement comprehensive security, caching, and production-ready features.

**Duration**: 1 week

**Prerequisites**:
- ✅ Phase 5 (Real-time Communication) completed
- ✅ All core functionality operational
- ✅ Security requirements defined

#### Step 1: Security Headers and CORS

**Implementation Tasks**:
1. **CORS Configuration**:
   - ☐ Configure CORS policies for web clients
   - ☐ Add origin validation
   - ☐ Configure preflight request handling
   - ☐ Implement CORS for WebSocket connections

2. **Security Headers**:
   - ☐ Implement security headers middleware
   - ☐ Add Content Security Policy (CSP)
   - ☐ Configure HSTS headers
   - ☐ Add X-Frame-Options and other security headers

3. **Request Sanitization**:
   - ☐ Implement input sanitization
   - ☐ Add GraphQL query validation
   - ☐ Configure query complexity limits
   - ☐ Implement query depth limiting

#### Step 2: Rate Limiting and Performance

**Implementation Tasks**:
1. **Rate Limiting**:
   - ☐ Implement operation-based rate limiting
   - ☐ Add IP-based throttling
   - ☐ Configure rate limit headers
   - ☐ Implement sliding window rate limiting

2. **Caching Strategies**:
   - ☐ Implement GraphQL query caching
   - ☐ Add response caching with Redis
   - ☐ Configure cache invalidation strategies
   - ☐ Implement cache warming

3. **Performance Optimization**:
   - ☐ Add query complexity analysis
   - ☐ Implement request batching
   - ☐ Configure connection pooling
   - ☐ Add performance monitoring

**Success Criteria**:
- ✅ Comprehensive security headers implemented
- ✅ CORS properly configured for all clients
- ✅ Rate limiting operational
- ✅ Caching strategies implemented
- ✅ Performance monitoring active
- ✅ Distributed tracing operational
- ✅ Alerting and dashboards configured

## Technical Specifications

### GraphQL Federation Configuration

**Subgraph Services**:
```typescript
// Federation configuration for microservices
const subgraphs = [
  {
    name: 'user-service',
    url: 'http://localhost:4002/graphql',
    schema: `
      extend type Query {
        user(id: ID!): User
        users(filter: UserFilterInput): [User!]!
      }

      type User @key(fields: "id") {
        id: ID!
        username: String!
        displayName: String!
        email: String!
      }
    `,
  },
  {
    name: 'chat-service',
    url: 'http://localhost:4003/graphql',
    schema: `
      extend type Query {
        conversations: [Conversation!]!
        messages(conversationId: ID!): [Message!]!
      }

      extend type User @key(fields: "id") {
        id: ID! @external
        conversations: [Conversation!]!
      }

      type Conversation @key(fields: "id") {
        id: ID!
        participants: [User!]!
        messages: [Message!]!
      }

      type Message @key(fields: "id") {
        id: ID!
        content: String!
        sender: User!
        conversation: Conversation!
      }
    `,
  },
];
```

### Service Discovery and Routing

**Service Registry Interface**:
```typescript
interface ServiceInstance {
  id: string;
  name: string;
  url: string;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck: Date;
  metadata: Record<string, any>;
}

interface RoutingConfig {
  timeout: number;
  retries: number;
  circuitBreaker: {
    threshold: number;
    timeout: number;
    halfOpenMaxCalls: number;
  };
  loadBalancing: 'round-robin' | 'weighted' | 'least-connections';
}
```

### Authentication and Authorization

**JWT Context Interface**:
```typescript
interface GraphQLContext {
  user?: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  session?: {
    id: string;
    expiresAt: Date;
  };
  request: FastifyRequest;
  reply: FastifyReply;
}

interface AuthGuardConfig {
  requireAuth: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  allowPublic?: boolean;
}
```

### Environment Configuration

**Required Environment Variables**:
```env
# API Gateway Configuration
API_GATEWAY_PORT=4000
NODE_ENV=development

# Service URLs
USER_SERVICE_GRAPHQL_URL=http://localhost:4002/graphql
CHAT_SERVICE_GRAPHQL_URL=http://localhost:4003/graphql
AUTH_SERVICE_URL=http://localhost:4001

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false

# Monitoring
LOG_LEVEL=info

# Security
SECURITY_HEADERS_ENABLED=true
CSP_ENABLED=true
HSTS_ENABLED=true
```

## Integration Points

### Auth Service Integration
- **Token Validation**: JWT token validation and user context extraction
- **Session Management**: Session validation and refresh handling
- **Permission Checking**: Role and permission validation for operations
- **User Context**: User information injection for downstream services

### User Service Integration
- **GraphQL Schema**: User queries, mutations, and subscriptions
- **Entity Resolution**: User entity resolution for cross-service queries
- **Caching**: User data caching for performance optimization
- **Real-time Updates**: User status and profile change subscriptions

### Chat Service Integration
- **GraphQL Schema**: Message and conversation operations
- **Real-time Messaging**: WebSocket subscriptions for live chat
- **File Handling**: File upload and attachment management
- **Message Search**: Full-text search across conversations

### Notification Service Integration (Future)
- **Event Routing**: Notification events from chat and user services
- **Real-time Delivery**: Push notification delivery via WebSocket
- **Preference Management**: User notification preferences
- **Template Rendering**: Notification template processing

## Shared Module Integration

### Required Shared Modules
- **@app/validation**: Input validation decorators and pipes
- **@app/security**: JWT authentication and authorization, Rate limiting, CORS, and security utilities
- **@app/logging**: Centralized logging with correlation IDs
- **@app/redis**: Redis connection and caching utilities
- **@app/testing**: Testing utilities and mock factories
- **@app/bootstrap**: Enhanced service startup patterns

### Module Integration Examples
```typescript
// Using shared validation
import { IsUUIDField, IsStringField } from '@app/validation';

export class GetUserInput {
  @IsUUIDField({ description: 'User ID' })
  id: string;
}

// Using shared security
import { RateLimit, SecurityHeaders } from '@app/security';

@Controller('graphql')
@SecurityHeaders()
export class GraphQLController {
  @Post()
  @RateLimit('graphql-query')
  async handleGraphQL(@Body() query: any) {
    // Implementation
  }
}

// Using shared Security
import { AuthGuard, RequirePermissions } from '@app/security';

@UseGuards(AuthGuard)
@RequirePermissions('user:read')
async getUserProfile(@Context() context: GraphQLContext) {
  // Implementation
}
```

## Folder Structure

Following the established 'gold standard' patterns:

```
server/apps/api-gateway/src/
├── auth/                    # Authentication and authorization
│   ├── auth.module.ts
│   ├── guards/
│   ├── decorators/
│   └── services/
├── graphql/                 # GraphQL federation and schema
│   ├── graphql.module.ts
│   ├── federation/
│   ├── resolvers/
│   └── types/
├── services/                # Service discovery and routing
│   ├── service-registry.service.ts
│   ├── routing.service.ts
│   └── circuit-breaker.service.ts
├── websocket/               # WebSocket and subscriptions
│   ├── websocket.module.ts
│   ├── gateway/
│   └── handlers/
├── security/                # Security middleware and policies
│   ├── security.module.ts
│   ├── cors/
│   ├── rate-limiting/
│   └── headers/
├── cache/                   # Caching strategies and management
│   ├── cache.module.ts
│   ├── strategies/
│   └── invalidation/
├── health/                  # Health checks and status
│   ├── health.controller.ts
│   └── health.service.ts
├── config/                  # Configuration management
│   ├── routing.config.ts
│   ├── federation.config.ts
│   └── security.config.ts
└── utils/                   # Utility functions and helpers
    ├── error-handling.ts
    ├── context.ts
    └── validation.ts
```

## Testing Strategy

### Unit Testing
- **GraphQL Module**: Test federation configuration and schema composition
- **Service Registry**: Test service discovery and health monitoring
- **Authentication**: Test JWT validation and user context injection
- **Circuit Breaker**: Test failure detection and recovery
- **Rate Limiting**: Test rate limit enforcement and headers

### Integration Testing
- **Schema Federation**: Test cross-service query execution
- **Service Communication**: Test request routing and forwarding
- **Authentication Flow**: Test end-to-end authentication
- **WebSocket Connections**: Test subscription federation
- **Error Handling**: Test error propagation and aggregation

### End-to-End Testing
- **Client Integration**: Test complete client-to-service flows
- **Real-time Features**: Test WebSocket subscriptions
- **Performance**: Test under load with multiple services
- **Security**: Test authentication and authorization

### Testing Utilities
```typescript
// Using @app/testing for API Gateway tests
import { MockFactoryService, GraphQLTestBuilder } from '@app/testing';

describe('API Gateway', () => {
  let gateway: INestApplication;
  let mockFactory: MockFactoryService;
  let graphqlTestBuilder: GraphQLTestBuilder;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApiGatewayModule],
      providers: [MockFactoryService],
    }).compile();

    gateway = module.createNestApplication();
    mockFactory = module.get<MockFactoryService>(MockFactoryService);
    graphqlTestBuilder = new GraphQLTestBuilder(gateway);
  });

  it('should federate schemas correctly', async () => {
    const query = `
      query {
        user(id: "123") {
          id
          username
          conversations {
            id
            messages {
              content
            }
          }
        }
      }
    `;

    const result = await graphqlTestBuilder
      .query(query)
      .withAuth(mockFactory.createMockUser())
      .execute();

    expect(result.data.user).toBeDefined();
    expect(result.data.user.conversations).toBeDefined();
  });
});
```

## Implementation Roadmap

### Week 1: GraphQL Federation (Phase 2)
**Days 1-2**: Apollo Federation setup and configuration
- Install Apollo Federation packages
- Configure gateway with service discovery
- Set up basic schema composition

**Days 3-4**: Schema integration and testing
- Integrate User Service schema
- Integrate Chat Service schema
- Resolve schema conflicts and test federation

**Day 5**: GraphQL Playground and documentation
- Configure development tools
- Add schema documentation
- Test cross-service queries

### Week 2: Request Routing and Authentication (Phases 3-4)
**Days 1-2**: Service discovery and routing
- Implement service registry
- Add health-based routing
- Configure circuit breakers

**Days 3-4**: Authentication middleware
- Integrate with Auth Service
- Implement JWT validation
- Add user context injection

**Day 5**: Authorization and session management
- Implement RBAC
- Add session validation
- Test authentication flow

### Week 3: Real-time and Security (Phases 5-6)
**Days 1-2**: WebSocket gateway
- Configure WebSocket support
- Implement subscription federation
- Add connection management

**Days 3-4**: Security and performance
- Configure CORS and security headers
- Implement rate limiting
- Add caching strategies

**Day 5**: Monitoring and production readiness
- Final testing and documentation

## Dependencies and Prerequisites

### External Dependencies
- User Service GraphQL API must be operational
- Chat Service GraphQL API must be operational
- Auth Service JWT validation must be working
- Redis cluster must be available
- Kafka cluster must be operational

### Internal Dependencies
- Shared infrastructure modules must be available
- Database connections must be configured
- Environment variables must be set
- Health check endpoints must be implemented

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/graphql": "^14.5.0",
    "apollo-server-testing": "^2.25.0",
    "graphql-tag": "^2.12.0",
    "supertest": "^6.3.0"
  }
}
```

## Success Metrics

### Functional Metrics
- ✅ All User Service operations accessible through gateway
- ✅ All Chat Service operations accessible through gateway
- ✅ Cross-service queries execute correctly
- ✅ Real-time subscriptions work through gateway
- ✅ Authentication and authorization functional
- ✅ Error handling and resilience operational

### Security Metrics
- ✅ All protected operations require authentication
- ✅ Authorization rules enforced correctly
- ✅ Rate limiting prevents abuse
- ✅ Security headers implemented
- ✅ Input validation and sanitization working

## Risk Mitigation

### Technical Risks
1. **Schema Conflicts**: Implement comprehensive schema validation and testing
2. **Service Failures**: Use circuit breakers and fallback mechanisms
3. **Performance Issues**: Implement caching and query optimization
4. **Security Vulnerabilities**: Regular security audits and updates

### Operational Risks
1. **Service Discovery Failures**: Implement health monitoring and failover
2. **Authentication Issues**: Comprehensive testing and monitoring
3. **Scaling Challenges**: Load testing and performance optimization

## GraphQL Federation Subscription Analysis

### Critical Issue: Apollo Federation Subscription Limitations

**Problem Statement**: Apollo Federation does not support GraphQL subscriptions, which creates a fundamental architectural conflict with our real-time messaging requirements.

**Impact Assessment**:
- ❌ **Chat Service**: Cannot federate real-time message subscriptions (`messageReceived`, `typingStatus`, `messageStatusUpdated`)
- ❌ **User Service**: Cannot federate user presence/status subscriptions
- ❌ **API Gateway**: Cannot provide unified real-time GraphQL API
- ❌ **Client Integration**: Clients cannot use single GraphQL endpoint for all real-time features

**Current Architecture Conflicts**:
1. **API Gateway Plan** assumes federated subscriptions will work
2. **Chat Service Plan** defines GraphQL subscriptions for real-time messaging
3. **User Service** may need presence/status subscriptions
4. **Client expectations** for unified GraphQL API including real-time features

### Alternative Architecture Solutions

#### Option 1: GraphQL Yoga Federation (RECOMMENDED)
**Description**: Replace Apollo Federation with GraphQL Yoga Federation which supports subscriptions.

**Pros**:
- ✅ Full Federation support with subscriptions
- ✅ NestJS integration available (`@nestjs/graphql` with Yoga driver)
- ✅ Maintains unified GraphQL API architecture
- ✅ Compatible with existing GraphQL schemas
- ✅ Active development and community support

**Cons**:
- ⚠️ Requires migration from Apollo Federation
- ⚠️ Different ecosystem than Apollo (tooling, documentation)
- ⚠️ Team learning curve for Yoga-specific features

**Implementation Impact**:
- **Low**: Change gateway driver from Apollo to Yoga
- **Medium**: Update federation configuration
- **Low**: Minimal changes to service schemas

**Example Configuration**:
```typescript
// API Gateway with GraphQL Yoga Federation
import { YogaDriver, YogaDriverConfig } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: () => ({
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              { name: 'user-service', url: 'http://localhost:4002/graphql' },
              { name: 'chat-service', url: 'http://localhost:4003/graphql' },
            ],
          }),
        },
        subscriptions: {
          'graphql-ws': true,
          'graphql-transport-ws': true,
        },
      }),
    }),
  ],
})
export class GraphQLModule {}
```

#### Option 2: Mercurius Federation
**Description**: Use Mercurius with Fastify for federation with subscription support.

**Pros**:
- ✅ Federation with subscription support
- ✅ Fastify integration (matches our HTTP engine choice)
- ✅ High performance
- ✅ Subscription support in federated graphs

**Cons**:
- ⚠️ Limited Federation 2 support
- ⚠️ Smaller ecosystem than Apollo/Yoga
- ⚠️ Less NestJS integration documentation

**Implementation Impact**:
- **High**: Significant changes to GraphQL setup
- **High**: Different federation patterns
- **Medium**: Learning curve for Mercurius

#### Option 3: Hybrid Architecture (PRAGMATIC CHOICE)
**Description**: Use Apollo Federation for queries/mutations, direct service subscriptions for real-time features.

**Architecture**:
```
┌─────────────────┐    ┌──────────────────┐
│   API Gateway   │    │   WebSocket      │
│                 │    │   Gateway        │
│ Apollo          │    │                  │
│ Federation      │    │ Direct Service   │
│ (Queries/Muts)  │    │ Subscriptions    │
└─────────────────┘    └──────────────────┘
         │                       │
    ┌────┴────┐              ┌───┴───┐
    │ User    │              │ Chat  │
    │ Service │              │ Service│
    │         │              │       │
    │ GraphQL │              │GraphQL│
    │ Q & M   │              │Q,M & S│
    └─────────┘              └───────┘
```

**Pros**:
- ✅ Keeps Apollo Federation for non-real-time features
- ✅ Minimal changes to existing plans
- ✅ Clear separation of concerns
- ✅ Can optimize each protocol independently

**Cons**:
- ⚠️ Clients need to connect to multiple endpoints
- ⚠️ More complex client-side connection management
- ⚠️ Authentication/authorization duplication

**Implementation**:
- **API Gateway**: Apollo Federation for queries/mutations
- **WebSocket Gateway**: Separate service for subscriptions
- **Client**: Two connections (HTTP for GraphQL, WebSocket for subscriptions)

#### Option 4: Service-Level Subscriptions Only
**Description**: No federation for subscriptions - clients connect directly to services for real-time features.

**Pros**:
- ✅ Simple implementation
- ✅ No federation complexity for subscriptions
- ✅ Services can optimize their own real-time features

**Cons**:
- ❌ No unified API for real-time features
- ❌ Clients must know about multiple service endpoints
- ❌ Complex client-side connection management
- ❌ Authentication/authorization per service

#### Option 5: Alternative Real-time Protocols
**Description**: Use WebSocket/Server-Sent Events outside of GraphQL for real-time features.

**Pros**:
- ✅ Protocol flexibility
- ✅ Can optimize for specific use cases
- ✅ No GraphQL subscription limitations

**Cons**:
- ❌ Loses GraphQL benefits for real-time features
- ❌ Different API patterns for real-time vs. regular operations
- ❌ More complex client integration

### ✅ PROOF OF CONCEPT COMPLETED

**PoC Results**: A comprehensive proof of concept has been implemented and tested in `server/apps/api-gateway-poc/`.

**PoC Artifacts**:
- ✅ **API Gateway PoC**: GraphQL Yoga Federation implementation with subscriptions
- ✅ **Chat Service Enhancement**: Subscription resolvers for real-time messaging
- ✅ **Test Suite**: Comprehensive testing for federation and subscriptions
- ✅ **Documentation**: Detailed findings and implementation guidance
- ✅ **Startup Scripts**: Easy testing and validation tools

**Key Technical Findings**:
1. ✅ **GraphQL Yoga subscriptions work perfectly** with WebSocket and Server-Sent Events
2. ✅ **NestJS integration is solid** via `@graphql-yoga/nestjs` driver
3. ⚠️ **Full federation requires custom implementation** - not as straightforward as Apollo Federation
4. ⚠️ **Apollo Federation ecosystem is more mature** for federation-specific features
5. ✅ **Hybrid approach provides best balance** of functionality and complexity

**Performance Characteristics**:
- ✅ **Subscription latency**: Low latency for real-time message delivery
- ✅ **Connection management**: Efficient WebSocket connection pooling
- ✅ **Memory usage**: Reasonable memory footprint for subscription management
- ✅ **Error handling**: Robust error formatting and logging

### UPDATED RECOMMENDATION: Hybrid Architecture

Based on PoC findings, the **recommended approach** has changed:

**Hybrid Architecture**: Apollo Federation + Dedicated WebSocket Gateway

**Rationale**:
1. **Leverages Apollo Federation's maturity** for queries/mutations
2. **Dedicated subscription gateway** for optimal real-time performance
3. **Minimal migration effort** from current plans
4. **Clear separation of concerns** for easier maintenance
5. **Best of both worlds** - proven federation + powerful subscriptions

**Architecture**:
```
┌─────────────────┐    ┌──────────────────┐
│   API Gateway   │    │   WebSocket      │
│                 │    │   Gateway        │
│ Apollo          │    │                  │
│ Federation      │    │ Direct Service   │
│ (Queries/Muts)  │    │ Subscriptions    │
└─────────────────┘    └──────────────────┘
         │                       │
    ┌────┴────┐              ┌───┴──c─┐
    │ User    │              │ Chat c │
    │ Service │              │ Service│
    │ GraphQL │              │GraphQLc│
    │ Q & M   │              │Q,M & Sc│
    └─────────┘              └───────-┘
```

**Implementation Plan**:
1. **Phase 1**: Implement Apollo Federation Gateway (as originally planned)
2. **Phase 2**: Create dedicated WebSocket Gateway for subscriptions
3. **Phase 3**: Enhance Chat Service with subscription endpoints
4. **Phase 4**: Client integration with dual connections
5. **Phase 5**: Authentication, monitoring, and optimization

**Benefits**:
- ✅ **Real-time messaging** through dedicated subscription gateway
- ✅ **Mature federation** for queries/mutations via Apollo Federation
- ✅ **Optimal performance** for each use case
- ✅ **Easier maintenance** with clear separation
- ✅ **Future flexibility** to evolve each gateway independently

## Implementation Timeline and Milestones

### Development Timeline (8-12 weeks total)

**Phase 2: Apollo Federation Gateway** (Weeks 1-3)
- Week 1: Apollo Federation setup and configuration
- Week 2: Service integration and schema composition
- Week 3: Testing, optimization, and documentation

**Phase 3: WebSocket Gateway** (Weeks 3-6) *Can run in parallel*
- Week 3-4: Service creation and GraphQL Yoga setup
- Week 5: Subscription resolver implementation
- Week 6: Connection management and performance optimization

**Phase 4: Request Routing** (Weeks 4-6) *Parallel with WebSocket Gateway*
- Week 4-5: Service discovery and routing implementation
- Week 6: Error handling and resilience patterns

**Phase 5: Authentication Integration** (Weeks 7-8)
- Week 7: Shared authentication infrastructure
- Week 8: WebSocket-specific authentication and testing

**Phase 6: Client Integration** (Weeks 9-10)
- Week 9: Client SDK development and dual connection management
- Week 10: Client integration testing and optimization

**Phase 7: Production Readiness** (Weeks 11-12)
- Week 11: Security implementation and performance optimization
- Week 12: Monitoring, alerting, and production deployment

### Key Milestones

**Milestone 1** (End of Week 3): Apollo Federation Gateway operational
- ✅ Unified GraphQL API for queries/mutations
- ✅ User and Chat service integration complete
- ✅ Basic authentication and routing working

**Milestone 2** (End of Week 6): WebSocket Gateway operational
- ✅ Real-time subscriptions working end-to-end
- ✅ Chat message and user presence subscriptions
- ✅ Connection management and performance optimized

**Milestone 3** (End of Week 8): Authentication unified
- ✅ JWT validation working across both gateways
- ✅ WebSocket authentication and authorization
- ✅ Session management and security implemented

**Milestone 4** (End of Week 10): Client integration complete
- ✅ Client SDK supporting dual connections
- ✅ Automatic routing and connection management
- ✅ End-to-end testing and validation

**Milestone 5** (End of Week 12): Production ready
- ✅ Security and performance optimizations
- ✅ Monitoring and alerting configured
- ✅ Production deployment and validation

## Risk Mitigation Strategies

### Technical Risks

**Risk 1: Apollo Federation complexity**
- **Mitigation**: Leverage existing User Service federation patterns
- **Fallback**: Use PoC patterns as reference implementation
- **Timeline Impact**: Low (well-documented patterns available)

**Risk 2: WebSocket Gateway performance**
- **Mitigation**: Use PoC performance baseline and optimization patterns
- **Fallback**: Implement connection limits and resource monitoring
- **Timeline Impact**: Medium (requires performance testing)

**Risk 3: Dual connection client complexity**
- **Mitigation**: Create comprehensive client SDK with clear abstractions
- **Fallback**: Provide detailed documentation and examples
- **Timeline Impact**: Medium (client-side complexity)

**Risk 4: Authentication synchronization**
- **Mitigation**: Use shared JWT validation and Redis session storage
- **Fallback**: Implement token refresh mechanisms
- **Timeline Impact**: Low (established patterns available)

### Operational Risks

**Risk 1: Deployment coordination**
- **Mitigation**: Independent service deployment with feature flags
- **Fallback**: Gradual rollout with traffic splitting
- **Timeline Impact**: Low (microservice architecture supports independence)

**Risk 2: Monitoring complexity**
- **Mitigation**: Unified observability platform with shared metrics
- **Fallback**: Service-specific monitoring with correlation IDs
- **Timeline Impact**: Medium (requires comprehensive monitoring setup)

**Risk 3: Load balancer configuration**
- **Mitigation**: Use nginx or AWS ALB with WebSocket support
- **Fallback**: Service-specific load balancing
- **Timeline Impact**: Low (standard configuration patterns)

### Business Risks

**Risk 1: Development timeline delays**
- **Mitigation**: Parallel development where possible, clear milestones
- **Fallback**: Prioritize core functionality, defer advanced features
- **Timeline Impact**: Medium (can be managed with proper planning)

**Risk 2: Team learning curve**
- **Mitigation**: Leverage PoC documentation and training materials
- **Fallback**: Pair programming and knowledge sharing sessions
- **Timeline Impact**: Low (PoC provides clear implementation guidance)

## Related Documents

### Core Planning Documents
- [Server Plan](SERVER_PLAN.md) - Main server implementation plan
- [Service Standardization Plan](SERVICE_STANDARDIZATION_PLAN.md) - Standardization patterns
- [Shared Infrastructure Modules](SHARED_INFRASTRUCTURE_MODULES.md) - Shared modules documentation

### Service Integration
- [Auth Service Plan](AUTH_SERVICE_PLAN.md) - Authentication service integration
- [User Service Plan](USER_SERVICE_PLAN.md) - User service integration
- [Chat Service Plan](CHAT_SERVICE_PLAN.md) - Chat service integration

### Architecture and Implementation
- [DDD Implementation Guide](DDD_IMPLEMENTATION_GUIDE.md) - Domain-Driven Design patterns
- [Security Standards Guide](SECURITY_STANDARDS_GUIDE.md) - Security implementation
- [Testing Standards Guide](TESTING_STANDARDS_GUIDE.md) - Testing patterns

### Infrastructure Documentation
- [Database Plan](../database/DATABASE_PLAN.md) - Database architecture
- [Redis Implementation Plan](../redis/REDIS_IMPLEMENTATION_PLAN.md) - Redis setup
- [Kafka Setup](../kafka/KAFKA_SETUP.md) - Kafka configuration

## Testing Strategy for Hybrid Architecture

### Apollo Federation Gateway Testing
- **Unit Tests**: GraphQL module configuration and schema composition
- **Integration Tests**: Cross-service query execution and entity resolution
- **Performance Tests**: Query execution time and federation overhead
- **Security Tests**: Authentication and authorization validation

### WebSocket Gateway Testing
- **Unit Tests**: Subscription resolver logic and filtering
- **Integration Tests**: End-to-end subscription flow with services
- **Performance Tests**: Connection scalability and message throughput
- **Security Tests**: WebSocket authentication and authorization

### End-to-End Testing
- **Dual Connection Tests**: Client connecting to both gateways simultaneously
- **Failover Tests**: Gateway failure and recovery scenarios
- **Authentication Tests**: JWT validation across both gateways
- **Load Tests**: High-concurrency scenarios with both gateways

### Monitoring and Observability
- **Metrics**: Connection counts, query performance, subscription latency
- **Tracing**: Distributed tracing across both gateways and services
- **Alerting**: Gateway health, performance degradation, error rates
- **Dashboards**: Unified view of hybrid architecture performance

## Document Information
- **Author**: Chat Application Team
- **Created**: 2024-01-15
- **Last Updated**: 2024-01-15
- **Version**: 3.0.0
- **Status**: ✅ ARCHITECTURE FINALIZED - Hybrid approach selected based on PoC validation
- **Change Log**:
  - 3.0.0: Complete rewrite for Hybrid Architecture with detailed implementation plan
  - 2.1.0: Added GraphQL Federation subscription analysis and alternative solutions
  - 2.0.0: Complete rewrite with detailed implementation plan and federation setup
  - 1.0.0: Initial basic plan

## Implementation Readiness

### ✅ Ready to Proceed
1. **Apollo Federation Gateway**: Well-documented patterns, existing User Service integration
2. **WebSocket Gateway**: PoC validated, clear implementation path
3. **Authentication**: Established JWT patterns, shared infrastructure available
4. **Monitoring**: Existing observability platform, clear metrics strategy

### 📋 Next Immediate Actions
1. **Week 1**: Begin Apollo Federation Gateway implementation (Phase 2)
2. **Week 3**: Start WebSocket Gateway development (Phase 3)
3. **Week 4**: Implement request routing and service discovery (Phase 4)
4. **Week 7**: Integrate authentication across both gateways (Phase 5)

### 🎯 Success Metrics
- **Functionality**: All existing GraphQL operations work through Apollo Federation Gateway
- **Real-time**: Chat subscriptions working with <100ms latency through WebSocket Gateway
- **Performance**: No degradation in query performance, <5% overhead for federation
- **Reliability**: 99.9% uptime for both gateways, automatic failover working
- **Security**: All authentication and authorization requirements met
