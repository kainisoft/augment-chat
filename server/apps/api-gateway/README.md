# API Gateway

## Overview

The API Gateway serves as the single entry point for all client requests in the microservice architecture. It handles request routing, authentication, rate limiting, and provides a unified GraphQL API by federating schemas from multiple services.

## Features

- **GraphQL Federation**: Unified GraphQL schema from multiple services
- **Authentication Middleware**: JWT token validation and user context injection
- **Request Routing**: Intelligent routing to appropriate microservices
- **Rate Limiting**: Configurable rate limits per user and endpoint
- **CORS Handling**: Cross-origin request support for web clients
- **Request/Response Transformation**: Data transformation and validation
- **Circuit Breaker**: Fault tolerance for downstream service failures
- **Load Balancing**: Distribution of requests across service instances

## Architecture

The service follows Domain-Driven Design (DDD) patterns and integrates with shared infrastructure modules:

- **Gateway Controller**: Main entry point for all requests
- **GraphQL Gateway**: Schema federation and query execution
- **Authentication Guards**: JWT validation and authorization
- **Rate Limiting Middleware**: Request throttling and abuse prevention
- **Service Clients**: HTTP clients for downstream service communication
- **Circuit Breakers**: Fault tolerance mechanisms

## API Endpoints

### GraphQL Federation
- `POST /graphql` - Unified GraphQL endpoint
- `GET /graphql` - GraphQL playground (development only)

### Authentication
- `POST /auth/login` - User authentication (proxied to auth-service)
- `POST /auth/register` - User registration (proxied to auth-service)
- `POST /auth/refresh` - Token refresh (proxied to auth-service)
- `POST /auth/logout` - User logout (proxied to auth-service)

### Health Monitoring
- `GET /health` - Comprehensive health check
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe
- `GET /health/services` - Downstream service health status

### Admin Endpoints
- `GET /admin/metrics` - Gateway performance metrics
- `GET /admin/rate-limits` - Current rate limit status
- `POST /admin/circuit-breaker/reset` - Reset circuit breakers

## Dependencies

### Shared Modules
- `@app/dtos` - Shared data transfer objects for API responses
- `@app/validation` - Shared validation decorators
- `@app/security` - Security utilities, guards, and rate limiting
- `@app/logging` - Centralized logging service
- `@app/testing` - Shared testing utilities
- `@app/domain` - Shared domain models (UserId, etc.)
- `@app/iam` - Identity and Access Management
- `@app/graphql` - GraphQL utilities and federation helpers

#### Shared Module Integration Examples

**Using Security Guards:**
```typescript
import { JwtAuthGuard, RateLimitGuard } from '@app/security';

@Controller('api')
@UseGuards(JwtAuthGuard, RateLimitGuard)
export class GatewayController {
  @Post('protected-endpoint')
  @RateLimit({ points: 10, duration: 60 })
  async protectedEndpoint(@Request() req) {
    return this.processRequest(req);
  }
}
```

**Using Validation Decorators:**
```typescript
import { IsStringField, IsOptionalField } from '@app/validation';

export class GatewayRequestDto {
  @IsStringField({
    description: 'Request identifier',
    example: 'req-123',
  })
  requestId: string;

  @IsOptionalField()
  @IsStringField({
    description: 'Optional metadata',
    example: 'additional-info',
  })
  metadata?: string;
}
```

**Using GraphQL Federation:**
```typescript
import { GraphQLFederationService } from '@app/graphql';

@Injectable()
export class GraphQLGatewayService {
  constructor(
    private readonly federationService: GraphQLFederationService,
  ) {}

  async createFederatedSchema() {
    return this.federationService.buildFederatedSchema([
      { name: 'user-service', url: 'http://user-service:4002/graphql' },
      { name: 'chat-service', url: 'http://chat-service:4003/graphql' },
    ]);
  }
}
```

### External Dependencies
- **Downstream Services**: All microservices (auth, user, chat, notification, logging)
- **Redis**: Caching and rate limiting storage
- **GraphQL**: Schema federation and query execution

## Development

### Running the Service

```bash
# Development mode
pnpm run start:dev api-gateway

# Production mode
pnpm run start:prod api-gateway

# Debug mode
pnpm run start:debug api-gateway
```

### Testing

The service uses the shared `@app/testing` module for consistent testing patterns.

#### Unit Tests

```bash
# Run all api-gateway tests
pnpm test -- --testPathPattern=api-gateway

# Run specific test file
pnpm test -- api-gateway.controller.spec.ts

# Run tests with coverage
pnpm test -- --coverage --testPathPattern=api-gateway
```

