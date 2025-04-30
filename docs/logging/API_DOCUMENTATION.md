# Logging Service API Documentation

## Overview

The Logging Service API provides endpoints for querying logs and managing log levels across the Chat Application. This API allows developers and operations teams to access log data without having to directly query Loki, and to dynamically adjust log levels for different services without redeploying them.

## Base URL

```
http://localhost:4005/api/logs
```

## Authentication

The API supports authentication using an API key. To use authentication, set the `API_KEY_ENABLED` environment variable to `true` and configure the `API_KEY` environment variable with your desired key.

When authentication is enabled, include the API key in the `X-API-KEY` header with all requests:

```
X-API-KEY: your-api-key
```

## Endpoints

### Query Logs

Retrieve logs based on various filter criteria.

```
GET /api/logs
```

#### Query Parameters

| Parameter | Type   | Description                                      | Example                    |
|-----------|--------|--------------------------------------------------|----------------------------|
| service   | string | Filter logs by service name                      | `auth-service`             |
| level     | string | Filter logs by log level                         | `error`                    |
| from      | string | Start timestamp (ISO format)                     | `2023-07-19T00:00:00.000Z` |
| to        | string | End timestamp (ISO format)                       | `2023-07-19T23:59:59.999Z` |
| query     | string | Text search within log messages                  | `login failed`             |
| limit     | number | Maximum number of logs to return (default: 100)  | `50`                       |
| offset    | number | Number of logs to skip (for pagination)          | `100`                      |

#### Response

```json
{
  "logs": [
    {
      "timestamp": "2023-07-19T12:34:56.789Z",
      "level": "error",
      "message": "Failed to authenticate user",
      "service": "auth-service",
      "context": "AuthController",
      "requestId": "req-123456",
      "userId": "user-789",
      "metadata": {
        "ip": "192.168.1.1",
        "method": "POST",
        "path": "/auth/login",
        "statusCode": 401
      }
    },
    // More log entries...
  ],
  "total": 1500,
  "limit": 100,
  "offset": 0
}
```

### Update Log Level

Update the log level for a specific service.

```
POST /api/logs/level
```

#### Request Body

```json
{
  "service": "auth-service",
  "level": "debug"
}
```

Valid log levels are: `error`, `warn`, `info`, `debug`, `verbose`

#### Response

```json
{
  "success": true,
  "message": "Log level for auth-service updated to debug",
  "service": "auth-service",
  "level": "debug"
}
```

### Get Log Level

Get the current log level for a specific service.

```
GET /api/logs/level?service=auth-service
```

#### Query Parameters

| Parameter | Type   | Description           | Example        |
|-----------|--------|-----------------------|----------------|
| service   | string | Service name          | `auth-service` |

#### Response

```json
{
  "service": "auth-service",
  "level": "debug"
}
```

### Get All Log Levels

Get the current log levels for all services.

```
GET /api/logs/levels
```

#### Response

```json
{
  "api-gateway": "info",
  "auth-service": "debug",
  "user-service": "info",
  "chat-service": "info",
  "notification-service": "warn"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages for different error scenarios:

- `400 Bad Request`: Invalid request parameters or body
- `401 Unauthorized`: Missing or invalid API key
- `500 Internal Server Error`: Server-side error

Error responses include a message describing the error:

```json
{
  "statusCode": 400,
  "message": "Invalid log level: trace. Valid levels are: error, warn, info, debug, verbose",
  "error": "Bad Request"
}
```

## Examples

### Query Error Logs from Auth Service

```
GET /api/logs?service=auth-service&level=error&from=2023-07-01T00:00:00.000Z
```

### Update Log Level to Debug

```
POST /api/logs/level
Content-Type: application/json

{
  "service": "auth-service",
  "level": "debug"
}
```

### Search for Failed Login Attempts

```
GET /api/logs?service=auth-service&query=login%20failed
```

## Rate Limiting

To prevent abuse, the API implements rate limiting. Clients are limited to 100 requests per minute. When the rate limit is exceeded, the API returns a `429 Too Many Requests` status code.

## Notes

- Log data is stored in Loki with a retention period of 7 days in development and 90 days (3 months) in production.
- The API provides a simplified interface to Loki's query capabilities. For more advanced queries, consider using Grafana or the Loki API directly.
- Log levels set through this API are stored in memory and will be reset when the service restarts. In a production environment, consider implementing persistent storage for log levels.
