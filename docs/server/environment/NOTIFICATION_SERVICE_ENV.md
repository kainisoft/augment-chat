# Notification Service Environment Variables

## Overview

The Notification Service handles multi-channel notifications including email, SMS, and push notifications. This document details all environment variables required for the Notification Service configuration.

**Service Port**: 4005
**Environment File**: `docker/config/notification-service/notification-service.env`

## Required Variables

| Variable | Type | Description | Example | Validation |
|----------|------|-------------|---------|------------|
| `NODE_ENV` | string | Application environment | `development` | Must be: `development`, `production`, `test` |
| `PORT` | number | Service port number | `4005` | Range: 1000-65535 |
| `MONGODB_URI` | url | MongoDB connection URI | `mongodb://mongo:27017/notificationdb` | Must match MongoDB URI pattern |
| `JWT_SECRET` | string | JWT signing secret | `your-32-character-secret-key-here` | Minimum 32 characters |
| `REDIS_HOST` | string | Redis cluster host | `redis-cluster` | Required for queuing |
| `REDIS_PORT` | number | Redis cluster port | `7000` | Range: 1000-65535 |
| `KAFKA_BROKERS` | string | Kafka broker addresses | `kafka:9092` | Comma-separated broker list |
| `KAFKA_CLIENT_ID` | string | Kafka client identifier | `notification-service` | Unique client ID |
| `KAFKA_GROUP_ID` | string | Kafka consumer group | `notification-service-group` | Unique group ID |

## Optional Variables

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `HOST` | string | `0.0.0.0` | Host interface to bind | Valid IP address |
| `API_PREFIX` | string | `api` | Global API route prefix | String pattern |
| `JWT_ACCESS_TOKEN_EXPIRY` | number | `900` | Access token expiry (seconds) | Range: 300-3600 |
| `JWT_REFRESH_TOKEN_EXPIRY` | number | `604800` | Refresh token expiry (seconds) | Range: 86400-2592000 |
| `REDIS_KEY_PREFIX` | string | `notification_` | Redis key prefix | Must end with underscore |
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

**Example Configurations**:

**Development**:
```env
MONGODB_URI=mongodb://mongo:27017/notificationdb
```

**Production**:
```env
MONGODB_URI=${MONGODB_URI}
```

## Email Configuration

### SMTP Settings

| Variable | Type | Required | Description | Validation |
|----------|------|----------|-------------|------------|
| `EMAIL_ENABLED` | boolean | ❌ | Enable email notifications | `true` or `false` |
| `SMTP_HOST` | string | ✅* | SMTP server host | Valid hostname |
| `SMTP_PORT` | number | ✅* | SMTP server port | Range: 1-65535 |
| `SMTP_SECURE` | boolean | ❌ | Use SSL/TLS | `true` or `false` |
| `SMTP_USER` | string | ✅* | SMTP username | Valid email format |
| `SMTP_PASS` | string | ✅* | SMTP password | Minimum 8 characters |
| `EMAIL_FROM` | string | ✅* | Default sender email | Valid email format |
| `EMAIL_FROM_NAME` | string | ❌ | Default sender name | String |

*Required when `EMAIL_ENABLED=true`

### Email Templates

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `EMAIL_TEMPLATE_DIR` | string | `./templates/email` | Email template directory |
| `EMAIL_DEFAULT_LOCALE` | string | `en` | Default email locale |

**Example Configuration**:
```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=notifications@example.com
SMTP_PASS=your-app-password
EMAIL_FROM=notifications@example.com
EMAIL_FROM_NAME=Chat App Notifications
```

## SMS Configuration

### SMS Provider Settings

| Variable | Type | Required | Description | Validation |
|----------|------|----------|-------------|------------|
| `SMS_ENABLED` | boolean | ❌ | Enable SMS notifications | `true` or `false` |
| `SMS_PROVIDER` | string | ✅* | SMS provider | `twilio`, `aws-sns` |
| `SMS_API_KEY` | string | ✅* | SMS provider API key | Minimum 16 characters |
| `SMS_API_SECRET` | string | ✅* | SMS provider API secret | Minimum 16 characters |
| `SMS_FROM_NUMBER` | string | ✅* | SMS sender number | E.164 format |

*Required when `SMS_ENABLED=true`

### Twilio Configuration

