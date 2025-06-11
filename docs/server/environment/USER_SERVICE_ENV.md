# User Service Environment Variables

## Overview

The User Service manages user profiles, relationships, and user-related data operations. This document details all environment variables required for the User Service configuration.

**Service Port**: 4003
**Environment File**: `docker/config/user-service/user-service.env`

## Required Variables

| Variable | Type | Description | Example | Validation |
|----------|------|-------------|---------|------------|
| `NODE_ENV` | string | Application environment | `development` | Must be: `development`, `production`, `test` |
| `PORT` | number | Service port number | `4003` | Range: 1000-65535 |
| `DATABASE_URL_USER` | url | PostgreSQL connection URL | `postgresql://user:pass@postgres:5432/userdb` | Must match PostgreSQL URL pattern |
| `JWT_SECRET` | string | JWT signing secret | `your-32-character-secret-key-here` | Minimum 32 characters |
| `REDIS_HOST` | string | Redis cluster host | `redis-cluster` | Required for caching |
| `REDIS_PORT` | number | Redis cluster port | `7000` | Range: 1000-65535 |
| `KAFKA_BROKERS` | string | Kafka broker addresses | `kafka:9092` | Comma-separated broker list |
| `KAFKA_CLIENT_ID` | string | Kafka client identifier | `user-service` | Unique client ID |
| `KAFKA_GROUP_ID` | string | Kafka consumer group | `user-service-group` | Unique group ID |

## Optional Variables

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `HOST` | string | `0.0.0.0` | Host interface to bind | Valid IP address |
| `API_PREFIX` | string | `api` | Global API route prefix | String pattern |
| `JWT_ACCESS_TOKEN_EXPIRY` | number | `900` | Access token expiry (seconds) | Range: 300-3600 |
| `JWT_REFRESH_TOKEN_EXPIRY` | number | `604800` | Refresh token expiry (seconds) | Range: 86400-2592000 |
| `REDIS_KEY_PREFIX` | string | `user_` | Redis key prefix | Must end with underscore |
| `CACHE_TTL` | number | `300` | Default cache TTL (seconds) | Range: 60-3600 |
| `LOG_LEVEL` | string | `info` | Logging level | `debug`, `info`, `warn`, `error` |
| `LOG_CONSOLE` | boolean | `true` | Enable console logging | `true` or `false` |
| `LOG_KAFKA_ENABLED` | boolean | `true` | Enable Kafka logging | `true` or `false` |
| `LOKI_HOST` | string | - | Loki server URL | Valid URL format |

## GraphQL Configuration

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `GRAPHQL_PLAYGROUND` | boolean | `true` | Enable GraphQL Playground | `true` or `false` |
| `GRAPHQL_DEBUG` | boolean | `true` | Enable GraphQL debug mode | `true` or `false` |
| `GRAPHQL_INTROSPECTION` | boolean | `true` | Enable GraphQL introspection | `true` or `false` |
| `QUERY_COMPLEXITY_LIMIT` | number | `1000` | Maximum query complexity | Range: 100-10000 |
| `QUERY_DEPTH_LIMIT` | number | `10` | Maximum query depth | Range: 5-20 |

## Database Configuration

### PostgreSQL Connection

The User Service uses PostgreSQL for user data storage.

**Required Format**:
```env
DATABASE_URL_USER=postgresql://username:password@host:port/database
```

**Example Configurations**:

**Development**:
```env
DATABASE_URL_USER=postgresql://user_user:user_pass@postgres:5432/userdb
```

**Production**:
```env
DATABASE_URL_USER=${DATABASE_URL_USER}
```

### Database Pool Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATABASE_POOL_SIZE` | number | `10` | Connection pool size |
| `DATABASE_IDLE_TIMEOUT` | number | `30` | Idle connection timeout (seconds) |
| `DATABASE_SSL` | boolean | `false` | Enable SSL connections |

## Cache Configuration

### Redis Configuration

The User Service uses Redis for caching user data and relationships.

```env
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=user_
CACHE_TTL=300
```

**Cache Patterns**:
- User Profiles: `user_profile:{userId}`
- User Relationships: `user_relationships:{userId}`
- User Search: `user_search:{query}`
- User Permissions: `user_permissions:{userId}`

### Cache Strategies

| Data Type | TTL | Strategy | Invalidation |
|-----------|-----|----------|--------------|
| User Profiles | 300s | Cache-aside | On profile update |
| Relationships | 600s | Write-through | On relationship change |
| Search Results | 60s | Cache-aside | Time-based |
| Permissions | 900s | Write-through | On permission change |

## GraphQL Configuration

### Development Settings

```env
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true
GRAPHQL_INTROSPECTION=true
QUERY_COMPLEXITY_LIMIT=1000
QUERY_DEPTH_LIMIT=10
```

### Production Settings

```env
GRAPHQL_PLAYGROUND=false
GRAPHQL_DEBUG=false
GRAPHQL_INTROSPECTION=false
QUERY_COMPLEXITY_LIMIT=500
QUERY_DEPTH_LIMIT=8
```

### Query Limits

