# Security Standards Guide

## Overview

This guide documents the standardized security patterns and utilities used across all microservices in the chat application. All security implementations are centralized in the `@app/security` module to ensure consistency, maintainability, and security best practices.

## Core Security Principles

### 1. Defense in Depth
- Multiple layers of security controls
- Rate limiting, input validation, authentication, and authorization
- Fail-safe defaults and least privilege access

### 2. Standardization
- All services use the same security utilities and patterns
- Consistent security configurations across all endpoints
- Centralized security policy management

### 3. Zero Trust
- Every request is authenticated and authorized
- Input validation and sanitization on all data
- Secure communication between services

## Security Module (`@app/security`)

### Available Services

#### `SecurityUtilsService`
Provides cryptographic utilities and security helper functions.

```typescript
import { SecurityUtilsService } from '@app/security';

@Injectable()
export class MyService {
  constructor(private securityUtils: SecurityUtilsService) {}

  async hashPassword(password: string): Promise<string> {
    return this.securityUtils.hashPassword(password, 12);
  }

  generateSecureToken(): string {
    return this.securityUtils.generateSecureToken(64);
  }
}
```

#### `RateLimitService`
Manages rate limiting across all services with Redis backend.

```typescript
import { RateLimitService } from '@app/security';

@Injectable()
export class MyService {
  constructor(private rateLimitService: RateLimitService) {}

  async checkRateLimit(key: string, config: RateLimitConfig): Promise<boolean> {
    return this.rateLimitService.checkRateLimit(key, config);
  }
}
```

### Available Guards

#### `RateLimitGuard`
Enforces rate limiting based on decorator metadata.

```typescript
import { UseGuards } from '@nestjs/common';
import { RateLimit, RateLimitGuard } from '@app/security';

@Controller('api')
@UseGuards(RateLimitGuard)
export class ApiController {
  @Get('data')
  @RateLimit('api-call')
  getData() {
    return { data: 'example' };
  }
}
```

## Rate Limiting Standards

### Predefined Rate Limit Configurations

#### Login Attempts
```typescript
@RateLimit('login')
// Configuration:
// - maxAttempts: 5
// - windowSeconds: 900 (15 minutes)
// - blockSeconds: 1800 (30 minutes)
```

#### Registration Attempts
```typescript
@RateLimit('registration')
// Configuration:
// - maxAttempts: 3
// - windowSeconds: 3600 (1 hour)
// - blockSeconds: 3600 (1 hour)
```

#### Password Reset Attempts
```typescript
@RateLimit('password-reset')
// Configuration:
// - maxAttempts: 3
// - windowSeconds: 3600 (1 hour)
// - blockSeconds: 1800 (30 minutes)
```

#### API Calls
```typescript
@RateLimit('api-call')
// Configuration:
// - maxAttempts: 100
// - windowSeconds: 60 (1 minute)
// - blockSeconds: 60 (1 minute)
```

### Custom Rate Limiting
```typescript
@RateLimit('custom', {
  maxAttempts: 10,
  windowSeconds: 300,
  blockSeconds: 600,
  message: 'Custom rate limit exceeded',
  keyGenerator: (req) => `custom:${req.ip}:${req.user?.id}`
})
```

## Password Security Standards

### Password Hashing
All password hashing uses bcrypt with configurable salt rounds:

```typescript
import { SecurityUtilsService } from '@app/security';

// Standard password hashing
const hashedPassword = await securityUtils.hashPassword(password, 12);

// Password verification
const isValid = await securityUtils.verifyPassword(password, hashedPassword);
```

### Password Validation
Password strength requirements are enforced through validation decorators:

```typescript
import { IsStrongPasswordField } from '@app/validation';

export class ChangePasswordDto {
  @IsStrongPasswordField({
    description: 'New password with complexity requirements',
  })
  newPassword: string;
}
```

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- No common passwords or dictionary words

## Token Security Standards

### JWT Token Generation
All JWT tokens are generated through the Security module:

```typescript
import { SecurityService } from '@app/security';

// Generate access token
const accessToken = await securityService.generateAccessToken(userId, payload);

// Generate refresh token
const refreshToken = await securityService.generateRefreshToken(userId, payload);
```

### Secure Token Generation
For non-JWT tokens (reset tokens, verification tokens):

```typescript
import { SecurityUtilsService } from '@app/security';

// Generate secure random token
const resetToken = securityUtils.generateSecureToken(64);

// Generate session ID
const sessionId = securityUtils.generateSessionId();

// Generate correlation ID
const correlationId = securityUtils.generateCorrelationId();
```

### Token Storage and Management
- Access tokens: Short-lived (15 minutes default)
- Refresh tokens: Longer-lived (7 days default) with rotation
- Session tokens: Stored in Redis with encryption
- Reset tokens: Single-use with expiration

## Input Sanitization Standards

### Automatic Sanitization
All input is automatically sanitized using shared utilities:

```typescript
import { SecurityUtilsService } from '@app/security';

// Sanitize user input
const cleanInput = securityUtils.sanitizeInput(userInput);

// Validate and sanitize email
const cleanEmail = securityUtils.validateAndSanitizeEmail(email);

// Check for malicious content
const isMalicious = securityUtils.containsMaliciousContent(input);
```

