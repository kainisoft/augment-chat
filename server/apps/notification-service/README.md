# Notification Service

## Overview

The Notification Service is responsible for managing and delivering notifications across the microservice architecture. It handles real-time notifications, email notifications, push notifications, and notification preferences management.

## Features

- **Real-time Notifications**: WebSocket-based instant notification delivery
- **Email Notifications**: SMTP-based email notification system
- **Push Notifications**: Mobile and web push notification support
- **Notification Preferences**: User-configurable notification settings
- **Notification History**: Persistent notification storage and retrieval
- **Template Management**: Customizable notification templates
- **Delivery Tracking**: Notification delivery status and analytics

## Architecture

The service follows Domain-Driven Design (DDD) patterns and integrates with shared infrastructure modules:

- **Controllers**: Handle HTTP requests and notification management
- **Services**: Implement business logic for notification operations
- **Repositories**: Data access layer for notification storage
- **Domain Objects**: Notification, NotificationTemplate, UserPreferences entities
- **Event Handlers**: Process notification events from other services
- **Delivery Providers**: Email, push, and real-time delivery mechanisms

## API Endpoints

### Notification Management
- `GET /notifications` - List user notifications
- `GET /notifications/:id` - Get specific notification
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/:id` - Delete notification

### Notification Preferences
- `GET /notifications/preferences` - Get user notification preferences
- `PUT /notifications/preferences` - Update notification preferences
- `POST /notifications/preferences/reset` - Reset to default preferences

### Admin Endpoints
- `POST /notifications/send` - Send notification to specific users
- `POST /notifications/broadcast` - Broadcast notification to all users
- `GET /notifications/templates` - List notification templates
- `POST /notifications/templates` - Create notification template

### Health Monitoring
- `GET /health` - Comprehensive health check
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe

## Dependencies

### Shared Modules
- `@app/dtos` - Shared data transfer objects for notifications
- `@app/validation` - Shared validation decorators
- `@app/security` - Security utilities, guards, and Identity and Access Management
- `@app/logging` - Centralized logging service
- `@app/testing` - Shared testing utilities
- `@app/domain` - Shared domain models (UserId, NotificationId, etc.)
- `@app/events` - Event interfaces for inter-service communication
- `@app/kafka` - Event publishing and consumption
- `@app/redis` - Caching and real-time data storage

#### Shared Module Integration Examples

**Using Validation Decorators:**
```typescript
import { IsUUIDField, IsStringField, IsEnumField } from '@app/validation';

export class SendNotificationDto {
  @IsUUIDField({
    description: 'Target user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @IsStringField({
    description: 'Notification title',
    example: 'New message received',
    maxLength: 100,
  })
  title: string;

  @IsEnumField(NotificationType, {
    description: 'Type of notification',
    example: NotificationType.MESSAGE,
  })
  type: NotificationType;
}
```

**Using Shared DTOs:**
```typescript
import { PaginationQueryDto, PaginatedResponseDto } from '@app/dtos';

export class NotificationListResponse extends PaginatedResponseDto<NotificationDto> {
  constructor(notifications: NotificationDto[], pagination: PaginationMetaDto) {
    super(notifications, pagination);
  }
}
```

**Using Domain Models:**
```typescript
import { UserId, NotificationId } from '@app/domain';

