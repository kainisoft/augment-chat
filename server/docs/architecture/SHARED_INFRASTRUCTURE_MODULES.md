# Shared Infrastructure Modules

This document outlines the shared infrastructure modules created to improve code reuse, maintainability, and consistency across all microservices in the chat application ecosystem.

## Overview

The shared infrastructure modules provide common functionality that can be used across multiple services, reducing code duplication and ensuring consistent patterns throughout the application.

## Available Modules

### 1. Validation Library (`@app/validation`)

**Purpose**: Provides shared validation utilities, decorators, and patterns for consistent validation across all microservices.

**Key Features**:
- Common validation decorators combining class-validator with Swagger documentation
- Reusable validation patterns for common data types
- Validation service with utility methods
- Type-safe validation helpers

**Usage Example**:
```typescript
import { IsEmailField, IsStrongPasswordField } from '@app/validation';

export class LoginDto {
  @IsEmailField({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @IsStrongPasswordField({
    description: 'User password',
    example: 'Password123',
  })
  password: string;
}
```

**Available Decorators**:
- `@IsUUIDField()` - UUID v4 validation with Swagger docs
- `@IsEmailField()` - Email validation with Swagger docs
- `@IsUsernameField()` - Username validation with Swagger docs
- `@IsStrongPasswordField()` - Strong password validation with Swagger docs
- `@IsDisplayNameField()` - Display name validation with Swagger docs
- `@IsJWTTokenField()` - JWT token validation with Swagger docs
- `@IsRefreshTokenField()` - Refresh token validation with Swagger docs

### 2. DTOs Library (`@app/dtos`)

**Purpose**: Provides shared Data Transfer Objects (DTOs) and patterns for consistent API interfaces across all microservices.

**Key Features**:
- Common authentication DTOs
- Standardized pagination DTOs
- Error response DTOs with consistent format
- Utility classes for creating responses

**Usage Example**:
```typescript
import { LoginDto, AuthResponseDto, PaginationQueryDto } from '@app/dtos';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    // Implementation
  }

  @Get('users')
  async getUsers(@Query() pagination: PaginationQueryDto) {
    // Implementation
  }
}
```

**Available DTOs**:
- **Authentication**: `LoginDto`, `RegisterDto`, `RefreshTokenDto`, `AuthResponseDto`
- **Pagination**: `PaginationQueryDto`, `PaginatedResponseDto`, `PaginationMetaDto`
- **Error Responses**: `ErrorResponseDto`, `ValidationErrorResponseDto`, `AuthErrorResponseDto`

### 3. Security Library (`@app/security`)

**Purpose**: Provides shared security utilities, guards, and patterns for consistent security implementation across all microservices.

**Key Features**:
- Rate limiting service and decorators
- Security utilities for common operations
- Input sanitization and validation
- Cryptographic utilities

**Usage Example**:
```typescript
import { RateLimit, SecurityUtilsService } from '@app/security';

@Controller('auth')
export class AuthController {
  constructor(private readonly securityUtils: SecurityUtilsService) {}

  @Post('login')
  @RateLimit('login')
  async login(@Body() loginDto: LoginDto) {
    const hashedPassword = await this.securityUtils.hashPassword(loginDto.password);
    // Implementation
  }
}
```

**Available Features**:
- **Rate Limiting**: `@RateLimit()` decorator with predefined configurations
- **Security Utils**: Password hashing, token generation, input sanitization
- **Utilities**: IP extraction, secure random generation, constant-time comparison

### 4. Testing Library (`@app/testing`)

**Purpose**: Provides shared testing utilities, mocks, and patterns for consistent testing across all microservices.

**Key Features**:
- Mock factory service for creating test data
- Test database utilities and setup
- Common test patterns and fixtures
- Reusable mock objects

