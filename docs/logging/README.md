# Logging System

## Overview

This directory contains documentation and configuration for the centralized logging system of the Chat Application. The logging system uses a dedicated microservice that collects logs from all other microservices via Kafka and stores them in Loki for visualization through Grafana.

## Quick Start

To start the logging system:

```bash
./docker/scripts/dev.sh logging
```

To restart the logging system (after configuration changes):

```bash
./docker/scripts/restart-logging.sh
```

## Access Points

- **Grafana UI**: http://localhost:3001 (admin/admin)
- **Loki API**: http://localhost:3100
- **Logging Service Health**: http://localhost:4005/health
- **Logging Service API**: http://localhost:4005/api/logs

## Directory Structure

- `docs/logging/` - Documentation for the logging system
  - `LOGGING_ARCHITECTURE.md` - Overall architecture of the logging system
  - `LOGGING_IMPLEMENTATION_PLAN.md` - Step-by-step implementation plan
  - `LOGGING_TECHNICAL_DESIGN.md` - Technical design details
  - `LOKI_RETENTION_CONFIG.md` - Loki retention configuration guide
  - `LOGGING_DASHBOARD_DESIGN.md` - Grafana dashboard design
  - `API_DOCUMENTATION.md` - Logging Service API documentation

- `docker/config/` - Configuration files for Docker services
  - `loki/` - Loki configuration
  - `grafana/` - Grafana configuration
  - `logging/` - Logging service configuration

## Log Retention

The logging system is configured with the following retention periods:

- **Development Environment**:
  - Default: 7 days
  - Error logs: 30 days
  - Warning logs: 14 days
  - Auth service logs: 14 days

- **Production Environment**:
  - Default: 90 days (3 months)

To modify retention periods, edit the following files:
- `docker/config/loki/local-config.yaml` - Loki retention configuration
- `docker/config/logging/logging-config.env` - Logging service configuration

After changing configuration, restart the logging system:

```bash
./docker/scripts/restart-logging.sh
```

## Log Management API

The logging system provides a REST API for querying logs and managing log levels:

- **Query Logs**: `GET /api/logs` - Retrieve logs with filtering options
- **Update Log Level**: `POST /api/logs/level` - Change log level for a service
- **Get Log Level**: `GET /api/logs/level` - Get current log level for a service
- **Get All Log Levels**: `GET /api/logs/levels` - Get all service log levels

API authentication can be enabled by setting `API_KEY_ENABLED=true` in the configuration.

For detailed API documentation, see [API Documentation](API_DOCUMENTATION.md).

## Logging Best Practices

1. **Use structured logging**: Always use JSON format for logs
2. **Include context**: Add service name, request ID, and other relevant metadata
3. **Use appropriate log levels**:
   - DEBUG: Detailed information for debugging
   - INFO: General operational information
   - WARN: Warning events that might cause issues
   - ERROR: Error events that might still allow the application to continue
   - FATAL: Very severe error events that will lead to application termination
4. **Redact sensitive information**: Never log passwords, tokens, or personal information
5. **Include correlation IDs**: For tracking requests across services

## Related Documents

- [Logging Architecture](LOGGING_ARCHITECTURE.md)
- [Logging Implementation Plan](LOGGING_IMPLEMENTATION_PLAN.md)
- [Logging Technical Design](LOGGING_TECHNICAL_DESIGN.md)
- [Loki Retention Configuration](LOKI_RETENTION_CONFIG.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Project Overview](../project/PROJECT_OVERVIEW.md)
- [Infrastructure Plan](../infrastructure/INFRASTRUCTURE_PLAN.md)