export class Notification {
  constructor(
    private readonly id: NotificationId,
    private readonly userId: UserId,
    private readonly title: string,
    private readonly content: string,
    private readonly type: NotificationType,
  ) {}
}
```

**Using Security Authentication and Authorization:**
```typescript
import { JwtAuthGuard, RolesGuard, Roles, Public } from '@app/security';
import { Controller, Get, Post, Put, Delete, UseGuards, Request, Body, Param } from '@nestjs/common';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  @Get()
  @Roles('user', 'admin')
  async getNotifications(@Request() req) {
    // Users can only see their own notifications
    return this.notificationService.getUserNotifications(req.user.id);
  }

  @Put(':id/read')
  @Roles('user')
  async markAsRead(@Param('id') id: string, @Request() req) {
    // Users can only mark their own notifications as read
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Post('send')
  @Roles('admin', 'system')
  async sendNotification(@Body() notificationDto: SendNotificationDto) {
    // Only admins and system can send notifications
    return this.notificationService.sendNotification(notificationDto);
  }

  @Post('broadcast')
  @Roles('admin')
  async broadcastNotification(@Body() notificationDto: BroadcastNotificationDto) {
    // Only admins can broadcast to all users
    return this.notificationService.broadcastNotification(notificationDto);
  }

  @Get('preferences')
  @Roles('user')
  async getPreferences(@Request() req) {
    // Users can only access their own preferences
    return this.notificationService.getUserPreferences(req.user.id);
  }

  @Put('preferences')
  @Roles('user')
  async updatePreferences(@Body() preferences: NotificationPreferencesDto, @Request() req) {
    // Users can only update their own preferences
    return this.notificationService.updatePreferences(req.user.id, preferences);
  }
}
```

### External Dependencies
- **PostgreSQL**: Notification and preference storage
- **Redis**: Real-time data and caching
- **Kafka**: Event consumption from other services
- **SMTP Server**: Email delivery
- **Push Service**: Mobile/web push notifications

## Development

### Running the Service

```bash
# Development mode
pnpm run start:dev notification-service

# Production mode
pnpm run start:prod notification-service

# Debug mode
pnpm run start:debug notification-service
```

### Testing

The service uses the shared `@app/testing` module for consistent testing patterns.

#### Unit Tests

```bash
# Run all notification-service tests
pnpm test -- --testPathPattern=notification-service

# Run specific test file
pnpm test -- notification-service.controller.spec.ts

# Run tests with coverage
pnpm test -- --coverage --testPathPattern=notification-service
```

#### E2E Tests

```bash
# Run E2E tests
pnpm run test:e2e notification-service
```

#### Testing Patterns

**Controller Tests:**
```typescript
import { ControllerTestBuilder, MockFactoryService } from '@app/testing';
import { NotificationServiceController } from './notification-service.controller';

describe('NotificationServiceController', () => {
  let testSetup: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const controllerTestBuilder = new ControllerTestBuilder(/* ... */);
    testSetup = await controllerTestBuilder.createControllerTestSetup(
      NotificationServiceController,
      {
        providers: [
          {
            provide: 'NotificationService',
            useValue: mockFactory.createMockNotificationService(),
          },
        ],
      },
    );
  });

  it('should send notification', async () => {
    const notificationDto = mockFactory.createMockSendNotificationDto();
    const result = await testSetup.controller.sendNotification(notificationDto);
    expect(result).toBeDefined();
  });
});
```

**Service Tests:**
```typescript
import { ServiceTestBuilder, MockFactoryService } from '@app/testing';
import { NotificationService } from './notification-service.service';

describe('NotificationService', () => {
  let testSetup: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const serviceTestBuilder = new ServiceTestBuilder(/* ... */);
    testSetup = await serviceTestBuilder.createServiceTestSetup(NotificationService, {
      notificationRepository: mockFactory.createMockNotificationRepository(),
      emailService: mockFactory.createMockEmailService(),
    });
  });

  it('should create and send notification', async () => {
    const notificationData = mockFactory.createMockNotification();
    const result = await testSetup.service.sendNotification(notificationData);
    expect(result).toBeDefined();
  });
});
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/notification_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=notification-service

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Push Notifications
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_key

