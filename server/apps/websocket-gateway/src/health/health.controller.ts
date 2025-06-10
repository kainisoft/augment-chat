import { Controller, Get } from '@nestjs/common';
import { LoggingService } from '@app/logging';

/**
 * Health Check Controller for WebSocket Gateway
 *
 * Provides health check endpoints for monitoring and service discovery.
 * Used by load balancers and monitoring systems to verify service health.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext('HealthController');
  }

  /**
   * Basic health check endpoint
   */
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'websocket-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  /**
   * Detailed health check with dependencies
   */
  @Get('detailed')
  getDetailedHealth() {
    const memoryUsage = process.memoryUsage();

    return {
      status: 'ok',
      service: 'websocket-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      dependencies: {
        redis: 'connected', // TODO: Add actual Redis health check
        graphql: 'active',
      },
    };
  }

  /**
   * Readiness probe for Kubernetes
   */
  @Get('ready')
  getReadiness() {
    // TODO: Add actual readiness checks (Redis connection, etc.)
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Liveness probe for Kubernetes
   */
  @Get('live')
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
