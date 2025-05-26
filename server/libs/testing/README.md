# @app/testing - Shared Testing Utilities

## Overview

The `@app/testing` module provides standardized testing utilities, mock factories, and patterns for consistent testing across all microservices. This module eliminates boilerplate code, ensures consistency, and improves developer experience when writing tests.

## Features

- **MockFactoryService**: Comprehensive mock object creation
- **TestSetupService**: Standardized test module configuration
- **ControllerTestBuilder**: Controller-specific test builders
- **ServiceTestBuilder**: Service-specific test builders
- **E2ETestSetupService**: End-to-end testing utilities
- **TestDatabaseService**: Database testing utilities

## Installation

The testing module is already configured in the workspace. Import it in your test files:

```typescript
import {
  MockFactoryService,
  ControllerTestBuilder,
  ServiceTestBuilder,
  E2ETestSetupService,
} from '@app/testing';
```

## Quick Start

### Controller Testing

```typescript
import { ControllerTestBuilder } from '@app/testing';
import { AuthController } from './auth.controller';
import { RateLimitGuard } from '@app/security';

describe('AuthController', () => {
  let testSetup: any;

  beforeEach(async () => {
    const controllerTestBuilder = new ControllerTestBuilder(
      {} as any, // Dependencies injected automatically
      {} as any,
    );

    testSetup = await controllerTestBuilder.createAuthControllerTestSetup(
      AuthController,
      {
        guards: [
          { guard: RateLimitGuard, mockValue: { canActivate: () => true } },
        ],
      },
    );
  });

  it('should register a user', async () => {
    const result = await testSetup.controller.register(
      testSetup.testData.registerDto,
      testSetup.mockRequest,
    );

    expect(result).toEqual(testSetup.testData.authResponse);
    expect(testSetup.authService.register).toHaveBeenCalledWith(
      testSetup.testData.registerDto,
      testSetup.mockRequest,
    );
  });
});
```

### Service Testing

```typescript
import { ServiceTestBuilder } from '@app/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let testSetup: any;

  beforeEach(async () => {
    const serviceTestBuilder = new ServiceTestBuilder(
      {} as any, // Dependencies injected automatically
      {} as any,
    );

    testSetup = await serviceTestBuilder.createAuthServiceTestSetup(AuthService);
  });

  it('should authenticate user', async () => {
    // Setup mock data
    testSetup.userRepository.findByEmail.mockResolvedValue(
      testSetup.testData.mockUser,
    );

    const result = await testSetup.service.login(testSetup.testData.loginDto);

    expect(result).toBeDefined();
    expect(testSetup.tokenService.generateAccessToken).toHaveBeenCalled();
  });
});
```

### E2E Testing

```typescript
import { E2ETestSetupService } from '@app/testing';
import { AuthModule } from '../src/auth.module';

describe('Auth E2E', () => {
  let app: INestApplication;
  let testRequest: any;

  beforeEach(async () => {
    const e2eSetup = new E2ETestSetupService({} as any);
    
    app = await e2eSetup.createTestApp(AuthModule);
    testRequest = e2eSetup.createTestRequest(app);
  });

  it('/auth/login (POST)', async () => {
    const loginData = { email: 'test@example.com', password: 'Password123' };
    
    const response = await testRequest.post('/auth/login').send(loginData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });
});
```

## API Reference

### MockFactoryService

#### Core Mock Methods

- `createMockUser(overrides?)` - Create mock user objects
- `createMockAuthData(overrides?)` - Create mock authentication data
- `createMockRequest(overrides?)` - Create mock HTTP request objects
- `createMockResponse()` - Create mock HTTP response objects

#### Service-Specific Mocks

- `createMockAuthService(overrides?)` - Mock AuthService
- `createMockTokenService(overrides?)` - Mock TokenService
- `createMockSessionService(overrides?)` - Mock SessionService
- `createMockUserRepository(overrides?)` - Mock UserRepository
- `createMockConfigService(overrides?)` - Mock ConfigService
- `createMockLoggingService()` - Mock LoggingService

#### Health Check Mocks

