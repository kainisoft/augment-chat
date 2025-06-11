# Logging Service Environment Variables

## Overview

The Logging Service provides centralized log aggregation, processing, and storage with a GUI dashboard. This document details all environment variables required for the Logging Service configuration.

**Service Port**: 4006
**Environment File**: `docker/config/logging-service/logging-service.env`

## Required Variables

| Variable | Type | Description | Example | Validation |
|----------|------|-------------|---------|------------|
| `NODE_ENV` | string | Application environment | `development` | Must be: `development`, `production`, `test` |
| `PORT` | number | Service port number | `4006` | Range: 1000-65535 |
| `JWT_SECRET` | string | JWT signing secret | `your-32-character-secret-key-here` | Minimum 32 characters |
| `REDIS_HOST` | string | Redis cluster host | `redis-cluster` | Required for caching |
| `REDIS_PORT` | number | Redis cluster port | `7000` | Range: 1000-65535 |
| `KAFKA_BROKERS` | string | Kafka broker addresses | `kafka:9092` | Comma-separated broker list |
| `KAFKA_CLIENT_ID` | string | Kafka client identifier | `logging-service` | Unique client ID |
| `KAFKA_GROUP_ID` | string | Kafka consumer group | `logging-service-group` | Unique group ID |
| `LOKI_HOST` | string | Loki server URL | `http://loki:3100` | Valid URL format |

## Optional Variables

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `HOST` | string | `0.0.0.0` | Host interface to bind | Valid IP address |
| `API_PREFIX` | string | `api` | Global API route prefix | String pattern |
| `JWT_ACCESS_TOKEN_EXPIRY` | number | `900` | Access token expiry (seconds) | Range: 300-3600 |
| `JWT_REFRESH_TOKEN_EXPIRY` | number | `604800` | Refresh token expiry (seconds) | Range: 86400-2592000 |
| `REDIS_KEY_PREFIX` | string | `logging_` | Redis key prefix | Must end with underscore |
| `LOG_LEVEL` | string | `info` | Logging level | `debug`, `info`, `warn`, `error` |
| `LOG_CONSOLE` | boolean | `true` | Enable console logging | `true` or `false` |
| `LOG_KAFKA_ENABLED` | boolean | `true` | Enable Kafka logging | `true` or `false` |

## Loki Configuration

### Connection Settings

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `LOKI_HOST` | string | - | Loki server URL | Valid URL format |
| `LOKI_USERNAME` | string | - | Loki basic auth username | String |
| `LOKI_PASSWORD` | string | - | Loki basic auth password | String |
| `LOKI_TIMEOUT` | number | `10000` | Loki request timeout (ms) | Range: 1000-60000 |

### Batch Processing

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `LOKI_BATCH_SIZE` | number | `100` | Log batch size | Range: 1-1000 |
| `LOKI_BATCH_WAIT` | number | `5000` | Batch wait time (ms) | Range: 100-10000 |
| `LOKI_MAX_RETRIES` | number | `3` | Maximum retry attempts | Range: 0-10 |
| `LOKI_RETRY_DELAY` | number | `1000` | Retry delay (ms) | Range: 100-10000 |

**Example Configuration**:
```env
LOKI_HOST=http://loki:3100
LOKI_BATCH_SIZE=100
LOKI_BATCH_WAIT=5000
LOKI_MAX_RETRIES=3
LOKI_RETRY_DELAY=1000
```

## Log Retention Configuration

### Retention Policies

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `LOG_RETENTION_DAYS` | number | `90` | Log retention period (days) | Range: 1-365 |
| `LOG_CLEANUP_ENABLED` | boolean | `true` | Enable automatic log cleanup | `true` or `false` |
| `LOG_CLEANUP_INTERVAL` | number | `86400` | Cleanup interval (seconds) | Range: 3600-604800 |
| `LOG_ARCHIVE_ENABLED` | boolean | `false` | Enable log archiving | `true` or `false` |
| `LOG_ARCHIVE_PATH` | string | `/logs/archive` | Archive storage path | Valid path |

