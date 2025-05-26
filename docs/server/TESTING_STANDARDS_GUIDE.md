# Testing Standards Guide

## Overview

This guide documents the standardized testing patterns and utilities used across all microservices in the chat application. All testing implementations are centralized in the `@app/testing` module to ensure consistency, maintainability, and developer experience.

## Core Testing Principles

### 1. Consistency
- All services use the same testing utilities and patterns
- Standardized mock factories and test setup across all services
- Consistent test structure and naming conventions

### 2. Maintainability
- Centralized mock implementations reduce duplication
- Shared test utilities simplify test maintenance
- Easy to update testing patterns across all services

### 3. Developer Experience
- Simple, intuitive testing APIs
- Comprehensive mock factories for all common services
- Clear testing patterns and examples

## Testing Module (`@app/testing`)

### Available Services

#### `MockFactoryService`
Provides standardized mock implementations for all common services.

```typescript
import { MockFactoryService } from '@app/testing';

describe('MyService', () => {
  let mockFactory: MockFactoryService;

  beforeEach(() => {
    mockFactory = new MockFactoryService();
  });

  it('should work with mocked dependencies', () => {
    const mockUserRepository = mockFactory.createMockUserRepository();
    const mockLoggingService = mockFactory.createMockLoggingService();
    
    // Use mocks in your tests
  });
});
```

#### `TestSetupService`
Manages test module setup and configuration.

```typescript
import { TestSetupService, MockFactoryService } from '@app/testing';

describe('MyService', () => {
  let testSetup: TestSetupService;

  beforeEach(async () => {
    const mockFactory = new MockFactoryService();
    testSetup = new TestSetupService(mockFactory);
    
    const module = await testSetup.createTestingModule({
      providers: [
        MyService,
        ...testSetup.createAuthServiceProviders(),
      ],
    });
  });
});
```

#### `ServiceTestBuilder`
Simplifies service testing with pre-configured setups.

```typescript
import { ServiceTestBuilder, TestSetupService, MockFactoryService } from '@app/testing';

describe('AuthService', () => {
  let service: AuthService;
  let setup: any;

  beforeEach(async () => {
    const mockFactory = new MockFactoryService();
    const testSetup = new TestSetupService(mockFactory);
    const serviceTestBuilder = new ServiceTestBuilder(testSetup, mockFactory);

    setup = await serviceTestBuilder.createAuthServiceTestSetup(AuthService, {
      userRepository: mockFactory.createMockUserRepository(),
      tokenService: mockFactory.createMockTokenService(),
    });

    service = setup.service;
  });
});
```

#### `ControllerTestBuilder`
Simplifies controller testing with HTTP context.

```typescript
import { ControllerTestBuilder, TestSetupService, MockFactoryService } from '@app/testing';

describe('AuthController', () => {
  let controller: AuthController;
  let setup: any;

  beforeEach(async () => {
    const mockFactory = new MockFactoryService();
    const testSetup = new TestSetupService(mockFactory);
    const controllerTestBuilder = new ControllerTestBuilder(testSetup, mockFactory);

    setup = await controllerTestBuilder.createControllerTestSetup(AuthController, {
      providers: [
        {
          provide: AuthService,
          useValue: mockFactory.createMockAuthService(),
        },
      ],
    });

    controller = setup.controller;
  });
});
```

## Available Mock Factories

### Core Service Mocks

#### `createMockLoggingService()`
Mock for the shared logging service.

```typescript
const mockLoggingService = mockFactory.createMockLoggingService({
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
});
```

#### `createMockCacheService()`
Mock for Redis cache operations.

```typescript
const mockCacheService = mockFactory.createMockCacheService({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
});
```

#### `createMockConfigService()`
Mock for NestJS configuration service.

```typescript
const mockConfigService = mockFactory.createMockConfigService({
  get: jest.fn().mockReturnValue('default-value'),
});
```

### Repository Mocks

#### `createMockUserRepository()`
Mock for user repository operations.

```typescript
const mockUserRepository = mockFactory.createMockUserRepository({
  findById: jest.fn().mockResolvedValue(null),
  findByEmail: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockResolvedValue(null),
  searchByUsernameOrDisplayName: jest.fn().mockResolvedValue([]),
});
```

#### `createMockTokenRepository()`
Mock for token repository operations.