```env
SMS_ENABLED=true
SMS_PROVIDER=twilio
SMS_API_KEY=your-twilio-account-sid
SMS_API_SECRET=your-twilio-auth-token
SMS_FROM_NUMBER=+1234567890
```

### AWS SNS Configuration

```env
SMS_ENABLED=true
SMS_PROVIDER=aws-sns
SMS_API_KEY=your-aws-access-key
SMS_API_SECRET=your-aws-secret-key
SMS_FROM_NUMBER=+1234567890
AWS_REGION=us-east-1
```

## Push Notification Configuration

### Firebase Configuration

| Variable | Type | Required | Description | Validation |
|----------|------|----------|-------------|------------|
| `PUSH_ENABLED` | boolean | ❌ | Enable push notifications | `true` or `false` |
| `FIREBASE_PROJECT_ID` | string | ✅* | Firebase project ID | String |
| `FIREBASE_PRIVATE_KEY` | string | ✅* | Firebase private key | Valid private key |
| `FIREBASE_CLIENT_EMAIL` | string | ✅* | Firebase client email | Valid email format |

*Required when `PUSH_ENABLED=true`

**Example Configuration**:
```env
PUSH_ENABLED=true
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
```

## Notification Processing Configuration

### Queue Settings

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `NOTIFICATION_BATCH_SIZE` | number | `100` | Batch processing size | Range: 1-1000 |
| `NOTIFICATION_BATCH_WAIT` | number | `5000` | Batch wait time (ms) | Range: 1000-60000 |
| `NOTIFICATION_RETRY_ATTEMPTS` | number | `3` | Retry attempts for failed notifications | Range: 0-10 |
| `NOTIFICATION_RETRY_DELAY` | number | `30000` | Retry delay (ms) | Range: 1000-300000 |

### Rate Limiting

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `RATE_LIMIT_PER_USER` | number | `100` | Notifications per user per hour | Range: 1-1000 |
| `RATE_LIMIT_WINDOW` | number | `3600` | Rate limit window (seconds) | Range: 60-86400 |
| `RATE_LIMIT_EMAIL` | number | `50` | Email notifications per hour | Range: 1-500 |
| `RATE_LIMIT_SMS` | number | `10` | SMS notifications per hour | Range: 1-100 |
| `RATE_LIMIT_PUSH` | number | `200` | Push notifications per hour | Range: 1-1000 |

## Notification Types Configuration

### Notification Categories

| Category | Description | Default Enabled | Rate Limit |
|----------|-------------|-----------------|------------|
| `CHAT_MESSAGE` | New chat messages | ✅ | 50/hour |
| `FRIEND_REQUEST` | Friend requests | ✅ | 10/hour |
| `SYSTEM_ALERT` | System notifications | ✅ | 5/hour |
| `MARKETING` | Marketing messages | ❌ | 2/day |
| `SECURITY` | Security alerts | ✅ | No limit |

### Channel Preferences

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DEFAULT_EMAIL_ENABLED` | boolean | `true` | Default email preference |
| `DEFAULT_SMS_ENABLED` | boolean | `false` | Default SMS preference |
| `DEFAULT_PUSH_ENABLED` | boolean | `true` | Default push preference |

## Kafka Configuration

### Event Consumption

The Notification Service consumes events from other services.

```env
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=notification-service
KAFKA_GROUP_ID=notification-service-group
```

**Consumed Events**:
- `chat.message.sent` (for chat notifications)
- `user.relationship.added` (for friend request notifications)
- `auth.user.login` (for security notifications)
- `system.alert.created` (for system notifications)

### Event Publishing

**Published Events**:
- `notification.sent`
- `notification.delivered`
- `notification.failed`
- `notification.clicked`

## Environment File Example

### Development Configuration

```env
# =============================================================================
# NOTIFICATION SERVICE ENVIRONMENT CONFIGURATION
# =============================================================================

# Application Configuration
NODE_ENV=development
PORT=4004
HOST=0.0.0.0
API_PREFIX=api

# Database Configuration
MONGODB_URI=mongodb://mongo:27017/notificationdb
MONGODB_POOL_SIZE=10
MONGODB_TIMEOUT=30000

# Cache Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=notification_

# Security Configuration
JWT_SECRET=development-notification-secret-32-chars
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Email Configuration
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=dev-notifications@example.com
SMTP_PASS=your-app-password
EMAIL_FROM=dev-notifications@example.com
EMAIL_FROM_NAME=Chat App Dev Notifications