### Storage Management

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOG_MAX_SIZE_MB` | number | `1000` | Maximum log size (MB) |
| `LOG_COMPRESSION_ENABLED` | boolean | `true` | Enable log compression |
| `LOG_COMPRESSION_LEVEL` | number | `6` | Compression level (1-9) |

## Kafka Consumer Configuration

### Consumer Settings

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `KAFKA_BROKERS` | string | - | Kafka broker addresses | Comma-separated list |
| `KAFKA_CLIENT_ID` | string | - | Kafka client identifier | Unique string |
| `KAFKA_GROUP_ID` | string | - | Kafka consumer group | Unique string |
| `KAFKA_AUTO_OFFSET_RESET` | string | `earliest` | Offset reset strategy | `earliest`, `latest` |
| `KAFKA_SESSION_TIMEOUT` | number | `30000` | Session timeout (ms) | Range: 6000-300000 |
| `KAFKA_HEARTBEAT_INTERVAL` | number | `3000` | Heartbeat interval (ms) | Range: 1000-30000 |

### Topic Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `KAFKA_LOG_TOPIC` | string | `application-logs` | Main log topic |
| `KAFKA_ERROR_TOPIC` | string | `error-logs` | Error log topic |
| `KAFKA_AUDIT_TOPIC` | string | `audit-logs` | Audit log topic |
| `KAFKA_METRICS_TOPIC` | string | `metrics-logs` | Metrics log topic |

**Consumed Topics**:
- `application-logs`: General application logs from all services
- `error-logs`: Error logs requiring immediate attention
- `audit-logs`: Security and audit events
- `metrics-logs`: Performance and metrics data

## Dashboard Configuration

### Web Interface Settings

| Variable | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `DASHBOARD_ENABLED` | boolean | `true` | Enable web dashboard | `true` or `false` |
| `DASHBOARD_PORT` | number | `4005` | Dashboard port | Range: 1000-65535 |
| `DASHBOARD_PATH` | string | `/dashboard` | Dashboard base path | Valid path |
| `DASHBOARD_AUTH_REQUIRED` | boolean | `true` | Require authentication | `true` or `false` |

### Search and Filtering

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SEARCH_MAX_RESULTS` | number | `1000` | Maximum search results |
| `SEARCH_TIMEOUT` | number | `30000` | Search timeout (ms) |
| `FILTER_CACHE_TTL` | number | `300` | Filter cache TTL (seconds) |

## Log Processing Configuration

### Log Parsing

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOG_PARSER_ENABLED` | boolean | `true` | Enable log parsing |
| `LOG_PARSER_FORMAT` | string | `json` | Log format (`json`, `text`) |
| `LOG_ENRICHMENT_ENABLED` | boolean | `true` | Enable log enrichment |
| `LOG_ANONYMIZATION_ENABLED` | boolean | `false` | Enable PII anonymization |

### Performance Monitoring

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PERFORMANCE_LOGGING_ENABLED` | boolean | `true` | Enable performance logging |
| `SLOW_QUERY_THRESHOLD` | number | `1000` | Slow query threshold (ms) |
| `REQUEST_LOGGING_ENABLED` | boolean | `true` | Enable request logging |
| `REQUEST_BODY_LOGGING` | boolean | `false` | Log request bodies |

## Alert Configuration

### Alert Rules

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ALERTS_ENABLED` | boolean | `true` | Enable alerting |
| `ERROR_RATE_THRESHOLD` | number | `10` | Error rate threshold (%) |
| `RESPONSE_TIME_THRESHOLD` | number | `5000` | Response time threshold (ms) |
| `DISK_USAGE_THRESHOLD` | number | `80` | Disk usage threshold (%) |

### Notification Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ALERT_WEBHOOK_URL` | string | - | Webhook URL for alerts |
| `ALERT_EMAIL_ENABLED` | boolean | `false` | Enable email alerts |
| `ALERT_COOLDOWN_MINUTES` | number | `15` | Alert cooldown period |

## Environment File Example

### Development Configuration

```env
# =============================================================================
# LOGGING SERVICE ENVIRONMENT CONFIGURATION
# =============================================================================

# Application Configuration
NODE_ENV=development
PORT=4006
HOST=0.0.0.0
API_PREFIX=api

# Cache Configuration
REDIS_HOST=redis-cluster
REDIS_PORT=7000
REDIS_KEY_PREFIX=logging_

# Security Configuration
JWT_SECRET=development-logging-secret-32-characters
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Loki Configuration
LOKI_HOST=http://loki:3100
LOKI_BATCH_SIZE=50
LOKI_BATCH_WAIT=5000
LOKI_MAX_RETRIES=3
LOKI_RETRY_DELAY=1000

# Log Retention
LOG_RETENTION_DAYS=30
LOG_CLEANUP_ENABLED=true
LOG_CLEANUP_INTERVAL=86400
LOG_ARCHIVE_ENABLED=false
LOG_MAX_SIZE_MB=500
LOG_COMPRESSION_ENABLED=true
LOG_COMPRESSION_LEVEL=6

# Kafka Consumer Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=logging-service
KAFKA_GROUP_ID=logging-service-group
KAFKA_AUTO_OFFSET_RESET=earliest
KAFKA_SESSION_TIMEOUT=30000
KAFKA_HEARTBEAT_INTERVAL=3000

# Kafka Topics
KAFKA_LOG_TOPIC=application-logs
KAFKA_ERROR_TOPIC=error-logs
KAFKA_AUDIT_TOPIC=audit-logs
KAFKA_METRICS_TOPIC=metrics-logs

# Dashboard Configuration
DASHBOARD_ENABLED=true
DASHBOARD_PORT=4006
DASHBOARD_PATH=/dashboard
DASHBOARD_AUTH_REQUIRED=false

# Search Configuration
SEARCH_MAX_RESULTS=1000
SEARCH_TIMEOUT=30000
FILTER_CACHE_TTL=300

# Log Processing
LOG_PARSER_ENABLED=true
LOG_PARSER_FORMAT=json
LOG_ENRICHMENT_ENABLED=true
LOG_ANONYMIZATION_ENABLED=false

# Performance Monitoring
PERFORMANCE_LOGGING_ENABLED=true
SLOW_QUERY_THRESHOLD=1000
REQUEST_LOGGING_ENABLED=true
REQUEST_BODY_LOGGING=false

# Alerts
ALERTS_ENABLED=true
ERROR_RATE_THRESHOLD=10
RESPONSE_TIME_THRESHOLD=5000
DISK_USAGE_THRESHOLD=80
ALERT_EMAIL_ENABLED=false
ALERT_COOLDOWN_MINUTES=15

# Logging Configuration
LOG_LEVEL=debug
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=false
```