### XSS Prevention
- HTML encoding of user-generated content
- Content Security Policy (CSP) headers
- Input validation and sanitization
- Output encoding in templates

### SQL Injection Prevention
- Parameterized queries only
- ORM usage (Drizzle) with proper escaping
- Input validation and type checking
- No dynamic SQL construction

## Authentication and Authorization

### Authentication Flow
1. User submits credentials
2. Rate limiting check
3. Credential validation
4. Password verification using bcrypt
5. JWT token generation
6. Session creation in Redis
7. Token response to client

### Authorization Patterns
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@app/security';
import { Roles } from '@app/security';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin', 'moderator')
  getUsers() {
    // Only admin and moderator roles can access
  }
}
```

### Public Endpoints
```typescript
import { Public } from '@app/security';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Public()
  login(@Body() loginDto: LoginDto) {
    // Public endpoint, no authentication required
  }
}
```

## Security Headers and CORS

### Standard Security Headers
All services automatically include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

### CORS Configuration
```typescript
// Standardized CORS settings
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

## Cryptographic Standards

### Random Generation
```typescript
import { SecurityUtilsService } from '@app/security';

// Cryptographically secure random string
const randomString = securityUtils.generateSecureRandom(32, 'hex');

// Base64URL encoded random string
const urlSafeRandom = securityUtils.generateSecureRandom(32, 'base64url');
```

### Constant-Time Comparison
```typescript
// Prevent timing attacks
const isEqual = securityUtils.constantTimeCompare(value1, value2);
```

### TOTP (Two-Factor Authentication)
```typescript
// Generate TOTP secret
const secret = securityUtils.generateTOTPSecret();

// Verify TOTP token
const isValid = securityUtils.verifyTOTP(token, secret);
```

## Service-Specific Security Implementations

### Auth Service
- ✅ Rate limiting on all authentication endpoints
- ✅ Password hashing using shared SecurityUtilsService
- ✅ JWT token generation through Security module
- ✅ Session management with Redis encryption
- ✅ Account lockout protection

### User Service
- ✅ Rate limiting on GraphQL search operations
- ✅ Input sanitization for user profiles
- ✅ Avatar URL validation and sanitization
- ✅ Bio content validation and length limits

### Logging Service
- ✅ Rate limiting on log query endpoints
- ✅ Input sanitization for log queries
- ✅ Date range validation
- ✅ Service-specific access controls

## Security Monitoring and Logging

### Security Event Logging
All security events are logged with appropriate severity levels:

```typescript
import { LoggingService } from '@app/logging';

// Log security events
loggingService.warn('Failed login attempt', 'security', {
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  email: loginDto.email,
});

// Log rate limit violations
loggingService.error('Rate limit exceeded', 'security', {
  ip: request.ip,
  endpoint: request.url,
  rateLimitType: 'login',
});
```

### Security Metrics
- Failed authentication attempts
- Rate limit violations
- Suspicious activity patterns
- Token usage and rotation

## Best Practices

### 1. Always Use Shared Security Utilities
❌ **Don't** implement custom security functions:
```typescript
// Bad - custom password hashing
const hash = bcrypt.hashSync(password, 10);
```

✅ **Do** use shared security utilities:
```typescript
// Good - shared security utility
const hash = await securityUtils.hashPassword(password, 12);
```

### 2. Apply Rate Limiting to All Public Endpoints
```typescript
@Controller('api')
@UseGuards(RateLimitGuard)
export class ApiController {
  @Get('public-data')
  @RateLimit('api-call')
  getPublicData() {
    // Rate limited public endpoint
  }
}
```

### 3. Validate and Sanitize All Input
```typescript
import { IsEmailField, IsBioField } from '@app/validation';

export class UpdateProfileDto {
  @IsEmailField()
  email: string;

  @IsBioField()
  bio?: string;
}
```

### 4. Use Proper Error Handling
```typescript
try {
  await securityOperation();
} catch (error) {
  // Log security errors without exposing sensitive information
  loggingService.error('Security operation failed', 'security', {
    operation: 'passwordReset',
    error: error.message,
  });

  // Return generic error to client
  throw new BadRequestException('Operation failed');
}
```

## Security Checklist

### For New Endpoints
- [ ] Rate limiting applied
- [ ] Input validation and sanitization
- [ ] Authentication and authorization checks
- [ ] Security logging implemented
- [ ] Error handling without information disclosure

### For New Services
- [ ] SecurityModule imported
- [ ] Rate limiting guards configured
- [ ] Security utilities used for cryptographic operations
- [ ] Proper CORS configuration
- [ ] Security headers configured

### For Production Deployment
- [ ] Security environment variables configured
- [ ] Rate limiting Redis connection secured
- [ ] JWT secrets rotated and secured
- [ ] Security monitoring enabled
- [ ] Security headers verified

## Related Documentation

- [Validation Standards Guide](./VALIDATION_STANDARDS_GUIDE.md)
- [Shared Infrastructure Modules](./SHARED_INFRASTRUCTURE_MODULES.md)
- [Service Standardization Plan](./SERVICE_STANDARDIZATION_PLAN.md)
