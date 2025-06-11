# Auth Service

## Overview

The Auth Service is responsible for user authentication, authorization, and session management in the microservice architecture. It provides secure user registration, login, token management, and session handling capabilities.

## Features

- **User Registration**: Secure user account creation with validation
- **User Authentication**: Login with email/password credentials
- **Token Management**: JWT access and refresh token generation and validation
- **Session Management**: Redis-based session storage and management
- **Password Security**: Bcrypt password hashing and validation
- **Rate Limiting**: Protection against brute force attacks
- **Health Monitoring**: Comprehensive health checks for dependencies

## Architecture

The service follows Domain-Driven Design (DDD) and CQRS patterns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic and orchestration
- **Repositories**: Data access layer abstraction
- **Domain Objects**: User, Email, Password, UserId value objects
- **DTOs**: Data transfer objects for API communication
- **Guards**: Authentication and authorization middleware

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user and create session
- `POST /auth/logout` - Terminate user session
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/reset-password` - Complete password reset

### Health Monitoring
- `GET /health` - Comprehensive health check
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe

## Dependencies

### Shared Modules
- `@app/dtos` - Shared data transfer objects for authentication responses
- `@app/validation` - Shared validation decorators for input validation
- `@app/security` - Security utilities, guards, rate limiting, and Identity and Access Management
- `@app/logging` - Centralized logging service with security event logging
- `@app/testing` - Shared testing utilities and mock factories
- `@app/domain` - Shared domain models (UserId, Email, Password, etc.)
- `@app/events` - Event interfaces for inter-service communication
- `@app/kafka` - Event publishing and consumption
- `@app/redis` - Session management and token storage

#### Shared Module Integration Examples

**Using Validation Decorators:**
```typescript
import { IsEmailField, IsPasswordField, IsStringField } from '@app/validation';

export class RegisterDto {
  @IsEmailField({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @IsPasswordField({
    description: 'User password',
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
  })
  password: string;

  @IsStringField({
    description: 'Display name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
  })
  displayName: string;
}
```

**Using Shared DTOs:**
```typescript
import { ApiResponseDto, ErrorResponseDto } from '@app/dtos';

export class AuthResponseDto extends ApiResponseDto<AuthTokensDto> {
  constructor(tokens: AuthTokensDto, message = 'Authentication successful') {
    super(tokens, message);
  }
}

export class AuthErrorResponseDto extends ErrorResponseDto {
  constructor(message: string, code: string) {
    super(message, code, 'AUTHENTICATION_ERROR');
  }
}
```

**Using Domain Models:**
```typescript
import { UserId, Email, Password } from '@app/domain';

export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private readonly password: Password,
    private readonly displayName: string,
  ) {}

  validatePassword(plainPassword: string): boolean {
    return this.password.verify(plainPassword);
  }
}
```

**Using Security Guards:**
```typescript
import { JwtAuthGuard, RateLimitGuard } from '@app/security';

@Controller('auth')
@UseGuards(RateLimitGuard)
export class AuthController {
  @Post('login')
  @RateLimit({ points: 5, duration: 300 }) // 5 attempts per 5 minutes
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }
}
```

#### DTO Standardization
The Auth Service uses standardized DTOs from `@app/dtos` for consistent response patterns:

- **Session Lists**: `SessionListDto` extends `ListResponseDto<SessionInfoDto>`
- **Session History**: `SessionHistoryDto` extends `HistoryResponseDto<SessionHistoryEntryDto>`
- **Error Handling**: Consistent error response format across all operations
- **Pagination**: Standardized pagination metadata for session management

### External Dependencies
- **PostgreSQL**: User data storage via Drizzle ORM
- **Redis**: Session storage and caching
- **Kafka**: Event publishing for service communication

## Development

### Running the Service

```bash
# Development mode
npm run start:dev auth-service

# Production mode
npm run start:prod auth-service

# Debug mode
npm run start:debug auth-service
```

### Testing

The service uses the shared `@app/testing` module for consistent testing patterns.

#### Unit Tests

```bash
# Run all auth-service tests
npm test -- --testPathPattern=auth-service

