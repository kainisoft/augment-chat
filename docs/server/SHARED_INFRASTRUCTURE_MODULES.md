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

**Objective**: Begin migrating existing services to use shared infrastructure modules, starting with the most commonly used patterns and gradually expanding coverage.

**Duration**: 2-3 weeks

**Prerequisites**:
- ✅ Service Standardization Plan completed
- ✅ Shared infrastructure modules (@app/validation, @app/dtos, @app/security, @app/testing) exist
- ✅ TypeScript path mappings configured
- ✅ Package dependencies installed

#### Step 1: Authentication DTOs Migration (Week 1)

**Objective**: Replace service-specific authentication DTOs with shared versions from @app/dtos.

**Files to Update**:

**Auth Service**:
- ✅ `server/apps/auth-service/src/auth/dto/login.dto.ts` → Replace with @app/dtos
- ✅ `server/apps/auth-service/src/auth/dto/register.dto.ts` → Replace with @app/dtos
- ✅ `server/apps/auth-service/src/auth/dto/refresh-token.dto.ts` → Replace with @app/dtos
- ✅ `server/apps/auth-service/src/auth/dto/auth-response.dto.ts` → Replace with @app/dtos
- ✅ `server/apps/auth-service/src/presentation/dtos/auth/login.dto.ts` → Remove duplicate
- ✅ `server/apps/auth-service/src/presentation/dtos/auth/register.dto.ts` → Remove duplicate
- ✅ `server/apps/auth-service/src/presentation/dtos/auth/auth-response.dto.ts` → Remove duplicate

**Implementation Tasks**:
1. **Update Auth Service Controllers**:
   - ✅ Replace imports in `server/apps/auth-service/src/auth/auth.controller.ts`
   - ✅ Replace imports in `server/apps/auth-service/src/presentation/controllers/auth.controller.ts`
   - ✅ Update import statements to use `@app/dtos`
   - ✅ Verify API documentation still works correctly

2. **Update Auth Service Services**:
   - ✅ Replace imports in `server/apps/auth-service/src/auth/auth.service.ts`
   - ✅ Update command handlers to use shared DTOs
   - ✅ Verify type compatibility with existing code
   - ✅ Added `tokenType: 'Bearer'` field to AuthResponseDto objects

3. **Remove Duplicate Files**:
   - ✅ Delete `server/apps/auth-service/src/auth/dto/` directory
   - ✅ Delete `server/apps/auth-service/src/presentation/dtos/auth/` directory
   - ✅ Update index files to remove exports

4. **Testing and Validation**:
   - ✅ Run auth-service unit tests (DTO imports working correctly)
   - ✅ Run auth-service integration tests (DTO migration successful)
   - ✅ Verify API endpoints still work correctly
   - ✅ Check Swagger documentation generation

#### Step 2: Validation Decorators Migration (Week 1-2)

**Objective**: Replace custom validation decorators with shared versions from @app/validation.

**Current Custom Validation Patterns to Replace**:

**Auth Service**:
- ✅ Email validation: `@IsEmail()` + `@ApiProperty()` → `@IsEmailField()` (Already using shared DTOs)
- ✅ Password validation: `@IsString()` + `@MinLength()` + `@Matches()` → `@IsStrongPasswordField()` (Already using shared DTOs)
- ✅ UUID validation: `@IsUUID()` → `@IsUUIDField()` (Already using shared DTOs)

**User Service**:
- ✅ Username validation: `@Matches(/^[a-zA-Z0-9_-]+$/)` → `@IsUsernameField()`
- ✅ Display name validation: `@MaxLength(100)` → `@IsDisplayNameField()`
- ✅ UUID validation: `@IsUUID('4')` → `@IsUUIDField()`

**Implementation Tasks**:
1. **Update User Service GraphQL Types**:
   - ✅ Replace validation in `server/apps/user-service/src/graphql/types/user-input.types.ts`
   - ✅ Replace validation in `server/apps/user-service/src/graphql/types/relationship-input.types.ts`
   - ✅ Update imports to use `@app/validation`
   - ✅ Verify GraphQL schema generation still works

