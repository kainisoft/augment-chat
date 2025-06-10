import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoggingService } from '@app/logging';
import { RequestProxyService } from './request-proxy.service';
import { GraphQLOperationRouterService } from './graphql-operation-router.service';

/**
 * Routing Controller
 *
 * This controller handles intelligent routing of GraphQL requests between
 * the Apollo Federation Gateway and WebSocket Gateway based on operation type.
 *
 * Phase 4: Request Routing and Service Proxy Implementation
 * - Intelligent GraphQL operation routing
 * - Request forwarding to appropriate gateways
 * - Error handling and fallback mechanisms
 */
@Controller('routing')
export class RoutingController {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly requestProxyService: RequestProxyService,
    private readonly operationRouter: GraphQLOperationRouterService,
  ) {
    this.loggingService.setContext('RoutingController');
  }

  /**
   * Handle GraphQL POST requests with intelligent routing
   */
  @Post('graphql')
  async handleGraphQLPost(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const correlationId = this.generateCorrelationId();

    try {
      this.loggingService.log(
        'Processing GraphQL POST request',
        'GraphQLRequest',
        {
          correlationId,
          method: request.method,
          url: request.url,
          userAgent: request.headers['user-agent'],
        },
      );

      // Add correlation ID to request headers for tracing
      request.headers['x-correlation-id'] = correlationId;

      // Proxy the request to appropriate gateway
      const result = await this.requestProxyService.proxyGraphQLRequest(
        request,
        reply,
      );

      this.loggingService.log(
        'GraphQL request processed successfully',
        'GraphQLSuccess',
        {
          correlationId,
          targetGateway: result.targetGateway,
          responseTime: result.responseTime,
          retryCount: result.retryCount,
        },
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to process GraphQL request',
        error.stack,
        'GraphQLError',
        { correlationId },
      );

      // Send error response if reply hasn't been sent yet
      if (!reply.sent) {
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse = {
          errors: [
            {
              message: error.message || 'Internal server error',
              extensions: {
                code: 'INTERNAL_ERROR',
                correlationId,
                timestamp: new Date().toISOString(),
              },
            },
          ],
        };

        reply.status(statusCode).send(errorResponse);
      }
    }
  }

  /**
   * Handle GraphQL GET requests (typically for playground or introspection)
   */
  @Get('graphql')
  async handleGraphQLGet(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const correlationId = this.generateCorrelationId();

    try {
      this.loggingService.log(
        'Processing GraphQL GET request',
        'GraphQLGetRequest',
        {
          correlationId,
          query: (request.query as any)?.query?.substring(0, 100),
        },
      );

      // Add correlation ID to request headers
      request.headers['x-correlation-id'] = correlationId;

      // For GET requests, we typically want to route to Apollo Federation Gateway
      // unless it's specifically a subscription query
      const query = (request.query as any)?.query;

      if (query) {
        // Analyze the query to determine routing
        const result = await this.requestProxyService.proxyGraphQLRequest(
          request,
          reply,
        );

        this.loggingService.log(
          'GraphQL GET request processed successfully',
          'GraphQLGetSuccess',
          {
            correlationId,
            targetGateway: result.targetGateway,
            responseTime: result.responseTime,
          },
        );
      } else {
        // No query provided, redirect to Apollo Federation Gateway playground
        const apolloGatewayUrl = 'http://localhost:4000/graphql';
        reply.redirect(apolloGatewayUrl, 302);
      }
    } catch (error) {
      this.loggingService.error(
        'Failed to process GraphQL GET request',
        error.stack,
        'GraphQLGetError',
        { correlationId },
      );

      if (!reply.sent) {
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          error: 'Internal server error',
          correlationId,
        });
      }
    }
  }

  /**
   * Get routing information and statistics
   */
  @Get('routing-info')
  async getRoutingInfo(): Promise<any> {
    try {
      const routingStats = this.operationRouter.getRoutingStats();

      return {
        message: 'API Gateway Routing Information',
        timestamp: new Date().toISOString(),
        routing: {
          description: 'Intelligent GraphQL operation routing',
          strategy: 'Operation-type based routing',
          gateways: {
            apolloFederation: {
              ...routingStats.apolloGateway,
              description: 'Handles queries and mutations',
            },
            webSocket: {
              ...routingStats.webSocketGateway,
              description: 'Handles subscriptions and real-time features',
            },
          },
          supportedOperations: routingStats.supportedOperations,
        },
        features: [
          'Intelligent operation-type routing',
          'Circuit breaker protection',
          'Retry policies with exponential backoff',
          'Health-based service discovery',
          'Request correlation and tracing',
          'Fallback mechanisms',
        ],
      };
    } catch (error) {
      this.loggingService.error(
        'Failed to get routing information',
        error.stack,
        'RoutingInfoError',
      );

      throw new HttpException(
        'Failed to retrieve routing information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check endpoint for routing service
   */
  @Get('health')
  async getRoutingHealth(): Promise<any> {
    try {
      const targets = this.operationRouter.getAllRoutingTargets();

      // Check if routing targets are accessible
      const healthChecks = await Promise.allSettled(
        targets.map(async (target) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${target.url}/api/health`, {
              method: 'GET',
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            return {
              target: target.name,
              status: response.ok ? 'healthy' : 'unhealthy',
              url: target.url,
              responseTime: Date.now(),
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            return {
              target: target.name,
              status: 'unhealthy',
              url: target.url,
              error: errorMessage,
            };
          }
        }),
      );

      const results = healthChecks.map((check) =>
        check.status === 'fulfilled' ? check.value : check.reason,
      );

      const allHealthy = results.every((result) => result.status === 'healthy');

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        routing: {
          status: 'operational',
          targets: results,
        },
        message: allHealthy
          ? 'All routing targets are healthy'
          : 'Some routing targets are unhealthy',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.loggingService.error(
        'Failed to check routing health',
        errorStack,
        'RoutingHealthError',
      );

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Failed to check routing health',
        message: errorMessage,
      };
    }
  }

  /**
   * Generate correlation ID for request tracing
   */
  private generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
