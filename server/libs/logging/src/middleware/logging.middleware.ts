import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoggingService } from '../logging.service';
import { RequestIdUtil } from '../utils/request-id.util';
import { RedactionUtil } from '../utils/redaction.util';
import { HttpLogMetadata } from '../interfaces/log-message.interface';
import { ErrorLoggerService } from '../errors/error-logger.service';

/**
 * Middleware for logging HTTP requests
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {}

  /**
   * Process the request
   * @param req The request object
   * @param res The response object
   * @param next The next function
   */
  use(req: FastifyRequest, res: FastifyReply, next: (err?: Error) => void) {
    // Get start time
    const startTime = Date.now();

    // Extract request ID
    const requestId = RequestIdUtil.extractRequestId(
      req.headers as Record<string, any>,
    );

    // Set request ID in logging service
    this.loggingService.setRequestId(requestId);

    // Extract correlation ID (or use request ID as fallback)
    const correlationId = RequestIdUtil.extractCorrelationId(
      req.headers as Record<string, any>,
      requestId,
    );

    // Set correlation ID in logging service
    this.loggingService.setCorrelationId(correlationId);

    // Set request ID and correlation ID in response headers
    res.header('X-Request-ID', requestId);
    res.header('X-Correlation-ID', correlationId);

    // Extract request information
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = this.getClientIp(req);

    // Create type-safe HTTP metadata
    const requestMetadata: HttpLogMetadata = {
      method: String(method),
      url: String(url),
      ip: String(ip),
      userAgent: String(userAgent),
      requestId,
    };

    // Log request with type-safe metadata
    this.loggingService.log<HttpLogMetadata>(
      `Incoming request: ${method} ${url}`,
      'LoggingMiddleware',
      requestMetadata,
    );

    // Log request body if present (and not a GET request)
    if (method !== 'GET' && req.body) {
      const redactedBody = RedactionUtil.redactRequestBody(
        req.body as Record<string, any>,
      );
      this.loggingService.debug<HttpLogMetadata>(
        'Request body',
        'LoggingMiddleware',
        {
          method: String(method),
          url: String(url),
          body: redactedBody,
          requestId,
        },
      );
    }

    // Handle response
    const handleResponse = () => {
      // Calculate duration
      const duration = Date.now() - startTime;

      // Get status code
      const statusCode = this.getStatusCode(res);

      // Determine log level based on status code
      const isError = statusCode >= 400;
      const logMethod = isError ? 'error' : 'log';

      // Create type-safe HTTP metadata for response
      const responseMetadata: HttpLogMetadata = {
        method: String(method),
        url: String(url),
        statusCode,
        duration,
        ip: String(this.getClientIp(req)),
        userAgent: String(req.headers['user-agent'] || 'unknown'),
        requestId,
      };

      // Log response with type-safe metadata
      if (logMethod === 'error') {
        this.loggingService.error<HttpLogMetadata>(
          `Response: ${statusCode} ${method} ${url} - ${duration}ms`,
          undefined,
          'LoggingMiddleware',
          responseMetadata,
        );
      } else {
        this.loggingService.log<HttpLogMetadata>(
          `Response: ${statusCode} ${method} ${url} - ${duration}ms`,
          'LoggingMiddleware',
          responseMetadata,
        );
      }

      // Clean up event listeners
      res.raw.removeListener('finish', handleResponse);
      res.raw.removeListener('close', handleResponse);
      res.raw.removeListener('error', handleError);
    };

    // Handle error
    const handleError = (error: Error) => {
      const duration = Date.now() - startTime;

      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, `Request error: ${method} ${url}`, {
        source: 'LoggingMiddleware',
        method: 'handleError',
        requestId,
        correlationId,
        ip: this.getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        url,
        httpMethod: method,
        duration,
      });

      // Clean up event listeners
      res.raw.removeListener('finish', handleResponse);
      res.raw.removeListener('close', handleResponse);
      res.raw.removeListener('error', handleError);
    };

    // Add event listeners
    res.raw.on('finish', handleResponse);
    res.raw.on('close', handleResponse);
    res.raw.on('error', handleError);

    // Continue to next middleware
    next();
  }

  /**
   * Get client IP address
   * @param req The request object
   * @returns The client IP address
   */
  private getClientIp(req: FastifyRequest): string {
    try {
      // Try to get IP from Fastify's ips array
      if (Array.isArray(req.ips) && req.ips.length > 0) {
        return String(req.ips[0]);
      }

      // Try to get IP from Fastify's ip property
      if (req.ip) {
        return String(req.ip);
      }

      // Fallback to headers
      const headers = req.headers as Record<string, any>;
      return String(
        headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
      );
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get response status code
   * @param res The response object
   * @returns The status code
   */
  private getStatusCode(res: FastifyReply): number {
    try {
      // Get status code from Fastify response
      if (res.statusCode) {
        return Number(res.statusCode);
      }

      // Fallback to raw response if available
      if (res.raw && typeof res.raw === 'object' && 'statusCode' in res.raw) {
        return Number(res.raw.statusCode);
      }

      return 0; // Unknown
    } catch {
      return 0;
    }
  }
}
