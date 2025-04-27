# NestJS Testing Plan

This document outlines the comprehensive testing strategy for the Chat Application microservices. It focuses on using official NestJS testing tools and methodologies to ensure high-quality, reliable code.

## Testing Overview

### Testing Levels
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test interactions between components
- **E2E Tests**: Test complete request flows through the application

### Testing Tools
- **Jest**: Primary testing framework
- **@nestjs/testing**: NestJS testing utilities
- **Supertest**: HTTP testing library for E2E tests

## Implementation Plan

### Phase 1: Testing Setup & Configuration

- [ ] **Step 1**: Verify testing dependencies in each microservice
  - Ensure Jest and @nestjs/testing are properly installed
  - Check test scripts in package.json

- [ ] **Step 2**: Configure test environments
  - Set up test database configurations
  - Create test utility helpers
  - Configure test data seeding

- [ ] **Step 3**: Establish testing standards
  - Define naming conventions
  - Establish code coverage requirements
  - Document mocking strategies

### Phase 2: Unit Testing Implementation

- [ ] **Step 1**: Service testing
  - Create test files for each service (`*.service.spec.ts`)
  - Implement mocks for external dependencies
  - Test core business logic

- [ ] **Step 2**: Controller testing
  - Create test files for each controller (`*.controller.spec.ts`)
  - Test request handling and response mapping
  - Verify HTTP status codes and response formats

- [ ] **Step 3**: Custom component testing
  - Test guards, pipes, interceptors, and filters
  - Verify correct behavior for both valid and invalid scenarios
  - Test error handling

### Phase 3: Integration Testing

- [ ] **Step 1**: Module integration tests
  - Test interactions between real components within modules
  - Verify correct data flow between components
  - Test event handling

- [ ] **Step 2**: Database integration
  - Test repository patterns with test databases
  - Verify CRUD operations
  - Test transactions and data integrity

- [ ] **Step 3**: Microservice communication testing
  - Test Kafka message production and consumption
  - Verify event-based communication
  - Test error handling and retries

### Phase 4: E2E Testing

- [ ] **Step 1**: API endpoint testing
  - Create E2E test files (`*.e2e-spec.ts`)
  - Test complete HTTP request/response cycles
  - Verify authentication and authorization

- [ ] **Step 2**: User flow testing
  - Test complete user journeys
  - Verify multi-step processes
  - Test error scenarios and edge cases

### Phase 5: CI/CD Integration

- [ ] **Step 1**: Configure automated test runs
  - Set up test execution in CI/CD pipeline
  - Configure test reporting
  - Implement code coverage analysis

- [ ] **Step 2**: Performance testing setup
  - Implement load testing for critical endpoints
  - Establish performance baselines
  - Configure performance regression detection

## Microservice-Specific Testing Plans

### API Gateway Service

- [ ] Unit test GraphQL resolvers
- [ ] Test authentication middleware
- [ ] E2E test GraphQL queries and mutations
- [ ] Test error handling and response formatting

### Authentication Service

- [ ] Test authentication strategies
- [ ] Unit test token generation and validation
- [ ] Test password hashing and verification
- [ ] E2E test login, registration, and password reset flows

### User Service

- [ ] Test user CRUD operations
- [ ] Test user profile management
- [ ] Test user search and filtering
- [ ] E2E test user API endpoints

### Chat Service

- [ ] Test message creation and retrieval
- [ ] Test conversation management
- [ ] Test real-time message delivery
- [ ] E2E test chat functionality

### Notification Service

- [ ] Test notification creation and delivery
- [ ] Test notification preferences
- [ ] Test notification queuing and processing
- [ ] E2E test notification flows

## Testing Examples

### Example: Unit Testing a Service

```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should find all users', async () => {
    const expectedUsers = [{ id: 1, username: 'test' }];
    mockRepository.find.mockResolvedValue(expectedUsers);

    const result = await service.findAll();

    expect(result).toEqual(expectedUsers);
    expect(mockRepository.find).toHaveBeenCalled();
  });
});
```

### Example: E2E Testing an API Endpoint

```typescript
// auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password' })
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('accessToken');
      });
  });
});
```

## Testing Specific NestJS Features

### 1. Testing Controllers

Controllers handle HTTP requests and delegate business logic to services. Testing controllers focuses on request handling, response mapping, and proper service method invocation.

```typescript
// users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createUserDto)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
```

### 2. Testing Services

