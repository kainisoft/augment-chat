# Auth Service Kafka Integration

## Overview

This document describes the Kafka integration in the Auth Service, which enables event-driven communication between the Auth Service and other microservices in the system.

## Implementation Details

The Auth Service Kafka integration follows the standardized pattern established in the User Service, which is considered the "gold standard" for microservice architecture in our system.

### Components

1. **KafkaProducerService**
   - Handles publishing events to Kafka topics
   - Provides error handling and logging
   - Automatically reconnects to Kafka if the connection is lost

2. **KafkaConsumerService**
   - Subscribes to Kafka topics to receive events from other services
   - Routes events to appropriate handlers based on event type
   - Provides error handling and logging

3. **Event Handlers**
   - **Auth Event Handlers**: Publish auth events to Kafka
     - `UserRegisteredKafkaHandler`: Publishes user registration events
     - `UserLoggedInKafkaHandler`: Publishes user login events
     - `UserLoggedOutKafkaHandler`: Publishes user logout events
     - `PasswordChangedKafkaHandler`: Publishes password change events
     - `SessionTerminatedKafkaHandler`: Publishes session termination events
     - `AllSessionsTerminatedKafkaHandler`: Publishes events when all sessions are terminated
   - **User Event Handlers**: Process user events from Kafka
     - Currently, the Auth Service listens for user events but doesn't have specific handlers implemented yet

### Kafka Topics

1. **auth-events**: Events published by the Auth Service
   - `UserRegistered`: Published when a user registers
   - `UserLoggedIn`: Published when a user logs in
   - `UserLoggedOut`: Published when a user logs out
   - `PasswordChanged`: Published when a user changes their password
   - `SessionTerminated`: Published when a session is terminated
   - `AllSessionsTerminated`: Published when all sessions for a user are terminated

2. **user-events**: Events consumed by the Auth Service
   - The Auth Service subscribes to this topic to receive events from the User Service

### Event Formats

#### UserRegistered Event
```json
{
  "type": "UserRegistered",
  "payload": {
    "userId": "12345678-1234-1234-1234-123456789012",
    "email": "user@example.com",
    "timestamp": "2025-05-21T13:50:00.000Z"
  }
}
```

#### UserLoggedIn Event
```json
{
  "type": "UserLoggedIn",
  "payload": {
    "userId": "12345678-1234-1234-1234-123456789012",
    "email": "user@example.com",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2025-05-21T13:50:00.000Z"
  }
}
```

#### UserLoggedOut Event
```json
{
  "type": "UserLoggedOut",
  "payload": {
    "userId": "12345678-1234-1234-1234-123456789012",
    "sessionId": "session-id-123",
    "timestamp": "2025-05-21T13:50:00.000Z"
  }
}
```

#### PasswordChanged Event
```json
{
  "type": "PasswordChanged",
  "payload": {
    "userId": "12345678-1234-1234-1234-123456789012",
    "timestamp": "2025-05-21T13:50:00.000Z"
  }
}
```

#### SessionTerminated Event
```json
{
  "type": "SessionTerminated",
  "payload": {
    "userId": "12345678-1234-1234-1234-123456789012",
    "sessionId": "session-id-123",
    "reason": "user_initiated",
    "timestamp": "2025-05-21T13:50:00.000Z"
  }
}
```

#### AllSessionsTerminated Event
```json
{
  "type": "AllSessionsTerminated",
  "payload": {
    "userId": "12345678-1234-1234-1234-123456789012",
    "currentSessionId": "session-id-123",
    "terminatedCount": 5,
    "timestamp": "2025-05-21T13:50:00.000Z"
  }
}
```

## Error Handling

The Kafka integration includes comprehensive error handling:

1. **Connection Errors**: If the connection to Kafka fails, the service will log the error but continue to operate. It will attempt to reconnect when the next event is published.

2. **Publishing Errors**: If an event cannot be published to Kafka, the error is logged, but the original operation (e.g., user registration) will still succeed.

3. **Consumption Errors**: If an error occurs while processing a consumed event, the error is logged, but the service will continue to process other events.

## Logging

The Kafka integration includes comprehensive logging:

1. **Connection Events**: Logs when the service connects to or disconnects from Kafka.

2. **Publishing Events**: Logs when events are published to Kafka, including the event type and key.

3. **Consumption Events**: Logs when events are consumed from Kafka, including the event type and key.

4. **Errors**: Logs detailed error information when errors occur.

## Testing

The Kafka integration has been tested to ensure:

1. **Connection**: The Auth Service can connect to Kafka.

2. **Publishing**: The Auth Service can publish events to Kafka.

3. **Consumption**: The Auth Service can consume events from Kafka.

4. **Error Handling**: The Auth Service properly handles errors in the Kafka integration.

## Future Improvements

1. **Additional Event Handlers**: Implement handlers for more auth events.

2. **User Event Handlers**: Implement handlers for user events consumed from Kafka.

3. **Schema Validation**: Add schema validation for Kafka events.

4. **Monitoring**: Add monitoring for Kafka events.

## Document Information
- **Author**: Chat Application Team
- **Created**: 2025-05-21
- **Version**: 1.0.0