2. **Update Any Remaining Custom DTOs**:
   - ✅ Scan for remaining custom validation patterns (None found - auth-service uses shared DTOs)
   - ✅ Replace with shared decorators (All user-service GraphQL types updated)
   - ✅ Update imports and remove unused dependencies

3. **Testing and Validation**:
   - ✅ Run validation tests for both services (No validation-related errors)
   - ✅ Verify error messages are consistent (Using shared validation decorators)
   - ✅ Check API documentation reflects new validation rules (GraphQL schema generation successful)

#### Step 3: Security Utilities Migration (Week 2)

**Objective**: Replace custom security implementations with shared utilities from @app/security.

**Current Custom Security Patterns to Replace**:

**Auth Service Rate Limiting**:
- ❌ `server/apps/auth-service/src/rate-limit/rate-limit.service.ts` → Use @app/security
- ❌ `server/apps/auth-service/src/rate-limit/rate-limit.guard.ts` → Use @app/security
- ❌ `server/apps/auth-service/src/rate-limit/rate-limit.decorator.ts` → Use @app/security

**Implementation Tasks**:
1. **Analyze Current Rate Limiting Implementation**:
   - ❌ Compare auth-service rate limiting with @app/security implementation
   - ❌ Identify any custom features that need to be preserved
   - ❌ Plan migration strategy for existing rate limit data

2. **Update Auth Service to Use Shared Security**:
   - ❌ Replace rate limiting imports in controllers
   - ❌ Update auth-service.module.ts to import SecurityModule
   - ❌ Remove custom rate limiting implementation
   - ❌ Update configuration to use shared security patterns

3. **Testing and Validation**:
   - ❌ Test rate limiting functionality
   - ❌ Verify security configurations work correctly
   - ❌ Check performance impact of migration

#### Step 4: Testing Utilities Migration (Week 2-3)

**Objective**: Replace custom testing utilities with shared patterns from @app/testing.

**Current Custom Testing Patterns to Replace**:
- ❌ Custom mock factories in individual services
- ❌ Duplicate test setup code
- ❌ Service-specific test utilities

**Implementation Tasks**:
1. **Identify Common Testing Patterns**:
   - ❌ Audit existing test files for common patterns
   - ❌ Identify mock objects that can be shared
   - ❌ Document test utilities that should be extracted

2. **Update Test Files to Use Shared Utilities**:
   - ❌ Replace custom mock factories with @app/testing
   - ❌ Update test setup to use shared patterns
   - ❌ Standardize test data generation

3. **Testing and Validation**:
   - ❌ Run all test suites to ensure compatibility
   - ❌ Verify test coverage is maintained
   - ❌ Check test execution performance

#### Step 5: Documentation and Cleanup (Week 3)

**Objective**: Update documentation and remove duplicate code.

**Implementation Tasks**:
1. **Update Service Documentation**:
   - ❌ Update README files to reference shared modules
   - ❌ Document migration changes in service documentation
   - ❌ Update architecture diagrams to show shared module usage

2. **Code Cleanup**:
   - ❌ Remove unused dependencies from package.json files
   - ❌ Clean up unused imports
   - ❌ Remove duplicate utility functions

3. **Validation and Testing**:
   - ❌ Run full test suite for both services
   - ❌ Verify Docker builds work correctly
   - ❌ Test service communication still works
   - ❌ Validate API documentation is complete

#### Success Criteria

**Technical Criteria**:
- ✅ All authentication DTOs use shared @app/dtos
- ✅ All validation decorators use shared @app/validation
- ✅ Security utilities use shared @app/security patterns
- ✅ Testing utilities use shared @app/testing patterns
- ✅ No duplicate code between services for common patterns
- ✅ All tests pass without regression
- ✅ API documentation is complete and accurate

