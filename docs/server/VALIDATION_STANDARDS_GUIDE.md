# Validation Standards Guide

## Overview

This guide documents the standardized validation patterns and decorators used across all microservices in the chat application. All validation is centralized in the `@app/validation` module to ensure consistency, maintainability, and developer experience.

## Core Principles

### 1. Consistency
- All services use the same validation decorators for common data types
- Error messages are standardized across all services
- Swagger documentation is automatically generated from validation decorators

### 2. Type Safety
- All validation decorators provide full TypeScript type safety
- Generic types ensure proper type inference
- IDE support with IntelliSense and auto-completion

### 3. Developer Experience
- Single import for validation and documentation
- Consistent API across all decorators
- Clear error messages for validation failures

## Available Validation Decorators

### Basic Field Validation

#### `@IsUUIDField(options?)`
Validates UUID v4 fields with Swagger documentation.

```typescript
import { IsUUIDField } from '@app/validation';

export class UserDto {
  @IsUUIDField({
    description: 'User identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}
```

#### `@IsEmailField(options?)`
Validates email addresses with proper format checking.

```typescript
import { IsEmailField } from '@app/validation';

export class LoginDto {
  @IsEmailField({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;
}
```

#### `@IsUsernameField(options?)`
Validates usernames with alphanumeric, underscore, and hyphen support.

```typescript
import { IsUsernameField } from '@app/validation';

export class CreateUserDto {
  @IsUsernameField({
    description: 'Unique username',
    example: 'john_doe',
  })
  username: string;
}
```

### Text Field Validation

#### `@IsDisplayNameField(options?)`
Validates display names with maximum length of 100 characters.

```typescript
import { IsDisplayNameField } from '@app/validation';

export class UpdateProfileDto {
  @IsDisplayNameField({
    description: 'Display name shown to other users',
    example: 'John Doe',
  })
  displayName: string;
}
```

#### `@IsBioField(options?)`
Validates user biography with maximum length of 500 characters.

```typescript
import { IsBioField } from '@app/validation';

export class UpdateProfileDto {
  @IsBioField({
    description: 'User biography',
    example: 'Software developer passionate about creating amazing user experiences.',
  })
  bio?: string;
}
```

#### `@IsSearchTermField(options?)`
Validates search terms with length constraints (1-100 characters).

```typescript
import { IsSearchTermField } from '@app/validation';

export class SearchDto {
  @IsSearchTermField({
    description: 'Search term to filter results',
    example: 'john doe',
  })
  searchTerm: string;
}
```

### Security Field Validation

#### `@IsStrongPasswordField(options?)`
Validates strong passwords with complexity requirements.

```typescript
import { IsStrongPasswordField } from '@app/validation';

export class RegisterDto {
  @IsStrongPasswordField({
    description: 'Strong password with uppercase, lowercase, and number',
    example: 'Password123',
  })
  password: string;
}
```

#### `@IsJWTTokenField(options?)`
Validates JWT token format.

```typescript
import { IsJWTTokenField } from '@app/validation';

export class TokenDto {
  @IsJWTTokenField({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}
```

### URL and Date Validation

#### `@IsAvatarUrlField(options?)`
Validates avatar URLs with length and format constraints.

```typescript
import { IsAvatarUrlField } from '@app/validation';

export class UpdateProfileDto {
  @IsAvatarUrlField({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl?: string;
}
```

#### `@IsISODateField(options?)`
Validates ISO 8601 date strings.

```typescript
import { IsISODateField } from '@app/validation';

export class LogQueryDto {
  @IsISODateField({
    description: 'Start date for query',
    example: '2023-07-19T00:00:00.000Z',
  })
  from?: string;
}
```

### Advanced Validation

#### `@IsValidDateRange(fromField, toField, options?)`
Validates that a date range is valid (from <= to).

```typescript
import { IsISODateField, IsValidDateRange } from '@app/validation';

export class DateRangeDto {
  @IsISODateField()
  from?: string;

  @IsISODateField()
  @IsValidDateRange('from', 'to')
  to?: string;
}
```

#### `@IsLogLevelField(logLevelEnum, options?)`
Validates log level enum values.

```typescript
import { IsLogLevelField } from '@app/validation';
import { LogLevel } from './log-level.enum';

export class LogQueryDto {
  @IsLogLevelField(LogLevel, {
    description: 'Log level filter',
    example: 'info',
  })
  level?: LogLevel;
}
```

## Usage Patterns

### GraphQL Input Types

For GraphQL input types, combine validation decorators with GraphQL decorators:

```typescript
import { Field, InputType } from '@nestjs/graphql';
import { IsUsernameField, IsDisplayNameField } from '@app/validation';

@InputType()
export class UpdateUserProfileInput {
  @Field(() => String, { description: 'Username' })
  @IsUsernameField()
  username: string;

  @Field(() => String, { nullable: true, description: 'Display name' })
  @IsDisplayNameField()
  displayName?: string;
}
```

