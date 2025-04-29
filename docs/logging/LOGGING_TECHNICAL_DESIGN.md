# Logging System Technical Design

## Overview

This document provides the technical design details for implementing the centralized logging system with a dedicated microservice, Loki, and Grafana. It covers component specifications, data structures, API definitions, integration details, security considerations, monitoring, and scaling strategies for both development and production environments.

## Table of Contents

- [Overview](#overview)
- [1. Component Specifications](#1-component-specifications)
  - [1.1 Logging Microservice](#11-logging-microservice)
  - [1.2 Loki](#12-loki)
  - [1.3 Grafana](#13-grafana)
- [2. Data Structures](#2-data-structures)
  - [2.1 Log Message Format](#21-log-message-format)
  - [2.2 Kafka Message Format](#22-kafka-message-format)
  - [2.3 Loki Push API Format](#23-loki-push-api-format)
- [3. API Specifications](#3-api-specifications)
  - [3.1 Logging Microservice API](#31-logging-microservice-api)
  - [3.2 Common Logging Library API](#32-common-logging-library-api)
- [4. Integration Details](#4-integration-details)
  - [4.1 Kafka Topic Configuration](#41-kafka-topic-configuration)
  - [4.2 Docker Compose Configuration](#42-docker-compose-configuration)
  - [4.3 Loki Configuration](#43-loki-configuration)
- [5. Security Considerations](#5-security-considerations)
- [6. Monitoring and Alerting](#6-monitoring-and-alerting)
- [7. Scaling Considerations](#7-scaling-considerations)
- [Related Documents](#related-documents)

## 1. Component Specifications

### 1.1 Logging Microservice

**Technology Stack:**
- NestJS framework
- TypeScript
- Node.js
- Kafka client for consuming log messages
- HTTP client for Loki integration

**Key Components:**
- **LogConsumerService**: Consumes log messages from Kafka
- **LogProcessorService**: Processes and enriches log messages
- **LokiClientService**: Forwards logs to Loki
- **LogApiController**: Provides REST API for log management
- **LogQueryService**: Handles log querying and filtering

**Port**: 4005

### 1.2 Loki

**Version**: 2.9.0 (or latest stable)

**Configuration:**
- Chunk size: 512KB
- Retention period: 7 days (dev), 90 days (3 months) (prod)
- Index period: 24h
- Compression: gzip

**Resource Requirements:**
- Memory: 1GB (dev), 4GB+ (prod)
- Storage: 10GB (dev), 100GB+ (prod)
- CPU: 1 core (dev), 2+ cores (prod)

### 1.3 Grafana

**Version**: 10.2.0 (or latest stable)

**Plugins:**
- Loki data source
- Alert manager
- Dashboard tools
- Clock panel

**Default Dashboards:**
- System Overview
- Service-specific dashboards
- Log Explorer
- Error Tracking
- Performance Metrics

## 2. Data Structures

### 2.1 Log Message Format

```typescript
interface LogMessage {
  // Basic log information
  timestamp: string;          // ISO format date-time
  level: LogLevel;            // 'debug' | 'info' | 'warn' | 'error'
  message: string;            // The log message

  // Service information
  service: string;            // Service name (e.g., 'auth-service')
  context?: string;           // Class or component name

  // Request tracking
  requestId?: string;         // Unique request identifier
  correlationId?: string;     // For tracking across services

  // User context (when applicable)
  userId?: string;            // User identifier

  // Additional metadata
  metadata?: {
    // HTTP request details (when applicable)
    method?: string;          // HTTP method
    path?: string;            // Request path
    statusCode?: number;      // Response status code
    duration?: number;        // Request duration in ms

    // Error details (when applicable)
    errorCode?: string;       // Error code
    stack?: string;           // Error stack trace

    // Custom fields
    [key: string]: any;       // Any additional metadata
  };
}
```

### 2.2 Kafka Message Format

```typescript
interface KafkaLogMessage {
  key: string;                // Service name (for partitioning)
  value: string;              // JSON stringified LogMessage
  headers?: {                 // Optional Kafka headers
    timestamp: string;        // Message creation timestamp
    [key: string]: string;    // Additional headers
  };
}
```

### 2.3 Loki Push API Format

```typescript
interface LokiPushRequest {
  streams: Array<{
    stream: {                 // Labels for the log stream
      service: string;        // Service name
      level: string;          // Log level
      [key: string]: string;  // Additional labels
    };
    values: Array<[           // Log entries
      string,                 // Nanosecond timestamp
      string                  // Log content (JSON)
    ]>;
  }>;
}
```

## 3. API Specifications

### 3.1 Logging Microservice API

#### Health Check
```
GET /health
Response: 200 OK
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2023-07-15T12:34:56.789Z"
}
```

#### Query Logs
```
GET /api/logs
Query Parameters:
  - service: string (optional)
  - level: string (optional)
  - from: ISO date string (optional)
  - to: ISO date string (optional)
  - query: string (optional)
  - limit: number (optional, default: 100)

Response: 200 OK
{
  "logs": [
    {
      "timestamp": "2023-07-15T12:34:56.789Z",
      "level": "info",
      "message": "User login successful",
      "service": "auth-service",
      ...
    },
    ...
  ],
  "total": 1500,
  "limit": 100,
  "offset": 0
}
```

#### Set Log Level
```
POST /api/logs/level
Body:
{
  "service": "auth-service",
  "level": "debug"
}

Response: 200 OK
{
  "success": true,
  "message": "Log level updated"
}
```

### 3.2 Common Logging Library API

```typescript
// Main logging service
interface LoggingService {
  log(message: string, context?: string, metadata?: any): void;
  error(message: string, trace?: string, context?: string, metadata?: any): void;
  warn(message: string, context?: string, metadata?: any): void;
  debug(message: string, context?: string, metadata?: any): void;
  verbose(message: string, context?: string, metadata?: any): void;
  setContext(context: string): void;
  setRequestId(requestId: string): void;
  setUserId(userId: string): void;
}

// Configuration options
interface LoggingModuleOptions {
  service: string;
  level?: LogLevel;
  kafka?: {
    topic?: string;
    clientId?: string;
    brokers: string[];
  };
  console?: boolean;
  redactFields?: string[];
}
```

## 4. Integration Details

### 4.1 Kafka Topic Configuration

```yaml
topic: logs
partitions: 10
replication-factor: 3
configs:
  retention.ms: 604800000  # 7 days
  cleanup.policy: delete
  compression.type: lz4
```

### 4.2 Docker Compose Configuration

```yaml
services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - chat-network

  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - loki
    networks:
      - chat-network

volumes:
  loki-data:
  grafana-data:
```

### 4.3 Loki Configuration

```yaml
# local-config.yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    cache_ttl: 24h
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
  retention_delete_worker_count: 150

limits_config:
  retention_period: 168h  # 7 days (development)

  # For production, this would be set to 2160h (90 days)
```

## 5. Security Considerations

### 5.1 Data Protection

- **Sensitive Data**: Implement automatic redaction of sensitive fields (passwords, tokens, personal information)
- **Encryption**: Use TLS for all communication between components
- **Access Control**: Restrict access to Grafana and the logging API

### 5.2 Authentication and Authorization

- **Grafana**: Use OAuth or LDAP integration for production
- **Logging API**: Implement JWT authentication
- **Loki**: Configure with authentication in production

### 5.3 Network Security

- **Loki**: Should not be directly exposed to the internet
- **Grafana**: Should be behind a reverse proxy with HTTPS
- **Logging Microservice**: Internal access only

## 6. Monitoring and Alerting

### 6.1 System Health Alerts

- **Log Processing Lag**: Alert if logs are not being processed in a timely manner
- **Storage Usage**: Alert on high storage utilization
- **Service Health**: Monitor the logging microservice itself

### 6.2 Application Alerts

- **Error Rate**: Alert on sudden increases in error logs
- **Authentication Failures**: Alert on multiple failed login attempts
- **Performance Degradation**: Alert on slow response times

## 7. Scaling Considerations

### 7.1 Development Environment

- Single instance of each component
- Minimal resource allocation
- Local storage

### 7.2 Production Environment

- **Kafka**: Multiple brokers with appropriate partitioning
- **Logging Microservice**: Multiple instances behind load balancer
- **Loki**: Clustered deployment with separate components (ingester, distributor, querier)
- **Storage**: Use S3 or EBS for log storage
- **Grafana**: Multiple instances with shared database

## Related Documents

- [Logging Architecture](LOGGING_ARCHITECTURE.md)
- [Logging Implementation Plan](LOGGING_IMPLEMENTATION_PLAN.md)
- [Logging Dashboard Design](LOGGING_DASHBOARD_DESIGN.md)
- [Loki Retention Configuration](LOKI_RETENTION_CONFIG.md)
- [Infrastructure Plan](../infrastructure/INFRASTRUCTURE_PLAN.md)
- [Docker Plan](../docker/DOCKER_PLAN.md)

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-07-15
- **Last Updated**: 2023-07-16
- **Version**: 1.0.0