# Service
PORT=4004
NODE_ENV=development
```

## Migration Notes

### Standardization Changes

During the service standardization process, the Notification Service was updated to:

1. **Shared Module Integration**: Migrated to use shared infrastructure modules
2. **Validation Standardization**: Replaced custom validation with `@app/validation` decorators
3. **DTO Standardization**: Adopted shared DTO patterns from `@app/dtos`
4. **Testing Standardization**: Migrated to shared testing utilities from `@app/testing`
5. **Logging Integration**: Integrated with centralized logging from `@app/logging`
6. **Event Communication**: Standardized event handling using `@app/events` and `@app/kafka`

### Performance Optimizations

- **Caching Strategy**: Implemented Redis caching for user preferences and templates
- **Batch Processing**: Optimized bulk notification sending
- **Delivery Optimization**: Improved notification delivery performance
- **Database Indexing**: Added indexes for notification queries and user lookups

## Event Handling

### Consumed Events

The service listens for events from other services:

```typescript
// User registration event
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler {
  async handle(event: UserRegisteredEvent) {
    await this.notificationService.sendWelcomeNotification(event.userId);
  }
}

// Message received event
@EventsHandler(MessageReceivedEvent)
export class MessageReceivedHandler {
  async handle(event: MessageReceivedEvent) {
    await this.notificationService.sendMessageNotification(
      event.recipientId,
      event.senderId,
      event.messageContent,
    );
  }
}
```

## Deployment

### Docker

```bash
# Build image
docker build -t notification-service .

# Run container
docker run -p 4004:4004 notification-service
```

### Docker Compose

```bash
# Start all services
docker-compose up notification-service

# Start with dependencies
docker-compose up notification-service postgres redis kafka
```

## Monitoring

### Health Checks

- **System Health**: Service status and resource usage
- **Database Health**: PostgreSQL connection and performance
- **Redis Health**: Cache connectivity and performance
- **Kafka Health**: Event system connectivity
- **Email Service Health**: SMTP server connectivity
- **Push Service Health**: Firebase/push provider connectivity

### Logging

Structured logging using `@app/logging`:

- **Notification Logging**: Notification creation and delivery events
- **Delivery Logging**: Email, push, and real-time delivery status
- **Error Logging**: Detailed error information with context
- **Performance Logging**: Delivery times and success rates

### Metrics

Key performance indicators:

- **Notification Volume**: Notifications sent per time period
- **Delivery Success Rate**: Successful delivery percentage by type
- **Response Times**: Notification processing and delivery times
- **User Engagement**: Notification open and click rates

### Performance Monitoring

The Notification Service integrates with the comprehensive performance monitoring system:

#### Performance Baselines (Current)
- **Bundle Size**: 420.56 KB (59.39 KB gzipped)
- **Average Response Time**: <50ms for notification operations
- **Email Delivery**: <2s average delivery time
- **Push Notification**: <500ms average delivery time
- **Event Processing**: <20ms for Kafka event handling
- **Memory Usage**: ~20 MB average, no memory leaks detected
- **Build Time**: 3.5s average

#### Performance Tools Integration
```bash
# Run performance analysis specific to notification-service
pnpm perf:monitor --service=notification-service

# Analyze notification delivery performance
pnpm perf:notifications --service=notification-service

# Monitor email performance
pnpm perf:email --service=notification-service

