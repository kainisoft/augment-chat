# API Gateway Service Implementation Plan

## Overview
The API Gateway serves as the single entry point for all client requests in the chat application ecosystem. It handles GraphQL schema federation, authentication, request routing, and provides a unified API interface that combines functionality from multiple microservices.

## Technology Stack
- NestJS with Fastify
- GraphQL with Apollo Server and Federation
- JWT Authentication middleware
- Service discovery and routing
- WebSocket support for real-time subscriptions
- Redis for caching and session management

## Service Architecture

The API Gateway follows the established 'gold standard' patterns and integrates with shared infrastructure modules:

- **GraphQL Federation**: Combines schemas from User Service and Chat Service
- **Authentication Middleware**: Integrates with Auth Service for JWT validation
- **Request Routing**: Intelligent routing to appropriate microservices
- **Caching Layer**: Redis-based caching for performance optimization
- **Real-time Support**: WebSocket gateway for GraphQL subscriptions
- **Security**: CORS, rate limiting, and security headers
- **Monitoring**: Comprehensive metrics and health checks

## Current Implementation Status

### Phase 1: Basic Infrastructure Setup ✅ COMPLETED
- ✅ **Initialize service with NestJS CLI**
  - ✅ Service created at `server/apps/api-gateway/`
  - ✅ Basic NestJS structure in place
- ✅ **Configure Fastify adapter**
  - ✅ Bootstrap service configured with Fastify in `main.ts`
  - ✅ Port 4000 configured for API Gateway
- ✅ **Basic module structure**
  - ✅ Main module with logging and metrics integration
  - ✅ Health check endpoints implemented
  - ✅ Shared infrastructure modules integrated

### Phase 2: GraphQL Federation Setup ⏳ PENDING
- ☐ **Apollo Federation Gateway setup**
  - ☐ Install and configure Apollo Federation packages
  - ☐ Set up federated gateway configuration
  - ☐ Configure service discovery for microservices
- ☐ **Schema composition and stitching**
  - ☐ Integrate User Service GraphQL schema
  - ☐ Integrate Chat Service GraphQL schema
  - ☐ Configure schema delegation and resolver composition
  - ☐ Handle schema conflicts and type merging
- ☐ **GraphQL playground and introspection**
  - ☐ Configure GraphQL playground for development
  - ☐ Set up schema introspection
  - ☐ Add schema documentation and examples

### Phase 3: Request Routing and Service Proxy ⏳ PENDING
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

### Phase 4: Authentication Middleware Integration ⏳ PENDING
- ☐ **JWT authentication middleware**
  - ☐ Integrate with Auth Service for token validation
  - ☐ Implement JWT middleware for protected operations
  - ☐ Add user context injection for downstream services
- ☐ **Authorization and permissions**
  - ☐ Implement role-based access control
  - ☐ Add operation-level authorization
  - ☐ Configure permission validation
- ☐ **Session management**
  - ☐ Integrate with Redis for session storage
  - ☐ Implement session validation and refresh
  - ☐ Add session-based routing

### Phase 5: Real-time Communication ⏳ PENDING
- ☐ **WebSocket gateway setup**
  - ☐ Configure WebSocket support for subscriptions
  - ☐ Implement subscription routing to services
  - ☐ Add connection management and authentication
- ☐ **GraphQL subscriptions**
  - ☐ Set up subscription federation
  - ☐ Implement real-time message broadcasting
  - ☐ Add subscription filtering and authorization
- ☐ **Connection management**
  - ☐ Implement connection pooling
  - ☐ Add connection health monitoring
  - ☐ Configure connection limits and throttling

### Phase 6: Security and Production Readiness ⏳ PENDING
- ☐ **Security headers and CORS**
  - ☐ Configure CORS policies
  - ☐ Implement security headers
  - ☐ Add request sanitization
- ☐ **Rate limiting and throttling**
  - ☐ Implement operation-based rate limiting
  - ☐ Add IP-based throttling
  - ☐ Configure rate limit headers
- ☐ **Caching and performance**
  - ☐ Implement GraphQL query caching
  - ☐ Add response caching strategies
  - ☐ Configure cache invalidation
- ☐ **Monitoring and observability**
  - ☐ Add comprehensive metrics collection
  - ☐ Implement distributed tracing
  - ☐ Configure alerting and dashboards

## Detailed Implementation Plan

### Phase 2: GraphQL Federation Setup (Priority 1)

**Objective**: Set up Apollo Federation Gateway to combine User Service and Chat Service GraphQL schemas into a unified API.

**Duration**: 1 week

**Prerequisites**:
- ✅ User Service GraphQL API is operational
- ✅ Chat Service GraphQL API is operational
- ✅ Both services expose federated schemas

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
   - ☐ Add circuit breaker metrics

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
   - ☐ Add session monitoring and metrics

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
   - ☐ Implement connection metrics

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

#### Step 3: Monitoring and Observability

**Implementation Tasks**:
1. **Metrics Collection**:
   - ☐ Add comprehensive metrics collection
   - ☐ Implement custom business metrics
   - ☐ Configure performance metrics
   - ☐ Add error rate monitoring

2. **Distributed Tracing**:
   - ☐ Implement distributed tracing
   - ☐ Add request correlation
   - ☐ Configure trace sampling
   - ☐ Implement trace aggregation

3. **Alerting and Dashboards**:
   - ☐ Configure alerting rules
   - ☐ Create monitoring dashboards
   - ☐ Add health check endpoints
   - ☐ Implement automated incident response

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
METRICS_ENABLED=true
TRACING_ENABLED=true
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
├── monitoring/              # Metrics and observability
│   ├── monitoring.module.ts
│   ├── metrics/
│   └── tracing/
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
- **Monitoring**: Test metrics collection and alerting

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
- Add metrics collection
- Configure alerting
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

### Performance Metrics
- **Response Time**: < 100ms for simple queries, < 500ms for complex queries
- **Throughput**: > 1000 requests per second
- **Availability**: > 99.9% uptime
- **Error Rate**: < 0.1% for successful operations
- **Cache Hit Rate**: > 80% for cacheable operations

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
4. **Monitoring Gaps**: Comprehensive metrics and alerting

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

## Document Information
- **Author**: Chat Application Team
- **Created**: 2024-01-15
- **Last Updated**: 2024-01-15
- **Version**: 2.0.0
- **Change Log**:
  - 2.0.0: Complete rewrite with detailed implementation plan and federation setup
  - 1.0.0: Initial basic plan