| Environment | Complexity Limit | Depth Limit | Reasoning |
|-------------|------------------|-------------|-----------|
| Development | 1000 | 10 | Flexible for testing |
| Production | 500 | 8 | Performance optimization |

## Kafka Configuration

### Event Publishing

The User Service publishes user-related events to Kafka.

```env
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=user-service
KAFKA_GROUP_ID=user-service-group
```

**Published Events**:
- `user.created`
- `user.updated`
- `user.deleted`
- `user.relationship.added`
- `user.relationship.removed`
- `user.profile.updated`

### Event Consumption

**Consumed Events**:
- `auth.user.authenticated` (for user activity tracking)
- `chat.message.sent` (for user engagement metrics)

## User Relationship Configuration

### Relationship Types

| Type | Description | Mutual | Validation |
|------|-------------|--------|------------|
| `FRIEND` | Mutual friendship | Yes | Both users must accept |
| `CONTACT` | One-way contact | No | Immediate addition |
| `BLOCKED` | User blocking | No | Immediate blocking |
| `PENDING` | Pending friend request | No | Awaiting acceptance |

### Relationship Limits

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MAX_FRIENDS_PER_USER` | number | `1000` | Maximum friends per user |
| `MAX_CONTACTS_PER_USER` | number | `5000` | Maximum contacts per user |
| `MAX_PENDING_REQUESTS` | number | `100` | Maximum pending friend requests |

## Logging Configuration

### Log Levels

| Level | Development | Production | Description |
|-------|-------------|------------|-------------|
| `debug` | ✅ | ❌ | Detailed debugging information |
| `info` | ✅ | ❌ | General information |
| `warn` | ✅ | ✅ | Warning messages |
| `error` | ✅ | ✅ | Error messages |

### User Activity Logging

```env
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true
LOKI_HOST=http://loki:3100
```

**Logged Activities**:
- User profile updates
- Relationship changes
- GraphQL query performance
- Cache hit/miss rates
- Database query performance

## Environment File Example

### Development Configuration

```env
# =============================================================================
# USER SERVICE ENVIRONMENT CONFIGURATION
# =============================================================================

# Application Configuration
NODE_ENV=development
PORT=4003
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
DATABASE_URL_USER=postgresql://user_user:user_pass@postgres:5432/userdb
DATABASE_POOL_SIZE=10
DATABASE_IDLE_TIMEOUT=30
DATABASE_SSL=false

# Cache Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=user_
CACHE_TTL=300

# Security Configuration
JWT_SECRET=development-user-secret-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

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

### Production Configuration

```env
# =============================================================================
# USER SERVICE ENVIRONMENT CONFIGURATION - PRODUCTION
# =============================================================================

# Application Configuration
NODE_ENV=production
PORT=4003
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
DATABASE_URL_USER=${DATABASE_URL_USER}
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=60
DATABASE_SSL=true

# Cache Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_KEY_PREFIX=user_
CACHE_TTL=600

# Security Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# GraphQL Configuration
GRAPHQL_PLAYGROUND=false
GRAPHQL_DEBUG=false
GRAPHQL_INTROSPECTION=false
QUERY_COMPLEXITY_LIMIT=500
QUERY_DEPTH_LIMIT=8

# Kafka Configuration
KAFKA_BROKERS=${KAFKA_BROKERS}
KAFKA_CLIENT_ID=user-service
KAFKA_GROUP_ID=user-service-group

# Logging Configuration
LOG_LEVEL=warn
LOG_CONSOLE=false
LOG_KAFKA_ENABLED=true
LOKI_HOST=${LOKI_HOST}

# User Relationship Configuration
MAX_FRIENDS_PER_USER=1000
MAX_CONTACTS_PER_USER=5000
MAX_PENDING_REQUESTS=50
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify `DATABASE_URL_USER` format
   - Check database credentials and connectivity
   - Ensure PostgreSQL service is running

2. **Redis Connection Failed**
   - Verify `REDIS_HOST` and `REDIS_PORT`
   - Check Redis cluster status
   - Ensure Redis service is accessible

3. **GraphQL Performance Issues**
   - Check `QUERY_COMPLEXITY_LIMIT` and `QUERY_DEPTH_LIMIT`
   - Monitor query performance logs
   - Optimize complex queries

4. **Cache Issues**
   - Verify Redis connectivity
   - Check `CACHE_TTL` configuration
   - Monitor cache hit rates

### Performance Optimization

1. **Database Optimization**
   - Increase `DATABASE_POOL_SIZE` for high load
   - Enable `DATABASE_SSL` for production
   - Monitor connection usage

2. **Cache Optimization**
   - Adjust `CACHE_TTL` based on data volatility
   - Monitor cache hit/miss ratios
   - Implement cache warming strategies

3. **GraphQL Optimization**
   - Set appropriate complexity limits
   - Use DataLoader for N+1 query prevention
   - Implement query caching

## Related Documentation

- [Environment Variables Overview](../ENVIRONMENT_VARIABLES.md)
- [User Service Plan](../USER_SERVICE_PLAN.md)
- [GraphQL Implementation Guide](../GRAPHQL_IMPLEMENTATION.md)

---

**Last Updated**: January 2024  
**Version**: 1.0.0