# Run specific test file
npm test -- auth.controller.spec.ts

# Run tests with coverage
npm test -- --coverage --testPathPattern=auth-service
```

#### E2E Tests

```bash
# Run E2E tests
npm run test:e2e auth-service
```

#### Testing Patterns

The service follows standardized testing patterns using shared utilities:

**Controller Tests:**
```typescript
import { ControllerTestBuilder } from '@app/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let testSetup: any;

  beforeEach(async () => {
    const controllerTestBuilder = new ControllerTestBuilder(/* ... */);
    testSetup = await controllerTestBuilder.createAuthControllerTestSetup(
      AuthController,
      {
        guards: [{ guard: RateLimitGuard, mockValue: { canActivate: () => true } }],
      },
    );
  });

  it('should register user', async () => {
    const result = await testSetup.controller.register(
      testSetup.testData.registerDto,
      testSetup.mockRequest,
    );
    expect(result).toEqual(testSetup.testData.authResponse);
  });
});
```

**Service Tests:**
```typescript
import { ServiceTestBuilder } from '@app/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let testSetup: any;

  beforeEach(async () => {
    const serviceTestBuilder = new ServiceTestBuilder(/* ... */);
    testSetup = await serviceTestBuilder.createAuthServiceTestSetup(AuthService);
  });

  it('should authenticate user', async () => {
    testSetup.userRepository.findByEmail.mockResolvedValue(testSetup.testData.mockUser);
    const result = await testSetup.service.login(testSetup.testData.loginDto);
    expect(result).toBeDefined();
  });
});
```

**E2E Tests:**
```typescript
import { E2ETestSetupService } from '@app/testing';
import { AuthModule } from '../src/auth.module';

describe('Auth E2E', () => {
  let app: INestApplication;
  let testRequest: any;

  beforeEach(async () => {
    const e2eSetup = new E2ETestSetupService(/* ... */);
    app = await e2eSetup.createTestApp(AuthModule);
    testRequest = e2eSetup.createTestRequest(app);
  });

  it('/auth/login (POST)', async () => {
    const response = await testRequest.post('/auth/login').send(loginData);
    expect(response.status).toBe(200);
  });
});
```

### Code Quality

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety and compile-time checks
- **Jest**: Unit and integration testing
- **Husky**: Git hooks for quality gates

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=auth-service

# Service
PORT=4001
NODE_ENV=development
```

## Migration Notes

### Standardization Changes

During the service standardization process, the Auth Service underwent significant architectural improvements:

#### 1. Shared Module Integration
- **Before**: Custom validation logic and DTOs scattered throughout the service
- **After**: Migrated to shared `@app/validation` decorators and `@app/dtos` patterns
- **Impact**: Reduced code duplication by ~40% and improved consistency

#### 2. Folder Structure Standardization
- **Before**: Flat structure with mixed concerns
- **After**: DDD-aligned structure matching user-service 'gold standard'
- **Changes**:
  ```
  src/
  ├── application/          # CQRS commands, queries, handlers
  ├── domain/              # Domain entities and value objects
  ├── infrastructure/      # External integrations (DB, Redis, Kafka)
  ├── presentation/        # Controllers and DTOs
  └── auth-service.module.ts
  ```

#### 3. CQRS Implementation
- **Before**: Service-based architecture with mixed read/write operations
- **After**: Full CQRS implementation with command/query separation
- **Benefits**: Better scalability, clearer separation of concerns

#### 4. Event-Driven Communication
- **Before**: Direct HTTP calls between services
- **After**: Kafka-based event communication using `@app/events`
- **Events Published**:
  - `UserRegisteredEvent`: When new user registers
  - `UserLoginEvent`: When user successfully logs in
  - `UserLogoutEvent`: When user logs out
  - `PasswordChangedEvent`: When user changes password

