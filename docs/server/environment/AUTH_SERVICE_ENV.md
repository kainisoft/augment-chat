# Auth Service Environment Variables

## Overview

The Auth Service handles authentication, authorization, and user session management. This document details all environment variables required for the Auth Service configuration.

**Service Port**: 4001  
**Environment File**: `docker/config/auth-service/auth-service.env`

## Required Variables

| Variable | Type | Description | Example | Validation |
|----------|------|-------------|---------|------------|
| `NODE_ENV` | string | Application environment | `development` | Must be: `development`, `production`, `test` |
| `PORT` | number | Service port number | `4001` | Range: 1000-65535 |
| `DATABASE_URL_AUTH` | url | PostgreSQL connection URL | `postgresql://user:pass@postgres:5432/authdb` | Must match PostgreSQL URL pattern |
| `JWT_SECRET` | string | JWT signing secret | `your-32-character-secret-key-here` | Minimum 32 characters |
| `REDIS_HOST` | string | Redis cluster host | `redis-cluster` | Required for session storage |
| `REDIS_PORT` | number | Redis cluster port | `7000` | Range: 1000-65535 |
| `KAFKA_BROKERS` | string | Kafka broker addresses | `kafka:9092` | Comma-separated broker list |
| `KAFKA_CLIENT_ID` | string | Kafka client identifier | `auth-service` | Unique client ID |
| `KAFKA_GROUP_ID` | string | Kafka consumer group | `auth-service-group` | Unique group ID |

## Optional Variables

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `HOST` | string | `0.0.0.0` | Host interface to bind | Valid IP address |
| `API_PREFIX` | string | `api` | Global API route prefix | String pattern |
| `JWT_ACCESS_TOKEN_EXPIRY` | number | `900` | Access token expiry (seconds) | Range: 300-3600 |
| `JWT_REFRESH_TOKEN_EXPIRY` | number | `604800` | Refresh token expiry (seconds) | Range: 86400-2592000 |
| `SESSION_TTL` | number | `3600` | Session TTL (seconds) | Range: 300-86400 |
| `SESSION_ENCRYPTION_KEY` | string | Auto-generated | Session encryption key | Minimum 32 characters |
| `ACCOUNT_LOCKOUT_ATTEMPTS` | number | `5` | Failed login attempts before lockout | Range: 3-10 |
| `ACCOUNT_LOCKOUT_DURATION` | number | `15` | Lockout duration (minutes) | Range: 5-1440 |
| `BCRYPT_ROUNDS` | number | `12` | Bcrypt hashing rounds | Range: 10-15 |
| `REDIS_KEY_PREFIX` | string | `auth_` | Redis key prefix | Must end with underscore |
| `LOG_LEVEL` | string | `info` | Logging level | `debug`, `info`, `warn`, `error` |
| `LOG_CONSOLE` | boolean | `true` | Enable console logging | `true` or `false` |
| `LOG_KAFKA_ENABLED` | boolean | `true` | Enable Kafka logging | `true` or `false` |
| `LOKI_HOST` | string | - | Loki server URL | Valid URL format |
| `HEALTH_CHECK_TIMEOUT` | number | `5000` | Health check timeout (ms) | Range: 1000-30000 |
| `HEALTH_CHECK_INTERVAL` | number | `30000` | Health check interval (ms) | Range: 5000-300000 |

## Database Configuration

### PostgreSQL Connection

The Auth Service uses PostgreSQL for user authentication data storage.

**Required Format**:
```env
DATABASE_URL_AUTH=postgresql://username:password@host:port/database
```

**Example Configurations**:

**Development**:
```env
DATABASE_URL_AUTH=postgresql://auth_user:auth_pass@postgres:5432/authdb
```

**Production**:
```env
DATABASE_URL_AUTH=${DATABASE_URL_AUTH}
```

### Database Pool Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATABASE_POOL_SIZE` | number | `10` | Connection pool size |
| `DATABASE_IDLE_TIMEOUT` | number | `30` | Idle connection timeout (seconds) |
| `DATABASE_SSL` | boolean | `false` | Enable SSL connections |

## Security Configuration

### JWT Configuration

| Variable | Purpose | Security Level | Recommendation |
|----------|---------|----------------|----------------|
| `JWT_SECRET` | Token signing | **Critical** | Use 32+ character random string |
| `JWT_ACCESS_TOKEN_EXPIRY` | Access token lifetime | High | 15 minutes (900s) for production |
| `JWT_REFRESH_TOKEN_EXPIRY` | Refresh token lifetime | High | 7 days (604800s) maximum |

### Session Management

| Variable | Purpose | Security Level | Recommendation |
|----------|---------|----------------|----------------|
| `SESSION_TTL` | Session lifetime | High | 1 hour (3600s) for production |
| `SESSION_ENCRYPTION_KEY` | Session encryption | **Critical** | Use 32+ character random string |

### Account Security

