# Environment Variables Documentation

## Overview

This document provides comprehensive documentation for environment variables across all microservices in the chat application. The environment variable system has been standardized to ensure consistency, security, and maintainability across all services.

## Table of Contents

- [Environment File Structure](#environment-file-structure)
- [Common Environment Variables](#common-environment-variables)
- [Service-Specific Variables](#service-specific-variables)
- [Validation Rules](#validation-rules)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## Environment File Structure

### File Organization

All environment files are organized in the following structure:

```
docker/
└── config/
    ├── api-gateway/
    │   └── api-gateway.env
    ├── auth-service/
    │   └── auth-service.env
    ├── user-service/
    │   └── user-service.env
    ├── chat-service/
    │   └── chat-service.env
    ├── notification-service/
    │   └── notification-service.env
    └── logging-service/
        └── logging-service.env
```

### Naming Conventions

- **Directory**: `{service-name}/` (kebab-case)
- **File**: `{service-name}.env` (kebab-case)
- **Variables**: `UPPER_SNAKE_CASE`

### File Structure Template

Each environment file follows this standardized structure:

```env
# =============================================================================
# {SERVICE NAME} ENVIRONMENT CONFIGURATION
# =============================================================================

# Application Configuration
NODE_ENV=development
PORT={service-port}
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
# (Service-specific database variables)

# Cache Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX={service}_

# Security Configuration
JWT_SECRET=change-me-in-production-this-is-32-chars-long
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID={service-name}
KAFKA_GROUP_ID={service-name}-group

# Logging Configuration
LOG_LEVEL=debug
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true
LOKI_HOST=http://loki:3100

# GraphQL Configuration (if applicable)
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true
GRAPHQL_INTROSPECTION=true

# Performance Configuration
QUERY_COMPLEXITY_LIMIT=1000
QUERY_DEPTH_LIMIT=10
CACHE_TTL=300

# Health Check Configuration
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000
```

## Common Environment Variables

These variables are used across multiple services and follow consistent patterns:

### Application Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_ENV` | string | ✅ | - | Application environment (`development`, `production`, `test`) |
| `PORT` | number | ✅ | - | Service port number (4000-4005) |
| `HOST` | string | ❌ | `0.0.0.0` | Host interface to bind to |
| `API_PREFIX` | string | ❌ | `api` | Global API route prefix |

### Security Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `JWT_SECRET` | string | ✅ | - | JWT signing secret (minimum 32 characters) |
| `JWT_ACCESS_TOKEN_EXPIRY` | number | ❌ | `900` | Access token expiry in seconds (15 minutes) |
| `JWT_REFRESH_TOKEN_EXPIRY` | number | ❌ | `604800` | Refresh token expiry in seconds (7 days) |

### Cache Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REDIS_HOST` | string | ✅ | - | Redis cluster host |
| `REDIS_PORT` | number | ✅ | - | Redis cluster port |
| `REDIS_KEY_PREFIX` | string | ❌ | `{service}_` | Redis key prefix for service isolation |
| `CACHE_TTL` | number | ❌ | `300` | Default cache TTL in seconds |

### Kafka Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `KAFKA_BROKERS` | string | ✅ | - | Kafka broker connection string |
| `KAFKA_CLIENT_ID` | string | ✅ | - | Kafka client identifier |
| `KAFKA_GROUP_ID` | string | ✅ | - | Kafka consumer group identifier |

### Logging Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `LOG_LEVEL` | string | ❌ | `info` | Logging level (`debug`, `info`, `warn`, `error`) |
| `LOG_CONSOLE` | boolean | ❌ | `true` | Enable console logging |
| `LOG_KAFKA_ENABLED` | boolean | ❌ | `true` | Enable Kafka logging |
| `LOKI_HOST` | string | ❌ | - | Loki server URL for log aggregation |

### GraphQL Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `GRAPHQL_PLAYGROUND` | boolean | ❌ | `true` | Enable GraphQL Playground |
| `GRAPHQL_DEBUG` | boolean | ❌ | `true` | Enable GraphQL debug mode |
| `GRAPHQL_INTROSPECTION` | boolean | ❌ | `true` | Enable GraphQL introspection |
| `QUERY_COMPLEXITY_LIMIT` | number | ❌ | `1000` | Maximum query complexity |
| `QUERY_DEPTH_LIMIT` | number | ❌ | `10` | Maximum query depth |

## Service-Specific Variables

Each service has additional variables specific to its functionality:

### Database Variables

- **PostgreSQL Services** (user-service, auth-service): `DATABASE_URL_{SERVICE}`
- **MongoDB Services** (chat-service, notification-service): `MONGODB_URI`

### Service-Specific Features

- **Chat Service**: WebSocket configuration, message limits
- **Notification Service**: SMTP, SMS, push notification settings
- **Auth Service**: Session management, account lockout settings
- **API Gateway**: Service endpoint URLs, federation configuration
- **Logging Service**: Log retention, batch processing settings

For detailed service-specific documentation, see:
- [Auth Service Environment Variables](./environment/AUTH_SERVICE_ENV.md)
- [User Service Environment Variables](./environment/USER_SERVICE_ENV.md)
- [Chat Service Environment Variables](./environment/CHAT_SERVICE_ENV.md)
- [Notification Service Environment Variables](./environment/NOTIFICATION_SERVICE_ENV.md)
- [API Gateway Environment Variables](./environment/API_GATEWAY_ENV.md)
- [Logging Service Environment Variables](./environment/LOGGING_SERVICE_ENV.md)

## Validation Rules

All environment variables are validated using the `EnvironmentValidationService` with the following validation types:

### Validation Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | String validation with length and pattern checks | `JWT_SECRET` (min 32 chars) |
| `number` | Numeric validation with min/max ranges | `PORT` (1000-65535) |
| `boolean` | Boolean validation (`true`/`false`) | `GRAPHQL_PLAYGROUND` |
| `url` | URL format validation with pattern matching | `DATABASE_URL_USER` |
| `email` | Email format validation | `SMTP_USER` |
| `array` | Comma-separated array validation | `KAFKA_BROKERS` |
| `pattern` | Regular expression pattern matching | `REDIS_KEY_PREFIX` |
| `allowedValues` | Enumerated allowed values | `NODE_ENV` |

### Common Validation Rules

- **Required Variables**: Must be present and non-empty
- **String Length**: Minimum and maximum character limits
- **Numeric Ranges**: Minimum and maximum value constraints
- **URL Patterns**: Protocol and format validation
- **Security Requirements**: Minimum security standards (e.g., JWT secret length)

## Security Best Practices

### Development Environment

1. **Use placeholder values** for sensitive variables
2. **Never commit real secrets** to version control
3. **Use minimum required permissions** for database connections
4. **Enable debug logging** for development troubleshooting

### Production Environment

1. **Use environment variable substitution** for sensitive values
2. **Implement secret management** (AWS Secrets Manager, HashiCorp Vault)
3. **Use strong, randomly generated secrets** (minimum 32 characters)
4. **Disable debug features** (GraphQL playground, introspection)
5. **Use SSL/TLS** for all database connections
6. **Implement proper logging levels** (warn/error only)

### Secret Management

```env
# Development (placeholder values)
JWT_SECRET=change-me-in-production-this-is-32-chars-long
DATABASE_URL_USER=postgresql://user:password@postgres:5432/userdb

# Production (environment substitution)
JWT_SECRET=${JWT_SECRET}
DATABASE_URL_USER=${DATABASE_URL_USER}
```

## Troubleshooting

### Common Issues

1. **Service fails to start**: Check validation errors in logs
2. **Database connection fails**: Verify database URL format and credentials
3. **Redis connection fails**: Check Redis cluster configuration
4. **Kafka connection fails**: Verify Kafka broker addresses
5. **Health checks fail**: Ensure correct health endpoint configuration

### Validation Error Resolution

See [Validation Rules and Troubleshooting Guide](./environment/VALIDATION_TROUBLESHOOTING.md) for detailed error resolution.

## Examples

### Complete Development Environment Example

This example shows a complete development environment configuration for all services:

#### Auth Service (Development)
```env
# =============================================================================
# AUTH SERVICE - DEVELOPMENT ENVIRONMENT
# =============================================================================

NODE_ENV=development
PORT=4001
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
DATABASE_URL_AUTH=postgresql://auth_user:auth_pass@postgres:5432/authdb
DATABASE_POOL_SIZE=10
DATABASE_IDLE_TIMEOUT=30
DATABASE_SSL=false

# Security Configuration
JWT_SECRET=development-auth-secret-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800
SESSION_TTL=3600
SESSION_ENCRYPTION_KEY=development-session-key-32-characters-long
ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=15
BCRYPT_ROUNDS=12

# Cache Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=auth_

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

#### User Service (Development)
```env
# =============================================================================
# USER SERVICE - DEVELOPMENT ENVIRONMENT
# =============================================================================

NODE_ENV=development
PORT=4003
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
DATABASE_URL_USER=postgresql://user_user:user_pass@postgres:5432/userdb
DATABASE_POOL_SIZE=10
DATABASE_IDLE_TIMEOUT=30
DATABASE_SSL=false

# Security Configuration
JWT_SECRET=development-user-secret-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Cache Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=user_
CACHE_TTL=300

# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true
GRAPHQL_INTROSPECTION=true
QUERY_COMPLEXITY_LIMIT=1000
QUERY_DEPTH_LIMIT=10

# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=user-service
KAFKA_GROUP_ID=user-service-group

# Logging Configuration
LOG_LEVEL=debug
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true
LOKI_HOST=http://loki:3100

# User Relationship Configuration
MAX_FRIENDS_PER_USER=1000
MAX_CONTACTS_PER_USER=5000
MAX_PENDING_REQUESTS=100
```

### Complete Production Environment Example

This example shows a complete production environment configuration with security best practices:

#### Auth Service (Production)
```env
# =============================================================================
# AUTH SERVICE - PRODUCTION ENVIRONMENT
# =============================================================================

NODE_ENV=production
PORT=4001
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
DATABASE_URL_AUTH=${DATABASE_URL_AUTH}
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=60
DATABASE_SSL=true

# Security Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800
SESSION_TTL=3600
SESSION_ENCRYPTION_KEY=${SESSION_ENCRYPTION_KEY}
ACCOUNT_LOCKOUT_ATTEMPTS=3
ACCOUNT_LOCKOUT_DURATION=30
BCRYPT_ROUNDS=14

# Cache Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_KEY_PREFIX=auth_

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

#### API Gateway (Production)
```env
# =============================================================================
# API GATEWAY - PRODUCTION ENVIRONMENT
# =============================================================================

NODE_ENV=production
PORT=4000
HOST=0.0.0.0
API_PREFIX=api

# Service Endpoints
USER_SERVICE_URL=${USER_SERVICE_URL}
CHAT_SERVICE_URL=${CHAT_SERVICE_URL}
NOTIFICATION_SERVICE_URL=${NOTIFICATION_SERVICE_URL}
AUTH_SERVICE_URL=${AUTH_SERVICE_URL}
LOGGING_SERVICE_URL=${LOGGING_SERVICE_URL}

# Security Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Cache Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_KEY_PREFIX=gateway_

# GraphQL Federation Configuration
GRAPHQL_PLAYGROUND=false
GRAPHQL_DEBUG=false
GRAPHQL_INTROSPECTION=false
FEDERATION_POLLING_INTERVAL=60000
FEDERATION_TIMEOUT=5000

# Query Performance
QUERY_COMPLEXITY_LIMIT=1000
QUERY_DEPTH_LIMIT=12
QUERY_TIMEOUT=15000
QUERY_CACHE_TTL=600

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=500
RATE_LIMIT_WINDOW=3600
RATE_LIMIT_SKIP_SUCCESSFUL=true

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=${ALLOWED_ORIGINS}
CORS_METHODS=GET,POST,OPTIONS
CORS_HEADERS=Content-Type,Authorization

# Authentication
AUTH_REQUIRED=true
AUTH_SKIP_INTROSPECTION=false
AUTH_SKIP_PLAYGROUND=false

# Kafka Configuration
KAFKA_BROKERS=${KAFKA_BROKERS}
KAFKA_CLIENT_ID=api-gateway
KAFKA_GROUP_ID=api-gateway-group

# Logging Configuration
LOG_LEVEL=warn
LOG_CONSOLE=false
LOG_KAFKA_ENABLED=true
LOKI_HOST=${LOKI_HOST}
```

### Environment Variable Substitution Patterns

For production deployments, use environment variable substitution to inject secrets:

#### Docker Compose Environment Variables
```yaml
# docker-compose.production.yml
services:
  auth-service:
    env_file:
      - ./docker/config/auth-service/auth-service.production.env
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL_AUTH=${DATABASE_URL_AUTH}
      - SESSION_ENCRYPTION_KEY=${SESSION_ENCRYPTION_KEY}
```

#### Kubernetes ConfigMap and Secrets
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: auth-service-config
data:
  NODE_ENV: "production"
  PORT: "4001"
  LOG_LEVEL: "warn"

---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-service-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  DATABASE_URL_AUTH: <base64-encoded-url>
```

#### AWS Systems Manager Parameter Store
```bash
# Store secrets in AWS Parameter Store
aws ssm put-parameter \
  --name "/chat-app/auth-service/jwt-secret" \
  --value "your-production-jwt-secret" \
  --type "SecureString"

# Reference in environment file
JWT_SECRET={{resolve:ssm-secure:/chat-app/auth-service/jwt-secret}}
```

## Related Documentation

- [Service Standardization Plan](./SERVICE_STANDARDIZATION_PLAN.md)
- [Docker Integration Summary](./STEP_4_DOCKER_INTEGRATION_SUMMARY.md)
- [Environment Validation Service](../libs/configuration/README.md)

---

**Last Updated**: January 2024  
**Version**: 1.0.0