# SMS Configuration
SMS_ENABLED=false
SMS_PROVIDER=twilio
SMS_API_KEY=your-twilio-sid
SMS_API_SECRET=your-twilio-token
SMS_FROM_NUMBER=+1234567890

# Push Notification Configuration
PUSH_ENABLED=true
FIREBASE_PROJECT_ID=your-dev-firebase-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-dev-project.iam.gserviceaccount.com

# Processing Configuration
NOTIFICATION_BATCH_SIZE=50
NOTIFICATION_BATCH_WAIT=5000
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=30000

# Rate Limiting
RATE_LIMIT_PER_USER=100
RATE_LIMIT_WINDOW=3600
RATE_LIMIT_EMAIL=50
RATE_LIMIT_SMS=10
RATE_LIMIT_PUSH=200

# Default Preferences
DEFAULT_EMAIL_ENABLED=true
DEFAULT_SMS_ENABLED=false
DEFAULT_PUSH_ENABLED=true

# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=notification-service
KAFKA_GROUP_ID=notification-service-group

# Logging Configuration
LOG_LEVEL=debug
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true
LOKI_HOST=http://loki:3100
```

### Production Configuration

```env
# =============================================================================
# NOTIFICATION SERVICE ENVIRONMENT CONFIGURATION - PRODUCTION
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

# Cache Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_KEY_PREFIX=notification_

# Security Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Email Configuration
EMAIL_ENABLED=true
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_SECURE=true
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EMAIL_FROM=${EMAIL_FROM}
EMAIL_FROM_NAME=${EMAIL_FROM_NAME}

# SMS Configuration
SMS_ENABLED=true
SMS_PROVIDER=${SMS_PROVIDER}
SMS_API_KEY=${SMS_API_KEY}
SMS_API_SECRET=${SMS_API_SECRET}
SMS_FROM_NUMBER=${SMS_FROM_NUMBER}

# Push Notification Configuration
PUSH_ENABLED=true
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}

# Processing Configuration
NOTIFICATION_BATCH_SIZE=200
NOTIFICATION_BATCH_WAIT=2000
NOTIFICATION_RETRY_ATTEMPTS=5
NOTIFICATION_RETRY_DELAY=60000

# Rate Limiting
RATE_LIMIT_PER_USER=50
RATE_LIMIT_WINDOW=3600
RATE_LIMIT_EMAIL=25
RATE_LIMIT_SMS=5
RATE_LIMIT_PUSH=100

# Default Preferences
DEFAULT_EMAIL_ENABLED=true
DEFAULT_SMS_ENABLED=false
DEFAULT_PUSH_ENABLED=true

# Kafka Configuration
KAFKA_BROKERS=${KAFKA_BROKERS}
KAFKA_CLIENT_ID=notification-service
KAFKA_GROUP_ID=notification-service-group

# Logging Configuration
LOG_LEVEL=warn
LOG_CONSOLE=false
LOG_KAFKA_ENABLED=true
LOKI_HOST=${LOKI_HOST}
```

## Troubleshooting

### Common Issues

1. **Email Delivery Failed**
   - Verify SMTP credentials and settings
   - Check email provider rate limits
   - Ensure proper authentication (app passwords)

2. **SMS Delivery Failed**
   - Verify SMS provider credentials
   - Check phone number format (E.164)
   - Ensure sufficient account balance

3. **Push Notification Failed**
   - Verify Firebase configuration
   - Check device token validity
   - Ensure proper Firebase permissions

4. **High Processing Latency**
   - Adjust batch size and wait times
   - Monitor Redis queue status
   - Check MongoDB performance

### Performance Optimization

1. **Batch Processing**
   - Increase `NOTIFICATION_BATCH_SIZE` for high volume
   - Reduce `NOTIFICATION_BATCH_WAIT` for low latency
   - Monitor queue depth

2. **Rate Limiting**
   - Adjust per-channel rate limits
   - Implement priority queues
   - Use exponential backoff for retries

## Related Documentation

- [Environment Variables Overview](../ENVIRONMENT_VARIABLES.md)
- [Notification Service Plan](../NOTIFICATION_SERVICE_PLAN.md)
- [Multi-Channel Notification Guide](../NOTIFICATION_IMPLEMENTATION.md)

---

**Last Updated**: January 2024  
**Version**: 1.0.0
