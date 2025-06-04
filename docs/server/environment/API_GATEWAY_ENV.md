# API Gateway Environment Variables

## Overview

The API Gateway serves as the unified entry point for all client requests, implementing GraphQL Federation and routing to appropriate microservices. This document details all environment variables required for the API Gateway configuration.

**Service Port**: 4000  
**Environment File**: `docker/config/api-gateway/api-gateway.env`

## Required Variables

| Variable | Type | Description | Example | Validation |
|----------|------|-------------|---------|------------|
| `NODE_ENV` | string | Application environment | `development` | Must be: `development`, `production`, `test` |
| `PORT` | number | Service port number | `4000` | Range: 1000-65535 |
| `JWT_SECRET` | string | JWT signing secret | `your-32-character-secret-key-here` | Minimum 32 characters |
| `REDIS_HOST` | string | Redis cluster host | `redis-cluster` | Required for caching |
| `REDIS_PORT` | number | Redis cluster port | `7000` | Range: 1000-65535 |
| `KAFKA_BROKERS` | string | Kafka broker addresses | `kafka:9092` | Comma-separated broker list |
| `KAFKA_CLIENT_ID` | string | Kafka client identifier | `api-gateway` | Unique client ID |
| `KAFKA_GROUP_ID` | string | Kafka consumer group | `api-gateway-group` | Unique group ID |

## Service Endpoint Configuration

### Microservice URLs

| Variable | Type | Required | Description | Validation |
|----------|------|----------|-------------|------------|
| `USER_SERVICE_URL` | url | ✅ | User service GraphQL endpoint | Must match GraphQL URL pattern |
| `CHAT_SERVICE_URL` | url | ✅ | Chat service GraphQL endpoint | Must match GraphQL URL pattern |
| `NOTIFICATION_SERVICE_URL` | url | ✅ | Notification service GraphQL endpoint | Must match GraphQL URL pattern |
| `AUTH_SERVICE_URL` | url | ✅ | Auth service GraphQL endpoint | Must match GraphQL URL pattern |
| `LOGGING_SERVICE_URL` | url | ✅ | Logging service GraphQL endpoint | Must match GraphQL URL pattern |

**Example Configuration**:
```env
USER_SERVICE_URL=http://user-service:4002/api/graphql
CHAT_SERVICE_URL=http://chat-service:4003/api/graphql
NOTIFICATION_SERVICE_URL=http://notification-service:4004/api/graphql
AUTH_SERVICE_URL=http://auth-service:4001/api/graphql
LOGGING_SERVICE_URL=http://logging-service:4005/api/graphql
```

## Optional Variables

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `HOST` | string | `0.0.0.0` | Host interface to bind | Valid IP address |
| `API_PREFIX` | string | `api` | Global API route prefix | String pattern |
| `JWT_ACCESS_TOKEN_EXPIRY` | number | `900` | Access token expiry (seconds) | Range: 300-3600 |
| `JWT_REFRESH_TOKEN_EXPIRY` | number | `604800` | Refresh token expiry (seconds) | Range: 86400-2592000 |
| `REDIS_KEY_PREFIX` | string | `gateway_` | Redis key prefix | Must end with underscore |
| `LOG_LEVEL` | string | `info` | Logging level | `debug`, `info`, `warn`, `error` |
| `LOG_CONSOLE` | boolean | `true` | Enable console logging | `true` or `false` |
| `LOG_KAFKA_ENABLED` | boolean | `true` | Enable Kafka logging | `true` or `false` |
| `LOKI_HOST` | string | - | Loki server URL | Valid URL format |

## GraphQL Federation Configuration

### Apollo Federation Settings

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `GRAPHQL_PLAYGROUND` | boolean | `true` | Enable GraphQL Playground | `true` or `false` |
| `GRAPHQL_DEBUG` | boolean | `true` | Enable GraphQL debug mode | `true` or `false` |
| `GRAPHQL_INTROSPECTION` | boolean | `true` | Enable GraphQL introspection | `true` or `false` |
| `FEDERATION_POLLING_INTERVAL` | number | `30000` | Schema polling interval (ms) | Range: 5000-300000 |
| `FEDERATION_TIMEOUT` | number | `10000` | Federation request timeout (ms) | Range: 1000-60000 |

### Query Performance Settings

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `QUERY_COMPLEXITY_LIMIT` | number | `2000` | Maximum query complexity | Range: 500-5000 |
| `QUERY_DEPTH_LIMIT` | number | `15` | Maximum query depth | Range: 10-25 |
| `QUERY_TIMEOUT` | number | `30000` | Query execution timeout (ms) | Range: 5000-120000 |
| `QUERY_CACHE_TTL` | number | `300` | Query cache TTL (seconds) | Range: 60-3600 |

**Performance Rationale**:
- Higher limits than individual services due to federation complexity
- Gateway handles multiple service coordination
- Caching reduces downstream service load

## Cache Configuration

### Redis Configuration

The API Gateway uses Redis for query caching and session management.

```env
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=gateway_
```

**Cache Patterns**:
- Query Cache: `gateway_query:{queryHash}`
- Schema Cache: `gateway_schema:{serviceName}`
- Rate Limit: `gateway_rate:{clientId}`
- Session Cache: `gateway_session:{sessionId}`

### Cache Strategies

| Cache Type | TTL | Strategy | Invalidation |
|------------|-----|----------|--------------|
| Query Results | 300s | Cache-aside | Time-based |
| Schema Definitions | 1800s | Write-through | On schema update |
| Rate Limiting | 3600s | Write-through | Time-based |
| User Sessions | 900s | Cache-aside | On logout |

## Rate Limiting Configuration