**Quality Criteria**:
- ✅ Code consistency improved across services
- ✅ Maintenance overhead reduced
- ✅ Developer experience improved
- ✅ Documentation is up-to-date and comprehensive

#### Risk Mitigation

**Potential Risks**:
1. **Breaking Changes**: Shared modules might have different validation rules
   - **Mitigation**: Thorough testing and gradual rollout
   - **Rollback Plan**: Keep original files until migration is validated

2. **Performance Impact**: Shared modules might introduce overhead
   - **Mitigation**: Performance testing during migration
   - **Monitoring**: Track response times and resource usage

3. **Integration Issues**: Services might have subtle dependencies on custom implementations
   - **Mitigation**: Comprehensive integration testing
   - **Documentation**: Document any custom behavior that needs preservation

#### Dependencies and Prerequisites

**Before Starting**:
- ✅ Ensure all shared modules are properly tested
- ✅ Verify shared modules support all required features
- ✅ Backup current service implementations
- ✅ Prepare rollback procedures

**During Migration**:
- ❌ Maintain backward compatibility during transition
- ❌ Test each step thoroughly before proceeding
- ❌ Document any issues or deviations discovered
- ❌ Coordinate with team members working on related features

### Phase 2: Systematic Replacement

**Objective**: Complete the migration by systematically replacing all remaining custom implementations with shared modules across all services.

**Duration**: 2-3 weeks

**Prerequisites**:
- ✅ Phase 1 completed successfully
- ✅ All shared modules validated and tested
- ✅ No regressions from Phase 1 migration

#### Step 1: Complete DTO Standardization (Week 1)

**Objective**: Replace all remaining custom DTOs with shared versions.

**Implementation Tasks**:
1. **Audit Remaining Custom DTOs**:
   - ❌ Scan all services for custom DTOs that could use shared patterns
   - ❌ Identify pagination DTOs that can use shared PaginationQueryDto
   - ❌ Find error response DTOs that can use shared ErrorResponseDto
   - ❌ Document any service-specific DTOs that need to remain custom

2. **Migrate Pagination DTOs**:
   - ❌ Replace custom pagination in user-service GraphQL resolvers
   - ❌ Update query handlers to use shared PaginationQueryDto
   - ❌ Standardize pagination response format across services

3. **Migrate Error Response DTOs**:
   - ❌ Replace custom error responses with shared ErrorResponseDto
   - ❌ Update exception filters to use shared error patterns
   - ❌ Ensure consistent error format across all APIs

#### Step 2: Complete Validation Standardization (Week 1-2)

**Objective**: Replace all remaining custom validation with shared decorators.

**Implementation Tasks**:
1. **Audit Remaining Custom Validation**:
   - ❌ Scan all DTOs and input types for custom validation patterns
   - ❌ Identify complex validation that could benefit from shared decorators
   - ❌ Document any domain-specific validation that should remain custom

2. **Create Additional Shared Decorators** (if needed):
   - ❌ Add any missing validation decorators to @app/validation
   - ❌ Ensure all common patterns are covered by shared decorators
   - ❌ Update shared validation documentation

3. **Complete Migration**:
   - ❌ Replace all remaining custom validation with shared decorators
   - ❌ Update imports across all services
   - ❌ Remove unused validation dependencies

#### Step 3: Complete Security Standardization (Week 2)

**Objective**: Ensure all security utilities use shared patterns.

**Implementation Tasks**:
1. **Audit Security Implementations**:
   - ❌ Review all services for custom security utilities
   - ❌ Identify password hashing, token generation, and other security patterns
   - ❌ Document any service-specific security requirements

2. **Migrate Security Utilities**:
   - ❌ Replace custom password hashing with shared SecurityUtilsService
   - ❌ Update token generation to use shared patterns
   - ❌ Standardize input sanitization across services

3. **Complete Rate Limiting Migration**:
   - ❌ Ensure all services use shared rate limiting patterns
   - ❌ Migrate any remaining custom rate limiting implementations
   - ❌ Standardize rate limiting configuration

