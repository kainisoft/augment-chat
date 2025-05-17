# Security Logging Implementation

## Overview

The security logging system provides comprehensive logging of security-related events in the Auth Service. It captures detailed information about authentication attempts, account activities, session management, and potential security threats. The logs are stored in Redis with configurable retention periods and can be accessed through dedicated API endpoints.

## Features

- **Comprehensive Event Logging**: Logs all security-relevant events with appropriate severity levels
- **Structured Log Format**: Uses a consistent, structured format for all security logs
- **Redis Storage**: Stores logs in Redis with configurable TTL for efficient retrieval
- **Centralized Logging Integration**: Forwards logs to the centralized logging system (Kafka)
- **Security Dashboard**: Provides a dashboard for viewing security events and statistics
- **API Endpoints**: Offers endpoints for retrieving and filtering security logs
- **Sensitive Data Protection**: Redacts sensitive information from logs

## Security Event Types

The system logs the following types of security events:

### Authentication Events
- Login attempts (successful and failed)
- Logout events
- Token refresh events

### Account Events
- Account creation
- Account updates
- Account lockout and unlock

### Password Events
- Password changes
- Password reset requests
- Password reset completions

### Session Events
- Session creation
- Session termination
- Session expiration
- All sessions termination

### Access Events
- Unauthorized access attempts
- Permission violations
- Rate limit exceeded events

## Implementation Details

### Security Event Interface

The security events follow a structured format defined in the `SecurityEvent` interface:

```typescript
export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: number;
  data: BaseSecurityEventData;
}
```

### Security Logging Service

The `SecurityLoggingService` provides methods for logging different types of security events:

```typescript
// Log authentication event
await securityLoggingService.logAuthenticationEvent(
  SecurityEventType.LOGIN_SUCCESS,
  {
    userId: 'user-123',
    email: 'user@example.com',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    success: true,
  },
);

// Log password event
await securityLoggingService.logPasswordEvent(
  SecurityEventType.PASSWORD_CHANGED,
  {
    userId: 'user-123',
    timestamp: Date.now(),
  },
);
```

### Redis Storage

Security logs are stored in Redis with the following key pattern:
```
security:logs:{userId}:{timestamp}
```

Each log entry has a configurable TTL (default: 90 days).

### API Endpoints

The following API endpoints are available for accessing security logs:

- `GET /auth/security/logs` - Get security logs for the current user
- `GET /auth/security/stats` - Get security statistics for the current user
- `GET /auth/security/dashboard` - Get security dashboard data

### Security Dashboard

The security dashboard provides:

- Recent security events
- Login success rate
- Recent failed login attempts
- Recent suspicious activities
- Event counts by type and severity

## Integration with Event Handlers

Security logging is integrated with the CQRS event handlers to log security events when they occur:

- `UserRegisteredHandler` - Logs account creation events
- `UserLoggedInHandler` - Logs successful login events
- `UserLoggedOutHandler` - Logs logout events
- `PasswordChangedHandler` - Logs password change events
- `PasswordResetRequestedHandler` - Logs password reset request events
- `SessionTerminatedHandler` - Logs session termination events
- `AllSessionsTerminatedHandler` - Logs all sessions termination events

## Configuration

The security logging system can be configured using the following environment variables:

- `SECURITY_LOG_TTL` - TTL for security logs in seconds (default: 7776000 - 90 days)
- `LOG_LEVEL` - Log level for the centralized logging system

## Usage Examples

### Retrieving Security Logs

```typescript
// Get security logs for a user
const logs = await securityLoggingRepository.getUserLogs(
  userId,
  50,  // limit
  0,   // offset
  [SecurityEventType.LOGIN_FAILURE],  // filter by event type
  startTime,  // filter by start time
  endTime,    // filter by end time
);
```

### Getting Security Statistics

```typescript
// Get event counts by type
const eventCounts = await securityLoggingRepository.getEventCounts(userId);

// Calculate login success rate
const loginAttempts = eventCounts[SecurityEventType.LOGIN_ATTEMPT] || 0;
const loginSuccesses = eventCounts[SecurityEventType.LOGIN_SUCCESS] || 0;
const loginSuccessRate = loginAttempts > 0 
  ? Math.round((loginSuccesses / loginAttempts) * 100) 
  : 100;
```

## Best Practices

1. **Log all security-relevant events**: Ensure all security-relevant events are logged with appropriate context
2. **Use appropriate severity levels**: Use the correct severity level for each event type
3. **Include contextual information**: Include relevant context such as user ID, IP address, and timestamps
4. **Protect sensitive information**: Redact sensitive information from logs
5. **Regularly review security logs**: Implement processes for regular review of security logs
6. **Set appropriate retention periods**: Configure appropriate TTL for security logs based on compliance requirements
7. **Implement alerting**: Set up alerts for critical security events

## Future Enhancements

1. **Real-time alerts**: Implement real-time alerts for suspicious activities
2. **Anomaly detection**: Add anomaly detection to identify unusual patterns
3. **Geolocation tracking**: Add geolocation information to security logs
4. **Export functionality**: Add ability to export security logs
5. **Advanced filtering**: Enhance filtering capabilities for security logs
6. **Integration with SIEM**: Integrate with Security Information and Event Management systems