#### 5. Security Enhancements
- **Before**: Basic JWT implementation
- **After**: Comprehensive security using `@app/security`
- **Improvements**:
  - Rate limiting with Redis backend
  - Enhanced session management
  - Comprehensive security logging
  - Account lockout mechanisms

#### 6. Testing Standardization
- **Before**: Custom test utilities and mocks
- **After**: Shared testing patterns using `@app/testing`
- **Benefits**: Consistent test structure, reusable mock factories, better coverage

#### 7. Security Integration
- **Before**: Service-specific authentication and authorization logic
- **After**: Centralized security using `@app/security` module
- **Changes**:
  - Replaced custom JWT guards with `JwtAuthGuard` from Security module
  - Implemented role-based access control using `@Roles()` decorator
  - Added `@Public()` decorator for public endpoints
  - Centralized user context injection across all endpoints
- **Benefits**: Consistent authentication across all services, centralized security policies

### Performance Optimizations

#### Database Optimizations
- Added indexes for frequently queried fields (email, userId)
- Implemented connection pooling for better resource management
- Optimized query patterns for user lookup and session management

#### Caching Strategy
- **Session Caching**: Redis-based session storage with TTL
- **User Data Caching**: Frequently accessed user data cached for 15 minutes
- **Rate Limit Caching**: Efficient rate limiting using Redis sliding window

#### Memory Management
- Implemented object pooling for frequently created objects
- Optimized JWT token generation and validation
- Reduced memory allocation in hot paths

### Breaking Changes

#### API Changes
- **Response Format**: All responses now use standardized `@app/dtos` format
- **Error Handling**: Consistent error response structure across all endpoints
- **Validation**: Enhanced validation with detailed error messages

#### Configuration Changes
- **Environment Variables**: Some environment variable names changed for consistency
- **Redis Configuration**: Enhanced Redis configuration for session management
- **Kafka Configuration**: New Kafka configuration for event publishing

### Migration Checklist

For teams adopting these changes:

- [ ] Update environment variables to match new configuration
- [ ] Update client applications to handle new response formats
- [ ] Test event handling integration with other services
- [ ] Verify rate limiting configuration matches requirements
- [ ] Update monitoring and alerting for new metrics
- [ ] Review and update documentation for API changes

## Deployment

### Docker

```bash
# Build image
docker build -t auth-service .

# Run container
docker run -p 4002:4002 auth-service
```

### Docker Compose

```bash
# Start all services
docker-compose up auth-service

# Start with dependencies
docker-compose up auth-service postgres redis kafka
```

## Monitoring

### Health Checks

The service provides comprehensive health monitoring:

- **System Health**: CPU, memory, and disk usage
- **Database Health**: PostgreSQL connection and query performance
- **Redis Health**: Connection status and response time
- **Kafka Health**: Broker connectivity and topic availability

### Logging

Structured logging with contextual information:

- **Request Logging**: HTTP requests and responses
- **Error Logging**: Detailed error information with stack traces
- **Security Logging**: Authentication attempts and security events
- **Performance Logging**: Response times and resource usage

### Metrics

Key performance indicators:

- **Authentication Rate**: Successful/failed login attempts
- **Token Generation**: Access and refresh token creation
- **Session Management**: Active sessions and session duration
- **Error Rates**: Service error frequency and types

### Performance Monitoring

The Auth Service integrates with the comprehensive performance monitoring system:

#### Performance Baselines (Current)
- **Bundle Size**: 705.29 KB (99.61 KB gzipped)
- **Average Response Time**: <100ms for authentication operations
- **Token Generation**: <5ms for JWT creation
- **Session Operations**: <10ms for Redis operations
- **Memory Usage**: ~28 MB average, no memory leaks detected
- **Build Time**: 4.8s average

#### Performance Tools Integration
```bash
# Run performance analysis specific to auth-service
pnpm perf:monitor --service=auth-service

# Analyze authentication performance
pnpm perf:auth --service=auth-service

# Monitor session performance
pnpm perf:sessions --service=auth-service

# Analyze security operations
pnpm perf:security --service=auth-service
```

