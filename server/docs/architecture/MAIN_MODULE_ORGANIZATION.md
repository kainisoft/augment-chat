# Main Module Organization Standards

This document outlines the standardized patterns for organizing main service modules across all microservices in the chat application ecosystem.

## Overview

The main service module serves as the entry point and orchestration layer for each microservice. It defines the service's dependencies, configuration, and overall architecture. Consistent organization patterns across services improve maintainability, reduce cognitive load, and facilitate team collaboration.

## Standardized Module Structure

### Import Organization

All main service modules should organize imports in the following order:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Shared Libraries
import { CommonModule } from '@app/common';
import { LoggingModule, LogLevel } from '@app/logging';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
// ... other shared libraries

// Service Controllers and Services
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { ServiceHealthController, ServiceHealthService } from './health/health.controller';
// ... other service-specific controllers and services

// Infrastructure Modules
import { RepositoryModule } from './infrastructure/repositories/repository.module';
// ... other infrastructure modules

// Feature Modules
import { FeatureModule } from './feature/feature.module';
// ... other feature modules
```

### Module Configuration Structure

```typescript
@Module({
  imports: [
    // Core configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Shared infrastructure
    CommonModule,
    DatabaseModule.forService(),
    
    // Logging configuration
    LoggingModule.registerAsync({
      // Service-specific logging configuration
    }),

    // Redis and caching
    RedisModule.registerDefault({
      // Service-specific Redis configuration
    }),

    // Infrastructure modules
    RepositoryModule,
    
    // Feature modules
    FeatureModule,
    
    // External integrations
    ExternalModule.register({
      // External service configuration
    }),
  ],
  controllers: [
    // Main service controller
    ServiceController,
    
    // Health monitoring controller
    ServiceHealthController,
  ],
  providers: [
    // Core service providers
    ServiceService,
    
    // Health monitoring service
    ServiceHealthService,
    
    // Additional service-specific providers
  ],
  exports: [
    // Export core services for potential use by other modules
    ServiceService,
  ],
})
export class ServiceModule {}
```

## Documentation Standards

### Module Documentation

Each main service module must include comprehensive JSDoc documentation covering:

1. **Service Overview**: Purpose and responsibilities
2. **Architecture**: High-level architectural decisions
3. **Module Dependencies**: Explanation of imported modules
4. **Configuration Strategy**: Environment and configuration patterns
5. **Performance Considerations**: Optimization strategies
6. **Security Considerations**: Security measures and patterns
7. **Integration Patterns**: How the service integrates with others

### Documentation Template

```typescript
/**
 * [Service Name] Module
 *
 * This is the main module for the [Service Name] microservice. It orchestrates
 * all [service-specific functionality] within the chat application ecosystem.
 *
 * ## Service Overview
 *
 * The [Service Name] is responsible for:
 * - [Primary responsibility 1]
 * - [Primary responsibility 2]
 * - [Primary responsibility 3]
 *
 * ## Architecture
 *
 * The service follows a modular architecture with clear separation of concerns:
 *
 * ### Core Infrastructure
 * - **Configuration**: Environment-based configuration management
 * - **Logging**: Structured logging with [service-specific features]
 * - **Database**: [Database technology] with [ORM/Query builder]
 * - **Caching**: Redis-based caching for [specific use cases]
 * - **Messaging**: Kafka for [event types]
 *
 * ### Feature Modules
 * - **[Module 1]**: [Description]
 * - **[Module 2]**: [Description]
 *
 * ## Module Dependencies
 *
 * ### Shared Libraries
 * - `@app/common`: Common utilities and patterns
 * - `@app/logging`: Structured logging infrastructure
 * - [Other shared libraries with descriptions]
 *
 * ### Infrastructure Modules
 * - **ConfigModule**: Environment variable management
 * - **LoggingModule**: Service-specific logging configuration
 * - [Other infrastructure modules]
 *
 * ### Feature Modules
 * - **[FeatureModule]**: [Description]
 * - [Other feature modules]
 *
 * ## Configuration Strategy
 *
 * The module uses environment-based configuration with [specific patterns]:
 * - **[Config Area 1]**: [Description]
 * - **[Config Area 2]**: [Description]
 *
 * ## Performance Considerations
 *
 * - **[Performance Strategy 1]**: [Description]
 * - **[Performance Strategy 2]**: [Description]
 *
 * ## Security Considerations (if applicable)
 *
 * - **[Security Measure 1]**: [Description]
 * - **[Security Measure 2]**: [Description]
 *
 * @see {@link FeatureModule} for [description]
 * @see {@link OtherModule} for [description]
 */