| Variable | Purpose | Default | Recommendation |
|----------|---------|---------|----------------|
| `ACCOUNT_LOCKOUT_ATTEMPTS` | Brute force protection | `5` | 3-5 attempts for production |
| `ACCOUNT_LOCKOUT_DURATION` | Lockout duration | `15` minutes | 15-30 minutes for production |
| `BCRYPT_ROUNDS` | Password hashing | `12` | 12-14 rounds for production |

## Cache Configuration

### Redis Configuration

The Auth Service uses Redis for session storage and caching.

```env
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=auth_
```

**Key Patterns**:
- Sessions: `auth_session:{sessionId}`
- Refresh Tokens: `auth_refresh:{tokenId}`
- User Cache: `auth_user:{userId}`
- Lockout: `auth_lockout:{userId}`

## Kafka Configuration

### Event Publishing

The Auth Service publishes authentication events to Kafka.

```env
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=auth-service
KAFKA_GROUP_ID=auth-service-group
```

**Published Events**:
- `user.authenticated`
- `user.logout`
- `user.password.changed`
- `user.account.locked`
- `user.account.unlocked`

## Logging Configuration

### Log Levels

| Level | Development | Production | Description |
|-------|-------------|------------|-------------|
| `debug` | ✅ | ❌ | Detailed debugging information |
| `info` | ✅ | ❌ | General information |
| `warn` | ✅ | ✅ | Warning messages |
| `error` | ✅ | ✅ | Error messages |

### Security Logging

The Auth Service implements comprehensive security logging:

```env
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true
LOKI_HOST=http://loki:3100
```

**Logged Security Events**:
- Authentication attempts (success/failure)
- Password changes
- Account lockouts
- Session creation/destruction
- JWT token generation/validation

## Health Check Configuration

The Auth Service exposes health checks at `/api/health`.

```env
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000
```

**Health Check Components**:
- System health
- Database connectivity
- Redis connectivity
- Kafka connectivity

## Environment File Example

### Development Configuration

```env
# =============================================================================
# AUTH SERVICE ENVIRONMENT CONFIGURATION
# =============================================================================

# Application Configuration
NODE_ENV=development
PORT=4001
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
DATABASE_URL_AUTH=postgresql://auth_user:auth_pass@postgres:5432/authdb
DATABASE_POOL_SIZE=10
DATABASE_IDLE_TIMEOUT=30
DATABASE_SSL=false

# Cache Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=auth_

# Security Configuration
JWT_SECRET=development-auth-secret-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800
SESSION_TTL=3600
SESSION_ENCRYPTION_KEY=development-session-key-32-characters-long
ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=15
BCRYPT_ROUNDS=12

# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=auth-service
KAFKA_GROUP_ID=auth-service-group

# Logging Configuration
LOG_LEVEL=debug
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true
LOKI_HOST=http://loki:3100

# Health Check Configuration
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000
```

### Production Configuration

```env
# =============================================================================
# AUTH SERVICE ENVIRONMENT CONFIGURATION - PRODUCTION
# =============================================================================

# Application Configuration
NODE_ENV=production
PORT=4001
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
DATABASE_URL_AUTH=${DATABASE_URL_AUTH}
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=60
DATABASE_SSL=true

# Cache Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_KEY_PREFIX=auth_

# Security Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800
SESSION_TTL=3600
SESSION_ENCRYPTION_KEY=${SESSION_ENCRYPTION_KEY}
ACCOUNT_LOCKOUT_ATTEMPTS=3
ACCOUNT_LOCKOUT_DURATION=30
BCRYPT_ROUNDS=14

# Kafka Configuration
KAFKA_BROKERS=${KAFKA_BROKERS}
KAFKA_CLIENT_ID=auth-service
KAFKA_GROUP_ID=auth-service-group

# Logging Configuration
LOG_LEVEL=warn
LOG_CONSOLE=false
LOG_KAFKA_ENABLED=true
LOKI_HOST=${LOKI_HOST}

# Health Check Configuration
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify `DATABASE_URL_AUTH` format
   - Check database credentials and connectivity
   - Ensure PostgreSQL service is running

2. **Redis Connection Failed**
   - Verify `REDIS_HOST` and `REDIS_PORT`
   - Check Redis cluster status
   - Ensure Redis service is accessible

3. **JWT Validation Errors**
   - Verify `JWT_SECRET` is at least 32 characters
   - Check token expiry settings
   - Ensure consistent secret across services

4. **Session Issues**
   - Verify Redis connectivity
   - Check `SESSION_TTL` configuration
   - Ensure `SESSION_ENCRYPTION_KEY` is set

### Validation Errors

See [Validation Troubleshooting Guide](./VALIDATION_TROUBLESHOOTING.md) for detailed error resolution.

## Related Documentation

- [Environment Variables Overview](../ENVIRONMENT_VARIABLES.md)
- [Auth Service Plan](../AUTH_SERVICE_PLAN.md)
- [Security Module Documentation](../../libs/security/README.md)

---

**Last Updated**: January 2024  
**Version**: 1.0.0
