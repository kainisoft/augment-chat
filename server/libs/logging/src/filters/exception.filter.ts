import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoggingService } from '../logging.service';
import { RequestIdUtil } from '../utils/request-id.util';
import { ErrorLoggerService } from '../errors/error-logger.service';

/**
 * Filter for logging and handling exceptions
 */
@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {}

  /**
   * Catch and handle exceptions
   * @param exception The exception
   * @param host The arguments host
   */
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Extract request ID
    const requestId = RequestIdUtil.extractRequestId(
      request.headers as Record<string, any>,
    );

    // Set request ID in logging service
    this.loggingService.setRequestId(requestId);

    // Extract correlation ID (or use request ID as fallback)
    const correlationId = RequestIdUtil.extractCorrelationId(
      request.headers as Record<string, any>,
      requestId,
    );

    // Set correlation ID in logging service
    this.loggingService.setCorrelationId(correlationId);

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
    // const ip = this.getClientIp(request); // Uncomment if needed

    // We could create type-safe HTTP metadata if needed
    // const httpMetadata: HttpLogMetadata = {
    //   method: String(method),
    //   url: String(url),
    //   statusCode: status,
    //   ip: String(ip),
    //   requestId,
    // };

    // Use ErrorLoggerService for structured error logging
    this.errorLogger.error(exception, `Exception: ${method} ${url}`, {
      source: 'ExceptionFilter',
      method: 'catch',
      requestId,
      correlationId,
      url,
      httpMethod: method,
      statusCode: status,
      httpStatus: status,
    });

    // Also log with HTTP metadata if needed
    // this.loggingService.error<HttpLogMetadata>(
    //   `HTTP Exception: ${status} ${method} ${url}`,
    //   undefined,
    //   'ExceptionFilter',
    //   httpMetadata,
    // );

    // Send response
    response.code(status).header('X-Request-ID', requestId).send({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: url,
      requestId,
    });
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
   * Get client IP address - kept for future use
   * @param req The request object
   * @returns The client IP address
   */
  private getClientIp(req: FastifyRequest): string {
    try {
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
}
