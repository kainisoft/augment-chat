import { RemoteGraphQLDataSource } from '@apollo/gateway';
import { LoggingService } from '@app/logging';
import { ServiceRegistryService } from './service-registry.service';
import { CircuitBreakerService } from './circuit-breaker.service';

/**
 * Service-Aware GraphQL Data Source
 *
 * Extends Apollo's RemoteGraphQLDataSource to integrate with service discovery,
 * health monitoring, load balancing, and circuit breaker patterns.
 *
 * Phase 2, Step 3: Service Discovery and Routing Integration
 */
export class ServiceAwareDataSource extends RemoteGraphQLDataSource {
  constructor(
    config: { url: string },
    private readonly serviceName: string,
    private readonly serviceRegistry: ServiceRegistryService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly loggingService: LoggingService,
  ) {
    super(config);
    this.loggingService.setContext(`ServiceAwareDataSource-${serviceName}`);

    // Start background health monitoring for this service
    this.startHealthMonitoring();
  }

  /**
   * Start background health monitoring
   */
  private startHealthMonitoring(): void {
    // Log that service discovery is active for this service
    this.loggingService.log(
      `Service discovery enabled for ${this.serviceName}`,
      'ServiceDiscoveryInit',
      {
        service: this.serviceName,
        url: this.url,
      },
    );
  }

  /**
   * Override willSendRequest to implement service discovery and routing
   */
  willSendRequest(requestOptions: any) {
    // Call parent implementation first if it exists
    if (super.willSendRequest) {
      super.willSendRequest(requestOptions);
    }

    const { request, context } = requestOptions;

    // Ensure request.http exists
    if (!request.http) {
      return;
    }

    // Pass authentication headers to downstream services
    const authHeader = context?.req?.headers?.authorization;
    if (authHeader && typeof authHeader === 'string') {
      request.http.headers.set('authorization', authHeader);
    }

    // Pass other relevant headers
    const userAgent = context?.req?.headers?.['user-agent'];
    if (userAgent && typeof userAgent === 'string') {
      request.http.headers.set('user-agent', userAgent);
    }

    // Add service identification headers
    request.http.headers.set('x-gateway-service', this.serviceName);
    request.http.headers.set('x-request-id', this.generateRequestId());

    this.loggingService.debug(
      `Preparing request to ${this.serviceName}`,
      'ServiceRequest',
      {
        service: this.serviceName,
        hasAuth: !!authHeader,
        operation: request.operationName || 'unknown',
      },
    );
  }

  /**
   * Override process to implement circuit breaker and service discovery
   */
  async process(requestOptions: any) {
    const startTime = Date.now();

    try {
      // Check circuit breaker before making request
      const canExecute = await this.circuitBreaker.canExecute(this.serviceName);
      if (!canExecute) {
        const error = new Error(
          `Service ${this.serviceName} is currently unavailable (circuit breaker open)`,
        );
        this.loggingService.warn(
          `Circuit breaker blocked request to ${this.serviceName}`,
          'CircuitBreakerBlocked',
        );
        throw error;
      }

      // Get healthy service instance for routing
      const serviceInstance = await this.serviceRegistry.routeRequest(
        this.serviceName,
      );
      if (!serviceInstance) {
        const error = new Error(
          `No healthy instances available for service: ${this.serviceName}`,
        );
        this.loggingService.error(
          `No healthy instances for ${this.serviceName}`,
          undefined,
          'ServiceUnavailable',
        );
        throw error;
      }

      // Update the URL to the selected instance
      const originalUrl = this.url;
      this.url = serviceInstance.url;

      this.loggingService.debug(
        `Routing request to service instance`,
        'ServiceRouting',
        {
          service: this.serviceName,
          instanceId: serviceInstance.id,
          url: serviceInstance.url,
        },
      );

      // Execute the request
      const result = await super.process(requestOptions);

      // Record success in circuit breaker
      await this.circuitBreaker.recordSuccess(this.serviceName);

      const responseTime = Date.now() - startTime;
      this.loggingService.debug(
        `Request completed successfully`,
        'ServiceRequestSuccess',
        {
          service: this.serviceName,
          instanceId: serviceInstance.id,
          responseTime,
        },
      );

      // Restore original URL
      this.url = originalUrl;

      return result;
    } catch (error: any) {
      // Record failure in circuit breaker
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.circuitBreaker.recordFailure(this.serviceName, errorMessage);

      const responseTime = Date.now() - startTime;
      this.loggingService.error(
        `Request failed to ${this.serviceName}`,
        error?.stack || 'No stack trace available',
        'ServiceRequestFailure',
        {
          service: this.serviceName,
          responseTime,
          error: errorMessage,
        },
      );

      throw error;
    }
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