#### E2E Tests

```bash
# Run E2E tests
pnpm run test:e2e api-gateway
```

#### Testing Patterns

**Controller Tests:**
```typescript
import { ControllerTestBuilder, MockFactoryService } from '@app/testing';
import { ApiGatewayController } from './api-gateway.controller';

describe('ApiGatewayController', () => {
  let testSetup: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const controllerTestBuilder = new ControllerTestBuilder(/* ... */);
    testSetup = await controllerTestBuilder.createControllerTestSetup(
      ApiGatewayController,
      {
        providers: [
          {
            provide: 'GatewayService',
            useValue: mockFactory.createMockGatewayService(),
          },
        ],
      },
    );
  });

  it('should route requests correctly', async () => {
    const requestDto = mockFactory.createMockGatewayRequest();
    const result = await testSetup.controller.handleRequest(requestDto);
    expect(result).toBeDefined();
  });
});
```

**GraphQL Federation Tests:**
```typescript
import { ServiceTestBuilder, MockFactoryService } from '@app/testing';
import { GraphQLGatewayService } from './graphql-gateway.service';

describe('GraphQLGatewayService', () => {
  let testSetup: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const serviceTestBuilder = new ServiceTestBuilder(/* ... */);
    testSetup = await serviceTestBuilder.createServiceTestSetup(GraphQLGatewayService, {
      federationService: mockFactory.createMockFederationService(),
    });
  });

  it('should create federated schema', async () => {
    const schema = await testSetup.service.createFederatedSchema();
    expect(schema).toBeDefined();
  });
});
```

### Environment Variables

```env
# Service Configuration
PORT=4000
NODE_ENV=development

# Downstream Services
AUTH_SERVICE_URL=http://localhost:4001
USER_SERVICE_URL=http://localhost:4002
CHAT_SERVICE_URL=http://localhost:4003
NOTIFICATION_SERVICE_URL=http://localhost:4004
LOGGING_SERVICE_URL=http://localhost:4005

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h

# Rate Limiting
RATE_LIMIT_POINTS=100
RATE_LIMIT_DURATION=60

# GraphQL
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
GRAPHQL_DEBUG=false

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

## Migration Notes

### Standardization Changes

During the service standardization process, the API Gateway was updated to:

1. **Shared Module Integration**: Migrated to use shared infrastructure modules
2. **Security Standardization**: Adopted shared security guards and rate limiting from `@app/security`
3. **Validation Standardization**: Replaced custom validation with `@app/validation` decorators
4. **Testing Standardization**: Migrated to shared testing utilities from `@app/testing`
5. **GraphQL Integration**: Enhanced GraphQL federation using `@app/graphql` utilities
6. **Logging Integration**: Integrated with centralized logging from `@app/logging`

### Performance Optimizations

- **Connection Pooling**: Optimized HTTP client connections to downstream services
- **Response Caching**: Implemented intelligent caching for frequently requested data
- **Circuit Breaker**: Added fault tolerance for improved reliability
- **Request Batching**: Optimized GraphQL query batching and execution

## GraphQL Federation

### Schema Composition

```typescript
// Federated schema configuration
const federatedSchema = await buildFederatedSchema([
  {
    name: 'user-service',
    url: process.env.USER_SERVICE_URL + '/graphql',
    typeDefs: userServiceTypeDefs,
  },
  {
    name: 'chat-service',
    url: process.env.CHAT_SERVICE_URL + '/graphql',
    typeDefs: chatServiceTypeDefs,
  },
]);
```

### Query Execution

```typescript
// Federated query execution
@Resolver()
export class FederatedResolver {
  @Query(() => User)
  async user(@Args('id') id: string, @Context() context) {
    return this.federationService.executeQuery(
      'user-service',
      `query { user(id: "${id}") { id email profile { displayName } } }`,
      context,
    );
  }
}
```

## Deployment

### Docker

```bash
# Build image
docker build -t api-gateway .

# Run container
docker run -p 4000:4000 api-gateway
```

### Docker Compose

```bash
# Start all services
docker-compose up api-gateway