#### Step 4: Complete Testing Standardization (Week 2-3)

**Objective**: Ensure all testing utilities use shared patterns.

**Implementation Tasks**:
1. **Audit Testing Implementations**:
   - ❌ Review all test files for custom testing utilities
   - ❌ Identify mock factories and test setup patterns
   - ❌ Document any service-specific testing requirements

2. **Migrate Testing Utilities**:
   - ❌ Replace all custom mock factories with shared MockFactoryService
   - ❌ Update test setup to use shared database utilities
   - ❌ Standardize test data generation patterns

3. **Enhance Shared Testing Module**:
   - ❌ Add any missing testing utilities to @app/testing
   - ❌ Ensure comprehensive coverage of testing patterns
   - ❌ Update testing documentation and examples

#### Step 5: Validation and Documentation (Week 3)

**Objective**: Validate complete migration and update documentation.

**Implementation Tasks**:
1. **Comprehensive Testing**:
   - ❌ Run full test suite for all services
   - ❌ Perform integration testing between services
   - ❌ Validate API documentation is complete and accurate
   - ❌ Test Docker builds and deployments

2. **Documentation Updates**:
   - ❌ Update all service README files
   - ❌ Document shared module usage patterns
   - ❌ Update architecture documentation
   - ❌ Create migration completion report

### Phase 3: Optimization

**Objective**: Optimize shared modules based on usage patterns and add additional utilities as needed.

**Duration**: 1-2 weeks

**Prerequisites**:
- ✅ Phase 2 completed successfully
- ✅ All services using shared modules
- ✅ Performance baseline established

#### Step 1: Performance Analysis (Week 1)

**Objective**: Analyze performance impact and optimize shared modules.

**Implementation Tasks**:
1. **Performance Monitoring**:
   - ❌ Measure response times before and after migration
   - ❌ Monitor memory usage and resource consumption
   - ❌ Identify any performance bottlenecks
   - ❌ Document performance metrics

2. **Optimization Opportunities**:
   - ❌ Identify frequently used patterns that could be optimized
   - ❌ Review shared module implementations for efficiency
   - ❌ Consider caching strategies for expensive operations
   - ❌ Optimize bundle sizes and import patterns

#### Step 2: Code Cleanup and Optimization (Week 1-2)

**Objective**: Remove all duplicate code and optimize shared modules.

**Implementation Tasks**:
1. **Remove Duplicate Code**:
   - ❌ Delete all replaced custom implementations
   - ❌ Clean up unused dependencies from package.json files
   - ❌ Remove unused imports and utility functions
   - ❌ Update TypeScript configurations

2. **Optimize Shared Modules**:
   - ❌ Refactor shared modules based on usage patterns
   - ❌ Improve performance of frequently used utilities
   - ❌ Add caching where appropriate
   - ❌ Optimize bundle sizes

3. **Enhance Developer Experience**:
   - ❌ Improve TypeScript types and intellisense
   - ❌ Add better error messages and debugging information
   - ❌ Create development tools and utilities
   - ❌ Update IDE configurations and snippets

#### Step 3: Additional Shared Utilities (Week 2)

**Objective**: Add additional shared utilities based on identified patterns.

**Implementation Tasks**:
1. **Identify Additional Opportunities**:
   - ❌ Review services for additional common patterns
   - ❌ Identify utilities that could benefit other teams
   - ❌ Document potential new shared modules
   - ❌ Prioritize based on impact and effort

2. **Implement New Shared Utilities**:
   - ❌ Create additional shared modules as needed
   - ❌ Implement common workflow patterns
   - ❌ Add shared configuration utilities
   - ❌ Create shared monitoring and metrics utilities

3. **Documentation and Training**:
   - ❌ Update shared module documentation
   - ❌ Create usage examples and best practices
   - ❌ Provide training to development team
   - ❌ Establish maintenance procedures

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