```typescript
const mockTokenRepository = mockFactory.createMockTokenRepository({
  save: jest.fn().mockResolvedValue(null),
  findByToken: jest.fn().mockResolvedValue(null),
  deleteByUserId: jest.fn().mockResolvedValue(true),
});
```

### Service-Specific Mocks

#### `createMockAuthService()`
Mock for authentication service.

```typescript
const mockAuthService = mockFactory.createMockAuthService({
  register: jest.fn().mockResolvedValue({ accessToken: 'token' }),
  login: jest.fn().mockResolvedValue({ accessToken: 'token' }),
  logout: jest.fn().mockResolvedValue(true),
});
```

#### `createMockTokenService()`
Mock for token management service.

```typescript
const mockTokenService = mockFactory.createMockTokenService({
  generateAccessToken: jest.fn().mockResolvedValue('access-token'),
  generateRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
  validateToken: jest.fn().mockResolvedValue(true),
});
```

#### `createMockSessionService()`
Mock for session management service.

```typescript
const mockSessionService = mockFactory.createMockSessionService({
  createSession: jest.fn().mockResolvedValue('session-id'),
  getSession: jest.fn().mockResolvedValue(null),
  deleteSession: jest.fn().mockResolvedValue(true),
});
```

### CQRS Mocks

#### `createMockCommandBus()`
Mock for CQRS command bus.

```typescript
const mockCommandBus = mockFactory.createMockCommandBus({
  execute: jest.fn().mockResolvedValue(undefined),
});
```

#### `createMockQueryBus()`
Mock for CQRS query bus.

```typescript
const mockQueryBus = mockFactory.createMockQueryBus({
  execute: jest.fn().mockResolvedValue(null),
});
```

#### `createMockEventBus()`
Mock for CQRS event bus.

```typescript
const mockEventBus = mockFactory.createMockEventBus({
  publish: jest.fn().mockResolvedValue(undefined),
  publishAll: jest.fn().mockResolvedValue(undefined),
});
```

### Logging Service Mocks

#### `createMockLogQueryService()`
Mock for log query operations.

```typescript
const mockLogQueryService = mockFactory.createMockLogQueryService({
  queryLogs: jest.fn().mockResolvedValue({
    logs: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  }),
});
```

#### `createMockLogStorageService()`
Mock for log storage operations.

```typescript
const mockLogStorageService = mockFactory.createMockLogStorageService({
  storeLogs: jest.fn().mockResolvedValue({ stored: 1 }),
  storeLog: jest.fn().mockResolvedValue(true),
});
```

## Testing Patterns

### Unit Testing Pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MockFactoryService, ServiceTestBuilder, TestSetupService } from '@app/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;
  let mockDependency: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const testSetup = new TestSetupService(mockFactory);
    const serviceTestBuilder = new ServiceTestBuilder(testSetup, mockFactory);

    const setup = await serviceTestBuilder.createServiceTestSetup(MyService, {
      dependency: mockFactory.createMockDependency(),
    });

    service = setup.service;
    mockDependency = setup.dependency;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle business logic correctly', async () => {
    // Arrange
    const input = 'test-input';
    const expectedOutput = 'expected-output';
    mockDependency.process.mockResolvedValue(expectedOutput);

    // Act
    const result = await service.processInput(input);

    // Assert
    expect(result).toBe(expectedOutput);
    expect(mockDependency.process).toHaveBeenCalledWith(input);
  });
});
```

### Controller Testing Pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MockFactoryService, ControllerTestBuilder, TestSetupService } from '@app/testing';
import { MyController } from './my.controller';
import { MyService } from './my.service';

describe('MyController', () => {
  let controller: MyController;
  let service: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const testSetup = new TestSetupService(mockFactory);
    const controllerTestBuilder = new ControllerTestBuilder(testSetup, mockFactory);

    const setup = await controllerTestBuilder.createControllerTestSetup(MyController, {
      providers: [
        {
          provide: MyService,
          useValue: mockFactory.createMockMyService(),
        },
      ],
    });

    controller = setup.controller;
    service = setup.module.get(MyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle HTTP requests correctly', async () => {
    // Arrange
    const requestDto = { data: 'test' };
    const expectedResponse = { result: 'success' };
    service.process.mockResolvedValue(expectedResponse);

    // Act
    const result = await controller.handleRequest(requestDto);

    // Assert
    expect(result).toEqual(expectedResponse);
    expect(service.process).toHaveBeenCalledWith(requestDto);
  });
});
```

