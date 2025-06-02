# PM2 Monitoring Guide

## Overview

This guide documents the external monitoring approach using PM2 for production-grade application monitoring, process management, and performance tracking across all microservices in the chat application.

## PM2 Configuration

### Basic Configuration

Create a `ecosystem.config.js` file in the server root:

```javascript
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'dist/apps/api-gateway/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      monitoring: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'auth-service',
      script: 'dist/apps/auth-service/main.js',
      instances: 2,
      exec_mode: 'cluster',
      monitoring: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      }
    },
    {
      name: 'user-service',
      script: 'dist/apps/user-service/main.js',
      instances: 2,
      exec_mode: 'cluster',
      monitoring: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4002
      }
    },
    {
      name: 'chat-service',
      script: 'dist/apps/chat-service/main.js',
      instances: 2,
      exec_mode: 'cluster',
      monitoring: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4003
      }
    },
    {
      name: 'notification-service',
      script: 'dist/apps/notification-service/main.js',
      instances: 1,
      exec_mode: 'fork',
      monitoring: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 4004
      }
    },
    {
      name: 'logging-service',
      script: 'dist/apps/logging-service/main.js',
      instances: 1,
      exec_mode: 'fork',
      monitoring: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4005
      }
    }
  ]
};
```

### Advanced Configuration

```javascript
module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: 'dist/apps/auth-service/main.js',
      instances: 2,
      exec_mode: 'cluster',
      
      // Monitoring
      monitoring: true,
      pmx: true,
      
      // Memory management
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Logging
      log_file: 'logs/auth-service.log',
      error_file: 'logs/auth-service-error.log',
      out_file: 'logs/auth-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 4001
      }
    }
  ]
};
```

## Monitoring Features

### Process Management

- **Automatic Restarts**: Services restart automatically on crashes
- **Cluster Mode**: Load balancing across multiple CPU cores
- **Memory Monitoring**: Automatic restart when memory limits are exceeded
- **Health Checks**: Built-in health monitoring and reporting

### Performance Monitoring

- **CPU Usage**: Real-time CPU utilization per service
- **Memory Usage**: Memory consumption tracking and alerts
- **Event Loop**: Event loop delay monitoring
- **HTTP Metrics**: Request/response metrics for web services

### Log Management

- **Centralized Logs**: Unified log collection and rotation
- **Error Tracking**: Automatic error detection and alerting
- **Log Rotation**: Automatic log file rotation and cleanup
- **Real-time Monitoring**: Live log streaming and filtering

## PM2 Commands

### Basic Operations

```bash
# Start all services
pm2 start ecosystem.config.js

# Stop all services
pm2 stop all

# Restart all services
pm2 restart all

# Reload services (zero-downtime)
pm2 reload all

# Delete all services
pm2 delete all
```

### Monitoring Commands

```bash
# Real-time monitoring dashboard
pm2 monit

# List all processes
pm2 list

# Show detailed process information
pm2 show <service-name>

# Display logs
pm2 logs
pm2 logs <service-name>

# Flush logs
pm2 flush
```

### Performance Analysis

```bash
# CPU and memory profiling
pm2 profile:cpu <service-name>
pm2 profile:mem <service-name>

# Generate performance report
pm2 report

# Monitor specific metrics
pm2 web  # Web-based monitoring interface
```

## Integration with External Tools

### Prometheus Integration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'auth-service',
    script: 'dist/apps/auth-service/main.js',
    pmx: {
      http: true,
      ignore_routes: [/socket\.io/, /notFound/],
      errors: true,
      custom_probes: true,
      network: true,
      ports: true
    }
  }]
};
```

### Grafana Dashboard

PM2 metrics can be exported to Grafana for advanced visualization:

- Process status and uptime
- Memory and CPU usage trends
- Request rate and response times
- Error rates and exception tracking

## Best Practices

### Resource Allocation

- **API Gateway**: Max instances for high throughput
- **Auth Service**: 2 instances for security and availability
- **User Service**: 2 instances for user operations
- **Chat Service**: 2+ instances for real-time messaging
- **Notification Service**: 1 instance (I/O bound)
- **Logging Service**: 1 instance (centralized logging)

### Memory Management

- Set appropriate memory limits per service
- Monitor memory leaks and growth patterns
- Use cluster mode for CPU-intensive services
- Configure automatic restarts for memory thresholds

### Health Monitoring

- Implement health check endpoints in each service
- Configure PM2 health check grace periods
- Set up alerting for service failures
- Monitor dependency health (database, Redis, Kafka)

## Alerting and Notifications

### PM2 Plus Integration

```bash
# Link to PM2 Plus for advanced monitoring
pm2 link <secret_key> <public_key>

# Set up notifications
pm2 install pm2-slack
pm2 set pm2-slack:slack_url https://hooks.slack.com/...
```

### Custom Alerts

```javascript
// Custom monitoring script
const pm2 = require('pm2');

pm2.connect((err) => {
  if (err) throw err;
  
  setInterval(() => {
    pm2.list((err, processes) => {
      processes.forEach(proc => {
        if (proc.pm2_env.status !== 'online') {
          // Send alert
          console.log(`Alert: ${proc.name} is ${proc.pm2_env.status}`);
        }
      });
    });
  }, 30000); // Check every 30 seconds
});
```

## Migration from Internal Metrics

### Removed Internal Metrics

The following internal metrics collection has been replaced with PM2:

- `@app/metrics` module (deprecated)
- Custom performance monitoring services
- Internal health metrics collection
- Business metrics tracking (moved to logging/events)

### New Monitoring Approach

- **Process Metrics**: Handled by PM2 automatically
- **Application Metrics**: Via health endpoints and logging
- **Business Metrics**: Via event-driven analytics
- **Performance Metrics**: Via PM2 and external APM tools

## Related Documentation

- [Performance Best Practices](performance/PERFORMANCE_BEST_PRACTICES.md)
- [Logging Standards Guide](LOGGING_STANDARDS_GUIDE.md)
- [Health Check Implementation](HEALTH_CHECK_GUIDE.md)
- [Production Deployment Guide](../deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