#### Performance Optimizations Applied
- **Password Hashing Optimization**: Optimized bcrypt rounds for security/performance balance
- **JWT Optimization**: Efficient token generation and validation
- **Redis Session Caching**: Optimized session storage and retrieval
- **Rate Limiting Optimization**: Efficient Redis-based rate limiting
- **Database Query Optimization**: Optimized user lookup and authentication queries

#### Security Performance Features
- **Concurrent Authentication**: Support for high-volume authentication requests
- **Session Scaling**: Efficient session management for large user bases
- **Rate Limiting Efficiency**: Low-latency rate limiting with Redis
- **Token Validation**: Fast JWT validation with caching

#### Monitoring Integration
- **External Monitoring**: PM2 for process management and performance monitoring
- **Security Metrics**: Failed login attempts, rate limiting, and security events tracked via logging
- **Session Metrics**: Active sessions, session duration, and cleanup efficiency via Redis monitoring
- **Health Checks**: Built-in health endpoints for service status monitoring
- **Alerting**: Security and performance threshold monitoring via external tools
- **Dashboards**: Real-time authentication and security visualization via PM2 and log aggregation

For detailed performance documentation, see [Performance Documentation Index](../../docs/server/performance/README.md).

## Security

### Authentication Flow

1. User submits credentials via `/auth/login`
2. Service validates credentials against database
3. Password verification using bcrypt
4. JWT tokens generated (access + refresh)
5. Session created in Redis
6. Tokens returned to client

### Security Features

- **Password Hashing**: Bcrypt with configurable rounds
- **JWT Tokens**: Signed with secret, short-lived access tokens
- **Session Management**: Redis-based session storage
- **Rate Limiting**: Configurable request rate limits
- **Input Validation**: Comprehensive DTO validation
- **CORS**: Cross-origin request handling

## Troubleshooting

### Common Issues

1. **Database Connection**: Check PostgreSQL connectivity and credentials
2. **Redis Connection**: Verify Redis server status and configuration
3. **Token Validation**: Ensure JWT secret consistency across services
4. **Rate Limiting**: Check rate limit configuration and Redis state

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development npm run start:debug auth-service

# View detailed logs
docker-compose logs -f auth-service
```

## Contributing

1. Follow the established patterns from shared modules
2. Write comprehensive tests using `@app/testing` utilities
3. Update documentation for new features
4. Ensure all tests pass before submitting changes
5. Follow the service standardization guidelines

## Related Documentation

### Core Planning Documents
- [Auth Service Plan](../../docs/server/AUTH_SERVICE_PLAN.md)
- [Service Standardization Plan](../../docs/server/SERVICE_STANDARDIZATION_PLAN.md)
- [Shared Infrastructure Modules](../../docs/server/SHARED_INFRASTRUCTURE_MODULES.md)

### Architecture and Implementation Guides
- [DDD Implementation Guide](../../docs/server/DDD_IMPLEMENTATION_GUIDE.md)
- [CQRS Implementation Plan](../../docs/server/CQRS_IMPLEMENTATION_PLAN.md)
- [Security Standards Guide](../../docs/server/SECURITY_STANDARDS_GUIDE.md)

### Standards and Guidelines
- [Testing Standards Guide](../../docs/server/TESTING_STANDARDS_GUIDE.md)
- [Validation Standards Guide](../../docs/server/VALIDATION_STANDARDS_GUIDE.md)

### Performance and Monitoring
- [Performance Documentation Index](../../docs/server/performance/README.md)
- [Performance Best Practices](../../docs/server/performance/PERFORMANCE_BEST_PRACTICES.md)

### Service Integration
- [Auth Service Kafka Integration](../../docs/server/AUTH_SERVICE_KAFKA_INTEGRATION.md)
- [User Service Plan](../../docs/server/USER_SERVICE_PLAN.md)

### Shared Module Documentation
- [Security Library](../../libs/security/README.md) - Identity and Access Management
- [Testing Library](../../libs/testing/README.md)
- [Validation Library](../../libs/validation/README.md)