### Integration Testing Pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MockFactoryService, IntegrationTestBuilder, TestSetupService } from '@app/testing';
import { MyModule } from './my.module';

describe('MyModule Integration', () => {
  let module: TestingModule;
  let service: MyService;
  let repository: any;

  beforeEach(async () => {
    const mockFactory = new MockFactoryService();
    const testSetup = new TestSetupService(mockFactory);
    const integrationTestBuilder = new IntegrationTestBuilder(testSetup, mockFactory);

    const setup = await integrationTestBuilder.createIntegrationTestSetup(MyModule, {
      // Override specific providers for integration testing
      overrides: [
        {
          provide: 'MyRepository',
          useValue: mockFactory.createMockRepository(),
        },
      ],
    });

    module = setup.module;
    service = module.get(MyService);
    repository = module.get('MyRepository');
  });

  it('should integrate components correctly', async () => {
    // Test integration between service and repository
    const testData = { id: '1', name: 'test' };
    repository.findById.mockResolvedValue(testData);

    const result = await service.findById('1');

    expect(result).toEqual(testData);
    expect(repository.findById).toHaveBeenCalledWith('1');
  });
});
```

## Best Practices

### 1. Always Use Shared Mock Factories

❌ **Don't** create custom mocks:
```typescript
// Bad - custom mock implementation
const mockService = {
  method: jest.fn().mockResolvedValue('result'),
};
```

✅ **Do** use shared mock factories:
```typescript
// Good - shared mock factory
const mockService = mockFactory.createMockService({
  method: jest.fn().mockResolvedValue('result'),
});
```

### 2. Use Appropriate Test Builders

Choose the right test builder for your testing needs:

- **ServiceTestBuilder**: For testing business logic in services
- **ControllerTestBuilder**: For testing HTTP endpoints and controllers
- **IntegrationTestBuilder**: For testing component integration

### 3. Follow AAA Pattern

Structure your tests using Arrange, Act, Assert:

```typescript
it('should process data correctly', async () => {
  // Arrange
  const input = 'test-input';
  const expectedOutput = 'processed-output';
  mockService.process.mockResolvedValue(expectedOutput);

  // Act
  const result = await service.processData(input);

  // Assert
  expect(result).toBe(expectedOutput);
  expect(mockService.process).toHaveBeenCalledWith(input);
});
```

### 4. Test Error Scenarios

Always test both success and error scenarios:

```typescript
describe('error handling', () => {
  it('should handle service errors gracefully', async () => {
    // Arrange
    const error = new Error('Service unavailable');
    mockService.process.mockRejectedValue(error);

    // Act & Assert
    await expect(service.processData('input')).rejects.toThrow('Service unavailable');
  });
});
```

### 5. Use Descriptive Test Names

Write clear, descriptive test names that explain the scenario:

```typescript
// Good test names
it('should return user when valid ID is provided')
it('should throw error when user is not found')
it('should cache result after successful database query')
```

## Testing Checklist

### For New Services
- [ ] Use shared mock factories for all dependencies
- [ ] Use appropriate test builders (Service/Controller/Integration)
- [ ] Follow AAA pattern in all tests
- [ ] Test both success and error scenarios
- [ ] Use descriptive test names
- [ ] Mock external dependencies properly

### For New Features
- [ ] Add unit tests for business logic
- [ ] Add controller tests for HTTP endpoints
- [ ] Add integration tests for component interaction
- [ ] Test validation and error handling
- [ ] Update existing tests if needed

### For Bug Fixes
- [ ] Add regression tests for the bug
- [ ] Ensure existing tests still pass
- [ ] Update tests if behavior changes
- [ ] Test edge cases related to the bug

## Related Documentation

- [Shared Infrastructure Modules](./SHARED_INFRASTRUCTURE_MODULES.md)
- [Service Standardization Plan](./SERVICE_STANDARDIZATION_PLAN.md)
- [Validation Standards Guide](./VALIDATION_STANDARDS_GUIDE.md)
- [Security Standards Guide](./SECURITY_STANDARDS_GUIDE.md)
