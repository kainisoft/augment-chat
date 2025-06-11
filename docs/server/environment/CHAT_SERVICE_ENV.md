# Chat Service Environment Variables

## Overview

The Chat Service manages real-time messaging, chat rooms, and message history. This document details all environment variables required for the Chat Service configuration.

**Service Port**: 4004
**Environment File**: `docker/config/chat-service/chat-service.env`

## Required Variables

| Variable | Type | Description | Example | Validation |
|----------|------|-------------|---------|------------|
| `NODE_ENV` | string | Application environment | `development` | Must be: `development`, `production`, `test` |
| `PORT` | number | Service port number | `4004` | Range: 1000-65535 |
| `MONGODB_URI` | url | MongoDB connection URI | `mongodb://mongo:27017/chatdb` | Must match MongoDB URI pattern |
| `JWT_SECRET` | string | JWT signing secret | `your-32-character-secret-key-here` | Minimum 32 characters |
| `REDIS_HOST` | string | Redis cluster host | `redis-cluster` | Required for real-time features |
| `REDIS_PORT` | number | Redis cluster port | `7000` | Range: 1000-65535 |
| `KAFKA_BROKERS` | string | Kafka broker addresses | `kafka:9092` | Comma-separated broker list |
| `KAFKA_CLIENT_ID` | string | Kafka client identifier | `chat-service` | Unique client ID |
| `KAFKA_GROUP_ID` | string | Kafka consumer group | `chat-service-group` | Unique group ID |

## Optional Variables

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `HOST` | string | `0.0.0.0` | Host interface to bind | Valid IP address |
| `API_PREFIX` | string | `api` | Global API route prefix | String pattern |
| `JWT_ACCESS_TOKEN_EXPIRY` | number | `900` | Access token expiry (seconds) | Range: 300-3600 |
| `JWT_REFRESH_TOKEN_EXPIRY` | number | `604800` | Refresh token expiry (seconds) | Range: 86400-2592000 |
| `REDIS_KEY_PREFIX` | string | `chat_` | Redis key prefix | Must end with underscore |
| `LOG_LEVEL` | string | `info` | Logging level | `debug`, `info`, `warn`, `error` |
| `LOG_CONSOLE` | boolean | `true` | Enable console logging | `true` or `false` |
| `LOG_KAFKA_ENABLED` | boolean | `true` | Enable Kafka logging | `true` or `false` |
| `LOKI_HOST` | string | - | Loki server URL | Valid URL format |

## MongoDB Configuration

### Connection Settings

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `MONGODB_URI` | url | - | MongoDB connection string | Must start with `mongodb://` |
| `MONGODB_POOL_SIZE` | number | `10` | Connection pool size | Range: 1-50 |
| `MONGODB_TIMEOUT` | number | `30000` | Connection timeout (ms) | Range: 1000-60000 |
| `MONGODB_RETRY_WRITES` | boolean | `true` | Enable retry writes | `true` or `false` |

**Example Configurations**:

**Development**:
```env
MONGODB_URI=mongodb://mongo:27017/chatdb
MONGODB_POOL_SIZE=10
MONGODB_TIMEOUT=30000
```

**Production**:
```env
MONGODB_URI=${MONGODB_URI}
MONGODB_POOL_SIZE=25
MONGODB_TIMEOUT=10000
```

## WebSocket Configuration

### Real-time Communication

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `WEBSOCKET_PORT` | number | `4004` | WebSocket server port | Range: 1000-65535 |
| `WEBSOCKET_PATH` | string | `/socket.io` | WebSocket endpoint path | Must start with `/` |
| `WEBSOCKET_CORS_ORIGIN` | string | `*` | CORS allowed origins | Valid origin pattern |
| `WEBSOCKET_PING_TIMEOUT` | number | `60000` | Ping timeout (ms) | Range: 10000-300000 |
| `WEBSOCKET_PING_INTERVAL` | number | `25000` | Ping interval (ms) | Range: 5000-120000 |

