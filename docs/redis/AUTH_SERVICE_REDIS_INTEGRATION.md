# Auth Service Redis Integration

## Overview
This document details the integration of Redis with the Auth Service, providing token storage, session management, rate limiting, and permission caching capabilities.

## Table of Contents
1. [Architecture](#architecture)
2. [Features](#features)
3. [Implementation Details](#implementation-details)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

## Architecture

The Auth Service uses Redis for several critical functions:

1. **Token Storage and Validation**: JWT tokens are stored in Redis with metadata for validation and revocation.
2. **Session Management**: User sessions are stored in Redis with configurable TTL and encryption.
3. **Rate Limiting**: Redis-based rate limiting protects authentication endpoints from abuse.
4. **Permission Caching**: User roles and permissions are cached in Redis for fast access.

### Integration Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Auth Service   │◄────┤  Redis Module   │◄────┤  Redis Cluster  │
│                 │     │                 │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│                 │
│  Auth Features  │
│                 │
│ - Token Storage │
│ - Sessions      │
│ - Rate Limiting │
│ - Permissions   │
│                 │
└─────────────────┘
```

## Features

### Token Storage and Validation

- **Token Metadata**: Stores token metadata in Redis for validation and auditing
- **Token Blacklisting**: Revoked tokens are added to a blacklist in Redis
- **Token Revocation**: Ability to revoke individual tokens or all user tokens
- **Token Types**: Support for access and refresh tokens with different TTLs

### Session Management

- **Session Creation**: Creates user sessions with configurable TTL
- **Session Retrieval**: Retrieves session data by session ID
- **Session Updating**: Updates session data with automatic TTL renewal
- **Session Termination**: Deletes sessions on logout
- **Session Encryption**: Optional encryption of session data
- **User Session Lookup**: Retrieves all sessions for a user

### Rate Limiting

- **IP-based Rate Limiting**: Limits authentication attempts by IP address
- **Username-based Rate Limiting**: Limits authentication attempts by username
- **Configurable Limits**: Customizable attempt limits, time windows, and block durations
- **Different Actions**: Separate rate limits for login, registration, and password reset

### Permission Caching

- **Role Caching**: Caches user roles for fast access
- **Permission Caching**: Caches user permissions for fast access
- **Permission Validation**: Fast checking of user permissions
- **Cache Invalidation**: Invalidates cache on permission changes

## Implementation Details

### Token Service

The `TokenService` handles JWT token generation, validation, and storage in Redis:

- **Token Generation**: Creates JWT tokens with Redis metadata storage
- **Token Validation**: Validates tokens against Redis blacklist
- **Token Revocation**: Adds tokens to Redis blacklist with appropriate TTL
- **User Token Management**: Manages all tokens for a user

### Session Service

The `SessionService` manages user sessions using Redis:

- **Session Store**: Uses `RedisSessionStore` for session storage
- **Session Lifecycle**: Handles session creation, retrieval, update, and deletion
- **Session Data**: Stores user data, IP, user agent, and timestamps
- **Session Lookup**: Provides methods to find sessions by user ID

### Rate Limit Service

The `RateLimitService` implements rate limiting using Redis:

- **Counter Management**: Uses Redis counters with TTL for rate limiting
- **Blocking**: Implements temporary blocking after too many attempts
- **Configuration**: Configurable limits for different actions
- **Guard Integration**: Provides a NestJS guard for easy route protection

### Permission Cache Service

The `PermissionCacheService` caches user permissions in Redis:

- **Permission Storage**: Caches user roles and permissions
- **Fast Lookup**: Provides fast permission checking
- **TTL Management**: Implements automatic cache expiration
- **Cache Invalidation**: Methods to invalidate cache on permission changes

## Configuration

### Environment Variables

The Auth Service Redis integration is configured using the following environment variables:

```
# Redis Configuration
REDIS_HOST=redis-node-1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_KEY_PREFIX=auth:

# JWT Configuration
JWT_SECRET=change-me-in-production
JWT_ACCESS_EXPIRY=900
JWT_REFRESH_EXPIRY=604800
JWT_EXPIRES_IN=15m

# Session Configuration
SESSION_TTL=3600
SESSION_PREFIX=auth:session
SESSION_ENCRYPT=false
SESSION_ENCRYPTION_KEY=change-me-in-production
SESSION_LOGS=true

# Cache Configuration
CACHE_TTL=300
CACHE_PREFIX=auth:cache
CACHE_LOGS=true

# Rate Limiting Configuration
RATE_LIMIT_LOGIN_MAX_ATTEMPTS=5
RATE_LIMIT_LOGIN_WINDOW=60
RATE_LIMIT_LOGIN_BLOCK=300
RATE_LIMIT_REGISTRATION_MAX_ATTEMPTS=3
RATE_LIMIT_REGISTRATION_WINDOW=3600
RATE_LIMIT_REGISTRATION_BLOCK=86400
RATE_LIMIT_PASSWORD_RESET_MAX_ATTEMPTS=3
RATE_LIMIT_PASSWORD_RESET_WINDOW=3600
RATE_LIMIT_PASSWORD_RESET_BLOCK=7200
```

### Docker Configuration

The Auth Service is configured to use Redis in Docker Compose:

- **Environment File**: `docker/config/auth/auth-config.env`
- **Redis Dependency**: Depends on `redis-node-1` service
- **Redis Profile**: Included in the `redis` profile

## Usage Examples

### Token Management

```typescript
// Generate tokens
const accessToken = await tokenService.generateAccessToken(userId);
const refreshToken = await tokenService.generateRefreshToken(userId);

// Validate tokens
const payload = await tokenService.validateToken(token, TokenType.ACCESS);

// Revoke tokens
await tokenService.revokeToken(token);
await tokenService.revokeAllUserTokens(userId);
```

### Session Management

```typescript
// Create a session
const sessionId = await sessionService.createSession(userId, userData, ip, userAgent);

// Get session data
const session = await sessionService.getSession(sessionId);

// Update session
await sessionService.updateSession(sessionId, { data: newData });

// Delete session
await sessionService.deleteSession(sessionId);
```

### Rate Limiting

```typescript
// Apply rate limiting to a controller method
@RateLimit('login')
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // Login logic
}

// Check rate limiting manually
const isLimited = await rateLimitService.isRateLimited(key, 'login');
if (isLimited) {
  throw new HttpException('Too many attempts', HttpStatus.TOO_MANY_REQUESTS);
}

// Increment counter
await rateLimitService.increment(key, 'login');
```

### Permission Caching

```typescript
// Cache permissions
await permissionCacheService.cachePermissions(userId, roles, permissions);

// Check permissions
const hasRole = await permissionCacheService.hasRole(userId, 'admin');
const hasPermission = await permissionCacheService.hasPermission(userId, 'user:delete');

// Invalidate cache
await permissionCacheService.invalidatePermissions(userId);
```

## Testing

### Unit Tests

Unit tests for the Redis integration should cover:

- Token generation, validation, and revocation
- Session creation, retrieval, update, and deletion
- Rate limiting functionality
- Permission caching and validation

### Integration Tests

Integration tests should verify:

- Redis connection and health checks
- Token storage and retrieval
- Session persistence across service restarts
- Rate limiting effectiveness
- Permission cache invalidation

## Monitoring

### Health Checks

The Auth Service includes Redis health checks:

- **Redis Connectivity**: Checks Redis connection status
- **Redis Operations**: Verifies Redis read/write operations
- **Health Endpoint**: Available at `/health` with Redis status

### Metrics

Monitor the following Redis metrics:

- **Connection Status**: Redis connection health
- **Operation Latency**: Time taken for Redis operations
- **Cache Hit/Miss Ratio**: Effectiveness of caching
- **Memory Usage**: Redis memory consumption
- **Rate Limit Blocks**: Number of rate-limited requests

## Troubleshooting

### Common Issues

1. **Redis Connection Failures**
   - Check Redis host and port configuration
   - Verify network connectivity
   - Ensure Redis service is running

2. **Token Validation Issues**
   - Check JWT secret configuration
   - Verify token expiration settings
   - Check Redis blacklist functionality

3. **Session Management Problems**
   - Verify session TTL configuration
   - Check session encryption settings
   - Ensure Redis persistence is enabled

4. **Rate Limiting Not Working**
   - Check rate limit configuration
   - Verify Redis counter incrementation
   - Check rate limit key generation

### Logging

Enable detailed Redis logs for troubleshooting:

```
SESSION_LOGS=true
CACHE_LOGS=true
LOG_LEVEL=debug
```

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-10-15
- **Version**: 1.0.0