### Production Configuration

```env
# =============================================================================
# LOGGING SERVICE ENVIRONMENT CONFIGURATION - PRODUCTION
# =============================================================================

# Application Configuration
NODE_ENV=production
PORT=4006
HOST=0.0.0.0
API_PREFIX=api

# Cache Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_KEY_PREFIX=logging_

# Security Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Loki Configuration
LOKI_HOST=${LOKI_HOST}
LOKI_USERNAME=${LOKI_USERNAME}
LOKI_PASSWORD=${LOKI_PASSWORD}
LOKI_BATCH_SIZE=200
LOKI_BATCH_WAIT=2000
LOKI_MAX_RETRIES=5
LOKI_RETRY_DELAY=2000

# Log Retention
LOG_RETENTION_DAYS=90
LOG_CLEANUP_ENABLED=true
LOG_CLEANUP_INTERVAL=43200
LOG_ARCHIVE_ENABLED=true
LOG_ARCHIVE_PATH=${LOG_ARCHIVE_PATH}
LOG_MAX_SIZE_MB=2000
LOG_COMPRESSION_ENABLED=true
LOG_COMPRESSION_LEVEL=9

# Kafka Consumer Configuration
KAFKA_BROKERS=${KAFKA_BROKERS}
KAFKA_CLIENT_ID=logging-service
KAFKA_GROUP_ID=logging-service-group
KAFKA_AUTO_OFFSET_RESET=latest
KAFKA_SESSION_TIMEOUT=30000
KAFKA_HEARTBEAT_INTERVAL=3000

# Kafka Topics
KAFKA_LOG_TOPIC=application-logs
KAFKA_ERROR_TOPIC=error-logs
KAFKA_AUDIT_TOPIC=audit-logs
KAFKA_METRICS_TOPIC=metrics-logs

# Dashboard Configuration
DASHBOARD_ENABLED=true
DASHBOARD_PORT=4006
DASHBOARD_PATH=/dashboard
DASHBOARD_AUTH_REQUIRED=true

# Search Configuration
SEARCH_MAX_RESULTS=500
SEARCH_TIMEOUT=15000
FILTER_CACHE_TTL=600

# Log Processing
LOG_PARSER_ENABLED=true
LOG_PARSER_FORMAT=json
LOG_ENRICHMENT_ENABLED=true
LOG_ANONYMIZATION_ENABLED=true

# Performance Monitoring
PERFORMANCE_LOGGING_ENABLED=true
SLOW_QUERY_THRESHOLD=500
REQUEST_LOGGING_ENABLED=true
REQUEST_BODY_LOGGING=false

# Alerts
ALERTS_ENABLED=true
ERROR_RATE_THRESHOLD=5
RESPONSE_TIME_THRESHOLD=2000
DISK_USAGE_THRESHOLD=70
ALERT_WEBHOOK_URL=${ALERT_WEBHOOK_URL}
ALERT_EMAIL_ENABLED=true
ALERT_COOLDOWN_MINUTES=30

# Logging Configuration
LOG_LEVEL=warn
LOG_CONSOLE=false
LOG_KAFKA_ENABLED=false
```

## Troubleshooting

### Common Issues

1. **Loki Connection Failed**
   - Verify `LOKI_HOST` URL and accessibility
   - Check authentication credentials
   - Ensure Loki service is running

2. **High Memory Usage**
   - Reduce `LOKI_BATCH_SIZE`
   - Increase `LOKI_BATCH_WAIT`
   - Enable log compression

3. **Kafka Consumer Lag**
   - Increase consumer instances
   - Optimize batch processing
   - Check Kafka broker health

4. **Dashboard Performance Issues**
   - Reduce `SEARCH_MAX_RESULTS`
   - Increase `FILTER_CACHE_TTL`
   - Optimize search queries

### Performance Optimization

1. **Batch Processing**
   - Tune batch size and wait times
   - Monitor processing latency
   - Implement backpressure handling

2. **Storage Optimization**
   - Enable compression
   - Implement log rotation
   - Use appropriate retention policies

3. **Search Optimization**
   - Implement result caching
   - Use indexed fields for filtering
   - Optimize query patterns

## Related Documentation

- [Environment Variables Overview](../ENVIRONMENT_VARIABLES.md)
- [Logging Service Plan](../LOGGING_SERVICE_PLAN.md)
- [Log Aggregation Guide](../LOG_AGGREGATION.md)

---

**Last Updated**: January 2024  
**Version**: 1.0.0