- `createMockDatabaseService(overrides?)` - Mock DatabaseService
- `createMockRedisHealthIndicator(overrides?)` - Mock RedisHealthIndicator

### ControllerTestBuilder

#### Methods

- `createAuthControllerTestModule(controllerClass, overrides?)` - Create auth controller test module
- `createUserControllerTestModule(controllerClass, overrides?)` - Create user controller test module
- `createHealthControllerTestModule(controllerClass, healthServiceClass, serviceName, overrides?)` - Create health controller test module
- `createAuthControllerTestSetup(controllerClass, overrides?)` - Complete auth controller setup
- `createUserControllerTestSetup(controllerClass, overrides?)` - Complete user controller setup
- `createHealthControllerTestSetup(controllerClass, healthServiceClass, serviceName, overrides?)` - Complete health controller setup

### ServiceTestBuilder

#### Methods

- `createAuthServiceTestModule(serviceClass, overrides?)` - Create auth service test module
- `createUserServiceTestModule(serviceClass, overrides?)` - Create user service test module
- `createTokenServiceTestModule(serviceClass, overrides?)` - Create token service test module
- `createSessionServiceTestModule(serviceClass, overrides?)` - Create session service test module
- `createAuthServiceTestSetup(serviceClass, overrides?)` - Complete auth service setup
- `createUserServiceTestSetup(serviceClass, overrides?)` - Complete user service setup

### E2ETestSetupService

#### Methods

- `createTestApp(moduleClass, overrides?)` - Create test application
- `createTestRequest(app)` - Create test request helper
- `createE2EAuthTestData(overrides?)` - Create E2E auth test data
- `createE2EUserTestData(overrides?)` - Create E2E user test data
- `createDatabaseSeeder(app)` - Create database seeding utilities

## Best Practices

### 1. Use Builders for Complex Setup

```typescript
// ✅ Good - Use builders for consistent setup
const testSetup = await controllerTestBuilder.createAuthControllerTestSetup(
  AuthController,
  { guards: [{ guard: RateLimitGuard }] },
);

// ❌ Avoid - Manual setup with repetitive code
const module = await Test.createTestingModule({
  controllers: [AuthController],
  providers: [/* manual provider setup */],
}).compile();
```

### 2. Leverage Mock Factory

```typescript
// ✅ Good - Use mock factory for consistent mocks
const mockUser = mockFactory.createMockUser({ email: 'test@example.com' });

// ❌ Avoid - Manual mock creation
const mockUser = { id: '1', email: 'test@example.com', /* ... */ };
```

### 3. Use Test Data Helpers

```typescript
// ✅ Good - Use standardized test data
const testData = testSetup.createTestAuthData();

// ❌ Avoid - Hardcoded test data
const loginDto = { email: 'test@example.com', password: 'password' };
```

## Migration Guide

### From Manual Mocks to MockFactoryService

**Before:**
```typescript
const mockAuthService = {
  login: jest.fn().mockResolvedValue({
    accessToken: 'token',
    refreshToken: 'refresh',
    // ... more properties
  }),
};
```

**After:**
```typescript
const mockAuthService = mockFactory.createMockAuthService();
```

### From Manual Test Setup to Builders

**Before:**
```typescript
beforeEach(async () => {
  const module = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: mockAuthService },
      { provide: LoggingService, useValue: mockLoggingService },
    ],
  }).compile();
  
  controller = module.get<AuthController>(AuthController);
});
```

**After:**
```typescript
beforeEach(async () => {
  const testSetup = await controllerTestBuilder.createAuthControllerTestSetup(
    AuthController,
  );
  controller = testSetup.controller;
});
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure `@app/testing` is properly configured in `tsconfig.json`
2. **Mock Not Working**: Check if the service name matches the provider token
3. **Test Timeout**: Increase timeout for complex E2E tests

### Getting Help

- Check the [Testing Patterns Analysis](../../docs/server/TESTING_PATTERNS_ANALYSIS.md)
- Review existing test files for examples
- Consult the [Service Standardization Plan](../../docs/server/SERVICE_STANDARDIZATION_PLAN.md)
