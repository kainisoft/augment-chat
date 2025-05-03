import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoggingService } from '../logging.service';
import { RequestIdUtil } from '../utils/request-id.util';
import { RedactionUtil } from '../utils/redaction.util';

/**
 * Middleware for logging HTTP requests
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Process the request
   * @param req The request object
   * @param res The response object
   * @param next The next function
   */
  use(
    req: Request | FastifyRequest,
    res: Response | FastifyReply,
    next: NextFunction,
  ) {
    // Get start time
    const startTime = Date.now();

    // Extract request ID
    const requestId = RequestIdUtil.extractRequestId(
      req.headers as Record<string, any>,
    );

    // Set request ID in logging service
    this.loggingService.setRequestId(requestId);

    // Set request ID in response headers
    if ('setHeader' in res) {
      res.setHeader('X-Request-ID', requestId);
    } else {
      (res as FastifyReply).header('X-Request-ID', requestId);
    }

    // Extract request information
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = this.getClientIp(req);

    // Log request
    this.loggingService.log(
      `Incoming request: ${method} ${url}`,
      'LoggingMiddleware',
      {
        method,
        url,
        ip,
        userAgent,
        requestId,
      },
    );

    // Log request body if present (and not a GET request)
    if (method !== 'GET' && req.body) {
      const redactedBody = RedactionUtil.redactRequestBody(req.body);
      this.loggingService.debug('Request body', 'LoggingMiddleware', {
        body: redactedBody,
      });
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

      // Log response
      this.loggingService[logMethod](
        `Response: ${statusCode} ${method} ${url} - ${duration}ms`,
        'LoggingMiddleware',
        {
          method,
          url,
          statusCode,
          duration,
          requestId,
        },
      );

      // Clean up event listeners
      if ('removeListener' in res) {
        res.removeListener('finish', handleResponse);
        res.removeListener('close', handleResponse);
        res.removeListener('error', handleError);
      }
    };

    // Handle error
    const handleError = (error: Error) => {
      // Calculate duration
      const duration = Date.now() - startTime;

      // Log error
      this.loggingService.error(
        `Request error: ${method} ${url} - ${error.message}`,
        error.stack,
        'LoggingMiddleware',
        {
          method,
          url,
          duration,
          requestId,
          error: error.message,
        },
      );

      // Clean up event listeners
      if ('removeListener' in res) {
        res.removeListener('finish', handleResponse);
        res.removeListener('close', handleResponse);
        res.removeListener('error', handleError);
      }
    };

    // Add event listeners
    if ('on' in res) {
      res.on('finish', handleResponse);
      res.on('close', handleResponse);
      res.on('error', handleError);
    }

    // Continue to next middleware
    next();
  }

  /**
   * Get client IP address
   * @param req The request object
   * @returns The client IP address
   */
  private getClientIp(req: Request | FastifyRequest): string {
    // For Express
    if ('ip' in req) {
      return req.ip;
    }

    // For Fastify
    if ('ips' in req && Array.isArray(req.ips) && req.ips.length > 0) {
      return req.ips[0];
    }

    // Fallback to headers
    const headers = req.headers as Record<string, any>;
    return headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown';
  }

  /**
   * Get response status code
   * @param res The response object
   * @returns The status code
   */
  private getStatusCode(res: Response | FastifyReply): number {
    // For Express
    if ('statusCode' in res) {
      return res.statusCode;
    }

    // For Fastify
    if ('raw' in res && res.raw && 'statusCode' in res.raw) {
      return res.raw.statusCode;
    }

    return 0; // Unknown
  }
}