# Analyze event processing performance
pnpm perf:events --service=notification-service
```

#### Performance Optimizations Applied
- **Batch Processing**: Efficient batch notification sending
- **Template Caching**: Cached notification templates for faster rendering
- **Delivery Optimization**: Optimized email and push notification delivery
- **Event Processing**: Efficient Kafka event consumption and processing
- **Database Optimization**: Optimized notification storage and retrieval

#### Notification Performance Features
- **Concurrent Delivery**: Support for high-volume notification delivery
- **Template Rendering**: Fast template processing and personalization
- **Delivery Tracking**: Efficient delivery status tracking and reporting
- **Preference Caching**: Cached user preferences for faster filtering

#### Monitoring Integration
- **External Monitoring**: PM2 for process management and performance monitoring
- **Delivery Metrics**: Success rates, delivery times, and failure tracking via logging and events
- **User Engagement**: Open rates, click rates, and user interaction tracking via analytics events
- **Health Checks**: Built-in health endpoints for service status monitoring
- **Alerting**: Delivery failure and performance threshold monitoring via external tools
- **Dashboards**: Real-time notification delivery and engagement visualization via PM2 and log aggregation

For detailed performance documentation, see [Performance Documentation Index](../../docs/server/performance/README.md).

## Security

### Centralized Security Integration

The Notification Service uses the centralized `@app/security` module for all authentication and authorization:

- **JWT Authentication**: Centralized JWT token validation using `JwtAuthGuard`
- **Role-Based Access Control**: Fine-grained permissions using `@Roles()` decorator
- **Admin Operations**: Restricted admin-only operations for system notifications
- **User Privacy**: Users can only access their own notifications and preferences

### Notification Security

- **Authentication**: Centralized JWT token validation via `@app/security`
- **Authorization**: Role-based access control for notification operations
- **Content Validation**: All notification content validated and sanitized
- **Rate Limiting**: Notification sending rate limits per user using `@app/security`

### Privacy Protection

- **Data Encryption**: Sensitive notification data encrypted at rest
- **Preference Privacy**: User preferences securely stored and access-controlled
- **Audit Logging**: All notification operations logged for compliance
- **User Consent**: Notification preferences respect user consent and privacy settings

### IAM Integration Examples

```typescript
// Event handler with IAM context
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler {
  async handle(event: UserRegisteredEvent) {
    // System-level operation, no user context needed
    await this.notificationService.sendWelcomeNotification(event.userId);
  }
}

// Service method with user context validation
@Injectable()
export class NotificationService {
  async getUserNotifications(userId: string, requestingUser: User) {
    // Validate user can only access their own notifications
    if (userId !== requestingUser.id && !requestingUser.hasRole('admin')) {
      throw new ForbiddenException('Cannot access other user notifications');
    }

    return this.notificationRepository.findByUserId(userId);
  }

  async sendAdminNotification(notification: NotificationDto, adminUser: User) {
    // Validate admin permissions
    if (!adminUser.hasRole('admin')) {
      throw new ForbiddenException('Admin role required');
    }

    return this.processNotification(notification);
  }
}
```

## Troubleshooting

### Common Issues

1. **Email Delivery**: Check SMTP configuration and credentials
2. **Push Notifications**: Verify Firebase/push service configuration
3. **Event Processing**: Check Kafka connectivity and event handlers
4. **Database Performance**: Monitor PostgreSQL queries and indexing

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development pnpm run start:debug notification-service

# Email debugging
EMAIL_DEBUG=true pnpm run start:dev notification-service
```

## Contributing

1. Follow the established patterns from shared modules
2. Write comprehensive tests using `@app/testing` utilities
3. Update documentation for new notification types
4. Ensure event handlers are properly tested
5. Follow the service standardization guidelines

## Related Documentation

### Core Planning Documents
- [Notification Service Plan](../../docs/server/NOTIFICATION_SERVICE_PLAN.md)
- [Service Standardization Plan](../../docs/server/SERVICE_STANDARDIZATION_PLAN.md)
- [Shared Infrastructure Modules](../../docs/server/SHARED_INFRASTRUCTURE_MODULES.md)

### Architecture and Implementation Guides
- [DDD Implementation Guide](../../docs/server/DDD_IMPLEMENTATION_GUIDE.md)
- [Event Communication Guide](../../docs/server/EVENT_COMMUNICATION_GUIDE.md)
- [Security Standards Guide](../../docs/server/SECURITY_STANDARDS_GUIDE.md)

### Standards and Guidelines
- [Testing Standards Guide](../../docs/server/TESTING_STANDARDS_GUIDE.md)
- [Validation Standards Guide](../../docs/server/VALIDATION_STANDARDS_GUIDE.md)

### Performance and Monitoring
- [Performance Documentation Index](../../docs/server/performance/README.md)
- [Performance Best Practices](../../docs/server/performance/PERFORMANCE_BEST_PRACTICES.md)

### Shared Module Documentation
- [Security Library](../../libs/security/README.md) - Identity and Access Management
- [Testing Library](../../libs/testing/README.md)
- [Validation Library](../../libs/validation/README.md)
