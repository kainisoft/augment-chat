import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoggingService } from '../logging.service';
import { RequestIdUtil } from '../utils/request-id.util';

/**
 * Filter for logging and handling exceptions
 */
@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Catch and handle exceptions
   * @param exception The exception
   * @param host The arguments host
   */
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response | FastifyReply>();
    const request = ctx.getRequest<Request | FastifyRequest>();

    // Extract request ID
    const requestId = RequestIdUtil.extractRequestId(
      request.headers as Record<string, any>,
    );

    // Set request ID in logging service
    this.loggingService.setRequestId(requestId);

    // Get status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get error message
    const message = this.getErrorMessage(exception);

    // Get stack trace
    const stack = exception.stack;

    // Get request information
    const method = request.method;
    const url = request.url;
    const ip = this.getClientIp(request);

    // Log error
    this.loggingService.error(
      `Exception: ${status} ${method} ${url} - ${message}`,
      stack,
      'ExceptionFilter',
      {
        statusCode: status,
        method,
        url,
        ip,
        requestId,
        errorName: exception.name,
        errorMessage: message,
      },
    );

    // Send response
    if ('status' in response) {
      // Express
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: url,
        requestId,
      });
    } else {
      // Fastify
      response.code(status).header('X-Request-ID', requestId).send({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: url,
        requestId,
      });
    }
  }

  /**
   * Get error message from exception
   * @param exception The exception
   * @returns The error message
   */
  private getErrorMessage(exception: Error): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'message' in response) {
        return Array.isArray(response.message)
          ? response.message.join(', ')
          : String(response.message);
      }
      return exception.message;
    }
    return exception.message || 'Internal Server Error';
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
}