### REST API DTOs

For REST API DTOs, validation decorators automatically include Swagger documentation:

```typescript
import { IsEmailField, IsStrongPasswordField } from '@app/validation';

export class LoginDto {
  @IsEmailField()
  email: string;

  @IsStrongPasswordField()
  password: string;
}
```

### Optional Fields

Use `@IsOptional()` from class-validator for optional fields:

```typescript
import { IsOptional } from 'class-validator';
import { IsBioField } from '@app/validation';

export class UpdateProfileDto {
  @IsOptional()
  @IsBioField()
  bio?: string;
}
```

## Error Handling

### Standard Error Messages

All validation decorators provide consistent error messages:

- **Email**: "Please provide a valid email address"
- **Password**: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
- **Username**: "Username can only contain letters, numbers, underscores, and hyphens"
- **Bio**: "Bio cannot exceed 500 characters"
- **Search Term**: "Search term cannot exceed 100 characters"

### Custom Error Messages

Override default error messages when needed:

```typescript
import { IsUsernameField } from '@app/validation';

export class CreateUserDto {
  @IsUsernameField({
    description: 'Username',
    // Custom validation options can be passed through
  })
  username: string;
}
```

## Best Practices

### 1. Always Use Shared Decorators

❌ **Don't** create custom validation for common patterns:
```typescript
// Bad
@IsString()
@IsEmail()
@ApiProperty({ description: 'Email' })
email: string;
```

✅ **Do** use shared validation decorators:
```typescript
// Good
@IsEmailField({ description: 'User email address' })
email: string;
```

### 2. Consistent Swagger Documentation

Always provide meaningful descriptions and examples:

```typescript
@IsUsernameField({
  description: 'Unique username for the user account',
  example: 'john_doe_2023',
})
username: string;
```

### 3. Combine with Other Decorators

Validation decorators work well with other decorators:

```typescript
import { Transform } from 'class-transformer';
import { IsEmailField } from '@app/validation';

export class LoginDto {
  @Transform(({ value }) => value?.toLowerCase())
  @IsEmailField()
  email: string;
}
```

### 4. Domain-Specific Validation

For domain-specific validation that can't be shared, create service-specific validators:

```typescript
// For service-specific validation
@IsEnum(UserStatusEnum)
status: UserStatusEnum;

// But use shared decorators for common patterns
@IsUUIDField()
userId: string;
```

## Migration Guidelines

### From Custom Validation

When migrating from custom validation:

1. **Identify the pattern**: Determine if it matches an existing shared decorator
2. **Replace imports**: Update imports to use `@app/validation`
3. **Update decorators**: Replace custom validation with shared decorators
4. **Test thoroughly**: Ensure validation behavior remains the same

### Example Migration

```typescript
// Before
import { IsString, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @IsEmail()
  @ApiProperty({ description: 'Email' })
  email: string;

  @IsString()
  @MaxLength(500)
  @ApiProperty({ description: 'Bio' })
  bio?: string;
}

// After
import { IsEmailField, IsBioField } from '@app/validation';

export class UserDto {
  @IsEmailField({ description: 'User email address' })
  email: string;

  @IsBioField({ description: 'User biography' })
  bio?: string;
}
```

## Validation Service

The `ValidationService` provides utility methods for programmatic validation:

```typescript
import { ValidationService } from '@app/validation';

@Injectable()
export class UserService {
  constructor(private validationService: ValidationService) {}

  async validateUserData(data: any) {
    const isValidEmail = this.validationService.isValidEmail(data.email);
    const isValidJWT = this.validationService.isValidJWTFormat(data.token);
    
    return { isValidEmail, isValidJWT };
  }
}
```

## Contributing

### Adding New Validation Decorators

When adding new shared validation decorators:

1. **Identify common patterns** across multiple services
2. **Create the decorator** in `common-validation.decorators.ts`
3. **Include Swagger documentation** with `@ApiProperty` or `@ApiPropertyOptional`
4. **Add comprehensive JSDoc** comments
5. **Export from index.ts**
6. **Update this documentation**
7. **Write tests** for the new decorator

### Naming Conventions

- Use `Is[Type]Field` pattern for field validation decorators
- Use descriptive names that indicate the validation purpose
- Include `Field` suffix to distinguish from class-validator decorators

## Related Documentation

- [Shared Infrastructure Modules](./SHARED_INFRASTRUCTURE_MODULES.md)
- [Service Standardization Plan](./SERVICE_STANDARDIZATION_PLAN.md)
- [API Documentation Guidelines](./API_DOCUMENTATION_GUIDELINES.md)
