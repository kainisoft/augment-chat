/**
 * Routing Configuration
 *
 * This file contains configuration for request routing, timeout policies,
 * retry strategies, and circuit breaker settings for the API Gateway.
 *
 * Phase 4: Request Routing and Service Proxy Implementation
 */

/**
 * Gateway Configuration
 */
export interface GatewayConfig {
  name: string;
  url: string;
  port: number;
  timeout: number;
  retries: number;
  retryDelay: number;
  maxRetryDelay: number;
  circuitBreaker: {
    failureThreshold: number;
    recoveryTimeout: number;
    halfOpenMaxCalls: number;
  };
  healthCheck: {
    interval: number;
    timeout: number;
    endpoint: string;
  };
}

/**
 * Operation Routing Rules
 */
export interface OperationRoutingRule {
  operationType: 'query' | 'mutation' | 'subscription';
  targetGateway: string;
  maxComplexity?: number;
  requiresAuth?: boolean;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

/**
 * Default Routing Configuration
 */
export const defaultRoutingConfig = {
  // Apollo Federation Gateway Configuration
  apolloFederationGateway: {
    name: 'apollo-federation-gateway',
    url: process.env.APOLLO_FEDERATION_GATEWAY_URL || 'http://localhost:4000',
    port: 4000,
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    maxRetryDelay: 10000, // 10 seconds
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 30000, // 30 seconds
      halfOpenMaxCalls: 3,
    },
    healthCheck: {
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      endpoint: '/api/health',
    },
  } as GatewayConfig,

  // WebSocket Gateway Configuration
  webSocketGateway: {
    name: 'websocket-gateway',
    url: process.env.WEBSOCKET_GATEWAY_URL || 'http://localhost:4001',
    port: 4001,
    timeout: 15000, // 15 seconds (shorter for real-time)
    retries: 2,
    retryDelay: 500, // 0.5 seconds
    maxRetryDelay: 5000, // 5 seconds
    circuitBreaker: {
      failureThreshold: 3,
      recoveryTimeout: 20000, // 20 seconds
      halfOpenMaxCalls: 2,
    },
    healthCheck: {
      interval: 15000, // 15 seconds
      timeout: 3000, // 3 seconds
      endpoint: '/api/health',
    },
  } as GatewayConfig,

  // Operation Routing Rules
  operationRouting: [
    {
      operationType: 'query',
      targetGateway: 'apollo-federation-gateway',
      maxComplexity: 1000,
      requiresAuth: false,
      rateLimit: {
        requests: 100,
        window: 60, // 1 minute
      },
    },
    {
      operationType: 'mutation',
      targetGateway: 'apollo-federation-gateway',
      maxComplexity: 500,
      requiresAuth: true,
      rateLimit: {
        requests: 50,
        window: 60, // 1 minute
      },
    },
    {
      operationType: 'subscription',
      targetGateway: 'websocket-gateway',
      maxComplexity: 200,
      requiresAuth: true,
      rateLimit: {
        requests: 10,
        window: 60, // 1 minute
      },
    },
  ] as OperationRoutingRule[],

  // General Proxy Configuration
  proxy: {
    timeout: parseInt(process.env.PROXY_TIMEOUT || '30000'),
    retries: parseInt(process.env.PROXY_RETRIES || '3'),
    retryDelay: parseInt(process.env.PROXY_RETRY_DELAY || '1000'),
    maxRetryDelay: parseInt(process.env.PROXY_MAX_RETRY_DELAY || '10000'),
    enableFallback: process.env.PROXY_ENABLE_FALLBACK !== 'false',
    enableCaching: process.env.PROXY_ENABLE_CACHING === 'true',
    enableTracing: process.env.PROXY_ENABLE_TRACING !== 'false',
    enableMetrics: process.env.PROXY_ENABLE_METRICS !== 'false',
  },

  // Error Handling Configuration
  errorHandling: {
    enableFallback: true,
    fallbackResponse: {
      errors: [
        {
          message: 'Service temporarily unavailable. Please try again later.',
          extensions: {
            code: 'SERVICE_UNAVAILABLE',
            retryAfter: 30,
          },
        },
      ],
    },
    enableErrorAggregation: true,
    errorReportingThreshold: 10, // Report after 10 errors in window
    errorReportingWindow: 300000, // 5 minutes
  },

  // Load Balancing Configuration
  loadBalancing: {
    strategy: 'round-robin', // 'round-robin' | 'weighted' | 'least-connections'
    healthCheckWeight: 0.7, // Weight given to health status in routing decisions
    responseTimeWeight: 0.3, // Weight given to response time in routing decisions
  },

  // Monitoring and Observability
  monitoring: {
    enableMetrics: true,
    enableTracing: true,
    enableLogging: true,
    metricsInterval: 60000, // 1 minute
    tracingHeaders: [
      'x-correlation-id',
      'x-request-id',
      'x-trace-id',
      'x-span-id',
    ],
  },
};

/**
 * Environment-specific configuration overrides
 */
export const getRoutingConfig = () => {
  const config = { ...defaultRoutingConfig };

  // Production overrides
  if (process.env.NODE_ENV === 'production') {
    // Increase timeouts for production
    config.apolloFederationGateway.timeout = 45000;
    config.webSocketGateway.timeout = 20000;

    // More aggressive circuit breaker settings
    config.apolloFederationGateway.circuitBreaker.failureThreshold = 3;
    config.webSocketGateway.circuitBreaker.failureThreshold = 2;

    // Disable fallback in production (fail fast)
    config.proxy.enableFallback = false;
  }

  // Development overrides
  if (process.env.NODE_ENV === 'development') {
    // Shorter timeouts for faster feedback
    config.apolloFederationGateway.timeout = 15000;
    config.webSocketGateway.timeout = 10000;

    // More lenient circuit breaker settings
    config.apolloFederationGateway.circuitBreaker.failureThreshold = 10;
    config.webSocketGateway.circuitBreaker.failureThreshold = 5;

    // Enable all debugging features
    config.proxy.enableTracing = true;
    config.proxy.enableMetrics = true;
    config.monitoring.enableLogging = true;
  }

  return config;
};

/**
 * Validate routing configuration
 */
export const validateRoutingConfig = (
  config: typeof defaultRoutingConfig,
): boolean => {
  try {
    // Validate gateway configurations
    const gateways = [config.apolloFederationGateway, config.webSocketGateway];

    for (const gateway of gateways) {
      if (!gateway.name || !gateway.url || !gateway.port) {
        throw new Error(`Invalid gateway configuration: ${gateway.name}`);
      }

      if (gateway.timeout <= 0 || gateway.retries < 0) {
        throw new Error(
          `Invalid timeout/retry configuration for: ${gateway.name}`,
        );
      }
    }

    // Validate operation routing rules
    const validOperationTypes = ['query', 'mutation', 'subscription'];
    const validGateways = gateways.map((g) => g.name);

    for (const rule of config.operationRouting) {
      if (!validOperationTypes.includes(rule.operationType)) {
        throw new Error(`Invalid operation type: ${rule.operationType}`);
      }

      if (!validGateways.includes(rule.targetGateway)) {
        throw new Error(`Invalid target gateway: ${rule.targetGateway}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Routing configuration validation failed:', error.message);
    return false;
  }
};

export default getRoutingConfig;