Services contain business logic and often interact with repositories or other services. Testing services focuses on business logic implementation and proper repository method invocation.

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findOne', () => {
    it('should return a user when user exists', async () => {
      const expectedUser = { id: 1, username: 'testuser' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedUser);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });
});
```

### 3. Testing Guards

Guards determine whether a request should be handled by the route handler. Testing guards focuses on the `canActivate` method and proper execution context handling.

```typescript
// auth.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should allow access with valid token', () => {
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    jest.spyOn(jwtService, 'verify').mockReturnValue({ userId: 1 });

    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should deny access with invalid token', () => {
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(guard.canActivate(context)).toBeFalsy();
  });
});
```

### 4. Testing Pipes

Pipes transform input data or validate it. Testing pipes focuses on the `transform` method and proper validation logic.

```typescript
// validation.pipe.spec.ts
import { ValidationPipe } from './validation.pipe';
import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

class TestDto {
  name: string;
  age: number;
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: TestDto,
    data: '',
  };

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  it('should validate and transform a valid object', async () => {
    const value = { name: 'Test', age: '25' };
    const result = await pipe.transform(value, metadata);

    expect(result).toEqual({ name: 'Test', age: 25 });
  });

  it('should throw BadRequestException for invalid data', async () => {
    const value = { name: '', age: 'not-a-number' };

    await expect(pipe.transform(value, metadata)).rejects.toThrow(BadRequestException);
  });
});
```

### 5. Testing Interceptors

Interceptors add extra logic before or after method execution. Testing interceptors focuses on the `intercept` method and proper RxJS stream handling.

```typescript
// logging.interceptor.spec.ts
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    context = createMock<ExecutionContext>();
    next = {
      handle: jest.fn(() => of('test result')),
    };
  });

  it('should call next.handle and return its result', (done) => {
    interceptor.intercept(context, next).subscribe({
      next: (value) => {
        expect(value).toBe('test result');
        expect(next.handle).toHaveBeenCalled();
        done();
      },
    });
  });
});
```

### 6. Testing Exception Filters

Exception filters handle exceptions thrown from your application. Testing exception filters focuses on the `catch` method and proper response formatting.

```typescript
// http-exception.filter.spec.ts
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    host = createMock<ArgumentsHost>({
      switchToHttp: () => ({
        getResponse: () => ({
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        }),
        getRequest: () => ({
          url: 'test-url',
        }),
      }),
    });
  });

  it('should format exception response correctly', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    const response = host.switchToHttp().getResponse();

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Test error',
      path: 'test-url',
      timestamp: expect.any(String),
    });
  });
});
```

### 7. Testing Custom Providers

Custom providers often require special testing approaches. Here's how to test a factory provider:

```typescript
// config.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { CONFIG_OPTIONS } from './constants';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            folder: './config',
          },
        },
        {
          provide: ConfigService,
          useFactory: (options) => {
            return new ConfigService(options);
          },
          inject: [CONFIG_OPTIONS],
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get config value', () => {
    jest.spyOn(service, 'get').mockReturnValue('test-value');
    expect(service.get('key')).toBe('test-value');
  });
});
```

### 8. Testing GraphQL Resolvers

GraphQL resolvers handle GraphQL queries and mutations. Testing resolvers focuses on proper data resolution and service method invocation.

```typescript
// users.resolver.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    service = module.get<UsersService>(UsersService);
  });

  describe('users', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [{ id: 1, username: 'test' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedUsers);

      expect(await resolver.users()).toBe(expectedUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('user', () => {
    it('should return a single user', async () => {
      const expectedUser = { id: 1, username: 'test' };
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedUser);

      expect(await resolver.user(1)).toBe(expectedUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});
```

### 9. Testing Microservice Communication

Testing microservice communication focuses on proper message pattern handling and client method invocation.

```typescript
// users.controller.spec.ts (microservice)
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [{ id: 1, username: 'test' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedUsers);

      // Test the message pattern handler
      expect(await controller.findAll({})).toBe(expectedUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests
2. **Descriptive Test Names**: Use clear naming conventions that describe what is being tested
3. **Arrange-Act-Assert Pattern**: Structure tests with clear setup, action, and verification phases
4. **Mock External Dependencies**: Avoid external service calls in unit tests
5. **Test Edge Cases**: Include error scenarios and boundary conditions
6. **Keep Tests Fast**: Optimize for quick execution to maintain developer productivity
7. **Maintain Test Code Quality**: Refactor tests as needed and treat test code with the same care as production code

## Test Execution

### Running Tests
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`
- Coverage report: `npm run test:cov`

### Test Coverage Goals
- Services: 90% coverage
- Controllers: 85% coverage
- Guards/Pipes/Interceptors: 80% coverage
- Overall project: 80% minimum coverage

## Integration with Project Plan

This testing plan will be implemented alongside the development phases outlined in the main project plan. Each feature development should include corresponding test implementation as part of the definition of done.
