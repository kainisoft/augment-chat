# Logging Service

## Overview

The Logging Service is a centralized logging microservice responsible for collecting, processing, storing, and providing access to logs from all services in the microservice architecture. It integrates with Loki for log storage and provides a comprehensive logging infrastructure.

## Features

- **Centralized Log Collection**: Collects logs from all microservices
- **Log Processing**: Filters, transforms, and enriches log data
- **Loki Integration**: Stores logs in Loki with automatic retention management
- **Log Query API**: Provides API endpoints for log retrieval and search
- **Dashboard Integration**: Supports log visualization and monitoring
- **Real-time Streaming**: Live log streaming capabilities
- **Log Retention**: Automatic cleanup of logs older than 3 months

## Architecture

The service follows Domain-Driven Design (DDD) patterns and integrates with shared infrastructure modules:

- **Controllers**: Handle HTTP requests for log management
- **Services**: Implement business logic for log processing
- **Repositories**: Data access layer for log storage and retrieval
- **Domain Objects**: LogEntry, LogFilter, LogQuery entities
- **Event Handlers**: Process log events from other services
- **Loki Client**: Integration with Loki for log storage

## API Endpoints

### Log Management
- `POST /logs` - Submit log entries
- `GET /logs` - Query logs with filters
- `GET /logs/stream` - Stream logs in real-time
- `GET /logs/search` - Full-text search across logs
- `DELETE /logs/cleanup` - Trigger manual log cleanup

### Log Analytics
- `GET /logs/stats` - Get log statistics and metrics
- `GET /logs/errors` - Get error log summary
- `GET /logs/services` - Get per-service log metrics
- `GET /logs/trends` - Get log volume trends

### Admin Endpoints
- `POST /logs/retention/configure` - Configure retention policies
- `GET /logs/retention/status` - Get retention status
- `POST /logs/export` - Export logs for backup
- `GET /logs/health/loki` - Check Loki connectivity

### Health Monitoring
- `GET /health` - Comprehensive health check
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe

## Dependencies

### Shared Modules
- `@app/dtos` - Shared data transfer objects for logging
- `@app/validation` - Shared validation decorators
- `@app/security` - Security utilities and guards
- `@app/logging` - Core logging utilities (self-hosted)
- `@app/testing` - Shared testing utilities
- `@app/domain` - Shared domain models (ServiceId, LogLevel, etc.)
- `@app/events` - Event interfaces for log event communication
- `@app/kafka` - Event consumption from other services
- `@app/redis` - Caching and real-time data storage

#### Shared Module Integration Examples

**Using Validation Decorators:**
```typescript
import { IsStringField, IsEnumField, IsDateField } from '@app/validation';

export class LogQueryDto {
  @IsStringField({
    description: 'Service name to filter logs',
    example: 'user-service',
    optional: true,
  })
  service?: string;

  @IsEnumField(LogLevel, {
    description: 'Log level filter',
    example: LogLevel.ERROR,
    optional: true,
  })
  level?: LogLevel;

  @IsDateField({
    description: 'Start date for log query',
    optional: true,
  })
  startDate?: Date;
}
```

**Using Shared DTOs:**
```typescript
import { PaginationQueryDto, PaginatedResponseDto } from '@app/dtos';

export class LogListResponse extends PaginatedResponseDto<LogEntryDto> {
  constructor(logs: LogEntryDto[], pagination: PaginationMetaDto) {
    super(logs, pagination);
  }
}
```

**Using Domain Models:**
```typescript
import { ServiceId, LogLevel } from '@app/domain';

export class LogEntry {
  constructor(
    private readonly id: LogEntryId,
    private readonly serviceId: ServiceId,
    private readonly level: LogLevel,
    private readonly message: string,
    private readonly timestamp: Date,
    private readonly metadata: Record<string, any>,
  ) {}
}
```

### External Dependencies
- **Loki**: Log storage and querying
- **Redis**: Caching and real-time data
- **Kafka**: Event consumption from other services
- **PostgreSQL**: Metadata and configuration storage

## Development

### Running the Service

```bash
# Development mode
pnpm run start:dev logging-service

# Production mode
pnpm run start:prod logging-service

# Debug mode
pnpm run start:debug logging-service
```

### Testing

The service uses the shared `@app/testing` module for consistent testing patterns.

#### Unit Tests