**Usage Example**:
```typescript
import { MockFactoryService } from '@app/testing';

describe('UserService', () => {
  let service: UserService;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        MockFactoryService,
        {
          provide: 'UserRepository',
          useValue: mockFactory.createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockFactory = module.get<MockFactoryService>(MockFactoryService);
  });

  it('should create a user', async () => {
    const mockUser = mockFactory.createMockUser();
    // Test implementation
  });
});
```

**Available Utilities**:
- **Mock Factory**: Create mock users, auth data, requests, responses
- **Test Database**: Setup and cleanup utilities for integration tests
- **Mock Services**: Pre-configured mocks for common services

## Integration Guidelines

### Adding to Existing Services

To integrate these shared modules into existing services:

1. **Install Dependencies**: Add the modules to your service's imports
2. **Update DTOs**: Replace existing DTOs with shared ones
3. **Update Validation**: Replace custom validation with shared decorators
4. **Update Tests**: Use shared testing utilities

### Example Integration

```typescript
// Before
export class LoginDto {
  @IsEmail()
  @ApiProperty({ description: 'Email' })
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ description: 'Password' })
  password: string;
}

// After
import { IsEmailField, IsStrongPasswordField } from '@app/validation';

export class LoginDto {
  @IsEmailField({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @IsStrongPasswordField({
    description: 'User password',
    example: 'Password123',
  })
  password: string;
}
```

## Benefits

### Code Reuse
- Eliminates duplication of common patterns
- Reduces maintenance overhead
- Ensures consistency across services

### Type Safety
- Strongly typed interfaces and utilities
- Compile-time validation of shared patterns
- Better IDE support and autocomplete

### Documentation
- Comprehensive JSDoc documentation
- Consistent API documentation through Swagger
- Clear usage examples and patterns

### Testing
- Standardized testing patterns
- Reusable mock objects and utilities
- Consistent test data generation

### Security
- Centralized security utilities
- Consistent rate limiting patterns
- Standardized input validation and sanitization

## Migration Strategy

### Phase 1: Gradual Adoption
- Start using shared modules in new features
- Replace existing DTOs during feature updates
- Update validation decorators incrementally

### Phase 2: Systematic Replacement
- Replace all authentication DTOs with shared versions
- Update all validation patterns to use shared decorators
- Migrate testing utilities to shared patterns

### Phase 3: Optimization
- Remove duplicate code from services
- Optimize shared modules based on usage patterns
- Add additional shared utilities as needed

## Best Practices

### Using Shared Modules

1. **Import Consistently**: Always import from the shared module, not individual files
2. **Extend When Needed**: Create service-specific DTOs by extending shared ones
3. **Document Usage**: Add comments explaining why shared patterns are used
4. **Test Integration**: Ensure shared modules work correctly in your service context

### Contributing to Shared Modules

1. **Follow Patterns**: Maintain consistency with existing shared module patterns
2. **Add Documentation**: Include comprehensive JSDoc comments
3. **Write Tests**: Add tests for new shared functionality
4. **Consider Impact**: Ensure changes don't break existing services

### Versioning Strategy

1. **Semantic Versioning**: Use semantic versioning for shared modules
2. **Backward Compatibility**: Maintain backward compatibility when possible
3. **Migration Guides**: Provide migration guides for breaking changes
4. **Deprecation Notices**: Give advance notice of deprecated features

## Future Enhancements

### Planned Additions
- **Metrics Library**: Shared metrics and monitoring utilities
- **Configuration Library**: Enhanced configuration management patterns
- **Event Library**: Standardized event handling patterns
- **Workflow Library**: Common workflow and state management patterns

### Continuous Improvement
- Regular review of shared module usage
- Optimization based on performance metrics
- Addition of new utilities based on common patterns
- Refactoring to improve maintainability

## Related Documentation

- [Service Standardization Plan](./SERVICE_STANDARDIZATION_PLAN.md)
- [Main Module Organization](./MAIN_MODULE_ORGANIZATION.md)
- [CQRS Implementation Guide](../user-service/USER_SERVICE_PLAN.md)
- [Testing Guidelines](../testing/README.md)