### Connection Limits

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MAX_CONNECTIONS_PER_USER` | number | `5` | Maximum connections per user |
| `MAX_ROOMS_PER_USER` | number | `100` | Maximum rooms per user |
| `CONNECTION_TIMEOUT` | number | `300000` | Connection timeout (ms) |

## Message Configuration

### Message Limits

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `MAX_MESSAGE_LENGTH` | number | `10000` | Maximum message length | Range: 1000-50000 |
| `MAX_MESSAGES_PER_ROOM` | number | `10000` | Maximum messages per room | Range: 1000-100000 |
| `MESSAGE_HISTORY_LIMIT` | number | `100` | Default message history limit | Range: 10-1000 |
| `MESSAGE_BATCH_SIZE` | number | `50` | Message batch processing size | Range: 10-200 |

### Message Types

| Type | Description | Max Length | Validation |
|------|-------------|------------|------------|
| `text` | Plain text message | 10000 chars | Required content |
| `image` | Image message | - | Valid image URL |
| `file` | File attachment | - | Valid file URL |
| `system` | System message | 1000 chars | System generated |

## GraphQL Configuration

### Subscription Settings

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `GRAPHQL_PLAYGROUND` | boolean | `true` | Enable GraphQL Playground | `true` or `false` |
| `GRAPHQL_DEBUG` | boolean | `true` | Enable GraphQL debug mode | `true` or `false` |
| `GRAPHQL_INTROSPECTION` | boolean | `true` | Enable GraphQL introspection | `true` or `false` |
| `GRAPHQL_SUBSCRIPTIONS` | boolean | `true` | Enable GraphQL subscriptions | `true` or `false` |
| `QUERY_COMPLEXITY_LIMIT` | number | `1000` | Maximum query complexity | Range: 100-10000 |
| `QUERY_DEPTH_LIMIT` | number | `10` | Maximum query depth | Range: 5-20 |

### Real-time Features

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `TYPING_INDICATOR_TIMEOUT` | number | `3000` | Typing indicator timeout (ms) |
| `PRESENCE_UPDATE_INTERVAL` | number | `30000` | User presence update interval (ms) |
| `MESSAGE_DELIVERY_TIMEOUT` | number | `10000` | Message delivery timeout (ms) |

## Cache Configuration

### Redis Configuration

The Chat Service uses Redis for real-time features and caching.

```env
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=chat_
```

**Cache Patterns**:
- Active Rooms: `chat_room:{roomId}`
- User Presence: `chat_presence:{userId}`
- Typing Indicators: `chat_typing:{roomId}`
- Message Cache: `chat_messages:{roomId}`
- Room Members: `chat_members:{roomId}`

### Cache TTL Settings

| Data Type | TTL | Purpose |
|-----------|-----|---------|
| User Presence | 60s | Real-time status |
| Typing Indicators | 5s | Typing status |
| Room Members | 300s | Member list cache |
| Message Cache | 3600s | Recent messages |

## Kafka Configuration

### Event Publishing

The Chat Service publishes chat-related events to Kafka.

```env
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=chat-service
KAFKA_GROUP_ID=chat-service-group
```

**Published Events**:
- `chat.message.sent`
- `chat.message.delivered`
- `chat.message.read`
- `chat.room.created`
- `chat.room.joined`
- `chat.room.left`
- `chat.user.typing`
- `chat.user.presence.changed`

### Event Consumption

**Consumed Events**:
- `user.created` (for user initialization)
- `user.updated` (for user profile updates)
- `auth.user.authenticated` (for presence updates)

## Real-time Features Configuration

### WebSocket Events

| Event | Description | Rate Limit |
|-------|-------------|------------|
| `message` | Send message | 10/second |
| `typing` | Typing indicator | 1/second |
| `join_room` | Join chat room | 5/minute |
| `leave_room` | Leave chat room | 5/minute |
| `presence` | Update presence | 1/10 seconds |

### Rate Limiting

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RATE_LIMIT_MESSAGES` | number | `10` | Messages per second per user |
| `RATE_LIMIT_TYPING` | number | `1` | Typing events per second |
| `RATE_LIMIT_PRESENCE` | number | `6` | Presence updates per minute |

## Environment File Example

### Development Configuration

