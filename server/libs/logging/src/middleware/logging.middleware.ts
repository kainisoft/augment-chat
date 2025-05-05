import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoggingService } from '../logging.service';
import { RequestIdUtil } from '../utils/request-id.util';
import { RedactionUtil } from '../utils/redaction.util';
import {
  HttpLogMetadata,
  ErrorLogMetadata,
} from '../interfaces/log-message.interface';

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

      // Create type-safe error metadata
      const errorMetadata: ErrorLogMetadata = {
        errorName: error.name,
        errorCode: 'HTTP_REQUEST_ERROR',
        stack: error.stack,
        requestId,
      };

      // We could also log with HTTP metadata if needed
      // const httpMetadata = LogHelpers.createHttpLogMetadata(
      //   String(method),
      //   String(url),
      //   {
      //     ip: String(this.getClientIp(req)),
      //     userAgent: String(req.headers['user-agent'] || 'unknown'),
      //     duration,
      //     requestId,
      //   }
      // );

      // Log error with type-safe metadata
      this.loggingService.error<ErrorLogMetadata>(
        `Request error: ${method} ${url} - ${error.message}`,
        error.stack,
        'LoggingMiddleware',
        errorMetadata,
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
    try {
      // For Express
      if ('ip' in req && req.ip) {
        return String(req.ip);
      }

      // For Fastify
      if ('ips' in req && Array.isArray(req.ips) && req.ips.length > 0) {
        return String(req.ips[0]);
      }

      // Fallback to headers
      const headers = req.headers as Record<string, any>;
      return String(
        headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
      );
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get response status code
   * @param res The response object
   * @returns The status code
   */
  private getStatusCode(res: Response | FastifyReply): number {
    try {
      // For Express
      if ('statusCode' in res) {
        return Number(res.statusCode);
      }

      // For Fastify
      if ('raw' in res && res.raw && 'statusCode' in res.raw) {
        return Number((res.raw as any).statusCode);
      }

      return 0; // Unknown
    } catch (error) {
      return 0;
    }
  }
}
