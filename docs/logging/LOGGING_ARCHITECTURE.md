# Logging Architecture

## Overview

This document outlines the architecture for the centralized logging system in our Chat Application. The system uses a dedicated logging microservice that collects logs from all other microservices via Kafka and stores them in Loki for visualization through Grafana. This architecture provides a scalable, reliable, and centralized approach to log management across the entire application.

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Components](#components)
  - [Log Producers](#1-log-producers-microservices)
  - [Log Transport](#2-log-transport-kafka)
  - [Logging Microservice](#3-logging-microservice)
  - [Log Storage](#4-log-storage-loki)
  - [Visualization and Alerting](#5-visualization-and-alerting-grafana)
- [Log Flow](#log-flow)
- [Log Structure](#log-structure)
- [Environment-Specific Configurations](#environment-specific-configurations)
- [Security Considerations](#security-considerations)
- [Related Documents](#related-documents)

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   API Gateway   │     │   Auth Service  │     │   User Service  │     │   Chat Service  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         │                       │                       │                       │
         │                       ▼                       │                       │
         │        ┌─────────────────────────────┐        │                       │
         └───────►│        Kafka Broker         │◄───────┘                       │
                  │     (logs topic)            │◄───────────────────────────────┘
                  └─────────────┬───────────────┘
                                │
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │     Logging Microservice    │
                  │                             │
                  │   ┌─────────────────────┐   │
                  │   │   Log Processor     │   │
                  │   └─────────┬───────────┘   │
                  │             │               │
                  │             ▼               │
                  │   ┌─────────────────────┐   │
                  │   │   Log Enricher      │   │
                  │   └─────────┬───────────┘   │
                  │             │               │
                  │             ▼               │
                  │   ┌─────────────────────┐   │
                  │   │   Log Storage       │   │
                  │   └─────────────────────┘   │
                  └─────────────┬───────────────┘
                                │
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │           Loki              │
                  │    (Log Storage Engine)     │
                  └─────────────┬───────────────┘
                                │
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │          Grafana            │
                  │  (Visualization & Alerting) │
                  └─────────────────────────────┘
```

## Components

### 1. Log Producers (Microservices)

Each microservice in our architecture acts as a log producer:

- **API Gateway**: Logs API requests, responses, and gateway-specific events
- **Auth Service**: Logs authentication attempts, token issuance, and security events
- **User Service**: Logs user operations, profile updates, and user-related events
- **Chat Service**: Logs message delivery, chat room operations, and real-time events
- **Notification Service**: Logs notification dispatches and delivery status

Each service uses a common logging library that:
- Formats logs in a consistent JSON structure
- Adds service-specific context and metadata
- Publishes logs to the Kafka "logs" topic

### 2. Log Transport (Kafka)

Kafka serves as the central transport mechanism for all logs:

- **Topic**: A dedicated "logs" topic for all application logs
- **Partitioning**: Logs are partitioned by service name for parallel processing
- **Retention**: Configurable retention period (7 days for development, 30 days for production)

### 3. Logging Microservice

A dedicated NestJS microservice that:

- Consumes logs from the Kafka "logs" topic
- Processes and enriches logs with additional metadata
- Forwards logs to Loki for storage
- Provides a simple API for log querying and management
- Handles log rotation and retention policies

### 4. Log Storage (Loki)

Grafana Loki serves as our log storage solution:

- Highly efficient storage optimized for logs
- Index-free log querying
- Label-based log organization (service, level, etc.)
- Horizontal scalability for production

### 5. Visualization and Alerting (Grafana)

Grafana provides:

- Real-time dashboards for monitoring system health
- Log exploration interface for troubleshooting
- Alert configuration for critical events
- User-friendly interface for technical and non-technical users

## Log Flow

1. A microservice generates a log entry
2. The log entry is formatted and enriched with metadata
3. The log is published to the Kafka "logs" topic
4. The logging microservice consumes the log from Kafka
5. The log is further processed and enriched
6. The log is stored in Loki
7. The log is available for querying and visualization in Grafana

## Log Structure

All logs follow a consistent JSON structure:

```json
{
  "timestamp": "2023-07-15T12:34:56.789Z",
  "level": "info",
  "message": "User login successful",
  "service": "auth-service",
  "context": "AuthController",
  "requestId": "req-123456",
  "userId": "user-789",
  "metadata": {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "method": "POST",
    "path": "/auth/login",
    "statusCode": 200,
    "duration": 45
  }
}
```

## Environment-Specific Configurations

### Development

- Logs are stored for 7 days
- All log levels are captured (debug, info, warn, error)
- Grafana dashboards focus on debugging and development metrics

### Production

- Logs are stored for 3 months (90 days)
- Only info, warn, and error levels are captured by default
- Grafana dashboards focus on system health, performance, and user activity
- Alerting is configured for critical errors and performance issues

## Security Considerations

- All log transport uses encrypted connections
- Sensitive data is redacted before logging (passwords, tokens, etc.)
- Access to Grafana is restricted and authenticated
- Loki access is only available to the logging microservice
- Audit logs track access to the logging system

## Related Documents

- [Logging Implementation Plan](LOGGING_IMPLEMENTATION_PLAN.md)
- [Logging Technical Design](LOGGING_TECHNICAL_DESIGN.md)
- [Logging Dashboard Design](LOGGING_DASHBOARD_DESIGN.md)
- [Loki Retention Configuration](LOKI_RETENTION_CONFIG.md)
- [Project Overview](../project/PROJECT_OVERVIEW.md)
- [Infrastructure Plan](../infrastructure/INFRASTRUCTURE_PLAN.md)

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-07-15
- **Last Updated**: 2023-07-16
- **Version**: 1.0.0
