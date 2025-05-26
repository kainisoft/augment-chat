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
- `@app/dtos` - Shared data transfer objects
- `@app/validation` - Shared validation decorators
- `@app/security` - Security utilities and guards
- `@app/logging` - Centralized logging service
- `@app/testing` - Shared testing utilities

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

## Deployment

### Docker

```bash
# Build image
docker build -t auth-service .

# Run container
docker run -p 4001:4001 auth-service
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

- [Service Standardization Plan](../../docs/server/SERVICE_STANDARDIZATION_PLAN.md)
- [Shared Infrastructure Modules](../../docs/server/SHARED_INFRASTRUCTURE_MODULES.md)
- [Testing Guidelines](../../libs/testing/README.md)
- [Security Guidelines](../../libs/security/README.md)