### Client Rate Limiting

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `RATE_LIMIT_ENABLED` | boolean | `true` | Enable rate limiting | `true` or `false` |
| `RATE_LIMIT_REQUESTS` | number | `1000` | Requests per window | Range: 100-10000 |
| `RATE_LIMIT_WINDOW` | number | `3600` | Rate limit window (seconds) | Range: 60-86400 |
| `RATE_LIMIT_SKIP_SUCCESSFUL` | boolean | `false` | Skip successful requests | `true` or `false` |

### Per-Operation Limits

| Operation Type | Requests/Hour | Complexity Limit |
|----------------|---------------|------------------|
| Query | 1000 | 2000 |
| Mutation | 500 | 1500 |
| Subscription | 100 | 1000 |
| Introspection | 50 | 500 |

## Security Configuration

### CORS Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CORS_ENABLED` | boolean | `true` | Enable CORS |
| `CORS_ORIGIN` | string | `*` | Allowed origins |
| `CORS_METHODS` | string | `GET,POST,OPTIONS` | Allowed methods |
| `CORS_HEADERS` | string | `Content-Type,Authorization` | Allowed headers |

### Authentication Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `AUTH_REQUIRED` | boolean | `true` | Require authentication |
| `AUTH_SKIP_INTROSPECTION` | boolean | `true` | Skip auth for introspection |
| `AUTH_SKIP_PLAYGROUND` | boolean | `true` | Skip auth for playground |

## Monitoring Configuration

### Health Check Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `HEALTH_CHECK_TIMEOUT` | number | `5000` | Health check timeout (ms) |
| `HEALTH_CHECK_INTERVAL` | number | `30000` | Health check interval (ms) |
| `SERVICE_HEALTH_TIMEOUT` | number | `3000` | Service health check timeout |

### Metrics Collection

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `METRICS_ENABLED` | boolean | `true` | Enable metrics collection |
| `METRICS_PATH` | string | `/metrics` | Metrics endpoint path |
| `METRICS_INTERVAL` | number | `15000` | Metrics collection interval |

## Environment File Example

### Development Configuration

```env
# =============================================================================
# API GATEWAY ENVIRONMENT CONFIGURATION
# =============================================================================

# Application Configuration
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
API_PREFIX=api

# Service Endpoints
USER_SERVICE_URL=http://user-service:4002/api/graphql
CHAT_SERVICE_URL=http://chat-service:4003/api/graphql
NOTIFICATION_SERVICE_URL=http://notification-service:4004/api/graphql
AUTH_SERVICE_URL=http://auth-service:4001/api/graphql
LOGGING_SERVICE_URL=http://logging-service:4005/api/graphql

# Cache Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=gateway_

# Security Configuration
JWT_SECRET=development-gateway-secret-32-characters
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# GraphQL Federation Configuration
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true
GRAPHQL_INTROSPECTION=true
FEDERATION_POLLING_INTERVAL=30000
FEDERATION_TIMEOUT=10000

# Query Performance
QUERY_COMPLEXITY_LIMIT=2000
QUERY_DEPTH_LIMIT=15
QUERY_TIMEOUT=30000
QUERY_CACHE_TTL=300

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=3600
RATE_LIMIT_SKIP_SUCCESSFUL=false

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=*
CORS_METHODS=GET,POST,OPTIONS
CORS_HEADERS=Content-Type,Authorization

# Authentication
AUTH_REQUIRED=false
AUTH_SKIP_INTROSPECTION=true
AUTH_SKIP_PLAYGROUND=true

# Health Check Configuration
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000
SERVICE_HEALTH_TIMEOUT=3000

# Metrics
METRICS_ENABLED=true
METRICS_PATH=/metrics
METRICS_INTERVAL=15000

# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=api-gateway
KAFKA_GROUP_ID=api-gateway-group

# Logging Configuration
LOG_LEVEL=debug
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true
LOKI_HOST=http://loki:3100
```

### Production Configuration

```env
# =============================================================================
# API GATEWAY ENVIRONMENT CONFIGURATION - PRODUCTION
# =============================================================================

# Application Configuration
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

# Cache Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_KEY_PREFIX=gateway_

# Security Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

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

# Health Check Configuration
HEALTH_CHECK_TIMEOUT=3000
HEALTH_CHECK_INTERVAL=15000
SERVICE_HEALTH_TIMEOUT=2000

# Metrics
METRICS_ENABLED=true
METRICS_PATH=/metrics
METRICS_INTERVAL=10000

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

## Troubleshooting

### Common Issues

1. **Service Federation Failed**
   - Verify all service URLs are accessible
   - Check service health endpoints
   - Ensure GraphQL schemas are compatible

2. **High Query Latency**
   - Check `QUERY_TIMEOUT` settings
   - Monitor downstream service performance
   - Verify Redis cache connectivity

3. **Rate Limiting Issues**
   - Adjust rate limit settings
   - Check Redis connectivity for rate limit storage
   - Monitor client request patterns

4. **CORS Errors**
   - Verify `CORS_ORIGIN` settings
   - Check allowed methods and headers
   - Ensure proper preflight handling

### Performance Optimization

1. **Query Optimization**
   - Implement query complexity analysis
   - Use query caching effectively
   - Optimize federation query planning

2. **Cache Optimization**
   - Tune cache TTL values
   - Implement cache warming
   - Monitor cache hit rates

3. **Federation Optimization**
   - Reduce polling intervals in production
   - Implement schema caching
   - Use connection pooling

## Related Documentation

- [Environment Variables Overview](../ENVIRONMENT_VARIABLES.md)
- [API Gateway Plan](../API_GATEWAY_PLAN.md)
- [GraphQL Federation Guide](../GRAPHQL_FEDERATION.md)

---

**Last Updated**: January 2024  
**Version**: 1.0.0