```env
# =============================================================================
# CHAT SERVICE ENVIRONMENT CONFIGURATION
# =============================================================================

# Application Configuration
NODE_ENV=development
PORT=4004
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
MONGODB_URI=mongodb://mongo:27017/chatdb
MONGODB_POOL_SIZE=10
MONGODB_TIMEOUT=30000
MONGODB_RETRY_WRITES=true

# Cache Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=chat_

# Security Configuration
JWT_SECRET=development-chat-secret-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# WebSocket Configuration
WEBSOCKET_PORT=4004
WEBSOCKET_PATH=/socket.io
WEBSOCKET_CORS_ORIGIN=*
WEBSOCKET_PING_TIMEOUT=60000
WEBSOCKET_PING_INTERVAL=25000

# Message Configuration
MAX_MESSAGE_LENGTH=10000
MAX_MESSAGES_PER_ROOM=10000
MESSAGE_HISTORY_LIMIT=100
MESSAGE_BATCH_SIZE=50

# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true
GRAPHQL_INTROSPECTION=true
GRAPHQL_SUBSCRIPTIONS=true
QUERY_COMPLEXITY_LIMIT=1000
QUERY_DEPTH_LIMIT=10

# Real-time Features
TYPING_INDICATOR_TIMEOUT=3000
PRESENCE_UPDATE_INTERVAL=30000
MESSAGE_DELIVERY_TIMEOUT=10000

# Rate Limiting
RATE_LIMIT_MESSAGES=10
RATE_LIMIT_TYPING=1
RATE_LIMIT_PRESENCE=6

# Connection Limits
MAX_CONNECTIONS_PER_USER=5
MAX_ROOMS_PER_USER=100
CONNECTION_TIMEOUT=300000

# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=chat-service
KAFKA_GROUP_ID=chat-service-group

# Logging Configuration
LOG_LEVEL=debug
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true
LOKI_HOST=http://loki:3100
```

### Production Configuration

```env
# =============================================================================
# CHAT SERVICE ENVIRONMENT CONFIGURATION - PRODUCTION
# =============================================================================

# Application Configuration
NODE_ENV=production
PORT=4004
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
MONGODB_URI=${MONGODB_URI}
MONGODB_POOL_SIZE=25
MONGODB_TIMEOUT=10000
MONGODB_RETRY_WRITES=true

# Cache Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_KEY_PREFIX=chat_

# Security Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# WebSocket Configuration
WEBSOCKET_PORT=4004
WEBSOCKET_PATH=/socket.io
WEBSOCKET_CORS_ORIGIN=${ALLOWED_ORIGINS}
WEBSOCKET_PING_TIMEOUT=60000
WEBSOCKET_PING_INTERVAL=25000

# Message Configuration
MAX_MESSAGE_LENGTH=5000
MAX_MESSAGES_PER_ROOM=50000
MESSAGE_HISTORY_LIMIT=50
MESSAGE_BATCH_SIZE=25

# GraphQL Configuration
GRAPHQL_PLAYGROUND=false
GRAPHQL_DEBUG=false
GRAPHQL_INTROSPECTION=false
GRAPHQL_SUBSCRIPTIONS=true
QUERY_COMPLEXITY_LIMIT=500
QUERY_DEPTH_LIMIT=8

# Real-time Features
TYPING_INDICATOR_TIMEOUT=3000
PRESENCE_UPDATE_INTERVAL=60000
MESSAGE_DELIVERY_TIMEOUT=5000

# Rate Limiting
RATE_LIMIT_MESSAGES=5
RATE_LIMIT_TYPING=1
RATE_LIMIT_PRESENCE=3

# Connection Limits
MAX_CONNECTIONS_PER_USER=3
MAX_ROOMS_PER_USER=50
CONNECTION_TIMEOUT=180000

# Kafka Configuration
KAFKA_BROKERS=${KAFKA_BROKERS}
KAFKA_CLIENT_ID=chat-service
KAFKA_GROUP_ID=chat-service-group

# Logging Configuration
LOG_LEVEL=warn
LOG_CONSOLE=false
LOG_KAFKA_ENABLED=true
LOKI_HOST=${LOKI_HOST}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify `MONGODB_URI` format
   - Check MongoDB service status
   - Ensure database credentials are correct

2. **WebSocket Connection Issues**
   - Check `WEBSOCKET_PORT` configuration
   - Verify CORS settings
   - Ensure Redis is accessible for session storage

3. **Message Delivery Problems**
   - Check Redis connectivity
   - Verify Kafka broker connectivity
   - Monitor message queue status

4. **Performance Issues**
   - Adjust `MONGODB_POOL_SIZE` for high load
   - Optimize `MESSAGE_BATCH_SIZE`
   - Monitor connection limits

### Performance Optimization

1. **Database Optimization**
   - Increase MongoDB pool size for high load
   - Implement message archiving
   - Use MongoDB indexes for queries

2. **Real-time Optimization**
   - Adjust WebSocket ping intervals
   - Optimize Redis key expiration
   - Implement connection pooling

## Related Documentation

- [Environment Variables Overview](../ENVIRONMENT_VARIABLES.md)
- [Chat Service Plan](../CHAT_SERVICE_PLAN.md)
- [WebSocket Implementation Guide](../WEBSOCKET_IMPLEMENTATION.md)

---

**Last Updated**: January 2024  
**Version**: 1.0.0