# Start with dependencies
docker-compose up api-gateway redis auth-service user-service chat-service
```

## Monitoring

### Health Checks

- **System Health**: Gateway status and resource usage
- **Downstream Services**: Health status of all connected services
- **Redis Health**: Cache connectivity and performance
- **GraphQL Health**: Schema federation and query execution status

### Logging

Structured logging using `@app/logging`:

- **Request Logging**: All incoming requests with timing and status
- **Route Logging**: Request routing decisions and downstream calls
- **Error Logging**: Detailed error information with request context
- **Performance Logging**: Response times and throughput metrics

### Metrics

Key performance indicators:

- **Request Volume**: Requests per second and total throughput
- **Response Times**: P50, P95, P99 response time percentiles
- **Error Rates**: Error percentage by endpoint and service
- **Rate Limiting**: Rate limit hits and blocked requests
- **Circuit Breaker**: Circuit breaker state and failure rates

### Performance Monitoring

The API Gateway integrates with the comprehensive performance monitoring system:

#### Performance Baselines (Current)
- **Bundle Size**: 418.85 KB (59.15 KB gzipped)
- **Average Response Time**: <50ms for proxied requests
- **GraphQL Federation**: <100ms for federated queries
- **Rate Limiting**: <5ms overhead per request
- **Circuit Breaker**: <1ms overhead per request
- **Memory Usage**: ~30 MB average, no memory leaks detected
- **Build Time**: 3.9s average

#### Performance Tools Integration
```bash
# Run performance analysis specific to api-gateway
pnpm perf:monitor --service=api-gateway

# Analyze gateway routing performance
pnpm perf:routing --service=api-gateway

# Monitor GraphQL federation performance
pnpm perf:federation --service=api-gateway

# Analyze rate limiting performance
pnpm perf:ratelimit --service=api-gateway
```

#### Performance Optimizations Applied
- **Connection Pooling**: Optimized HTTP client connections to downstream services
- **Response Caching**: Intelligent caching for frequently requested data
- **GraphQL Federation**: Optimized schema federation and query execution
- **Rate Limiting Optimization**: Efficient Redis-based rate limiting
- **Circuit Breaker**: Optimized fault tolerance with minimal overhead

#### Gateway Performance Features
- **Request Routing**: High-performance request routing and load balancing
- **Federation Efficiency**: Optimized GraphQL schema federation
- **Caching Strategy**: Multi-layer caching for improved response times
- **Fault Tolerance**: Circuit breaker patterns with minimal performance impact

#### Monitoring Integration
- **@app/metrics**: Integrated performance metrics collection
- **Custom Metrics**: Service-specific gateway and routing metrics
- **Federation Metrics**: GraphQL federation performance and query complexity
- **Rate Limiting Metrics**: Rate limit effectiveness and performance impact
- **Circuit Breaker Metrics**: Fault tolerance effectiveness and recovery times
- **Downstream Metrics**: Performance monitoring of all connected services
- **Alerting**: Gateway performance and downstream service health monitoring
- **Dashboards**: Real-time gateway performance and service health visualization

For detailed performance documentation, see [Performance Documentation Index](../../docs/server/performance/README.md).

## Security

### Authentication & Authorization

- **JWT Validation**: Token verification for all protected endpoints
- **User Context**: Automatic user context injection for downstream services
- **Role-Based Access**: Fine-grained permissions based on user roles
- **API Key Support**: Optional API key authentication for service-to-service calls

### Rate Limiting

- **Per-User Limits**: Individual user request throttling
- **Per-Endpoint Limits**: Specific limits for different API endpoints
- **Global Limits**: Overall system protection against abuse
- **Dynamic Limits**: Adjustable limits based on user tier or subscription

## Troubleshooting

### Common Issues

1. **Service Connectivity**: Check downstream service health and network connectivity
2. **GraphQL Federation**: Verify service schemas and federation configuration
3. **Rate Limiting**: Check Redis connectivity and rate limit configuration
4. **Authentication**: Verify JWT secret and token validation

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development pnpm run start:debug api-gateway

# GraphQL debugging
GRAPHQL_DEBUG=true pnpm run start:dev api-gateway
```

## Contributing

1. Follow the established patterns from shared modules
2. Write comprehensive tests using `@app/testing` utilities
3. Update GraphQL federation configuration for new services
4. Ensure proper error handling and circuit breaker patterns
5. Follow the service standardization guidelines

## Related Documentation

- [API Gateway Plan](../../docs/server/API_GATEWAY_PLAN.md)
- [Service Standardization Plan](../../docs/server/SERVICE_STANDARDIZATION_PLAN.md)
- [Shared Infrastructure Modules](../../docs/server/SHARED_INFRASTRUCTURE_MODULES.md)
- [Testing Standards Guide](../../docs/server/TESTING_STANDARDS_GUIDE.md)
- [GraphQL Federation Guide](../../docs/server/GRAPHQL_FEDERATION_GUIDE.md)
- [Security Standards Guide](../../docs/server/SECURITY_STANDARDS_GUIDE.md)