```bash
# Run all logging-service tests
pnpm test -- --testPathPattern=logging-service

# Run specific test file
pnpm test -- logging-service.controller.spec.ts

# Run tests with coverage
pnpm test -- --coverage --testPathPattern=logging-service
```

#### E2E Tests

```bash
# Run E2E tests
pnpm run test:e2e logging-service
```

#### Testing Patterns

**Controller Tests:**
```typescript
import { ControllerTestBuilder, MockFactoryService } from '@app/testing';
import { LoggingServiceController } from './logging-service.controller';

describe('LoggingServiceController', () => {
  let testSetup: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const controllerTestBuilder = new ControllerTestBuilder(/* ... */);
    testSetup = await controllerTestBuilder.createControllerTestSetup(
      LoggingServiceController,
      {
        providers: [
          {
            provide: 'LoggingService',
            useValue: mockFactory.createMockLoggingService(),
          },
        ],
      },
    );
  });

  it('should query logs', async () => {
    const queryDto = mockFactory.createMockLogQueryDto();
    const result = await testSetup.controller.queryLogs(queryDto);
    expect(result).toBeDefined();
  });
});
```

**Service Tests:**
```typescript
import { ServiceTestBuilder, MockFactoryService } from '@app/testing';
import { LoggingService } from './logging-service.service';

describe('LoggingService', () => {
  let testSetup: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const serviceTestBuilder = new ServiceTestBuilder(/* ... */);
    testSetup = await serviceTestBuilder.createServiceTestSetup(LoggingService, {
      logRepository: mockFactory.createMockLogRepository(),
      lokiClient: mockFactory.createMockLokiClient(),
    });
  });

  it('should process and store logs', async () => {
    const logEntry = mockFactory.createMockLogEntry();
    const result = await testSetup.service.processLog(logEntry);
    expect(result).toBeDefined();
  });
});
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/logging_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=logging-service

# Loki Configuration
LOKI_URL=http://localhost:3100
LOKI_USERNAME=admin
LOKI_PASSWORD=admin
LOKI_RETENTION_PERIOD=90d

# Service
PORT=4005
NODE_ENV=development
LOG_LEVEL=info
```

## Migration Notes

### Standardization Changes

During the service standardization process, the Logging Service was updated to:

1. **Shared Module Integration**: Migrated to use shared infrastructure modules
2. **Validation Standardization**: Replaced custom validation with `@app/validation` decorators
3. **DTO Standardization**: Adopted shared DTO patterns from `@app/dtos`
4. **Testing Standardization**: Migrated to shared testing utilities from `@app/testing`
5. **Event Communication**: Standardized event handling using `@app/events` and `@app/kafka`
6. **Self-Logging**: Implemented careful self-logging to avoid circular dependencies

### Performance Optimizations

- **Batch Processing**: Implemented batch log processing for better performance
- **Caching Strategy**: Redis caching for frequently accessed log metadata
- **Loki Optimization**: Optimized Loki queries and indexing
- **Retention Management**: Automated log cleanup to manage storage

## Log Processing Pipeline

### Log Ingestion

```typescript
// Log event handler
@EventsHandler(LogEvent)
export class LogEventHandler {
  async handle(event: LogEvent) {
    // Process and enrich log entry
    const enrichedLog = await this.logProcessor.enrichLog(event.logEntry);

    // Store in Loki
    await this.lokiClient.pushLog(enrichedLog);

    // Cache metadata for quick access
    await this.cacheService.cacheLogMetadata(enrichedLog);
  }
}
```

### Log Retention

```typescript
// Automatic cleanup job
@Cron('0 2 * * *') // Daily at 2 AM
async handleLogCleanup() {
  const retentionDate = new Date();
  retentionDate.setMonth(retentionDate.getMonth() - 3);

  await this.lokiClient.deleteLogsBefore(retentionDate);
  await this.logRepository.cleanupMetadata(retentionDate);
}
```

## Deployment

### Docker

```bash
# Build image
docker build -t logging-service .

# Run container
docker run -p 4005:4005 logging-service
```

### Docker Compose

```bash
# Start all services
docker-compose up logging-service

# Start with dependencies
docker-compose up logging-service postgres redis kafka loki
```

## Monitoring

### Health Checks

- **System Health**: Service status and resource usage
- **Database Health**: PostgreSQL connection and performance
- **Redis Health**: Cache connectivity and performance
- **Kafka Health**: Event system connectivity
- **Loki Health**: Log storage connectivity and performance

### Self-Monitoring