```

## Configuration Patterns

### Logging Configuration

All services should use the standardized logging configuration pattern:

```typescript
LoggingModule.registerAsync({
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const logLevelStr = configService.get<string>('LOG_LEVEL', 'info');
    const level = mapLogLevel(logLevelStr);

    return {
      service: 'service-name',
      level,
      kafka: {
        brokers: configService
          .get<string>('KAFKA_BROKERS', 'kafka:29092')
          .split(','),
        topic: configService.get<string>('KAFKA_LOGS_TOPIC', 'logs'),
        clientId: 'service-name',
      },
      console: configService.get<string>('LOG_CONSOLE', 'true') === 'true',
      redactFields: ['password', 'token', 'secret', 'authorization'],
    };
  },
  inject: [ConfigService],
}),
```

### Redis Configuration

```typescript
RedisModule.registerDefault({
  isGlobal: true,
  keyPrefix: 'service-prefix:',
}),
```

### Cache Configuration

```typescript
RedisCacheModule.register({
  isGlobal: true,
  ttl: 300, // 5 minutes default
  prefix: 'service-prefix:cache',
  enableLogs: process.env.CACHE_LOGS === 'true',
}),
```

## Provider Organization

### Controller Organization

```typescript
controllers: [
  // Main service controller
  ServiceController,
  
  // Health monitoring controller
  ServiceHealthController,
  
  // Additional controllers grouped by functionality
],
```

### Provider Organization

```typescript
providers: [
  // Core service providers
  ServiceService,
  
  // Health monitoring service
  ServiceHealthService,
  
  // Security services (if applicable)
  SecurityService,
  SecurityGuard,
  
  // Additional providers grouped by functionality
],
```

### Export Strategy

```typescript
exports: [
  // Export core services for potential use by other modules
  ServiceService,
  
  // Export utilities that other modules might need
  UtilityService,
],
```

## Best Practices

### Import Organization

1. **Group Related Imports**: Group imports by category (shared libraries, controllers, modules)
2. **Consistent Ordering**: Follow the standardized import order
3. **Clear Comments**: Add comments to separate import groups
4. **Avoid Deep Nesting**: Keep import paths as shallow as possible

### Module Configuration

1. **Logical Grouping**: Group related modules together in imports
2. **Clear Comments**: Document the purpose of each module group
3. **Consistent Patterns**: Use the same configuration patterns across services
4. **Environment-Based Config**: Use environment variables for all configuration

### Documentation

1. **Comprehensive Coverage**: Document all aspects of the service
2. **Clear Structure**: Use consistent documentation structure
3. **Practical Examples**: Include code examples where helpful
4. **Cross-References**: Link to related modules and documentation

### Performance

1. **Lazy Loading**: Use lazy loading for non-critical modules where possible
2. **Global Modules**: Mark frequently used modules as global
3. **Efficient Imports**: Avoid circular dependencies and unnecessary imports
4. **Resource Management**: Configure connection pools and caching appropriately

## Validation Checklist

When creating or updating a main service module, ensure:

- [ ] Imports are organized according to the standard pattern
- [ ] Module includes comprehensive JSDoc documentation
- [ ] Configuration follows standardized patterns
- [ ] Controllers and providers are logically organized
- [ ] Exports are clearly defined and documented
- [ ] No circular dependencies exist
- [ ] Environment variables are properly configured
- [ ] Health checks are included
- [ ] Logging is properly configured
- [ ] Security considerations are addressed (if applicable)
