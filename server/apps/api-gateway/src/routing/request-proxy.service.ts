import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import {
  GraphQLOperationRouterService,
  OperationAnalysis,
  GraphQLOperationType,
} from './graphql-operation-router.service';
import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Request Proxy Configuration
 */
export interface ProxyConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  maxRetryDelay: number;
  enableFallback: boolean;
  enableCaching: boolean;
}

/**
 * Proxy Request Result
 */
export interface ProxyResult {
  success: boolean;
  statusCode: number;
  data?: any;
  error?: string;
  targetGateway: string;
  responseTime: number;
  retryCount: number;
}

/**
 * Request Proxy Service
 *
 * This service handles intelligent routing of GraphQL requests between
 * the Apollo Federation Gateway and WebSocket Gateway based on operation type.
 *
 * Phase 4: Request Routing and Service Proxy Implementation
 * - Intelligent operation-based routing
 * - Timeout and retry policies
 * - Circuit breaker integration
 * - Fallback mechanisms
 */
@Injectable()
export class RequestProxyService {
  private readonly config: ProxyConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly operationRouter: GraphQLOperationRouterService,
  ) {
    this.loggingService.setContext('RequestProxyService');

    // Load proxy configuration
    this.config = {
      timeout: this.configService.get<number>('PROXY_TIMEOUT', 30000),
      retries: this.configService.get<number>('PROXY_RETRIES', 3),
      retryDelay: this.configService.get<number>('PROXY_RETRY_DELAY', 1000),
      maxRetryDelay: this.configService.get<number>(
        'PROXY_MAX_RETRY_DELAY',
        10000,
      ),
      enableFallback: this.configService.get<boolean>(
        'PROXY_ENABLE_FALLBACK',
        true,
      ),
      enableCaching: this.configService.get<boolean>(
        'PROXY_ENABLE_CACHING',
        false,
      ),
    };

    this.loggingService.log(
      'Request Proxy Service initialized',
      'ProxyInit',
      this.config,
    );
  }

  /**
   * Proxy GraphQL request to appropriate gateway
   */
  async proxyGraphQLRequest(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<ProxyResult> {
    const startTime = Date.now();
    let retryCount = 0;

    try {
      // Extract GraphQL query from request
      const query = await this.extractGraphQLQuery(request);
      if (!query) {
        throw new HttpException(
          'Invalid GraphQL request: No query found',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Analyze operation to determine routing target
      const analysis = await this.operationRouter.analyzeOperation(query);

      this.loggingService.debug('Proxying GraphQL request', 'ProxyRequest', {
        operationType: analysis.operationType,
        operationName: analysis.operationName,
        targetGateway: analysis.targetGateway.name,
        complexity: analysis.complexity,
      });

      // Execute request with retry logic
      const result = await this.executeWithRetry(
        analysis,
        request,
        reply,
        retryCount,
      );

      const responseTime = Date.now() - startTime;

      this.loggingService.log(
        'GraphQL request proxied successfully',
        'ProxySuccess',
        {
          targetGateway: analysis.targetGateway.name,
          responseTime,
          retryCount: result.retryCount,
        },
      );

      return {
        ...result,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.loggingService.error(
        'Failed to proxy GraphQL request',
        error.stack,
        'ProxyError',
        { responseTime, retryCount },
      );

      // Try fallback if enabled
      if (this.config.enableFallback) {
        return await this.executeFallback(error, responseTime, retryCount);
      }

      throw error;
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry(
    analysis: OperationAnalysis,
    request: FastifyRequest,
    reply: FastifyReply,
    initialRetryCount: number,
  ): Promise<ProxyResult> {
    let retryCount = initialRetryCount;
    let lastError: Error = new Error('No attempts made');

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        // Check circuit breaker before attempting request
        const canExecute = await this.circuitBreakerService.canExecute(
          analysis.targetGateway.name,
        );

        if (!canExecute) {
          throw new Error(
            `Circuit breaker open for ${analysis.targetGateway.name}`,
          );
        }

        // Execute the actual proxy request
        const result = await this.executeProxyRequest(analysis, request, reply);

        // Record success in circuit breaker
        await this.circuitBreakerService.recordSuccess(
          analysis.targetGateway.name,
        );

        return {
          ...result,
          retryCount,
        };
      } catch (error) {
        lastError = error;
        retryCount++;

        // Record failure in circuit breaker
        await this.circuitBreakerService.recordFailure(
          analysis.targetGateway.name,
          error.message,
        );

        // Don't retry on the last attempt
        if (attempt < this.config.retries) {
          const delay = this.calculateRetryDelay(attempt);
          this.loggingService.warn(
            `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.config.retries})`,
            'ProxyRetry',
            {
              error: error.message,
              targetGateway: analysis.targetGateway.name,
            },
          );

          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute the actual proxy request
   */
  private async executeProxyRequest(
    analysis: OperationAnalysis,
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<ProxyResult> {
    const targetUrl = `${analysis.targetGateway.url}/graphql`;

    // For subscriptions, we need to handle WebSocket connections differently
    if (analysis.operationType === GraphQLOperationType.SUBSCRIPTION) {
      return await this.handleSubscriptionRequest(analysis, request, reply);
    }

    // For queries and mutations, forward to Apollo Federation Gateway
    return await this.forwardHttpRequest(targetUrl, request, reply);
  }

  /**
   * Handle subscription requests (WebSocket Gateway)
   */
  private async handleSubscriptionRequest(
    analysis: OperationAnalysis,
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<ProxyResult> {
    // For HTTP requests to subscription endpoint, return information about WebSocket endpoint
    const webSocketUrl = analysis.targetGateway.url.replace('http', 'ws');

    const response = {
      message: 'Subscriptions require WebSocket connection',
      webSocketUrl: `${webSocketUrl}/graphql`,
      operationType: analysis.operationType,
      operationName: analysis.operationName,
    };

    reply.status(200).send(response);

    return {
      success: true,
      statusCode: 200,
      data: response,
      targetGateway: analysis.targetGateway.name,
      responseTime: 0,
      retryCount: 0,
    };
  }

  /**
   * Forward HTTP request to target gateway
   */
  private async forwardHttpRequest(
    targetUrl: string,
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<ProxyResult> {
    try {
      // Create fetch request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout,
      );

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: this.prepareHeaders(request),
        body:
          request.method !== 'GET' ? JSON.stringify(request.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // Forward response to client
      reply.status(response.status).send(data);

      return {
        success: response.ok,
        statusCode: response.status,
        data,
        targetGateway: targetUrl,
        responseTime: 0,
        retryCount: 0,
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Prepare headers for forwarding
   */
  private prepareHeaders(request: FastifyRequest): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward authentication headers
    if (request.headers.authorization) {
      headers.authorization = request.headers.authorization;
    }

    // Forward correlation ID
    if (request.headers['x-correlation-id']) {
      headers['x-correlation-id'] = request.headers[
        'x-correlation-id'
      ] as string;
    }

    // Add user agent
    headers['User-Agent'] = 'API-Gateway-Proxy/1.0';

    return headers;
  }

  /**
   * Extract GraphQL query from request
   */
  private async extractGraphQLQuery(
    request: FastifyRequest,
  ): Promise<string | null> {
    try {
      const body = request.body as any;

      if (body?.query) {
        return body.query;
      }

      // Handle GET requests with query parameter
      if (request.method === 'GET' && request.query) {
        const query = (request.query as any).query;
        return query || null;
      }

      return null;
    } catch (error) {
      this.loggingService.error(
        'Failed to extract GraphQL query',
        error.stack,
        'QueryExtractionError',
      );
      return null;
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const delay = this.config.retryDelay * Math.pow(2, attempt);
    return Math.min(delay, this.config.maxRetryDelay);
  }

  /**
   * Sleep for specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute fallback when all retries fail
   */
  private async executeFallback(
    error: Error,
    responseTime: number,
    retryCount: number,
  ): Promise<ProxyResult> {
    this.loggingService.warn('Executing fallback response', 'ProxyFallback', {
      error: error.message,
    });

    return {
      success: false,
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      error: 'Service temporarily unavailable. Please try again later.',
      targetGateway: 'fallback',
      responseTime,
      retryCount,
    };
  }
}