The logging service implements careful self-monitoring to avoid circular dependencies:

- **Internal Metrics**: Service performance and processing metrics
- **Error Tracking**: Internal error logging with fallback mechanisms
- **Performance Monitoring**: Log processing times and throughput
- **Storage Monitoring**: Loki storage usage and retention status

### Metrics

Key performance indicators:

- **Log Volume**: Logs processed per time period
- **Processing Latency**: Time from log receipt to storage
- **Storage Usage**: Loki storage consumption and growth
- **Query Performance**: Log query response times

### Performance Monitoring

The Logging Service integrates with the comprehensive performance monitoring system:

#### Performance Baselines (Current)
- **Bundle Size**: 466.26 KB (65.86 KB gzipped)
- **Average Response Time**: <100ms for log queries
- **Log Processing**: <5ms per log entry
- **Loki Storage**: <10ms for log ingestion
- **Batch Processing**: 1000+ logs/second sustained
- **Memory Usage**: ~25 MB average, no memory leaks detected
- **Build Time**: 4.1s average

#### Performance Tools Integration
```bash
# Run performance analysis specific to logging-service
pnpm perf:monitor --service=logging-service

# Analyze log processing performance
pnpm perf:logs --service=logging-service

# Monitor Loki performance
pnpm perf:loki --service=logging-service

# Analyze query performance
pnpm perf:queries --service=logging-service
```

#### Performance Optimizations Applied
- **Batch Log Processing**: Efficient batch processing for high-volume log ingestion
- **Loki Optimization**: Optimized Loki queries and indexing strategies
- **Caching Strategy**: Redis caching for frequently accessed log metadata
- **Query Optimization**: Optimized log search and filtering operations
- **Retention Management**: Efficient automated log cleanup and retention

#### Logging Performance Features
- **High-Volume Ingestion**: Support for high-volume log processing
- **Efficient Storage**: Optimized Loki storage and compression
- **Fast Queries**: Optimized log search and filtering
- **Retention Automation**: Efficient automated cleanup processes

#### Self-Monitoring Considerations
- **Circular Dependency Prevention**: Careful self-logging to avoid infinite loops
- **Fallback Mechanisms**: Local logging fallbacks when centralized logging fails
- **Performance Impact**: Minimal performance impact on monitored services
- **Resource Management**: Efficient resource usage for log processing

#### Monitoring Integration
- **@app/metrics**: Integrated performance metrics collection
- **Custom Metrics**: Service-specific logging and storage metrics
- **Loki Metrics**: Storage usage, ingestion rates, and query performance
- **Processing Metrics**: Log processing times and batch efficiency
- **Alerting**: Storage capacity and performance threshold monitoring
- **Dashboards**: Real-time logging performance and storage visualization

For detailed performance documentation, see [Performance Documentation Index](../../docs/server/performance/README.md).

## Security

### Log Security

- **Authentication**: JWT token validation for log access
- **Authorization**: Role-based access to log data
- **Data Sanitization**: Sensitive data filtering and masking
- **Audit Logging**: All log access operations logged

### Privacy Protection

- **PII Filtering**: Automatic detection and masking of personal information
- **Data Retention**: Compliance with data retention policies
- **Access Control**: Granular permissions for log access

## Troubleshooting

### Common Issues

1. **Loki Connectivity**: Check Loki server status and configuration
2. **Log Processing Delays**: Monitor Kafka lag and processing queues
3. **Storage Issues**: Check Loki storage capacity and retention
4. **Query Performance**: Optimize Loki queries and indexing

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development pnpm run start:debug logging-service

# Loki debugging
LOKI_DEBUG=true pnpm run start:dev logging-service
```

## Contributing

1. Follow the established patterns from shared modules
2. Write comprehensive tests using `@app/testing` utilities
3. Be careful with self-logging to avoid circular dependencies
4. Update documentation for new log processing features
5. Follow the service standardization guidelines

## Related Documentation

- [Logging Service Plan](../../docs/server/LOGGING_SERVICE_PLAN.md)
- [Service Standardization Plan](../../docs/server/SERVICE_STANDARDIZATION_PLAN.md)
- [Shared Infrastructure Modules](../../docs/server/SHARED_INFRASTRUCTURE_MODULES.md)
- [Testing Standards Guide](../../docs/server/TESTING_STANDARDS_GUIDE.md)
- [Loki Configuration Guide](../../docs/logging/LOKI_SETUP.md)
